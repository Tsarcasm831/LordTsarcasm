// settlement.js

function createSettlement(scene, walls = [], enemyWalls = [], structures = [], friendlies = [], npcData = null) {
    if (!scene) {
        console.error('Scene is required for createSettlement');
        return null;
    }

    // Create ground and safe zone
    const { ground, safeZoneGround } = createSettlementGround(scene);

    // Create settlement walls
    const wallsGroup = createSettlementWalls(scene, walls, enemyWalls);

    // Create shrine and teleport pad
    const teleportPad = createShrine(scene);

    // Create structures and NPCs
    createStructuresAndNPCs(scene, walls, structures, friendlies, npcData);

    // Add decorative elements
    addSettlementDecorations(scene, walls);

    return {
        ground,
        safeZoneGround,
        teleportPad,
        wallsGroup
    };
}

function createSettlementGround(scene) {
    if (!scene) {
        console.error('Scene is required for createSettlementGround');
        return null;
    }

    // Create textured ground
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    context.fillStyle = '#654321';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = '#4c3a2b';
    for (let i = 0; i < canvas.width; i += 16) {
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
        context.moveTo(0, i);
        context.lineTo(canvas.width, i);
    }
    context.stroke();

    const groundTexture = new THREE.CanvasTexture(canvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(50, 50);

    const groundMaterial = new THREE.MeshLambertMaterial({
        map: groundTexture,
        side: THREE.DoubleSide
    });

    const groundGeometry = new THREE.PlaneGeometry(2400, 2400);
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.name = 'settlementGround';
    scene.add(ground);

    // Create safe zone ground
    const safeZoneGroundGeometry = new THREE.PlaneGeometry(1200, 1200);
    const safeZoneGroundMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const safeZoneGround = new THREE.Mesh(safeZoneGroundGeometry, safeZoneGroundMaterial);
    safeZoneGround.rotation.x = -Math.PI / 2;
    safeZoneGround.position.y = 0.1;
    scene.add(safeZoneGround);

    return { ground, safeZoneGround };
}

function createSettlementWalls(scene, walls = [], enemyWalls = []) {
    if (!scene) {
        console.error('Scene is required for createSettlementWalls');
        return new THREE.Group(); // Return empty group if no scene
    }

    const safeZoneSize = 1200;
    const wallHeight = 30;
    const wallThickness = 2;
    const gateWidth = 100;
    const wallsGroup = new THREE.Group();
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });

    // Ensure walls and enemyWalls are arrays
    if (!Array.isArray(walls)) walls = [];
    if (!Array.isArray(enemyWalls)) enemyWalls = [];

    // North Wall (Split into two segments)
    const sideLength = (safeZoneSize - gateWidth) / 2;
    
    // North Walls
    const northLeftWall = new THREE.Mesh(
        new THREE.BoxGeometry(sideLength, wallHeight, wallThickness),
        wallMaterial
    );
    northLeftWall.position.set(-safeZoneSize/4 - gateWidth/4, wallHeight/2, -safeZoneSize/2);
    wallsGroup.add(northLeftWall);
    walls.push(northLeftWall);

    const northRightWall = new THREE.Mesh(
        new THREE.BoxGeometry(sideLength, wallHeight, wallThickness),
        wallMaterial
    );
    northRightWall.position.set(safeZoneSize/4 + gateWidth/4, wallHeight/2, -safeZoneSize/2);
    wallsGroup.add(northRightWall);
    walls.push(northRightWall);

    // South Walls
    const southLeftWall = northLeftWall.clone();
    southLeftWall.position.set(-safeZoneSize/4 - gateWidth/4, wallHeight/2, safeZoneSize/2);
    wallsGroup.add(southLeftWall);
    walls.push(southLeftWall);

    const southRightWall = northRightWall.clone();
    southRightWall.position.set(safeZoneSize/4 + gateWidth/4, wallHeight/2, safeZoneSize/2);
    wallsGroup.add(southRightWall);
    walls.push(southRightWall);

    // Side Walls
    const eastWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, safeZoneSize),
        wallMaterial
    );
    eastWall.position.set(safeZoneSize/2, wallHeight/2, 0);
    wallsGroup.add(eastWall);
    walls.push(eastWall);

    const westWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, safeZoneSize),
        wallMaterial
    );
    westWall.position.set(-safeZoneSize/2, wallHeight/2, 0);
    wallsGroup.add(westWall);
    walls.push(westWall);

    // Gates (enemy barriers only - transparent)
    const gateMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
    });

    const northGate = new THREE.Mesh(
        new THREE.BoxGeometry(gateWidth, wallHeight, wallThickness),
        gateMaterial
    );
    northGate.position.set(0, wallHeight/2, -safeZoneSize/2);
    wallsGroup.add(northGate);
    enemyWalls.push(northGate);

    const southGate = northGate.clone();
    southGate.position.set(0, wallHeight/2, safeZoneSize/2);
    wallsGroup.add(southGate);
    enemyWalls.push(southGate);

    scene.add(wallsGroup);
    return wallsGroup;
}

