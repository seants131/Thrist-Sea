import * as THREE from 'three';

export function createBuilding(x, z) {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    // Start with default Cyan color
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });
    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, 1, z); // Center point is at y=1 so it sits on y=0
    building.castShadow = true;
    building.receiveShadow = true;
    return building;
}
