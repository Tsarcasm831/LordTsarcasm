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
    
    // Create procedural concrete texture
    const concreteCanvas = document.createElement('canvas');
    concreteCanvas.width = 512;
    concreteCanvas.height = 512;
    const concreteCtx = concreteCanvas.getContext('2d');
    
    // Base color
    concreteCtx.fillStyle = '#808080';
    concreteCtx.fillRect(0, 0, 512, 512);
    
    // Add noise and cracks
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 3;
        concreteCtx.fillStyle = `rgba(${128 + Math.random() * 30 - 15}, ${128 + Math.random() * 30 - 15}, ${128 + Math.random() * 30 - 15}, 0.1)`;
        concreteCtx.fillRect(x, y, size, size);
    }
    
    // Add some cracks
    for (let i = 0; i < 20; i++) {
        const startX = Math.random() * 512;
        const startY = Math.random() * 512;
        concreteCtx.beginPath();
        concreteCtx.moveTo(startX, startY);
        concreteCtx.lineTo(startX + Math.random() * 100 - 50, startY + Math.random() * 100 - 50);
        concreteCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        concreteCtx.lineWidth = 1;
        concreteCtx.stroke();
    }
    
    const groundTexture = new THREE.CanvasTexture(concreteCanvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(50, 50);
    
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

    // Create procedural bark texture
    const barkCanvas = document.createElement('canvas');
    barkCanvas.width = 256;
    barkCanvas.height = 256;
    const barkCtx = barkCanvas.getContext('2d');
    
    // Base color
    barkCtx.fillStyle = '#4A2F1B';
    barkCtx.fillRect(0, 0, 256, 256);
    
    // Add vertical stripes for bark texture
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 256;
        barkCtx.beginPath();
        barkCtx.moveTo(x, 0);
        let prevX = x;
        for (let y = 0; y < 256; y += 10) {
            prevX += (Math.random() - 0.5) * 5;
            barkCtx.lineTo(prevX, y);
        }
        barkCtx.strokeStyle = `rgba(30, 15, 0, ${Math.random() * 0.3})`;
        barkCtx.lineWidth = 1 + Math.random() * 3;
        barkCtx.stroke();
    }
    
    const barkTexture = new THREE.CanvasTexture(barkCanvas);
    barkTexture.wrapS = THREE.RepeatWrapping;
    barkTexture.wrapT = THREE.RepeatWrapping;

    // Create procedural leaf texture
    const leafCanvas = document.createElement('canvas');
    leafCanvas.width = 256;
    leafCanvas.height = 256;
    const leafCtx = leafCanvas.getContext('2d');
    
    // Base green
    leafCtx.fillStyle = '#1B4A1B';
    leafCtx.fillRect(0, 0, 256, 256);
    
    // Add leaf vein patterns
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        leafCtx.beginPath();
        leafCtx.moveTo(x, y);
        const angle = Math.random() * Math.PI * 2;
        leafCtx.lineTo(
            x + Math.cos(angle) * 20,
            y + Math.sin(angle) * 20
        );
        leafCtx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
        leafCtx.lineWidth = 1;
        leafCtx.stroke();
    }
    
    const leafTexture = new THREE.CanvasTexture(leafCanvas);
    leafTexture.wrapS = THREE.RepeatWrapping;
    leafTexture.wrapT = THREE.RepeatWrapping;

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
    const numElements = 3000;
    const colliders = [];
    
    // Grid-based spawning system
    const GRID_SIZE = 10; // Minimum distance between trees
    const TERRAIN_SIZE = 2000;
    const GRID_CELLS = Math.floor(TERRAIN_SIZE / GRID_SIZE);
    const grid = new Array(GRID_CELLS).fill(null).map(() => new Array(GRID_CELLS).fill(false));
    
    const BATCH_SIZE = 2000; // Increased batch size
    let processedElements = 0;
    
    // Create simplified textures for better performance
    const barkTexture = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    const leafTexture = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');

    // Function to check if a point is on concrete
    function isOnConcrete(x, z) {
        const CONCRETE_BOUNDS = {
            minX: -600,  
            maxX: 600,
            minZ: -600,
            maxZ: 600
        };
        
        return x >= CONCRETE_BOUNDS.minX && x <= CONCRETE_BOUNDS.maxX && 
               z >= CONCRETE_BOUNDS.minZ && z <= CONCRETE_BOUNDS.maxZ;
    }

    // Optimized tree creation function
    function createTree(scale = 1) {
        const treeGroup = new THREE.Group();
        
        // Create simplified trunk with fixed height reference
        const trunkHeight = 96 * scale;
        const trunkGeometry = new THREE.CylinderGeometry(1.5 * scale, 2.5 * scale, trunkHeight, 6);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            map: barkTexture,
            color: new THREE.Color(0x4A2F1B),
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;  
        treeGroup.add(trunk);

        // Create simplified foliage
        const foliageGeometry = new THREE.ConeGeometry(12 * scale, 40 * scale, 6);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            map: leafTexture,
            color: new THREE.Color(0x1B4A1B),
            roughness: 1.0,
            metalness: 0.0
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = trunkHeight - (20 * scale);  
        treeGroup.add(foliage);

        return treeGroup;
    }

    function getGridPosition(x, z) {
        const gridX = Math.floor((x + TERRAIN_SIZE/2) / GRID_SIZE);
        const gridZ = Math.floor((z + TERRAIN_SIZE/2) / GRID_SIZE);
        return [
            Math.min(Math.max(gridX, 0), GRID_CELLS - 1),
            Math.min(Math.max(gridZ, 0), GRID_CELLS - 1)
        ];
    }
    
    function processBatch() {
        const batchEnd = Math.min(processedElements + BATCH_SIZE, numElements);
        let attempts = 0;
        const maxAttempts = BATCH_SIZE * 2;
        
        while (processedElements < batchEnd && attempts < maxAttempts) {
            const x = (Math.random() - 0.5) * TERRAIN_SIZE;
            const z = (Math.random() - 0.5) * TERRAIN_SIZE;
            
            // Skip if point is on concrete
            if (isOnConcrete(x, z)) {
                attempts++;
                continue;
            }
            
            const [gridX, gridZ] = getGridPosition(x, z);
            
            if (!grid[gridX][gridZ]) {
                const tree = createTree(0.8 + Math.random() * 0.4);
                tree.position.set(x, 0, z);
                tree.rotation.y = Math.random() * Math.PI * 2;
                scene.add(tree);
                grid[gridX][gridZ] = true;
                processedElements++;
            }
            
            attempts++;
        }
        
        if (processedElements < numElements) {
            setTimeout(processBatch, 0);
        }
    }
    
    // Start the batched processing
    processBatch();
}

addPlantsToTerrain();