// terrain_grass.js

// Ensure that THREE.js and SimplexNoise are loaded before this script.
// Include this script after including Three.js and SimplexNoise in your HTML.

// ─────────────────────────────────────────────────────────────────────────────
// TERRAIN GRASS GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

class TerrainGeneratorGrass {
    constructor(scene, settings) {
        this.scene = scene;
        this.settings = settings;
        this.chunks = new Map();
        
        // Initialize noise generators
        const simplexMaker = new SimplexNoise();
        this.simplex = {
            noise2D: (x, y) => simplexMaker.noise2D(x, y)
        };
        const simplexDetailMaker = new SimplexNoise();
        this.simplexDetail = {
            noise2D: (x, y) => simplexDetailMaker.noise2D(x, y)
        };

        // Terrain geometry
        this.chunkGeometry = new THREE.PlaneGeometry(
            this.settings.chunkSize,
            this.settings.chunkSize,
            this.settings.chunkResolution,
            this.settings.chunkResolution
        );
        this.chunkGeometry.rotateX(-Math.PI / 2); // Rotate to make it horizontal

        // Terrain material with vertex colors and grass texture
        this.terrainMaterial = new THREE.MeshStandardMaterial({
            vertexColors: true,
            flatShading: false, // Smooth shading for better elevation visuals
            color: new THREE.Color(0x2d5a27), // Base green color
            roughness: 0.8,
            metalness: 0.1
        });

        // Create a procedural grass texture
        const grassCanvas = document.createElement('canvas');
        grassCanvas.width = 256;
        grassCanvas.height = 256;
        const grassCtx = grassCanvas.getContext('2d');
        
        // Create a grass-like gradient pattern
        const grassGradient = grassCtx.createLinearGradient(0, 0, 256, 256);
        grassGradient.addColorStop(0, '#2d5a27');    // Dark green
        grassGradient.addColorStop(0.5, '#3a7034');  // Medium green
        grassGradient.addColorStop(1, '#2d5a27');    // Dark green
        
        grassCtx.fillStyle = grassGradient;
        grassCtx.fillRect(0, 0, 256, 256);
        
        // Add subtle noise for texture variation
        for (let i = 0; i < 500; i++) {
            grassCtx.fillStyle = `rgba(${45 + Math.random() * 20}, ${90 + Math.random() * 20}, ${39 + Math.random() * 20}, 0.05)`;
            grassCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
        }
        
        // Create texture from canvas
        this.grassTexture = new THREE.CanvasTexture(grassCanvas);
        this.grassTexture.wrapS = this.grassTexture.wrapT = THREE.RepeatWrapping;
        this.grassTexture.repeat.set(10, 10);
        this.terrainMaterial.map = this.grassTexture;
        this.terrainMaterial.needsUpdate = true;

        // Initialize Grass Generator
        this.grassGenerator = new GrassGenerator(this.scene, this.settings);
    }

    // Generates or retrieves an existing terrain chunk
    generateChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        if (this.chunks.has(chunkKey)) {
            return this.chunks.get(chunkKey);
        }

        // Clone the base geometry to modify for this chunk
        const geometry = this.chunkGeometry.clone();
        const vertices = geometry.attributes.position.array;
        const colors = new Float32Array(vertices.length); // Initialize color array

        // Parameters for noise layers
        const baseFrequency = this.settings.noiseScale;
        const detailFrequency = this.settings.noiseScale * 2;
        const baseAmplitude = this.settings.terrainHeight;
        const detailAmplitude = this.settings.terrainHeight / 2;

