import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Input } from './Input.js';
import { Grid } from '../systems/Grid.js';
import { Economy } from '../systems/Economy.js';
import { Hydration } from '../systems/Hydration.js';
import { createPurifier } from '../entities/Purifier.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        this.scene.fog = new THREE.Fog(0x111111, 20, 100);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(30, 30, 30);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.maxPolarAngle = Math.PI / 2.5; // Steeper oblique angle constraint

        this.initLights();
        this.initScene();
        
        this.input = new Input(this);

        this.lastTick = 0;
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(0xffffff, 3);
        directional.position.set(10, 20, 10);
        directional.castShadow = true;
        directional.shadow.mapSize.width = 1024;
        directional.shadow.mapSize.height = 1024;
        this.scene.add(directional);
    }

    initScene() {
        // Purifier
        const purifier = createPurifier();
        this.scene.add(purifier);

        // Ground Mesh
        const groundGeo = new THREE.PlaneGeometry(200, 200);
        groundGeo.rotateX(-Math.PI / 2);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Grid Helper
        const gridHelper = Grid.createGridHelper();
        this.scene.add(gridHelper);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate(now = 0) {
        requestAnimationFrame((t) => this.animate(t));

        // Tick system: every 1000ms
        if (now - this.lastTick >= 1000) {
            Economy.update();
            Hydration.update();
            this.lastTick = now;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