function createShrine(scene) {
    if (!scene) {
        console.error('Scene is required for createShrine');
        return null;
    }

    const shrineGroup = new THREE.Group();

    // Create shrine platform
    const platformGeometry = new THREE.CircleGeometry(20, 32);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = -Math.PI / 2;
    platform.position.y = 0.1;
    shrineGroup.add(platform);

    // Create teleport pad
    const teleportPadGeometry = new THREE.CircleGeometry(5, 32);
    const teleportPadMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.7
    });
    const teleportPad = new THREE.Mesh(teleportPadGeometry, teleportPadMaterial);
    teleportPad.rotation.x = -Math.PI / 2;
    teleportPad.position.y = 0.2;
    teleportPad.name = 'teleportPad';
    shrineGroup.add(teleportPad);

    // Add decorative pillars
    const pillarGeometry = new THREE.CylinderGeometry(1, 1, 15, 8);
    const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * 15;
        const z = Math.sin(angle) * 15;
        
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, 7.5, z);
        shrineGroup.add(pillar);
    }

    shrineGroup.position.set(0, 0, 0);
    scene.add(shrineGroup);

    return teleportPad;
}

function createStructuresAndNPCs(scene, walls, structures, friendlies, npcData) {
    if (!scene) {
        console.error('Scene is required for createStructuresAndNPCs');
        return;
    }

    const positions = getSettlementPositions();
    
    positions.forEach(pos => {
        // Create building with random type
        const type = Math.floor(Math.random() * 4) + 1;
        const structure = createBuilding(type);
        
        // Apply random rotation and scale
        structure.rotation.y = Math.random() * Math.PI * 2;
        structure.scale.set(pos.scale, pos.scale, pos.scale);
        structure.position.set(pos.x, 0, pos.z);
        
        scene.add(structure);
        
        if (structure.userData && structure.userData.walls) {
            walls.push(...structure.userData.walls);
        }
        structures.push(structure);

        // Add NPC if data is provided
        if (npcData && npcData.length > 0) {
            const npcInfo = npcData[Math.floor(Math.random() * npcData.length)];
            const npc = createFriendlyNPC(0x00ff00, npcInfo.name, npcInfo.dialogue);
            
            // Position NPC near the building but with some randomness
            const npcAngle = Math.random() * Math.PI * 2;
            const npcRadius = 15 + Math.random() * 10;
            npc.position.set(
                pos.x + Math.cos(npcAngle) * npcRadius,
                0,
                pos.z + Math.sin(npcAngle) * npcRadius
            );
            
            scene.add(npc);
            friendlies.push(npc);
        }
    });
}

function getSettlementPositions() {
    const positions = [];
    const safeZoneSize = 1200;
    const minDistance = 100; // Minimum distance between buildings
    
    // Create clusters of buildings
    const clusters = [
        { x: -400, z: -400, radius: 150, count: 3 },
        { x: 400, z: -400, radius: 200, count: 4 },
        { x: -400, z: 400, radius: 180, count: 3 },
        { x: 400, z: 400, radius: 160, count: 3 },
        { x: 0, z: 0, radius: 250, count: 5 }
    ];

    clusters.forEach(cluster => {
        for (let i = 0; i < cluster.count; i++) {
            const angle = (i / cluster.count) * Math.PI * 2 + Math.random() * 0.5;
            const radius = Math.random() * cluster.radius;
            const x = cluster.x + Math.cos(angle) * radius;
            const z = cluster.z + Math.sin(angle) * radius;
            
            // Check if position is within safe zone bounds
            if (Math.abs(x) < safeZoneSize/2 - 50 && Math.abs(z) < safeZoneSize/2 - 50) {
                positions.push({
                    x: x,
                    z: z,
                    scale: 0.8 + Math.random() * 0.4 // Random scale between 0.8 and 1.2
                });
            }
        }
    });

    // Add some random individual buildings
    for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 300 + 200;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Check if position is within safe zone bounds
        if (Math.abs(x) < safeZoneSize/2 - 50 && Math.abs(z) < safeZoneSize/2 - 50) {
            positions.push({
                x: x,
                z: z,
                scale: 0.8 + Math.random() * 0.4
            });
        }
    }

    return positions;
}

