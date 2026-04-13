import * as THREE from 'three';

export const Grid = {
    radiusInterval: 5,
    angleSteps: 12,
    maxRings: 5,

    getSnappedPosition(x, z) {
        // ... (rest of the method stays same)
        const radius = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x);

        const snappedRadius = Math.max(this.radiusInterval, Math.round(radius / this.radiusInterval) * this.radiusInterval);
        const angleStep = (Math.PI * 2) / this.angleSteps;
        const snappedAngle = Math.round(angle / angleStep) * angleStep;

        const snappedX = Math.cos(snappedAngle) * snappedRadius;
        const snappedZ = Math.sin(snappedAngle) * snappedRadius;

        return { x: snappedX, z: snappedZ };
    },

    createGridHelper() {
        const maxRadius = this.radiusInterval * this.maxRings;
        const group = new THREE.Group();
        const material = new THREE.LineBasicMaterial({ color: 0x444444 });

        for (let r = this.radiusInterval; r <= maxRadius; r += this.radiusInterval) {
            const circlePoints = [];
            for (let i = 0; i <= 64; i++) {
                const a = (i / 64) * Math.PI * 2;
                circlePoints.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(circlePoints);
            const line = new THREE.Line(geometry, material);
            group.add(line);
        }

        // Add radial lines
        for (let i = 0; i < this.angleSteps; i++) {
            const a = (i / this.angleSteps) * Math.PI * 2;
            const points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(Math.cos(a) * maxRadius, 0, Math.sin(a) * maxRadius)
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            group.add(line);
        }

        return group;
    }
};
