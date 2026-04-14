import * as THREE from 'three';
import { State } from './State.js';
import { Grid } from '../systems/Grid.js';
import { createBuilding, getBuildingGeometry } from '../entities/Building.js';
import { Economy } from '../systems/Economy.js';

export class Input {
    constructor(game) {
        this.game = game;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        groundGeometry.rotateX(-Math.PI / 2);
        const groundMaterial = new THREE.MeshBasicMaterial({ visible: false });
        this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        this.game.scene.add(this.groundPlane);

        // Initial empty Ghost Mesh
        this.ghostMesh = new THREE.Mesh();
        this.ghostMesh.visible = false;
        this.game.scene.add(this.ghostMesh);

        this.setupUI();

        window.addEventListener('click', (event) => this.onClick(event));
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    setupUI() {
        const btnHouse = document.getElementById('btn-house');
        const btnGathering = document.getElementById('btn-gathering');
        const btnCancel = document.getElementById('btn-cancel');

        btnHouse.addEventListener('click', (e) => {
            e.stopPropagation();
            State.buildMode = 'HOUSE';
            this.updateButtonStates();
        });

        btnGathering.addEventListener('click', (e) => {
            e.stopPropagation();
            State.buildMode = 'GATHERING_POST';
            this.updateButtonStates();
        });

        btnCancel.addEventListener('click', (e) => {
            e.stopPropagation();
            State.buildMode = null;
            this.ghostMesh.visible = false;
            this.updateButtonStates();
        });
    }

    updateButtonStates() {
        document.getElementById('btn-house').classList.toggle('active', State.buildMode === 'HOUSE');
        document.getElementById('btn-gathering').classList.toggle('active', State.buildMode === 'GATHERING_POST');
    }

    onMouseMove(event) {
        if (!State.buildMode) {
            this.ghostMesh.visible = false;
            return;
        }

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.game.camera);
        const intersects = this.raycaster.intersectObject(this.groundPlane);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const snapped = Grid.getSnappedPosition(point.x, point.z);
            
            if (snapped.x > 5000) {
                this.ghostMesh.visible = false;
                return;
            }

            const distance = Math.sqrt(snapped.x * snapped.x + snapped.z * snapped.z);
            const maxRange = (State.buildMode === 'HOUSE') ? State.maxHydrationRadius : 50;

            if (distance <= maxRange + 0.1) {
                // IMPORTANT: Generate identical geometry for the ghost
                if (this.ghostMesh.geometry) this.ghostMesh.geometry.dispose();
                this.ghostMesh.geometry = getBuildingGeometry(State.buildMode, distance, snapped.numSlots);
                
                // Set materials for Ghost
                if (State.buildMode === 'HOUSE') {
                    this.ghostMesh.material = new THREE.MeshStandardMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
                } else {
                    this.ghostMesh.material = new THREE.MeshStandardMaterial({ color: 0x5C4033, transparent: true, opacity: 0.5 });
                }

                // Match Building rotation and position logic exactly
                const height = (State.buildMode === 'GATHERING_POST') ? 1 : 2;
                this.ghostMesh.position.set(snapped.x, height / 2, snapped.z);
                this.ghostMesh.rotation.x = -Math.PI / 2;
                this.ghostMesh.rotation.z = snapped.angle + Math.PI;
                this.ghostMesh.visible = true;
            } else {
                this.ghostMesh.visible = false;
            }
        }
    }

    onClick(event) {
        if (event.target.tagName === 'BUTTON') return;
        if (!State.buildMode) return;

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.game.camera);
        const intersects = this.raycaster.intersectObject(this.groundPlane);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const snapped = Grid.getSnappedPosition(point.x, point.z);
            if (snapped.x > 5000) return;

            const distance = Math.sqrt(snapped.x * snapped.x + snapped.z * snapped.z);
            const maxRange = (State.buildMode === 'HOUSE') ? State.maxHydrationRadius : 50;
            if (distance > maxRange + 0.1) return;

            const cost = State.costs[State.buildMode];
            if (State.coal < cost) return;

            const exists = State.buildings.some(b => 
                Math.abs(b.position.x - snapped.x) < 0.1 && 
                Math.abs(b.position.z - snapped.z) < 0.1
            );

            if (!exists) {
                State.coal -= cost;
                const building = createBuilding(State.buildMode, snapped.x, snapped.z, snapped.angle, distance, snapped.numSlots);
                this.game.scene.add(building);
                State.buildings.push(building);
                Economy.updateUI();
            }
        }
    }
}