function addSettlementDecorations(scene, walls) {
    if (!scene) {
        console.error('Scene is required for addSettlementDecorations');
        return;
    }

    // Add trees
    const treeGeometry = new THREE.ConeGeometry(10, 30, 8);
    const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const trunkGeometry = new THREE.CylinderGeometry(2, 2, 10, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });

    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 200 + 500;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 5, z);
        scene.add(trunk);

        const tree = new THREE.Mesh(treeGeometry, treeMaterial);
        tree.position.set(x, 25, z);
        scene.add(tree);
    }

    // Add rocks
    const rockGeometry = new THREE.DodecahedronGeometry(5);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });

    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 400 + 300;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, 2.5, z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.scale.set(
            0.5 + Math.random(),
            0.5 + Math.random(),
            0.5 + Math.random()
        );
        scene.add(rock);
    }
}

function createBuilding(type) {
    const building = new THREE.Group();
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });

    switch(type) {
        case 1:
            // Type 1: Standard Building
            addStandardWalls(building, wallMaterial);
            addStandardRoof(building, roofMaterial);
            break;
        case 2:
            // Type 2: Large Building
            addLargeWalls(building, wallMaterial);
            addLargeRoof(building, roofMaterial);
            break;
        case 3:
            // Type 3: L-shaped Building
            addLShapedWalls(building, wallMaterial);
            addFlatRoof(building, roofMaterial);
            break;
        case 4:
            // Type 4: Small Tower
            addTowerBuilding(building, wallMaterial, roofMaterial);
            break;
        default:
            // Default to standard building
            addStandardWalls(building, wallMaterial);
            addStandardRoof(building, roofMaterial);
    }

    return building;
}

function addStandardWalls(building, material) {
    const wallHeight = 30;
    const wallLength = 50;
    const wallThickness = 2;
    const walls = [];

    // Front wall with door
    const frontWallShape = new THREE.Shape();
    frontWallShape.moveTo(-wallLength/2, 0);
    frontWallShape.lineTo(wallLength/2, 0);
    frontWallShape.lineTo(wallLength/2, wallHeight);
    frontWallShape.lineTo(-wallLength/2, wallHeight);
    frontWallShape.lineTo(-wallLength/2, 0);

    // Add door hole
    const doorWidth = 10;
    const doorHeight = 20;
    const doorHole = new THREE.Path();
    doorHole.moveTo(-doorWidth/2, 0);
    doorHole.lineTo(doorWidth/2, 0);
    doorHole.lineTo(doorWidth/2, doorHeight);
    doorHole.lineTo(-doorWidth/2, doorHeight);
    frontWallShape.holes.push(doorHole);

    const frontWallGeometry = new THREE.ShapeGeometry(frontWallShape);
    const frontWall = new THREE.Mesh(frontWallGeometry, material);
    frontWall.position.set(0, 0, -wallLength/2);
    frontWall.rotation.y = Math.PI; // Rotate to face outward
    building.add(frontWall);
    walls.push(frontWall);

    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallLength, wallHeight, wallThickness),
        material
    );
    backWall.position.set(0, wallHeight/2, wallLength/2);
    building.add(backWall);
    walls.push(backWall);

    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, wallLength),
        material
    );
    leftWall.position.set(-wallLength/2, wallHeight/2, 0);
    building.add(leftWall);
    walls.push(leftWall);

    const rightWall = leftWall.clone();
    rightWall.position.x = wallLength/2;
    building.add(rightWall);
    walls.push(rightWall);

    // Add floor
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(wallLength, wallThickness, wallLength),
        material
    );
    floor.position.set(0, -wallThickness/2, 0);
    building.add(floor);

    building.userData.walls = walls;
}

function addStandardRoof(building, material) {
    const roofGeometry = new THREE.ConeGeometry(35, 20, 4);
    const roof = new THREE.Mesh(roofGeometry, material);
    roof.rotation.y = Math.PI/4;
    roof.position.y = 40;
    building.add(roof);
}

