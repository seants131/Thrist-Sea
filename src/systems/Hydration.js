import * as THREE from 'three';
import { State } from '../core/State.js';

export const Hydration = {
    update() {
        const cyan = new THREE.Color(0x00ffff);
        const sandyBrown = new THREE.Color(0xf4a460);
        const lerpSpeed = 0.05; // Adjust for faster/slower transitions

        State.buildings.forEach(building => {
            // Houses care about hydration, Gathering Posts remain their brown color
            if (building.userData.type === 'HOUSE') {
                const distance = building.position.distanceTo(new THREE.Vector3(0, 1, 0));
                
                const isHydrated = State.isPurifierRunning && (distance <= State.maxHydrationRadius + 0.1);
                const targetColor = isHydrated ? cyan : sandyBrown;
                
                // Smoothly transition the color
                building.material.color.lerp(targetColor, lerpSpeed);
            }
        });
    }
};
