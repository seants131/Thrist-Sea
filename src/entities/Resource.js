import * as THREE from 'three';

export function createCoalPile(x, z) {
    const geometry = new THREE.IcosahedronGeometry(2, 0); // Low-poly look
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x222222, 
        flatShading: true,
        metalness: 0.5,
        roughness: 0.8
    });
    const pile = new THREE.Mesh(geometry, material);
    pile.position.set(x, 1, z);
    pile.castShadow = true;
    pile.receiveShadow = true;
    return pile;
}
