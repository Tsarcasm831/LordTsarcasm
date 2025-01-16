// terrain.js

// Ensure that THREE.js and SimplexNoise are loaded before this script.
// Include this script after including Three.js and SimplexNoise in your HTML.

// ─────────────────────────────────────────────────────────────────────────────
// TERRAIN GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
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

        this.chunkGeometry = new THREE.PlaneGeometry(
            this.settings.chunkSize,
            this.settings.chunkSize,
            this.settings.chunkResolution,
            this.settings.chunkResolution
        );
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
// GLOBAL / UTILITY
// ─────────────────────────────────────────────────────────────────────────────
window.trees = []; // Global array to store all trees for hover or selection

// ─────────────────────────────────────────────────────────────────────────────
// ADD PLANTS / TREES
// ─────────────────────────────────────────────────────────────────────────────
function addPlantsToTerrain(scene, groundSize = 10000) {
    const numberOfGroves = 15; // Number of tree groves
    const treesPerGrove = 20;  // Average number of trees in each grove
    const groveRadius = 200;   // Radius of each grove

    // Create groves of trees
    for (let g = 0; g < numberOfGroves; g++) {
        // Random position for the grove center
        const groveX = (Math.random() - 0.5) * (groundSize * 0.8);
        const groveZ = (Math.random() - 0.5) * (groundSize * 0.8);

        // Random number of trees for this grove
        const numTrees = Math.floor(treesPerGrove * (0.8 + Math.random() * 0.4));

        for (let i = 0; i < numTrees; i++) {
            // Random position within the grove
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.pow(Math.random(), 0.5) * groveRadius;
            const x = groveX + Math.cos(angle) * radius;
            const z = groveZ + Math.sin(angle) * radius;

            // Random scale variation for each tree
            const scale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

            const tree = createTree(scale);
            tree.position.set(x, 0, z);
            tree.rotation.y = Math.random() * Math.PI * 2;
            scene.add(tree);
            trees.push(tree);
        }
    }

    // Add some individual trees scattered around
    const numScatteredTrees = 50;
    for (let i = 0; i < numScatteredTrees; i++) {
        const x = (Math.random() - 0.5) * groundSize;
        const z = (Math.random() - 0.5) * groundSize;

        const scale = 0.7 + Math.random() * 0.6; // 0.7 to 1.3

        const tree = createTree(scale);
        tree.position.set(x, 0, z);
        tree.rotation.y = Math.random() * Math.PI * 2;
        scene.add(tree);
        trees.push(tree);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD INDIVIDUAL TREES (10 NAMED VARIANTS)
// ─────────────────────────────────────────────────────────────────────────────

// Variant 1: Ancient Oak
function createTreeVariantAncientOak(scale) {
    const canopyOffset = -4; // Lowering the canopy

    // Tree parameters
    const baseRadius = 1.5 + Math.random() * 0.5;
    const topRadius  = baseRadius * (0.7 + Math.random() * 0.1);
    const trunkHeight = 16 + Math.random() * 3;

    // Trunk
    const trunkGeom = buildTrunkGeometry(trunkHeight, baseRadius, topRadius, scale);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: randomHSLColor(0.08, 0.4, 0.3, 0.01, 0.1, 0.1),
        roughness: 0.9,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide // show from all sides
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight * 0.5 * scale;

    // Foliage layers (conical)
    const foliageLayers = 3;
    const baseColor = randomHSLColor(0.33, 0.6, 0.3, 0.03, 0.2, 0.2);

    for (let i = 0; i < foliageLayers; i++) {
        const layerScale  = 1 - (i * 0.25);
        const coneHeight  = (14 + Math.random() * 2) * layerScale;
        const coneRadius  = (7 + Math.random() * 2) * layerScale;

        const foliageGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8, 3, false);
        randomizeVertices(foliageGeometry.attributes.position.array, 1.2);
        foliageGeometry.attributes.position.needsUpdate = true;
        foliageGeometry.scale(scale, scale, scale);

        const foliageColor = baseColor.clone().multiplyScalar(0.9 + Math.random() * 0.2);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: foliageColor,
            roughness: 1.0,
            metalness: 0.0,
            flatShading: true,
            side: THREE.DoubleSide
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.castShadow = true;
        foliage.receiveShadow = true;

        foliage.position.y = trunkHeight * scale - coneHeight * 0.3 + i * (5 * scale) + canopyOffset;
        foliage.rotation.y = Math.random() * Math.PI * 2;
        trunk.add(foliage);
    }

    const group = new THREE.Group();
    group.add(trunk);
    return group;
}

// Variant 2: Towering Pine
function createTreeVariantToweringPine(scale) {
    // Tree parameters
    const baseRadius  = 1.0 + Math.random() * 0.5;
    const topRadius   = baseRadius * (0.7 + Math.random() * 0.2);
    const trunkHeight = 10 + Math.random() * 3;

    // Trunk
    const trunkGeom = buildTrunkGeometry(trunkHeight, baseRadius, topRadius, scale);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: randomHSLColor(0.08, 0.4, 0.35, 0.02, 0.1, 0.1),
        roughness: 0.85,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight * 0.5 * scale;

    // Single large sphere of foliage
    const sphereRadius = (4 + Math.random() * 1) * scale;
    const foliageGeometry = new THREE.SphereGeometry(sphereRadius, 8, 8);
    randomizeVertices(foliageGeometry.attributes.position.array, 0.8);
    const foliageColor = randomHSLColor(0.34, 0.7, 0.3, 0.04, 0.15, 0.15);
    const foliageMaterial = new THREE.MeshStandardMaterial({
        color: foliageColor,
        roughness: 0.9,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    foliage.position.y = trunkHeight * scale - sphereRadius * 0.5; // Lowered position
    trunk.add(foliage);

    const group = new THREE.Group();
    group.add(trunk);
    return group;
}

// Variant 3: Mighty Redwood
function createTreeVariantMightyRedwood(scale) {
    // Tree parameters
    const baseRadius = 1.2 + Math.random() * 0.5;
    const topRadius  = baseRadius * (0.6 + Math.random() * 0.2);
    const trunkHeight = 14 + Math.random() * 3;

    // Trunk
    const trunkGeom = buildTrunkGeometry(trunkHeight, baseRadius, topRadius, scale);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: randomHSLColor(0.1, 0.45, 0.3, 0.02, 0.15, 0.15),
        roughness: 0.8,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight * 0.5 * scale;

    // Multiple foliage spheres near top
    const clusters = 3 + Math.floor(Math.random() * 2); 
    for (let c = 0; c < clusters; c++) {
        const sphereRadius = (3 + Math.random() * 1.5) * scale;
        const foliageGeometry = new THREE.SphereGeometry(sphereRadius, 8, 8);
        randomizeVertices(foliageGeometry.attributes.position.array, 0.8);

        const foliageColor = randomHSLColor(0.3, 0.6, 0.3, 0.04, 0.2, 0.15);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: foliageColor,
            roughness: 0.9,
            metalness: 0.0,
            flatShading: true,
            side: THREE.DoubleSide
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.castShadow = true;
        foliage.receiveShadow = true;

        foliage.position.y = trunkHeight * scale - sphereRadius * 0.5 + (Math.random() * 2 * scale) - sphereRadius * 0.5; // Lowered position
        foliage.position.x = (Math.random() - 0.5) * 3 * scale;
        foliage.position.z = (Math.random() - 0.5) * 3 * scale;
        trunk.add(foliage);
    }

    const group = new THREE.Group();
    group.add(trunk);
    return group;
}

// Variant 4: Elder Birch
function createTreeVariantElderBirch(scale) {
    const canopyOffset = -4; // Lowering the canopy

    // Tree parameters
    const baseRadius  = 0.8 + Math.random() * 0.4;
    const topRadius   = baseRadius * 0.9;
    const trunkHeight = 18 + Math.random() * 3;

    // Trunk
    const trunkGeom = buildTrunkGeometry(trunkHeight, baseRadius, topRadius, scale);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: randomHSLColor(0.09, 0.35, 0.35, 0.02, 0.15, 0.15),
        roughness: 0.8,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight * 0.5 * scale;

    // Palm-like ring of foliage
    const frondCount = 6 + Math.floor(Math.random() * 3);
    for (let f = 0; f < frondCount; f++) {
        const frondWidth  = (3 + Math.random() * 1) * scale;
        const frondHeight = (6 + Math.random() * 2) * scale;
        const frondGeometry = new THREE.PlaneGeometry(frondWidth, frondHeight, 2, 2);

        // Slight bend
        frondGeometry.translate(0, frondHeight * 0.4, 0);
        randomizeVertices(frondGeometry.attributes.position.array, 0.3);

        const frondColor = randomHSLColor(0.33, 0.7, 0.3, 0.02, 0.15, 0.15);
        const frondMaterial = new THREE.MeshStandardMaterial({
            color: frondColor,
            side: THREE.DoubleSide,
            roughness: 1.0,
            metalness: 0.0,
            flatShading: true
        });

        const frond = new THREE.Mesh(frondGeometry, frondMaterial);
        frond.castShadow = true;
        frond.receiveShadow = true;

        // Place frond near trunk top
        frond.position.y = trunkHeight * scale + canopyOffset;
        frond.rotation.y = (Math.PI * 2 * f) / frondCount;
        // Tilt outward
        frond.rotation.x = -Math.PI / 3;

        trunk.add(frond);
    }

    const group = new THREE.Group();
    group.add(trunk);
    return group;
}

// Variant 5: Sacred Ash
function createTreeVariantSacredAsh(scale) {
    // Tree parameters
    const baseRadius  = 2.5 + Math.random() * 0.5;
    const topRadius   = baseRadius * (0.8 + Math.random() * 0.1);
    const trunkHeight = 8 + Math.random() * 2;

    // Trunk
    const trunkGeom = buildTrunkGeometry(trunkHeight, baseRadius, topRadius, scale);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: randomHSLColor(0.07, 0.35, 0.3, 0.02, 0.15, 0.15),
        roughness: 0.9,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight * 0.5 * scale;

    // Broad layered canopy
    const layers = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < layers; i++) {
        const canopyHeight = (5 + Math.random() * 2);
        const canopyRadius = (10 + Math.random() * 3);
        const canopyGeometry = new THREE.ConeGeometry(
            canopyRadius * scale, 
            canopyHeight * scale,
            8, 3, false
        );
        randomizeVertices(canopyGeometry.attributes.position.array, 1.5);
        canopyGeometry.attributes.position.needsUpdate = true;

        const canopyColor = randomHSLColor(0.32, 0.65, 0.3, 0.03, 0.15, 0.15);
        const canopyMaterial = new THREE.MeshStandardMaterial({
            color: canopyColor,
            roughness: 0.9,
            metalness: 0.0,
            flatShading: true,
            side: THREE.DoubleSide
        });

        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.castShadow = true;
        canopy.receiveShadow = true;

        canopy.position.y = trunkHeight * scale + i * (3 * scale) - canopyHeight * 0.5; // Lowered position
        canopy.rotation.y = Math.random() * Math.PI * 2;
        trunk.add(canopy);
    }

    const group = new THREE.Group();
    group.add(trunk);
    return group;
}

// Variant 6: Mystic Maple
function createTreeVariantMysticMaple(scale) {
    // Tree parameters
    const baseRadius  = 1.5 + Math.random() * 0.7;
    const topRadius   = baseRadius * 0.6;
    const trunkHeight = 15 + Math.random() * 4;

    // Trunk
    const trunkGeom = buildTrunkGeometry(trunkHeight, baseRadius, topRadius, scale);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: randomHSLColor(0.08, 0.4, 0.25, 0.02, 0.2, 0.2),
        roughness: 0.8,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight * 0.5 * scale;

    // Multiple conical clusters
    const clusterCount = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < clusterCount; i++) {
        const subHeight = (7 + Math.random() * 2);
        const subRadius = (4 + Math.random() * 1.5);
        const coneGeom = new THREE.ConeGeometry(
            subRadius * scale, 
            subHeight * scale,
            8, 3, false
        );
        randomizeVertices(coneGeom.attributes.position.array, 1.5);
        coneGeom.attributes.position.needsUpdate = true;

        const subColor = randomHSLColor(0.33, 0.6, 0.3, 0.03, 0.15, 0.15);
        const coneMat = new THREE.MeshStandardMaterial({
            color: subColor,
            roughness: 1.0,
            metalness: 0.0,
            flatShading: true,
            side: THREE.DoubleSide
        });

        const coneFoliage = new THREE.Mesh(coneGeom, coneMat);
        coneFoliage.castShadow = true;
        coneFoliage.receiveShadow = true;

        coneFoliage.position.y = trunkHeight * scale * 0.75 + (Math.random() * 3 * scale) - subHeight * 0.25; // Lowered position
        coneFoliage.position.x = (Math.random() - 0.5) * 3 * scale;
        coneFoliage.position.z = (Math.random() - 0.5) * 3 * scale;
        coneFoliage.rotation.y = Math.random() * Math.PI * 2;

        trunk.add(coneFoliage);
    }

    const group = new THREE.Group();
    group.add(trunk);
    return group;
}

// Variant 7: Whispering Willow
function createTreeVariantWhisperingWillow(scale) {
    // Tree parameters
    const baseRadius = 1.0 + Math.random() * 0.3;
    const topRadius = baseRadius * 0.8;
    const trunkHeight = 12 + Math.random() * 2;

    // Trunk
    const trunkGeom = buildTrunkGeometry(trunkHeight, baseRadius, topRadius, scale);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: randomHSLColor(0.15, 0.4, 0.35, 0.01, 0.1, 0.1),
        roughness: 0.85,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight * 0.5 * scale;

    // Hanging willow branches
    const branchCount = 5 + Math.floor(Math.random() * 3);
    for (let b = 0; b < branchCount; b++) {
        const branchLength = (8 + Math.random() * 2) * scale;
        const branchGeometry = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, branchLength, 4);
        const branchMat = new THREE.MeshStandardMaterial({
            color: randomHSLColor(0.15, 0.4, 0.35, 0.0, 0.05, 0.0),
            roughness: 0.7,
            metalness: 0.0,
            flatShading: true,
            side: THREE.DoubleSide
        });
        const branch = new THREE.Mesh(branchGeometry, branchMat);
        branch.castShadow = true;
        branch.receiveShadow = true;

        // Position branches along the trunk
        const yPos = trunkHeight * scale * (0.5 + Math.random() * 0.4);
        branch.position.y = yPos;
        branch.rotation.z = Math.PI / 2;
        branch.rotation.y = Math.random() * Math.PI * 2;

        // Add slight downward bend
        branch.rotation.x = -Math.PI / 6;

        trunk.add(branch);
    }

    // Foliage as multiple thin cones to simulate willow leaves
    const foliageCount = 3 + Math.floor(Math.random() * 2);
    for (let f = 0; f < foliageCount; f++) {
        const foliageHeight = (6 + Math.random() * 2) * scale;
        const foliageRadius = (3 + Math.random() * 1) * scale;
        const foliageGeometry = new THREE.ConeGeometry(foliageRadius, foliageHeight, 8, 1, true);
        foliageGeometry.rotateX(Math.PI); // Pointing downwards
        randomizeVertices(foliageGeometry.attributes.position.array, 0.5);
        foliageGeometry.attributes.position.needsUpdate = true;

        const foliageColor = randomHSLColor(0.4, 0.5, 0.35, 0.02, 0.1, 0.1);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: foliageColor,
            emissive: new THREE.Color(0x000000),
            roughness: 0.9,
            metalness: 0.0,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.castShadow = true;
        foliage.receiveShadow = true;

        foliage.position.y = trunkHeight * scale - foliageHeight * 0.5 - 2; // Lowered position
        trunk.add(foliage);
    }

    const group = new THREE.Group();
    group.add(trunk);
    return group;
}

