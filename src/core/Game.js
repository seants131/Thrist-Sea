import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { State } from './State.js';
import { Input } from './Input.js';
import { Grid } from '../systems/Grid.js';
import { Economy } from '../systems/Economy.js';
import { Hydration } from '../systems/Hydration.js';
import { createPurifier } from '../entities/Purifier.js';
import { createCoalPile } from '../entities/Resource.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        // Deep ocean blue background
        this.scene.background = new THREE.Color(0x00151a);
        this.scene.fog = new THREE.Fog(0x00151a, 20, 100);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(30, 30, 30);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.maxPolarAngle = Math.PI / 2.5;

        this.initLights();
        this.initScene();
        this.initResources();
        
        this.input = new Input(this);

        this.lastTick = 0;
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initLights() {
        this.ambient = new THREE.AmbientLight(0x404040, 1.5);
        this.scene.add(this.ambient);

        this.sun = new THREE.DirectionalLight(0xffffff, 3);
        this.sun.position.set(10, 50, 10);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.width = 1024;
        this.sun.shadow.mapSize.height = 1024;
        this.scene.add(this.sun);
    }

    initScene() {
        const purifier = createPurifier();
        this.scene.add(purifier);

        const groundGeo = new THREE.PlaneGeometry(200, 200);
        groundGeo.rotateX(-Math.PI / 2);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Range Indicator (Neon Ring)
        const ringGeo = new THREE.RingGeometry(State.maxHydrationRadius - 0.5, State.maxHydrationRadius, 64);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const rangeRing = new THREE.Mesh(ringGeo, ringMat);
        rangeRing.rotation.x = -Math.PI / 2;
        rangeRing.position.y = 0.1; // Slightly above ground to prevent flickering (z-fighting)
        this.scene.add(rangeRing);

        const gridHelper = Grid.createGridHelper();
        this.scene.add(gridHelper);
    }

    initResources() {
        const count = 5;
        const radius = 30;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const pile = createCoalPile(x, z);
            this.scene.add(pile);
            State.coalPiles.push(pile);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateDayNight() {
        const cycleLength = 60;
        const dayLength = 30;
        State.isNight = (State.time % cycleLength) >= dayLength;

        if (State.isNight) {
            this.sun.color.setHex(0x3344ff);
            this.sun.intensity = 0.5;
            this.ambient.intensity = 0.4;
            this.scene.background.setHex(0x00080a); // Darker ocean night
            this.scene.fog.color.setHex(0x00080a);
        } else {
            this.sun.color.setHex(0xffffff);
            this.sun.intensity = 3;
            this.ambient.intensity = 1.5;
            this.scene.background.setHex(0x00151a); // Original ocean blue
            this.scene.fog.color.setHex(0x00151a);
        }
    }

    animate(now = 0) {
        requestAnimationFrame((t) => this.animate(t));

        // Logic Tick (Every 1s)
        if (now - this.lastTick >= 1000) {
            State.time++;
            this.updateDayNight();
            Economy.update(this.scene);
            this.lastTick = now;
        }

        // Smooth Updates (Every Frame)
        Hydration.update();

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
