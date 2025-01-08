// terrain.js

// Ensure that THREE.js and SimplexNoise are loaded before this script.
// Include this script after including Three.js and SimplexNoise in your HTML.

// TerrainGenerator Class: Responsible for generating and managing the terrain
class TerrainGenerator {
    constructor(scene, settings) {
        this.scene = scene;
        this.settings = settings;
        this.chunks = new Map();
        
        // Create new instances of SimplexNoise
        const simplexMaker = new SimplexNoise();
        this.simplex = {
            noise2D: (x, y) => simplexMaker.noise2D(x, y)
        };
        const simplexDetailMaker = new SimplexNoise();
        this.simplexDetail = {
            noise2D: (x, y) => simplexDetailMaker.noise2D(x, y)
        };

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

// Function to add diverse plants to the terrain with collision detection
function addPlantsToTerrain() {
    const numElements = 3000; // Total number of natural elements
    const colliders = []; // Array to store collision objects

    // Function to create a tree with separate trunk and foliage
    function createTree(scale = 1) {
        const treeGroup = new THREE.Group();
        
        // Trunk (using custom geometry for more natural look)
        const trunkGeometry = new THREE.CylinderGeometry(2 * scale, 3 * scale, 40 * scale, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(0x8B4513).multiplyScalar(0.8 + Math.random() * 0.4),
            roughness: 0.8,
            metalness: 0.2
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 20 * scale;
        treeGroup.add(trunk);

        // Create multiple foliage layers for more realistic look
        const foliageLayers = 3;
        for (let i = 0; i < foliageLayers; i++) {
            const foliageGeometry = new THREE.ConeGeometry(
                15 * scale * (1 - i * 0.2),
                30 * scale,
                8
            );
            const foliageMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x228B22).multiplyScalar(0.8 + Math.random() * 0.4),
                roughness: 1.0,
                metalness: 0.0
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = (35 + i * 15) * scale;
            treeGroup.add(foliage);
        }

        // Add collision box
        const bbox = new THREE.Box3();
        bbox.setFromObject(treeGroup);
        const collider = new THREE.Box3Helper(bbox, 0xff0000);
        collider.visible = false; // Hide the collision box
        treeGroup.add(collider);
        colliders.push({ type: 'tree', box: bbox, object: treeGroup });

        return treeGroup;
    }

    // Function to create a bush with more natural shape
    function createBush(scale = 1) {
        const bushGroup = new THREE.Group();
        const segments = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < segments; i++) {
            const size = (3 + Math.random() * 2) * scale;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x228B22).multiplyScalar(0.7 + Math.random() * 0.6),
                roughness: 1.0,
                metalness: 0.0
            });
            const segment = new THREE.Mesh(geometry, material);
            
            // Position segments slightly randomly
            segment.position.x = (Math.random() - 0.5) * 4 * scale;
            segment.position.y = size + (Math.random() - 0.5) * 2 * scale;
            segment.position.z = (Math.random() - 0.5) * 4 * scale;
            
            bushGroup.add(segment);
        }

        // Add collision box
        const bbox = new THREE.Box3();
        bbox.setFromObject(bushGroup);
        const collider = new THREE.Box3Helper(bbox, 0xff0000);
        collider.visible = false;
        bushGroup.add(collider);
        colliders.push({ type: 'bush', box: bbox, object: bushGroup });

        return bushGroup;
    }

    // Function to create a rock with more natural shape
    function createRock(scale = 1) {
        const rockGroup = new THREE.Group();
        const geometry = new THREE.DodecahedronGeometry(5 * scale, 1);
        
        // Modify vertices slightly for more natural look
        const positionAttribute = geometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);
            
            positionAttribute.setXYZ(
                i,
                x + (Math.random() - 0.5) * scale,
                y + (Math.random() - 0.5) * scale,
                z + (Math.random() - 0.5) * scale
            );
        }

        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x808080).multiplyScalar(0.7 + Math.random() * 0.6),
            roughness: 0.9,
            metalness: 0.1
        });
        
        const rock = new THREE.Mesh(geometry, material);
        rockGroup.add(rock);

        // Add collision box
        const bbox = new THREE.Box3();
        bbox.setFromObject(rockGroup);
        const collider = new THREE.Box3Helper(bbox, 0xff0000);
        collider.visible = false;
        rockGroup.add(collider);
        colliders.push({ type: 'rock', box: bbox, object: rockGroup });

        return rockGroup;
    }

    // Create natural clusters of elements
    const createCluster = (centerX, centerZ, radius, type) => {
        const elements = Math.floor(3 + Math.random() * 5);
        for (let i = 0; i < elements; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const x = centerX + Math.cos(angle) * distance;
            const z = centerZ + Math.sin(angle) * distance;
            
            if (Math.sqrt(x * x + z * z) < 800) continue; // Skip if in safe zone

            const scale = 0.5 + Math.random() * 1.0;
            let element;
            
            switch(type) {
                case 'tree':
                    element = createTree(scale);
                    break;
                case 'bush':
                    element = createBush(scale);
                    break;
                case 'rock':
                    element = createRock(scale);
                    break;
            }

            if (element) {
                element.position.set(x, 0, z);
                element.rotation.y = Math.random() * Math.PI * 2;
                scene.add(element);
            }
        }
    };

    // Create clusters of different types of elements
    for (let i = 0; i < numElements / 10; i++) {
        const x = Math.random() * 10000 - 5000;
        const z = Math.random() * 10000 - 5000;
        
        if (Math.sqrt(x * x + z * z) < 800) continue; // Skip if in safe zone

        // Randomly choose cluster type with weighted probability
        const rand = Math.random();
        if (rand < 0.4) {
            createCluster(x, z, 100, 'tree');
        } else if (rand < 0.8) {
            createCluster(x, z, 50, 'bush');
        } else {
            createCluster(x, z, 30, 'rock');
        }
    }

    // Export colliders for collision detection
    window.natureColliders = colliders;
}

// Ground creation functions
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
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
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

// Make functions globally available
window.TerrainGenerator = TerrainGenerator;
window.addPlantsToTerrain = addPlantsToTerrain;
window.createGround = createGround;

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

addPlantsToTerrain();
