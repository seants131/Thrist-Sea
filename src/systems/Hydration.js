import * as THREE from 'three';
import { State } from '../core/State.js';

export const Hydration = {
    update() {
        State.buildings.forEach(building => {
            const distance = building.position.distanceTo(new THREE.Vector3(0, 1, 0)); 
            
            // Added +0.1 epsilon to account for floating point precision on the outer ring
            if (State.isPurifierRunning && distance <= State.maxHydrationRadius + 0.1) {
                // Hydrated: Cyan
                building.material.color.setHex(0x00ffff);
            } else {
                // Thirsty: SandyBrown
                building.material.color.setHex(0xf4a460);
            }
        });
    }
};