// Variant 8: Enchanted Spruce
function createTreeVariantEnchantedSpruce(scale) {
    // Tree parameters
    const baseRadius = 1.3 + Math.random() * 0.4;
    const topRadius = baseRadius * 0.75;
    const trunkHeight = 13 + Math.random() * 2.5;

    // Trunk
    const trunkGeom = buildTrunkGeometry(trunkHeight, baseRadius, topRadius, scale);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: randomHSLColor(0.12, 0.45, 0.32, 0.01, 0.1, 0.1),
        roughness: 0.88,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight * 0.5 * scale;

    // Layered conical foliage with slight magic glow
    const foliageLayers = 4;
    for (let i = 0; i < foliageLayers; i++) {
        const layerScale = 1 - (i * 0.2);
        const coneHeight = (10 + Math.random() * 1.5) * layerScale;
        const coneRadius = (5 + Math.random() * 1) * layerScale;

        const foliageGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8, 2, false);
        randomizeVertices(foliageGeometry.attributes.position.array, 0.6);
        foliageGeometry.attributes.position.needsUpdate = true;
        foliageGeometry.scale(scale, scale, scale);

        const foliageColor = randomHSLColor(0.55, 0.6, 0.35, 0.02, 0.1, 0.1);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: foliageColor,
            emissive: new THREE.Color(0x444444),
            emissiveIntensity: 0.2,
            roughness: 0.85,
            metalness: 0.0,
            flatShading: true,
            side: THREE.DoubleSide
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.castShadow = true;
        foliage.receiveShadow = true;

        foliage.position.y = trunkHeight * scale - coneHeight * 0.3 + i * (3 * scale) - 1; // Lowered position
        foliage.rotation.y = Math.random() * Math.PI * 2;
        trunk.add(foliage);
    }

    const group = new THREE.Group();
    group.add(trunk);
    return group;
}

