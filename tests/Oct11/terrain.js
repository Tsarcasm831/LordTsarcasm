// terrain.js

// Ensure that THREE.js and SimplexNoise are loaded before this script.
// Include this script after including Three.js and SimplexNoise in your HTML.

// TerrainGenerator Class: Responsible for generating and managing the terrain
class TerrainGenerator {
    constructor(scene, settings) {
        this.scene = scene;
        this.settings = settings;
        this.chunks = new Map();
        this.simplex = new SimplexNoise();
        this.simplexDetail = new SimplexNoise();
        this.chunkGeometry = new THREE.PlaneGeometry(this.settings.chunkSize, this.settings.chunkSize, this.settings.chunkResolution, this.settings.chunkResolution);
        this.chunkGeometry.rotateX(-Math.PI / 2); // Rotate to make it horizontal

        // Create a green material for the terrain with vertex colors
        this.terrainMaterial = new THREE.MeshStandardMaterial({
            vertexColors: true,
            flatShading: false, // Smooth shading for better elevation visuals
        });

        // Initialize texture for grass (optional)
        const textureLoader = new THREE.TextureLoader();
        this.grassTexture = textureLoader.load('path/to/grass-texture.jpg'); // Replace with your grass texture path
        this.grassTexture.wrapS = this.grassTexture.wrapT = THREE.RepeatWrapping;
        this.grassTexture.repeat.set(10, 10);
        this.terrainMaterial.map = this.grassTexture;
        this.terrainMaterial.needsUpdate = true;

        // Initialize any additional features like trees or rocks here if needed
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

            // Assign green color based on elevation (optional gradient)
            // For uniform green, uncomment the following lines:
            colors[i] = 34 / 255;      // R component for ForestGreen (0x228B22)
            colors[i + 1] = 139 / 255; // G component
            colors[i + 2] = 34 / 255;  // B component

            // Optional: Gradient based on elevation for visual depth
            /*
            const normalizedElevation = (elevation - this.settings.minElevation) / (this.settings.maxElevation - this.settings.minElevation);
            const color = new THREE.Color();
            color.setHSL(0.33, 1, 0.5 + 0.5 * normalizedElevation); // Adjust hue and lightness as needed
            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
            */
        }

        geometry.computeVertexNormals(); // Recompute normals for accurate lighting
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create the terrain mesh
        const terrain = new THREE.Mesh(geometry, this.terrainMaterial);
        terrain.receiveShadow = true;
        terrain.castShadow = false; // Terrain typically doesn't cast shadows onto itself

        // Create a group for the chunk (useful if adding more objects like trees)
        const chunkGroup = new THREE.Group();
        chunkGroup.add(terrain);

        // Position the chunk correctly in the world
        chunkGroup.position.set(chunkX * this.settings.chunkSize, 0, chunkZ * this.settings.chunkSize);

        // Add the chunk to the scene and the chunks map
        this.scene.add(chunkGroup);
        this.chunks.set(chunkKey, chunkGroup);

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

        // Remove chunks that are outside the render distance to optimize performance
        for (const [key, chunk] of this.chunks.entries()) {
            const [chunkX, chunkZ] = key.split(',').map(Number);
            if (Math.abs(chunkX - playerChunkX) > this.settings.renderDistance || Math.abs(chunkZ - playerChunkZ) > this.settings.renderDistance) {
                this.scene.remove(chunk);
                this.chunks.delete(key);
            }
        }
    }
}

// Example usage:

// Assuming you have a Three.js scene already set up
// const scene = new THREE.Scene();

// Define terrain settings
const terrainSettings = {
    chunkSize: 100,           // Size of each terrain chunk
    chunkResolution: 100,     // Number of segments per chunk
    terrainHeight: 30,        // Maximum height of the terrain
    noiseScale: 100,          // Scale of the noise (adjust for different terrain roughness)
    renderDistance: 3,        // Number of chunks to render around the player
    minElevation: -10,        // Minimum elevation (for gradient if needed)
    maxElevation: 30          // Maximum elevation (for gradient if needed)
};

// Initialize the terrain generator
const terrainGenerator = new TerrainGenerator(scene, terrainSettings);


