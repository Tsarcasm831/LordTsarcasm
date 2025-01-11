// spawnzone.js
// Note: Make sure to include terrain.js before this file in your HTML

function createSpawnZone(scene, walls, enemyWalls, structures, friendlies, npcData) {
    // Create ground and safe zone
    const ground = createGround(scene);
    const { safeZoneGround, safeZoneBarrier } = createSafeZone(scene, enemyWalls);

    // Create settlement walls
    createSettlementWalls(scene, walls, enemyWalls);

    // Create shrine and teleport pad
    const teleportPad = createShrine(scene);

    // Create structures and NPCs
    createStructuresAndNPCs(scene, walls, structures, friendlies, npcData);

    // Return references if needed
    return {
        ground: ground,
        safeZoneGround: safeZoneGround,
        teleportPad: teleportPad
    };
}

function createSafeZone(scene, enemyWalls) {
    // Create safe zone ground
    const safeZoneGroundGeometry = new THREE.PlaneGeometry(1200, 1200);
    
    // Load and configure the texture
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('https://file.garden/Zy7B0LkdIVpGyzA1/broken%20concrete.webp');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(50, 50); // Adjust repeat to match the scale
    
    const safeZoneGroundMaterial = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.8,
        metalness: 0.2
    });
    
    const safeZoneGround = new THREE.Mesh(safeZoneGroundGeometry, safeZoneGroundMaterial);
    safeZoneGround.rotation.x = -Math.PI / 2;
    safeZoneGround.position.y = 0.1;
    scene.add(safeZoneGround);

    // Create invisible barrier for safe zone
    const safeZoneBarrierGeometry = new THREE.BoxGeometry(1200, 50, 1200);
    const safeZoneBarrierMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000, 
        transparent: true, 
        opacity: 0 
    });
    const safeZoneBarrier = new THREE.Mesh(safeZoneBarrierGeometry, safeZoneBarrierMaterial);
    safeZoneBarrier.position.set(0, 25, 0);
    scene.add(safeZoneBarrier);
    enemyWalls.push(safeZoneBarrier);

    return { safeZoneGround, safeZoneBarrier };
}

function createSettlementWalls(scene, walls, enemyWalls) {
    const wallHeight = 50;
    const wallThickness = 5;
    const settlementRadius = 1000;
    const numSegments = 16;
    
    for (let i = 0; i < numSegments; i++) {
        const angle1 = (i / numSegments) * Math.PI * 2;
        const angle2 = ((i + 1) / numSegments) * Math.PI * 2;
        
        const x1 = Math.cos(angle1) * settlementRadius;
        const z1 = Math.sin(angle1) * settlementRadius;
        const x2 = Math.cos(angle2) * settlementRadius;
        const z2 = Math.sin(angle2) * settlementRadius;
        
        // Calculate wall dimensions and position
        const dx = x2 - x1;
        const dz = z2 - z1;
        const wallLength = Math.sqrt(dx * dx + dz * dz);
        const wallAngle = Math.atan2(dz, dx);
        
        // Create wall segment
        const wall = createSafeZoneWall(wallLength, wallHeight, wallThickness, 
            (x1 + x2) / 2, wallHeight / 2, (z1 + z2) / 2);
        wall.rotation.y = wallAngle;
        scene.add(wall);
        walls.push(wall);
    }
}

function createSafeZoneWall(width, height, depth, x, y, z) {
    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    return wall;
}

function createShrine(scene) {
    const shrineGroup = new THREE.Group();

    const floorGeometry = new THREE.CircleGeometry(20, 32);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.1;
    shrineGroup.add(floor);

    const teleportPadGeometry = new THREE.CircleGeometry(5, 32);
    const teleportPadMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const teleportPad = new THREE.Mesh(teleportPadGeometry, teleportPadMaterial);
    teleportPad.rotation.x = -Math.PI / 2;
    teleportPad.position.y = 0.11;
    teleportPad.name = 'teleportPad';
    shrineGroup.add(teleportPad);

    shrineGroup.position.set(0, 0, 0);
    scene.add(shrineGroup);

    return teleportPad;
}

