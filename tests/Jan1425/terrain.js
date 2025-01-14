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
            color: new THREE.Color(0x2d5a27), // Base green color
            roughness: 0.8,
            metalness: 0.1
        });

        // Create a procedural grass texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create a gradient green pattern
        const gradient = ctx.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, '#2d5a27');    // Dark green
        gradient.addColorStop(0.5, '#3a7034');  // Medium green
        gradient.addColorStop(1, '#2d5a27');    // Dark green
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // Add some noise for texture
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(${45 + Math.random() * 20}, ${90 + Math.random() * 20}, ${39 + Math.random() * 20}, 0.1)`;
            ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
        }
        
        // Create texture from canvas
        this.grassTexture = new THREE.CanvasTexture(canvas);
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

// Global array to store all trees for hover functionality
window.trees = [];

// Function to add diverse plants to the terrain with collision detection
function addPlantsToTerrain(scene, groundSize = 10000) {
    const numberOfGroves = 15; // Number of tree groves to create
    const treesPerGrove = 20;  // Average number of trees per grove
    const groveRadius = 200;    // Radius of each grove
    
    // Create groves of trees
    for (let g = 0; g < numberOfGroves; g++) {
        // Random position for the grove center
        const groveX = (Math.random() - 0.5) * (groundSize * 0.8); // Use 80% of ground size to keep away from edges
        const groveZ = (Math.random() - 0.5) * (groundSize * 0.8);
        
        // Random number of trees for this grove
        const numTrees = Math.floor(treesPerGrove * (0.8 + Math.random() * 0.4)); // +/- 20% variation
        
        for (let i = 0; i < numTrees; i++) {
            // Random position within grove using polar coordinates for more natural distribution
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.pow(Math.random(), 0.5) * groveRadius; // Square root for more natural density
            
            const x = groveX + Math.cos(angle) * radius;
            const z = groveZ + Math.sin(angle) * radius;
            
            // Random scale variation for each tree
            const scale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
            
            const tree = createTree(scale);
            tree.position.set(x, 0, z);
            tree.rotation.y = Math.random() * Math.PI * 2;
            scene.add(tree);
            trees.push(tree); // Add tree to global array
        }
    }
    
    // Add some individual trees scattered around
    const numScatteredTrees = 50;
    for (let i = 0; i < numScatteredTrees; i++) {
        const x = (Math.random() - 0.5) * groundSize;
        const z = (Math.random() - 0.5) * groundSize;
        
        const scale = 0.7 + Math.random() * 0.6; // Wider scale variation for scattered trees
        
        const tree = createTree(scale);
        tree.position.set(x, 0, z);
        tree.rotation.y = Math.random() * Math.PI * 2;
        scene.add(tree);
        trees.push(tree); // Add tree to global array
    }
}

// Function to create a tree with separate trunk and foliage
function createTree(scale = 1) {
    const treeLOD = new THREE.LOD();
    
    // Add tree name data
    const treeTypes = [
        'Ancient Oak',
        'Towering Pine',
        'Mighty Redwood',
        'Elder Birch', 
        'Sacred Ash',
        'Mystic Maple'
    ];
    const treeName = treeTypes[Math.floor(Math.random() * treeTypes.length)];
    treeLOD.userData = { 
        name: treeName,
        type: 'tree',
        gatheringTime: 5000, // 5 seconds to gather,
        selected: false
    };

    // Define createTreeMesh function with geometry reuse
    const createTreeMesh = (detailLevel) => {
        // Randomize trunk dimensions slightly
        const baseRadius = 1.5 + Math.random() * 1;
        const topRadius = baseRadius * (0.6 + Math.random() * 0.2);
        const height = 18 + Math.random() * 4;
        
        const trunkGeometry = new THREE.CylinderGeometry(
            topRadius, baseRadius, height, 
            8, // radial segments
            4, // height segments
            false
        );
        
        // Add some random variation to trunk vertices
        const positions = trunkGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            if (i > positions.length / 2) { // Only modify upper half
                positions[i] += (Math.random() - 0.5) * 0.3;
                positions[i + 2] += (Math.random() - 0.5) * 0.3;
            }
        }
        trunkGeometry.attributes.position.needsUpdate = true;
        trunkGeometry.scale(scale, scale, scale);

        // Create a more natural brown color for the trunk
        const trunkHue = 0.08 + Math.random() * 0.02; // Brown hue
        const trunkSaturation = 0.4 + Math.random() * 0.2;
        const trunkLightness = 0.3 + Math.random() * 0.2;
        const trunkColor = new THREE.Color().setHSL(trunkHue, trunkSaturation, trunkLightness);

        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: trunkColor,
            roughness: 0.9,
            metalness: 0.0,
            flatShading: true // Add some angular detail to the trunk
        });

        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = height * 0.5 * scale;
        trunk.castShadow = true;
        trunk.receiveShadow = true;

        // Create foliage with more natural variation
        const foliageLayers = 3;
        const baseColor = new THREE.Color().setHSL(
            0.35 + (Math.random() - 0.5) * 0.05, // Green hue with slight variation
            0.6 + Math.random() * 0.2, // Moderate to high saturation
            0.25 + Math.random() * 0.15 // Darker to moderate lightness
        );

        for (let i = 0; i < foliageLayers; i++) {
            const layerScale = 1 - (i * 0.25); // Each layer gets progressively smaller
            const coneHeight = (16 + Math.random() * 4) * layerScale;
            const coneRadius = (8 + Math.random() * 3) * layerScale;
            
            const foliageGeometry = new THREE.ConeGeometry(
                coneRadius, coneHeight,
                8, // radial segments
                4, // height segments
                false
            );
            
            // Add random variation to foliage vertices
            const positions = foliageGeometry.attributes.position.array;
            for (let j = 0; j < positions.length; j += 3) {
                positions[j] += (Math.random() - 0.5) * 2;
                positions[j + 2] += (Math.random() - 0.5) * 2;
            }
            foliageGeometry.attributes.position.needsUpdate = true;
            foliageGeometry.scale(scale, scale, scale);
            
            // Slightly vary the color for each layer
            const layerColor = baseColor.clone().multiplyScalar(0.9 + Math.random() * 0.2);
            
            const foliageMaterial = new THREE.MeshStandardMaterial({
                color: layerColor,
                roughness: 1.0,
                metalness: 0.0,
                flatShading: true // Creates more interesting light interaction
            });
            
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.castShadow = true;
            foliage.receiveShadow = true;
            
            // Position foliage with slight random offset
            const trunkHeight = height * scale;
            const foliageHeight = coneHeight * scale;
            foliage.position.y = trunkHeight - foliageHeight * 0.3 + (i * 6 * scale);
            foliage.position.x += (Math.random() - 0.5) * 2 * scale;
            foliage.position.z += (Math.random() - 0.5) * 2 * scale;
            foliage.rotation.y = Math.random() * Math.PI * 2; // Random rotation for each layer
            
            trunk.add(foliage);
        }

        return trunk;
    };

    // Add all LOD levels at once
    treeLOD.addLevel(createTreeMesh('low'), 100);
    treeLOD.addLevel(createTreeMesh('medium'), 50);
    treeLOD.addLevel(createTreeMesh('high'), 0);

    return treeLOD;
}

// Function to remove specific trees
function removeSelectedTrees() {
    const treesToRemove = trees.filter(tree => tree.userData.selected);
    
    treesToRemove.forEach(tree => {
        scene.remove(tree);
        const index = trees.indexOf(tree);
        if (index > -1) {
            trees.splice(index, 1);
        }
    });
}

// Function to toggle tree selection
function toggleTreeSelection(tree) {
    if (!tree.userData.selected) {
        tree.userData.selected = true;
        // Add visual feedback for selected trees
        tree.traverse(child => {
            if (child.material) {
                child.material.emissive = new THREE.Color(0xff0000);
                child.material.emissiveIntensity = 0.5;
            }
        });
    } else {
        tree.userData.selected = false;
        // Remove visual feedback
        tree.traverse(child => {
            if (child.material) {
                child.material.emissive = new THREE.Color(0x000000);
                child.material.emissiveIntensity = 0;
            }
        });
    }
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

// Make functions globally available
window.TerrainGenerator = TerrainGenerator;
window.addPlantsToTerrain = addPlantsToTerrain;
window.createGround = createGround;
window.removeSelectedTrees = removeSelectedTrees;
window.toggleTreeSelection = toggleTreeSelection;

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

addPlantsToTerrain(scene);
