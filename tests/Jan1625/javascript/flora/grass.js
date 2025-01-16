// grass.js - Simple grass system
class GrassSystem {
    constructor(scene, settings = {}) {
        this.scene = scene;
        this.settings = {
            patchSize: settings.patchSize || 50,
            bladesPerPatch: settings.bladesPerPatch || 100,
            bladeHeight: settings.bladeHeight || 1,
            bladeWidth: settings.bladeWidth || 0.1,
            renderDistance: settings.renderDistance || 3,
            ...settings
        };

        // Create grass material
        this.grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a7034,
            side: THREE.DoubleSide,
            roughness: 0.8,
            metalness: 0.1
        });

        // Create blade geometry
        this.bladeGeometry = new THREE.PlaneGeometry(
            this.settings.bladeWidth,
            this.settings.bladeHeight
        );
        this.bladeGeometry.translate(0, this.settings.bladeHeight / 2, 0);

        // Store grass patches
        this.patches = new Map();
    }

    createGrassPatch(x, z) {
        const patchKey = `${x},${z}`;
        if (this.patches.has(patchKey)) {
            return this.patches.get(patchKey);
        }

        const group = new THREE.Group();
        group.position.set(
            x * this.settings.patchSize,
            0,
            z * this.settings.patchSize
        );

        // Create grass blades
        for (let i = 0; i < this.settings.bladesPerPatch; i++) {
            const blade = new THREE.Mesh(this.bladeGeometry, this.grassMaterial);
            
            // Random position within patch
            blade.position.set(
                (Math.random() - 0.5) * this.settings.patchSize,
                0,
                (Math.random() - 0.5) * this.settings.patchSize
            );
            
            blade.rotation.y = Math.random() * Math.PI;
            blade.scale.multiplyScalar(0.8 + Math.random() * 0.4);
            group.add(blade);
        }

        this.patches.set(patchKey, group);
        this.scene.add(group);
        return group;
    }

    update(playerPosition) {
        // Calculate current chunk coordinates
        const chunkX = Math.floor(playerPosition.x / this.settings.patchSize);
        const chunkZ = Math.floor(playerPosition.z / this.settings.patchSize);

        // Update grass patches around player
        for (let x = chunkX - this.settings.renderDistance; x <= chunkX + this.settings.renderDistance; x++) {
            for (let z = chunkZ - this.settings.renderDistance; z <= chunkZ + this.settings.renderDistance; z++) {
                this.createGrassPatch(x, z);
            }
        }

        // Remove patches that are too far from player
        this.patches.forEach((patch, key) => {
            const [x, z] = key.split(',').map(Number);
            if (Math.abs(x - chunkX) > this.settings.renderDistance ||
                Math.abs(z - chunkZ) > this.settings.renderDistance) {
                this.scene.remove(patch);
                this.patches.delete(key);
            }
        });
    }
}

// Make GrassSystem available globally
window.GrassSystem = GrassSystem;
