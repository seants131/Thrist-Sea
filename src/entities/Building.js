import * as THREE from 'three';

export function getBuildingGeometry(type, radius, numSlots) {
    const depth = 4.8; // Slightly more coverage
    const innerRadius = radius - depth / 2;
    const outerRadius = radius + depth / 2;
    const thetaLength = (Math.PI * 2) / numSlots;
    const arcAngle = thetaLength * 0.96; // Tiny gap for visual separation

    const shape = new THREE.Shape();
    // Center the arc on the Y-axis (PI/2) so that translation on Y works correctly
    const startAngle = Math.PI / 2 - arcAngle / 2;
    const endAngle = Math.PI / 2 + arcAngle / 2;

    shape.absarc(0, 0, outerRadius, startAngle, endAngle, false);
    shape.absarc(0, 0, innerRadius, endAngle, startAngle, true);

    const height = (type === 'GATHERING_POST') ? 1 : 2;
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: height,
        bevelEnabled: false
    });

    // Translate the geometry so the arc's center of mass is at (0,0,0)
    // Since the arc is centered on the Y-axis at 'radius', we translate by -radius
    geometry.translate(0, -radius, -height / 2);
    return geometry;
}

export function createBuilding(type, x, z, rotationZ = 0, radius = 5, numSlots = 12) {
    const geometry = getBuildingGeometry(type, radius, numSlots);
    const height = (type === 'GATHERING_POST') ? 1 : 2;

    let material;
    if (type === 'HOUSE') {
        material = new THREE.MeshStandardMaterial({ color: 0x00ffff });
    } else if (type === 'GATHERING_POST') {
        material = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
    } else {
        material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    }

    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, height / 2, z);
    
    // Frostpunk Rotation Logic:
    // 1. Rotate X to lay the extrusion flat on the ground
    // 2. Rotate Z to align the building with the radial segment (flipped 180 degrees)
    building.rotation.x = -Math.PI / 2;
    building.rotation.z = rotationZ + Math.PI; 

    building.castShadow = true;
    building.receiveShadow = true;
    building.userData.type = type;
    
    return building;
}
