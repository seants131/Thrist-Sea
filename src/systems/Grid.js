import * as THREE from 'three';

export const Grid = {
    radiusInterval: 5,
    maxRings: 5,
    unitWidth: 4, // The width of a building "slot"

    getSlotsInRing(radius) {
        if (radius === 0) return 1;
        // Formula: Circumference / Unit Width
        // This ensures outer rings have more slots than inner rings
        return Math.max(4, Math.floor((2 * Math.PI * radius) / this.unitWidth));
    },

    getSnappedPosition(x, z) {
        // 1. Find the nearest Radius (Ring)
        const rawRadius = Math.sqrt(x * x + z * z);
        const snappedRadius = Math.max(this.radiusInterval, Math.round(rawRadius / this.radiusInterval) * this.radiusInterval);
        
        // Don't allow snapping beyond the max rings
        if (snappedRadius > this.radiusInterval * this.maxRings) {
            return { x: 9999, z: 9999, angle: 0, numSlots: 0 }; 
        }

        // 2. Find the nearest Angle based on dynamic slots for THIS radius
        const rawAngle = Math.atan2(x, z); // Use x, z to align with Three.js coordinate system
        const numSlots = this.getSlotsInRing(snappedRadius);
        const angleStep = (Math.PI * 2) / numSlots;
        
        const snappedAngle = Math.round(rawAngle / angleStep) * angleStep;

        // 3. Convert back to Cartesian
        const snappedX = Math.sin(snappedAngle) * snappedRadius;
        const snappedZ = Math.cos(snappedAngle) * snappedRadius;

        return { 
            x: snappedX, 
            z: snappedZ, 
            angle: snappedAngle,
            numSlots: numSlots
        };
    },

    createGridHelper() {
        const group = new THREE.Group();
        const material = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.5 });

        for (let ring = 1; ring <= this.maxRings; ring++) {
            const r = ring * this.radiusInterval;
            
            // Draw the Circle (Ring)
            const circlePoints = [];
            for (let i = 0; i <= 128; i++) {
                const a = (i / 128) * Math.PI * 2;
                circlePoints.push(new THREE.Vector3(Math.sin(a) * r, 0, Math.cos(a) * r));
            }
            const circleGeo = new THREE.BufferGeometry().setFromPoints(circlePoints);
            group.add(new THREE.Line(circleGeo, material));

            // Draw the Radial Segments for THIS ring
            const numSlots = this.getSlotsInRing(r);
            const nextR = (ring - 1) * this.radiusInterval; // Connect to the inner ring

            for (let i = 0; i < numSlots; i++) {
                const a = (i / numSlots) * Math.PI * 2;
                const points = [
                    new THREE.Vector3(Math.sin(a) * nextR, 0, Math.cos(a) * nextR),
                    new THREE.Vector3(Math.sin(a) * r, 0, Math.cos(a) * r)
                ];
                const segmentGeo = new THREE.BufferGeometry().setFromPoints(points);
                group.add(new THREE.Line(segmentGeo, material));
            }
        }

        return group;
    }
};