function addLargeWalls(building, material) {
    const wallHeight = 40;
    const wallLength = 80;
    const wallThickness = 2;
    const walls = [];

    // Front wall with door
    const frontWallShape = new THREE.Shape();
    frontWallShape.moveTo(-wallLength/2, 0);
    frontWallShape.lineTo(wallLength/2, 0);
    frontWallShape.lineTo(wallLength/2, wallHeight);
    frontWallShape.lineTo(-wallLength/2, wallHeight);
    frontWallShape.lineTo(-wallLength/2, 0);

    // Add door hole
    const doorWidth = 15;
    const doorHeight = 25;
    const doorHole = new THREE.Path();
    doorHole.moveTo(-doorWidth/2, 0);
    doorHole.lineTo(doorWidth/2, 0);
    doorHole.lineTo(doorWidth/2, doorHeight);
    doorHole.lineTo(-doorWidth/2, doorHeight);
    frontWallShape.holes.push(doorHole);

    const frontWallGeometry = new THREE.ShapeGeometry(frontWallShape);
    const frontWall = new THREE.Mesh(frontWallGeometry, material);
    frontWall.position.set(0, 0, -wallLength/2);
    frontWall.rotation.y = Math.PI; // Rotate to face outward
    building.add(frontWall);
    walls.push(frontWall);

    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallLength, wallHeight, wallThickness),
        material
    );
    backWall.position.set(0, wallHeight/2, wallLength/2);
    building.add(backWall);
    walls.push(backWall);

    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, wallLength),
        material
    );
    leftWall.position.set(-wallLength/2, wallHeight/2, 0);
    building.add(leftWall);
    walls.push(leftWall);

    const rightWall = leftWall.clone();
    rightWall.position.x = wallLength/2;
    building.add(rightWall);
    walls.push(rightWall);

    // Add floor
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(wallLength, wallThickness, wallLength),
        material
    );
    floor.position.set(0, -wallThickness/2, 0);
    building.add(floor);

    building.userData.walls = walls;
}

function addLargeRoof(building, material) {
    const roofGeometry = new THREE.ConeGeometry(60, 30, 4);
    const roof = new THREE.Mesh(roofGeometry, material);
    roof.rotation.y = Math.PI/4;
    roof.position.y = 55;
    building.add(roof);
}

function addLShapedWalls(building, material) {
    const wallHeight = 35;
    const mainLength = 60;
    const wingLength = 40;
    const wallThickness = 2;
    const walls = [];

    // Main section front wall with door
    const mainFrontShape = new THREE.Shape();
    mainFrontShape.moveTo(-mainLength/2, 0);
    mainFrontShape.lineTo(mainLength/2, 0);
    mainFrontShape.lineTo(mainLength/2, wallHeight);
    mainFrontShape.lineTo(-mainLength/2, wallHeight);
    mainFrontShape.lineTo(-mainLength/2, 0);

    // Add door hole
    const doorWidth = 12;
    const doorHeight = 22;
    const doorHole = new THREE.Path();
    doorHole.moveTo(-doorWidth/2, 0);
    doorHole.lineTo(doorWidth/2, 0);
    doorHole.lineTo(doorWidth/2, doorHeight);
    doorHole.lineTo(-doorWidth/2, doorHeight);
    mainFrontShape.holes.push(doorHole);

    const mainFrontWall = new THREE.Mesh(
        new THREE.ShapeGeometry(mainFrontShape),
        material
    );
    mainFrontWall.position.set(0, 0, -mainLength/2);
    mainFrontWall.rotation.y = Math.PI;
    building.add(mainFrontWall);
    walls.push(mainFrontWall);

    const mainBackWall = new THREE.Mesh(
        new THREE.BoxGeometry(mainLength, wallHeight, wallThickness),
        material
    );
    mainBackWall.position.set(0, wallHeight/2, mainLength/2);
    building.add(mainBackWall);
    walls.push(mainBackWall);

    // Wing section walls with side entrance
    const wingFrontShape = new THREE.Shape();
    wingFrontShape.moveTo(-wingLength/2, 0);
    wingFrontShape.lineTo(wingLength/2, 0);
    wingFrontShape.lineTo(wingLength/2, wallHeight);
    wingFrontShape.lineTo(-wingLength/2, wallHeight);
    wingFrontShape.lineTo(-wingLength/2, 0);

    // Add side door
    const sideDoorWidth = 10;
    const sideDoorHeight = 20;
    const sideDoorHole = new THREE.Path();
    sideDoorHole.moveTo(-sideDoorWidth/2, 0);
    sideDoorHole.lineTo(sideDoorWidth/2, 0);
    sideDoorHole.lineTo(sideDoorWidth/2, sideDoorHeight);
    sideDoorHole.lineTo(-sideDoorWidth/2, sideDoorHeight);
    wingFrontShape.holes.push(sideDoorHole);

    const wingFrontWall = new THREE.Mesh(
        new THREE.ShapeGeometry(wingFrontShape),
        material
    );
    wingFrontWall.position.set(mainLength/2 + wingLength/2, 0, 0);
    wingFrontWall.rotation.y = Math.PI/2;
    building.add(wingFrontWall);
    walls.push(wingFrontWall);

    // Add floors
    const mainFloor = new THREE.Mesh(
        new THREE.BoxGeometry(mainLength, wallThickness, mainLength),
        material
    );
    mainFloor.position.set(0, -wallThickness/2, 0);
    building.add(mainFloor);

    const wingFloor = new THREE.Mesh(
        new THREE.BoxGeometry(wingLength, wallThickness, wingLength),
        material
    );
    wingFloor.position.set(mainLength/2 + wingLength/2, -wallThickness/2, 0);
    building.add(wingFloor);

    building.userData.walls = walls;
}