// Variant 9: Twilight Cypress
function createTreeVariantTwilightCypress(scale) {
    // Tree parameters
    const baseRadius = 1.4 + Math.random() * 0.3;
    const topRadius = baseRadius * 0.7;
    const trunkHeight = 14 + Math.random() * 2;

    // Trunk
    const trunkGeom = buildTrunkGeometry(trunkHeight, baseRadius, topRadius, scale);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: randomHSLColor(0.25, 0.4, 0.28, 0.01, 0.1, 0.1),
        roughness: 0.9,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight * 0.5 * scale;

    // Tall, narrow foliage cones
    const foliageLayers = 5;
    for (let i = 0; i < foliageLayers; i++) {
        const layerScale = 1 - (i * 0.15);
        const coneHeight = (12 + Math.random() * 1) * layerScale;
        const coneRadius = (4 + Math.random() * 0.5) * layerScale;

        const foliageGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8, 1, false);
        randomizeVertices(foliageGeometry.attributes.position.array, 0.4);
        foliageGeometry.attributes.position.needsUpdate = true;
        foliageGeometry.scale(scale, scale, scale);

        const foliageColor = randomHSLColor(0.6, 0.55, 0.3, 0.02, 0.1, 0.1);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: foliageColor,
            roughness: 0.88,
            metalness: 0.0,
            flatShading: true,
            side: THREE.DoubleSide
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.castShadow = true;
        foliage.receiveShadow = true;

        foliage.position.y = trunkHeight * scale - coneHeight * 0.4 + i * (2.5 * scale) - 1.5; // Lowered position
        foliage.rotation.y = Math.random() * Math.PI * 2;
        trunk.add(foliage);
    }

    const group = new THREE.Group();
    group.add(trunk);
    return group;
}