function createStructuresAndNPCs(scene, walls, structures, friendlies, npcData) {
    // Define positions for structures in a circle around the center
    const radius = 800; // Distance from center
    const numBuildings = 8; // Number of buildings to place
    
    for (let i = 0; i < numBuildings; i++) {
        const angle = (i / numBuildings) * Math.PI * 2;
        // Add some randomness to make it look more natural
        const variationRadius = radius + (Math.random() - 0.5) * 100;
        const x = Math.cos(angle) * variationRadius;
        const z = Math.sin(angle) * variationRadius;
        
        // Create a building of a random type (1-5)
        const type = Math.floor(Math.random() * 5) + 1;
        const structure = createBuilding(type);
        // Add random rotation to make it more interesting
        structure.rotation.y = Math.random() * Math.PI * 2;
        structure.position.set(x, 0, z);
        scene.add(structure);
        
        // Add walls for collision
        if (structure.userData.walls) {
            walls.push(...structure.userData.walls);
        }
        structures.push(structure);

        // Add an NPC near the building
        if (npcData && npcData.length > 0) {
            const npcInfo = npcData[Math.floor(Math.random() * npcData.length)];
            const npc = createFriendlyNPC(0x00ff00, npcInfo.name, npcInfo.dialogue);
            // Place NPC slightly offset from the building
            npc.position.set(x + (Math.random() - 0.5) * 20, 0, z + (Math.random() - 0.5) * 20);
            scene.add(npc);
            friendlies.push(npc);
        }
    }
}

function getSpawnZonePositions() {
    const positions = [];
    const radius = 800; // Distance from center
    const numBuildings = 8; // Number of buildings to place
    
    for (let i = 0; i < numBuildings; i++) {
        const angle = (i / numBuildings) * Math.PI * 2;
        // Add some randomness to make it look more natural
        const variationRadius = radius + (Math.random() - 0.5) * 100;
        const x = Math.cos(angle) * variationRadius;
        const z = Math.sin(angle) * variationRadius;
        positions.push({ x, z });
    }
    
    return positions;
}