function addFlatRoof(building, material) {
    const roofGeometry = new THREE.BoxGeometry(100, 5, 100);
    const roof = new THREE.Mesh(roofGeometry, material);
    roof.position.y = 37.5;
    building.add(roof);
}

function addTowerBuilding(building, wallMaterial, roofMaterial) {
    const baseHeight = 50;
    const towerHeight = 30;
    const baseWidth = 40;
    const towerWidth = 20;
    const wallThickness = 2;
    const walls = [];

    // Base front wall with door
    const baseFrontShape = new THREE.Shape();
    baseFrontShape.moveTo(-baseWidth/2, 0);
    baseFrontShape.lineTo(baseWidth/2, 0);
    baseFrontShape.lineTo(baseWidth/2, baseHeight);
    baseFrontShape.lineTo(-baseWidth/2, baseHeight);
    baseFrontShape.lineTo(-baseWidth/2, 0);

    // Add door hole
    const doorWidth = 12;
    const doorHeight = 25;
    const doorHole = new THREE.Path();
    doorHole.moveTo(-doorWidth/2, 0);
    doorHole.lineTo(doorWidth/2, 0);
    doorHole.lineTo(doorWidth/2, doorHeight);
    doorHole.lineTo(-doorWidth/2, doorHeight);
    baseFrontShape.holes.push(doorHole);

    const baseFrontWall = new THREE.Mesh(
        new THREE.ShapeGeometry(baseFrontShape),
        wallMaterial
    );
    baseFrontWall.position.set(0, 0, -baseWidth/2);
    baseFrontWall.rotation.y = Math.PI;
    building.add(baseFrontWall);
    walls.push(baseFrontWall);

    // Other base walls
    const baseBackWall = new THREE.Mesh(
        new THREE.BoxGeometry(baseWidth, baseHeight, wallThickness),
        wallMaterial
    );
    baseBackWall.position.set(0, baseHeight/2, baseWidth/2);
    building.add(baseBackWall);
    walls.push(baseBackWall);

    const baseLeftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, baseHeight, baseWidth),
        wallMaterial
    );
    baseLeftWall.position.set(-baseWidth/2, baseHeight/2, 0);
    building.add(baseLeftWall);
    walls.push(baseLeftWall);

    const baseRightWall = baseLeftWall.clone();
    baseRightWall.position.x = baseWidth/2;
    building.add(baseRightWall);
    walls.push(baseRightWall);

    // Tower
    const towerWalls = new THREE.Mesh(
        new THREE.BoxGeometry(towerWidth, towerHeight, towerWidth),
        wallMaterial
    );
    towerWalls.position.y = baseHeight + towerHeight/2;
    building.add(towerWalls);
    walls.push(towerWalls);

    // Base floor
    const baseFloor = new THREE.Mesh(
        new THREE.BoxGeometry(baseWidth, wallThickness, baseWidth),
        wallMaterial
    );
    baseFloor.position.y = -wallThickness/2;
    building.add(baseFloor);

    // Tower roof
    const roofGeometry = new THREE.ConeGeometry(towerWidth/1.5, 20, 4);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = baseHeight + towerHeight + 10;
    building.add(roof);

    building.userData.walls = walls;
}

function getSpawnZonePositions() {
    const positions = [];
    const rowCount = 2;
    const buildingsPerRow = 5;
    const spacing = 300; // Adjust based on building sizes and desired spacing
    const startX = -((buildingsPerRow - 1) * spacing) / 2;
    const zOffset = 500; // Distance between rows

    for (let row = 0; row < rowCount; row++) {
        for (let i = 0; i < buildingsPerRow; i++) {
            const x = startX + i * spacing;
            const z = row === 0 ? zOffset : -zOffset;
            positions.push({ x, z });
        }
    }

    // Add corner building at one of the corners
    positions.push({ x: startX - spacing, z: zOffset + spacing });

    return positions;
}

const structurePositions = [
    { x: -200, z: 200 },
    { x: 0, z: 200 },
    { x: 200, z: 200 },
    { x: -200, z: -200 },
    { x: 0, z: -200 },
    { x: 200, z: -200 },
];