// Variant 10: Silver Birch
function createTreeVariantSilverBirch(scale) {
    // Tree parameters
    const baseRadius = 0.9 + Math.random() * 0.3;
    const topRadius = baseRadius * 0.85;
    const trunkHeight = 17 + Math.random() * 3;

    // Trunk with characteristic white bark
    const trunkGeom = buildTrunkGeometry(trunkHeight, baseRadius, topRadius, scale);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: randomHSLColor(0.1, 0.2, 0.9, 0.0, 0.0, 0.0), // Light color for bark
        roughness: 0.7,
        metalness: 0.0,
        flatShading: true,
        side: THREE.DoubleSide
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight * 0.5 * scale;

    // Slender, layered foliage
    const foliageLayers = 4;
    for (let i = 0; i < foliageLayers; i++) {
        const layerScale = 1 - (i * 0.2);
        const coneHeight = (8 + Math.random() * 1.5) * layerScale;
        const coneRadius = (3 + Math.random() * 0.5) * layerScale;

        const foliageGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 6, 1, false);
        randomizeVertices(foliageGeometry.attributes.position.array, 0.3);
        foliageGeometry.attributes.position.needsUpdate = true;
        foliageGeometry.scale(scale, scale, scale);

        const foliageColor = randomHSLColor(0.6, 0.5, 0.4, 0.01, 0.05, 0.05);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: foliageColor,
            roughness: 0.85,
            metalness: 0.0,
            flatShading: true,
            side: THREE.DoubleSide
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.castShadow = true;
        foliage.receiveShadow = true;

        foliage.position.y = trunkHeight * scale - coneHeight * 0.2 + i * (3 * scale) - 1; // Lowered position
        foliage.rotation.y = Math.random() * Math.PI * 2;
        trunk.add(foliage);
    }

    const group = new THREE.Group();
    group.add(trunk);
    return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER CREATE-TREE FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
