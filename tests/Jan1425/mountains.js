// mountains.js

// Ensure that THREE.js and SimplexNoise are loaded before this script.
// Include this script after including Three.js and SimplexNoise in your HTML.

// MountainTerrainGenerator Class: Extends TerrainGenerator for mountainous terrain
class MountainTerrainGenerator extends TerrainGenerator {
    constructor(scene, settings) {
        super(scene, settings);
    }

    // Override the generateChunk method to create mountainous terrain
    generateChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        if (this.chunks.has(chunkKey)) {
            return this.chunks.get(chunkKey);
        }

        // Clone the base geometry to modify for this chunk
        const geometry = this.chunkGeometry.clone();
        const vertices = geometry.attributes.position.array;
        const colors = new Float32Array(vertices.length);

        // Parameters for noise layers specific to mountains
        const baseFrequency = this.settings.noiseScale;
        const detailFrequency = this.settings.noiseScale * 2;
        const baseAmplitude = this.settings.terrainHeight * 2; // Increase height for mountains
        const detailAmplitude = this.settings.terrainHeight; // Adjust detail amplitude

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

            // Assign color based on elevation (mountain gradient)
            const normalizedElevation = (elevation - this.settings.minElevation) / (this.settings.maxElevation - this.settings.minElevation);
            const color = new THREE.Color();
            color.setHSL(0.6, 1, 0.5 + 0.5 * normalizedElevation); // Mountain color gradient
            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
        }

        geometry.computeVertexNormals();
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create the mountain terrain mesh
        const mountainTerrain = new THREE.Mesh(geometry, this.terrainMaterial);
        mountainTerrain.receiveShadow = true;
        mountainTerrain.castShadow = false;

        // Create a group for the chunk
        const chunkGroup = new THREE.Group();
        chunkGroup.add(mountainTerrain);

        // Position the chunk correctly in the world
        chunkGroup.position.set(chunkX * this.settings.chunkSize, 0, chunkZ * this.settings.chunkSize);

        // Add the chunk to the scene and the chunks map
        this.scene.add(chunkGroup);
        this.chunks.set(chunkKey, chunkGroup);

        return chunkGroup;
    }
}

// Make the MountainTerrainGenerator globally available
window.MountainTerrainGenerator = MountainTerrainGenerator;