function createBuilding(type) {
    const building = new THREE.Group();
    building.userData.walls = [];

    // Common materials
    const woodMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const thatchMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
    const metalMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 });

    let structure;
    switch(type) {
        case 1: // Tavern
            const tavernWidth = 60;
            const tavernDepth = 80;
            const tavernHeight = 40;
            
            // Main structure
            const tavernGeometry = new THREE.BoxGeometry(tavernWidth, tavernHeight, tavernDepth);
            structure = new THREE.Mesh(tavernGeometry, woodMaterial);
            structure.position.y = tavernHeight / 2;
            building.add(structure);
            building.userData.walls.push(structure);

            // Door
            const doorGeometry = new THREE.BoxGeometry(15, 25, 2);
            const door = new THREE.Mesh(doorGeometry, woodMaterial);
            door.position.set(0, 12.5, -tavernDepth/2);
            building.add(door);

            // Windows
            for (let x of [-20, 20]) {
                const windowGeom = new THREE.BoxGeometry(10, 15, 1);
                const window = new THREE.Mesh(windowGeom, windowMaterial);
                window.position.set(x, tavernHeight/2, -tavernDepth/2);
                building.add(window);
            }

            // Sloped roof
            const roofGeometry = new THREE.ConeGeometry(Math.sqrt(tavernWidth * tavernWidth + tavernDepth * tavernDepth) / 2, 30, 4);
            const roof = new THREE.Mesh(roofGeometry, thatchMaterial);
            roof.position.y = tavernHeight + 10;
            roof.rotation.y = Math.PI / 4;
            building.add(roof);

            // Chimney
            const chimneyGeometry = new THREE.BoxGeometry(8, 20, 8);
            const chimney = new THREE.Mesh(chimneyGeometry, stoneMaterial);
            chimney.position.set(tavernWidth/4, tavernHeight + 20, tavernDepth/4);
            building.add(chimney);
            break;

        case 2: // Blacksmith
            const forgeWidth = 50;
            const forgeDepth = 60;
            const forgeHeight = 35;

            // Main workshop
            const forgeGeometry = new THREE.BoxGeometry(forgeWidth, forgeHeight, forgeDepth);
            structure = new THREE.Mesh(forgeGeometry, stoneMaterial);
            structure.position.y = forgeHeight / 2;
            building.add(structure);
            building.userData.walls.push(structure);

            // Door
            const forgeDoorGeometry = new THREE.BoxGeometry(12, 20, 2);
            const forgeDoor = new THREE.Mesh(forgeDoorGeometry, woodMaterial);
            forgeDoor.position.set(0, 10, -forgeDepth/2);
            building.add(forgeDoor);

            // Anvil
            const anvilGeometry = new THREE.BoxGeometry(5, 8, 10);
            const anvil = new THREE.Mesh(anvilGeometry, metalMaterial);
            anvil.position.set(forgeWidth/4, 4, forgeDepth/4);
            building.add(anvil);

            // Forge chimney
            const forgeChimneyGeometry = new THREE.CylinderGeometry(5, 7, 25);
            const forgeChimney = new THREE.Mesh(forgeChimneyGeometry, stoneMaterial);
            forgeChimney.position.set(-forgeWidth/4, forgeHeight + 5, -forgeDepth/4);
            building.add(forgeChimney);

            // Simple pitched roof
            const forgeRoofGeometry = new THREE.BoxGeometry(forgeWidth + 10, 2, forgeDepth + 10);
            const forgeRoof = new THREE.Mesh(forgeRoofGeometry, woodMaterial);
            forgeRoof.position.y = forgeHeight;
            building.add(forgeRoof);
            break;

        case 3: // Temple
            const templeWidth = 70;
            const templeDepth = 90;
            const templeHeight = 50;

            // Main temple structure
            const templeGeometry = new THREE.BoxGeometry(templeWidth, templeHeight, templeDepth);
            structure = new THREE.Mesh(templeGeometry, stoneMaterial);
            structure.position.y = templeHeight / 2;
            building.add(structure);
            building.userData.walls.push(structure);

            // Entrance steps
            const stepsGeometry = new THREE.BoxGeometry(30, 5, 20);
            const steps = new THREE.Mesh(stepsGeometry, stoneMaterial);
            steps.position.set(0, 2.5, -templeDepth/2 - 10);
            building.add(steps);

            // Columns
            for (let i = -1; i <= 1; i += 2) {
                const columnGeometry = new THREE.CylinderGeometry(5, 5, templeHeight, 8);
                const column = new THREE.Mesh(columnGeometry, stoneMaterial);
                column.position.set(i * (templeWidth/3), templeHeight/2, -templeDepth/2);
                building.add(column);
            }

            // Dome roof
            const domeGeometry = new THREE.SphereGeometry(templeWidth/2, 32, 32, 0, Math.PI * 2, 0, Math.PI/2);
            const dome = new THREE.Mesh(domeGeometry, metalMaterial);
            dome.position.y = templeHeight;
            building.add(dome);
            break;

        case 4: // Market stall
            const stallWidth = 40;
            const stallDepth = 30;
            const stallHeight = 25;

            // Counter
            const counterGeometry = new THREE.BoxGeometry(stallWidth, stallHeight/2, stallDepth);
            structure = new THREE.Mesh(counterGeometry, woodMaterial);
            structure.position.y = stallHeight/4;
            building.add(structure);
            building.userData.walls.push(structure);

            // Display items (boxes on the counter)
            for (let x = -1; x <= 1; x++) {
                const boxGeometry = new THREE.BoxGeometry(8, 8, 8);
                const box = new THREE.Mesh(boxGeometry, woodMaterial);
                box.position.set(x * 12, stallHeight/2 + 4, 0);
                building.add(box);
            }

            // Canopy
            const canopyGeometry = new THREE.BoxGeometry(stallWidth + 10, 2, stallDepth + 10);
            const canopy = new THREE.Mesh(canopyGeometry, thatchMaterial);
            canopy.position.y = stallHeight;
            building.add(canopy);

            // Support poles
            for (let x = -1; x <= 1; x += 2) {
                for (let z = -1; z <= 1; z += 2) {
                    const poleGeometry = new THREE.CylinderGeometry(2, 2, stallHeight);
                    const pole = new THREE.Mesh(poleGeometry, woodMaterial);
                    pole.position.set(x * (stallWidth/2), stallHeight/2, z * (stallDepth/2));
                    building.add(pole);
                }
            }
            break;

        case 5: // House
            const houseWidth = 45;
            const houseDepth = 55;
            const houseHeight = 35;

            // Main house structure
            const houseGeometry = new THREE.BoxGeometry(houseWidth, houseHeight, houseDepth);
            structure = new THREE.Mesh(houseGeometry, woodMaterial);
            structure.position.y = houseHeight / 2;
            building.add(structure);
            building.userData.walls.push(structure);

            // Door
            const houseDoorGeometry = new THREE.BoxGeometry(10, 20, 2);
            const houseDoor = new THREE.Mesh(houseDoorGeometry, woodMaterial);
            houseDoor.position.set(0, 10, -houseDepth/2);
            building.add(houseDoor);

            // Windows
            [-1, 1].forEach(x => {
                const windowGeom = new THREE.BoxGeometry(8, 12, 1);
                const window = new THREE.Mesh(windowGeom, windowMaterial);
                window.position.set(x * (houseWidth/3), houseHeight/2, -houseDepth/2);
                building.add(window);
            });

            // Pitched roof
            const pitchedRoofGeometry = new THREE.CylinderGeometry(houseDepth/2, houseDepth/2, houseWidth, 4, 1, false, Math.PI/4, Math.PI);
            const pitchedRoof = new THREE.Mesh(pitchedRoofGeometry, thatchMaterial);
            pitchedRoof.rotation.z = Math.PI/2;
            pitchedRoof.position.y = houseHeight + houseDepth/4;
            building.add(pitchedRoof);
            break;
    }

    return building;
}