        // Iterate over each vertex to set elevation and color
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i] + chunkX * this.settings.chunkSize;
            const z = vertices[i + 2] + chunkZ * this.settings.chunkSize;

            // Generate elevation using multiple layers of simplex noise
            const elevation = (
                this.simplex.noise2D(x / baseFrequency, z / baseFrequency) * baseAmplitude +
                this.simplexDetail.noise2D(x / detailFrequency, z / detailFrequency) * detailAmplitude
            );

            vertices[i + 1] = elevation;

            // Assign green color (uniform)
            colors[i] = 34 / 255;      // R component for ForestGreen (0x228B22)
            colors[i + 1] = 139 / 255; // G component
            colors[i + 2] = 34 / 255;  // B component
        }

        geometry.computeVertexNormals(); // Recompute normals for accurate lighting
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create the terrain mesh
        const terrain = new THREE.Mesh(geometry, this.terrainMaterial);
        terrain.receiveShadow = true;
        terrain.castShadow = false; // Terrain typically doesn't cast onto itself

        // Create a group for the chunk (useful if adding more objects like grass)
        const chunkGroup = new THREE.Group();
        chunkGroup.add(terrain);

        // Position the chunk correctly in the world
        chunkGroup.position.set(chunkX * this.settings.chunkSize, 0, chunkZ * this.settings.chunkSize);

        // Add the chunk to the scene and the chunks map
        this.scene.add(chunkGroup);
        this.chunks.set(chunkKey, chunkGroup);

        // Generate grass for this chunk
        this.grassGenerator.generateGrass(chunkGroup, chunkX, chunkZ);

        return chunkGroup;
    }

    // Updates terrain chunks based on the player's current position
    update(playerPosition) {
        const playerChunkX = Math.floor(playerPosition.x / this.settings.chunkSize);
        const playerChunkZ = Math.floor(playerPosition.z / this.settings.chunkSize);

        // Determine which chunks should be visible based on render distance
        for (let x = playerChunkX - this.settings.renderDistance; x <= playerChunkX + this.settings.renderDistance; x++) {
            for (let z = playerChunkZ - this.settings.renderDistance; z <= playerChunkZ + this.settings.renderDistance; z++) {
                this.generateChunk(x, z);
            }
        }

        // Remove chunks that are outside the render distance
        for (const [key, chunk] of this.chunks.entries()) {
            const [cx, cz] = key.split(',').map(Number);
            if (
                Math.abs(cx - playerChunkX) > this.settings.renderDistance ||
                Math.abs(cz - playerChunkZ) > this.settings.renderDistance
            ) {
                this.scene.remove(chunk);
                this.chunks.delete(key);
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GRASS GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

class GrassGenerator {
    constructor(scene, settings) {
        this.scene = scene;
        this.settings = settings;

        // Grass blade geometry
        this.grassBladeGeometry = new THREE.PlaneGeometry(0.1, 0.5);
        this.grassBladeGeometry.translate(0, 0.25, 0); // Pivot at the base

        // Grass material
        this.grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22, // ForestGreen
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        });

        // Instanced mesh for grass blades
        this.maxInstances = 1000;
        this.grassMesh = new THREE.InstancedMesh(this.grassBladeGeometry, this.grassMaterial, this.maxInstances);
        this.grassMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.grassMesh.castShadow = true;
        this.grassMesh.receiveShadow = false;
    }

    generateGrass(chunkGroup, chunkX, chunkZ) {
        const numGrassPerChunk = this.settings.grassDensity;

        for (let i = 0; i < numGrassPerChunk; i++) {
            if (this.grassMesh.count >= this.maxInstances) break;

            // Random position within the chunk
            const x = Math.random() * this.settings.chunkSize - this.settings.chunkSize / 2;
            const z = Math.random() * this.settings.chunkSize - this.settings.chunkSize / 2;

            // Get elevation at (x, z)
            const elevation = this.getElevation(chunkGroup, x, z);

            // Create transformation matrix for the grass blade
            const matrix = new THREE.Matrix4();

            // Position
            const pos = new THREE.Vector3(x, elevation, z);

            // Rotation
            const rotation = new THREE.Euler(
                0,
                Math.random() * Math.PI * 2,
                0
            );

            // Scale
            const scale = 0.5 + Math.random() * 0.5;

            matrix.compose(
                pos,
                new THREE.Quaternion().setFromEuler(rotation),
                new THREE.Vector3(scale, scale, scale)
            );

            this.grassMesh.setMatrixAt(this.grassMesh.count, matrix);
            this.grassMesh.count++;
        }

        // Add the grass mesh to the chunk group
        chunkGroup.add(this.grassMesh);
    }

    getElevation(chunkGroup, x, z) {
        const terrainMesh = chunkGroup.children.find(child => child instanceof THREE.Mesh);
        if (!terrainMesh) return 0;

        const geometry = terrainMesh.geometry;
        const position = geometry.attributes.position;
        const resolution = Math.sqrt(position.count);
        const gridX = Math.floor((x / this.settings.chunkSize + 0.5) * (resolution - 1));
        const gridZ = Math.floor((z / this.settings.chunkSize + 0.5) * (resolution - 1));

        const index = gridZ * resolution + gridX;
        const y = position.getY(index);
        return y;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL / UTILITY
// ─────────────────────────────────────────────────────────────────────────────
window.grassBlades = []; // Global array to store all grass blades for potential interactions

// ─────────────────────────────────────────────────────────────────────────────
// HELPER GEOMETRY / MATERIALS FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
function buildTrunkGeometry(height, baseRad, topRad, scale) {
    const trunkGeometry = new THREE.CylinderGeometry(
        topRad, baseRad, height,
        8, // radial segments
        4, // height segments
        false
    );
    // Slight distortion in the top half only
    const positions = trunkGeometry.attributes.position.array;
    for (let i = Math.floor(positions.length / 2); i < positions.length; i += 3) {
        positions[i]     += (Math.random() - 0.5) * 0.15;
        positions[i + 2] += (Math.random() - 0.5) * 0.15;
    }
    trunkGeometry.attributes.position.needsUpdate = true;
    trunkGeometry.scale(scale, scale, scale);
    return trunkGeometry;
}

function randomizeVertices(positions, amount = 1) {
    for (let i = 0; i < positions.length; i += 3) {
        positions[i]     += (Math.random() - 0.5) * amount;
        positions[i + 2] += (Math.random() - 0.5) * amount;
    }
}

// Basic HSL-based color generation with slight random offset
function randomHSLColor(h, s, l, hRange = 0, sRange = 0, lRange = 0) {
    const hue = THREE.MathUtils.clamp(h + (Math.random() - 0.5) * hRange, 0, 1);
    const sat = THREE.MathUtils.clamp(s + (Math.random() - 0.5) * sRange, 0, 1);
    const lig = THREE.MathUtils.clamp(l + (Math.random() - 0.5) * lRange, 0, 1);
    return new THREE.Color().setHSL(hue, sat, lig);
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUND CREATION
// ─────────────────────────────────────────────────────────────────────────────
function createGround(scene) {
    const groundShape = new THREE.Shape();
    groundShape.moveTo(-5000, -5000);
    groundShape.lineTo(5000, -5000);
    groundShape.lineTo(5000, 5000);
    groundShape.lineTo(-5000, 5000);
    groundShape.lineTo(-5000, -5000);

    const groundGeometry = new THREE.ShapeGeometry(groundShape);

    // Create a CanvasTexture as a replacement for the ground texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Fill with a base color
    context.fillStyle = '#654321'; // Example ground color
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Optional: Add grid pattern for texture effect
    context.strokeStyle = '#4c3a2b';
    for (let i = 0; i < canvas.width; i += 16) {
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
        context.moveTo(0, i);
        context.lineTo(canvas.width, i);
    }
    context.stroke();

    // Create a Three.js texture from the canvas
    const groundTexture = new THREE.CanvasTexture(canvas);
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(50, 50);

    // Create material with the generated CanvasTexture
    const groundMaterial = new THREE.MeshLambertMaterial({
        map: groundTexture,
        side: THREE.DoubleSide
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.name = 'ground';
    scene.add(ground);

    return ground;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAKE FUNCTIONS AVAILABLE GLOBALLY
// ─────────────────────────────────────────────────────────────────────────────
window.TerrainGeneratorGrass = TerrainGeneratorGrass;
window.createGround = createGround;

// Example Usage:
// Assuming you have a Three.js scene initialized as `scene` and settings defined.

const settings = {
    chunkSize: 1000,
    chunkResolution: 128,
    noiseScale: 100,
    terrainHeight: 50,
    renderDistance: 2,
    grassDensity: 500 // Number of grass blades per chunk
};

const terrainGeneratorGrass = new TerrainGeneratorGrass(scene, settings);
terrainGeneratorGrass.update(new THREE.Vector3(0, 0, 0)); // Initialize around origin

// You can update the terrain based on player position as needed:
// terrainGeneratorGrass.update(player.position);