function createTree(originalScale = 1) {
    // We scale everything up 4×
    const finalScale = originalScale * 4;

    // Randomly pick one of the 10 named variants
    const variantIndex = Math.floor(Math.random() * 10);
    let treeName;
    let treeMesh;

    switch (variantIndex) {
        case 0:
            treeName = 'Ancient Oak';
            treeMesh = createTreeVariantAncientOak(finalScale);
            break;
        case 1:
            treeName = 'Towering Pine';
            treeMesh = createTreeVariantToweringPine(finalScale);
            break;
        case 2:
            treeName = 'Mighty Redwood';
            treeMesh = createTreeVariantMightyRedwood(finalScale);
            break;
        case 3:
            treeName = 'Elder Birch';
            treeMesh = createTreeVariantElderBirch(finalScale);
            break;
        case 4:
            treeName = 'Sacred Ash';
            treeMesh = createTreeVariantSacredAsh(finalScale);
            break;
        case 5:
            treeName = 'Mystic Maple';
            treeMesh = createTreeVariantMysticMaple(finalScale);
            break;
        case 6:
            treeName = 'Whispering Willow';
            treeMesh = createTreeVariantWhisperingWillow(finalScale);
            break;
        case 7:
            treeName = 'Enchanted Spruce';
            treeMesh = createTreeVariantEnchantedSpruce(finalScale);
            break;
        case 8:
            treeName = 'Twilight Cypress';
            treeMesh = createTreeVariantTwilightCypress(finalScale);
            break;
        case 9:
            treeName = 'Silver Birch';
            treeMesh = createTreeVariantSilverBirch(finalScale);
            break;
        default:
            treeName = 'Mystic Maple';
            treeMesh = createTreeVariantMysticMaple(finalScale);
            break;
    }

    // Attach userData with the tree’s name
    treeMesh.userData = {
        name: treeName,
        type: 'tree',
        gatheringTime: 5000, // 5 seconds
        selected: false
    };

    return treeMesh;
}

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
// TREE REMOVAL & SELECTION
// ─────────────────────────────────────────────────────────────────────────────
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
window.TerrainGenerator     = TerrainGenerator;
window.addPlantsToTerrain   = addPlantsToTerrain;
window.createGround         = createGround;
window.removeSelectedTrees  = removeSelectedTrees;
window.toggleTreeSelection  = toggleTreeSelection;
window.createTree           = createTree;

// Example usage:
// const scene = new THREE.Scene();
// const terrainSettings = { ... };
// const terrainGenerator = new TerrainGenerator(scene, terrainSettings);
// addPlantsToTerrain(scene);
addPlantsToTerrain(scene);