function createFriendlyNPC(color = 0x00ff00, name = 'Friendly NPC', dialogue = 'Hello!') {
    const npc = createHumanoid(color);
    npc.userData.type = 'friendly';
    npc.userData.name = name;
    npc.userData.dialogue = dialogue;
    return npc;
}

// Function to add diverse plants to the terrain with collision detection
function addPlantsToTerrain() {
    const numElements = 3000; // Total number of natural elements
    const colliders = []; // Array to store collision objects

    // Create a texture loader and load the bark texture
    const textureLoader = new THREE.TextureLoader();
    const barkTexture = textureLoader.load('https://file.garden/Zy7B0LkdIVpGyzA1/bark.webp');
    barkTexture.wrapS = THREE.RepeatWrapping;
    barkTexture.wrapT = THREE.RepeatWrapping;

    // Load the leaf texture
    const leafTexture = textureLoader.load('https://file.garden/Zy7B0LkdIVpGyzA1/leaf.webp');
    leafTexture.wrapS = THREE.RepeatWrapping;
    leafTexture.wrapT = THREE.RepeatWrapping;

    // Function to create a tree with separate trunk and foliage
    function createTree(scale = 1) {
        const treeGroup = new THREE.Group();
        
        // Randomly select tree type
        const treeType = Math.random();
        
        if (treeType < 0.4) { // Pine tree
            createPineTree(treeGroup, scale);
        } else if (treeType < 0.7) { // Oak tree
            createOakTree(treeGroup, scale);
        } else { // Birch tree
            createBirchTree(treeGroup, scale);
        }

        // Add collision box
        const bbox = new THREE.Box3();
        bbox.setFromObject(treeGroup);
        const collider = new THREE.Box3Helper(bbox, 0xff0000);
        collider.visible = false;
        treeGroup.add(collider);
        colliders.push({ type: 'tree', box: bbox, object: treeGroup });

        return treeGroup;
    }

    function createPineTree(group, scale) {
        // Create trunk with slight random lean
        const lean = (Math.random() - 0.5) * 0.2;
        const trunkGeometry = new THREE.CylinderGeometry(1.5 * scale, 2.5 * scale, 45 * scale, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            map: barkTexture,
            color: new THREE.Color(0x4A2F1B).multiplyScalar(0.8 + Math.random() * 0.4),
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 22.5 * scale;
        trunk.rotation.x = lean;
        group.add(trunk);

        // Create multiple foliage layers in a cone shape
        const foliageLayers = 5 + Math.floor(Math.random() * 3);
        for (let i = 0; i < foliageLayers; i++) {
            const layerScale = 1 - (i / foliageLayers);
            const foliageGeometry = new THREE.ConeGeometry(
                12 * scale * layerScale,
                25 * scale,
                8
            );
            const foliageMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x1B4A1B).multiplyScalar(0.7 + Math.random() * 0.6),
                roughness: 1.0,
                metalness: 0.0
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = (35 + i * 12) * scale;
            foliage.rotation.x = lean;
            group.add(foliage);
        }
    }

    function createOakTree(group, scale) {
        // Create a thicker, more gnarled trunk
        const trunkHeight = (35 + Math.random() * 15) * scale;
        const trunkGeometry = new THREE.CylinderGeometry(3 * scale, 4 * scale, trunkHeight, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            map: barkTexture,
            color: new THREE.Color(0x8B4513).multiplyScalar(0.7 + Math.random() * 0.6),
            roughness: 0.8,
            metalness: 0.2
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        group.add(trunk);

        // Create a large, rounded foliage mass
        const foliageClusters = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < foliageClusters; i++) {
            const radius = (15 + Math.random() * 5) * scale;
            const foliageGeometry = new THREE.SphereGeometry(radius, 8, 8);
            const foliageMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x355E3B).multiplyScalar(0.8 + Math.random() * 0.4),
                roughness: 1.0,
                metalness: 0.0
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            
            // Position clusters around the top of the trunk
            const angle = (i / foliageClusters) * Math.PI * 2;
            const distance = (5 + Math.random() * 3) * scale;
            foliage.position.x = Math.cos(angle) * distance;
            foliage.position.z = Math.sin(angle) * distance;
            foliage.position.y = trunkHeight + radius * 0.7;
            group.add(foliage);
        }
    }

    function createBirchTree(group, scale) {
        // Create a tall, slender trunk with white bark
        const trunkHeight = (45 + Math.random() * 15) * scale;
        const trunkGeometry = new THREE.CylinderGeometry(1.5 * scale, 2 * scale, trunkHeight, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            map: barkTexture,
            color: new THREE.Color(0xE6E6E6).multiplyScalar(0.9 + Math.random() * 0.2),
            roughness: 0.7,
            metalness: 0.3
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        group.add(trunk);

        // Create smaller, more delicate foliage
        const foliageLayers = 3 + Math.floor(Math.random() * 2);
        for (let i = 0; i < foliageLayers; i++) {
            const layerGeometry = new THREE.SphereGeometry(
                (8 + Math.random() * 4) * scale,
                8,
                8
            );
            const foliageMaterial = new THREE.MeshStandardMaterial({
                map: leafTexture,
                color: new THREE.Color(0x98FB98).multiplyScalar(0.8 + Math.random() * 0.4),
                roughness: 1.0,
                metalness: 0.0
            });
            const foliage = new THREE.Mesh(layerGeometry, foliageMaterial);
            
            // Position foliage in a more vertical arrangement
            foliage.position.y = trunkHeight - (i * 10 * scale);
            foliage.position.x = (Math.random() - 0.5) * 5 * scale;
            foliage.position.z = (Math.random() - 0.5) * 5 * scale;
            group.add(foliage);
        }
    }

    // Function to create a bush with more natural shape
    function createBush(scale = 1) {
        const bushGroup = new THREE.Group();
        const segments = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < segments; i++) {
            const size = (3 + Math.random() * 2) * scale;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                map: leafTexture,
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
        collider.visible = false; // Hide the collision box
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

addPlantsToTerrain();