import * as THREE from 'three';
import { State } from './State.js';
import { Grid } from '../systems/Grid.js';
import { createBuilding } from '../entities/Building.js';

export class Input {
    constructor(game) {
        this.game = game;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Create an invisible ground plane for raycasting
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        groundGeometry.rotateX(-Math.PI / 2);
        const groundMaterial = new THREE.MeshBasicMaterial({ visible: false });
        this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        this.game.scene.add(this.groundPlane);

        window.addEventListener('click', (event) => this.onClick(event));
    }

    onClick(event) {
        // Normalize mouse coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.game.camera);

        const intersects = this.raycaster.intersectObject(this.groundPlane);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const snapped = Grid.getSnappedPosition(point.x, point.z);

            // Calculate distance to center
            const distance = Math.sqrt(snapped.x * snapped.x + snapped.z * snapped.z);

            // Limit building placement to max radius with small epsilon for precision
            if (distance > State.maxHydrationRadius + 0.1) {
                console.log("Too far from the Purifier!");
                return;
            }

            // Check if building already exists at this snapped position
            const exists = State.buildings.some(b => 
                Math.abs(b.position.x - snapped.x) < 0.1 && 
                Math.abs(b.position.z - snapped.z) < 0.1
            );

            if (!exists) {
                const building = createBuilding(snapped.x, snapped.z);
                this.game.scene.add(building);
                State.buildings.push(building);
            }
        }
    }
}
