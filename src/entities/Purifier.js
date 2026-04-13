import * as THREE from 'three';

export function createPurifier() {
    const geometry = new THREE.CylinderGeometry(2, 2, 5, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
    const purifier = new THREE.Mesh(geometry, material);
    purifier.position.y = 2.5; // Half of height to sit on ground
    purifier.castShadow = true;
    purifier.receiveShadow = true;
    return purifier;
}
