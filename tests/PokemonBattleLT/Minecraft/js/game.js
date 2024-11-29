import * as THREE from 'three';
import { Player } from './player.js';
import { generateChunk } from './worldGeneration.js';
import { CHUNK_SIZE, RENDER_DISTANCE } from './config.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.player = new Player(this.camera);
        this.blocks = [];
        this.chunks = new Map();
        this.currentRenderDistance = RENDER_DISTANCE;
        this.lastPlayerPos = new THREE.Vector3();
        this.highlightBox = null;

        this.setupScene();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, this.currentRenderDistance * CHUNK_SIZE);
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        document.body.appendChild(this.renderer.domElement);

        const light = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(light);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.renderer.domElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleKeyDown(e) {
        switch(e.key.toLowerCase()) {
            case 'w': this.player.moveForward = true; break;
            case 's': this.player.moveBackward = true; break;
            case 'a': this.player.moveLeft = true; break;
            case 'd': this.player.moveRight = true; break;
            case 'shift': this.player.isSprinting = true; break;
            case ' ': 
                if (this.player.canJump) {
                    this.player.velocity.y = 5;
                    this.player.canJump = false;
                }
                break;
        }
    }

    handleKeyUp(e) {
        switch(e.key.toLowerCase()) {
            case 'w': this.player.moveForward = false; break;
            case 's': this.player.moveBackward = false; break;
            case 'a': this.player.moveLeft = false; break;
            case 'd': this.player.moveRight = false; break;
            case 'shift': this.player.isSprinting = false; break;
        }
    }

    handleMouseMove(e) {
        if (document.pointerLockElement === this.renderer.domElement) {
            this.camera.rotation.y -= e.movementX * 0.002;
            this.camera.rotation.x -= e.movementY * 0.002;
            this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
        }
    }

    handleMouseDown(e) {
        if (document.pointerLockElement === this.renderer.domElement) {
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
            const intersects = raycaster.intersectObjects(this.blocks);

            if (intersects.length > 0) {
                const intersect = intersects[0];
                if (e.button === 0) { // Left click - remove block
                    intersect.object.visible = false;
                } else if (e.button === 2) { // Right click - add block
                    const pos = intersect.point.add(intersect.face.normal);
                    const roundedPos = pos.round();
                    // Add block logic here
                }
            }
        } else {
            this.renderer.domElement.requestPointerLock();
        }
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateChunks(forceUpdate = false) {
        const playerChunkX = Math.floor(this.camera.position.x / CHUNK_SIZE);
        const playerChunkZ = Math.floor(this.camera.position.z / CHUNK_SIZE);

        if (!forceUpdate && 
            Math.abs(this.lastPlayerPos.x - this.camera.position.x) < 8 &&
            Math.abs(this.lastPlayerPos.z - this.camera.position.z) < 8) {
            return;
        }

        this.lastPlayerPos.copy(this.camera.position);

        for (let x = -this.currentRenderDistance; x <= this.currentRenderDistance; x++) {
            for (let z = -this.currentRenderDistance; z <= this.currentRenderDistance; z++) {
                const chunkX = playerChunkX + x;
                const chunkZ = playerChunkZ + z;
                const chunkKey = `${chunkX},${chunkZ}`;

                if (!this.chunks.has(chunkKey)) {
                    const chunk = generateChunk(chunkX, chunkZ, this.currentRenderDistance);
                    this.chunks.set(chunkKey, chunk);
                    this.scene.add(chunk);
                }
            }
        }

        // Remove far chunks
        for (const [key, chunk] of this.chunks) {
            const [x, z] = key.split(',').map(Number);
            if (Math.abs(x - playerChunkX) > this.currentRenderDistance ||
                Math.abs(z - playerChunkZ) > this.currentRenderDistance) {
                this.scene.remove(chunk);
                this.chunks.delete(key);
            }
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const delta = 0.016; // Assuming 60fps
        this.player.update(delta, this.blocks);
        this.updateChunks();
        
        this.renderer.render(this.scene, this.camera);
    }
}
