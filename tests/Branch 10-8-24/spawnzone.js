// spawnzone.js

function createSpawnZone(scene, walls, enemyWalls, structures, friendlies, npcData) {
    // Create ground and safe zone
    const { ground, safeZoneGround, safeZoneBarrier } = createGroundAndSafeZone(scene, enemyWalls);

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

function createGroundAndSafeZone(scene, enemyWalls) {
    const groundShape = new THREE.Shape();
    groundShape.moveTo(-5000, -5000);
    groundShape.lineTo(5000, -5000);
    groundShape.lineTo(5000, 5000);
    groundShape.lineTo(-5000, 5000);
    groundShape.lineTo(-5000, -5000);

    const safeZoneSize = 300;
    const holePath = new THREE.Path();
    holePath.moveTo(-safeZoneSize, -safeZoneSize);
    holePath.lineTo(-safeZoneSize, safeZoneSize);
    holePath.lineTo(safeZoneSize, safeZoneSize);
    holePath.lineTo(safeZoneSize, -safeZoneSize);
    holePath.lineTo(-safeZoneSize, -safeZoneSize);
    groundShape.holes.push(holePath);

    const groundGeometry = new THREE.ShapeGeometry(groundShape);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.name = 'ground';
    scene.add(ground);

    const safeZoneGroundGeometry = new THREE.PlaneGeometry(600, 600);
    const safeZoneGroundMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const safeZoneGround = new THREE.Mesh(safeZoneGroundGeometry, safeZoneGroundMaterial);
    safeZoneGround.rotation.x = -Math.PI / 2;
    safeZoneGround.position.y = 0.1;
    scene.add(safeZoneGround);

    const safeZoneBarrierGeometry = new THREE.BoxGeometry(600, 50, 600);
    const safeZoneBarrierMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    const safeZoneBarrier = new THREE.Mesh(safeZoneBarrierGeometry, safeZoneBarrierMaterial);
    safeZoneBarrier.position.set(0, 25, 0);
    scene.add(safeZoneBarrier);
    enemyWalls.push(safeZoneBarrier);

    return { ground, safeZoneGround, safeZoneBarrier };
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
    const structurePositions = [
        { x: 150, z: 150 },
        { x: -150, z: 150 },
        { x: 150, z: -150 },
        { x: -150, z: -150 },
        { x: 0, z: 200 },
    ];

    structurePositions.forEach(pos => {
        const structure = createStructure();
        structure.position.set(pos.x, 0, pos.z);
        scene.add(structure);
        walls.push(...structure.userData.walls);
        structures.push(structure);

        // Select a random NPC from npcData
        const npcInfo = npcData[Math.floor(Math.random() * npcData.length)];

        // Create the NPC with the selected data
        const npc = createFriendlyNPC(0x00ff00, npcInfo.name, npcInfo.dialogue);

        // Position the NPC at the structure's position
        npc.position.copy(structure.position);

        // Add the NPC to the scene and friendlies array
        scene.add(npc);
        friendlies.push(npc);
    });
}

function createSettlementWalls(scene, walls, enemyWalls) {
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const wallHeight = 30;
    const wallThickness = 2;
    const wallLength = 600;

    const northWallLeftGeometry = new THREE.BoxGeometry(wallLength / 2 - 50, wallHeight, wallThickness);
    const northWallLeft = new THREE.Mesh(northWallLeftGeometry, wallMaterial);
    northWallLeft.position.set(-wallLength / 4 - 25, wallHeight / 2, -300);
    scene.add(northWallLeft);
    walls.push(northWallLeft);

    const northWallRight = new THREE.Mesh(northWallLeftGeometry, wallMaterial);
    northWallRight.position.set(wallLength / 4 + 25, wallHeight / 2, -300);
    scene.add(northWallRight);
    walls.push(northWallRight);

    const gateBarrierGeometry = new THREE.BoxGeometry(100, wallHeight, wallThickness);
    const gateBarrierMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    const northGateBarrier = new THREE.Mesh(gateBarrierGeometry, gateBarrierMaterial);
    northGateBarrier.position.set(0, wallHeight / 2, -300);
    scene.add(northGateBarrier);
    enemyWalls.push(northGateBarrier);

    const southWallLeft = northWallLeft.clone();
    southWallLeft.position.set(-wallLength / 4 - 25, wallHeight / 2, 300);
    scene.add(southWallLeft);
    walls.push(southWallLeft);

    const southWallRight = northWallRight.clone();
    southWallRight.position.set(wallLength / 4 + 25, wallHeight / 2, 300);
    scene.add(southWallRight);
    walls.push(southWallRight);

    const southGateBarrier = northGateBarrier.clone();
    southGateBarrier.position.set(0, wallHeight / 2, 300);
    scene.add(southGateBarrier);
    enemyWalls.push(southGateBarrier);

    const eastWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallLength);
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.set(300, wallHeight / 2, 0);
    scene.add(eastWall);
    walls.push(eastWall);

    const westWall = eastWall.clone();
    westWall.position.set(-300, wallHeight / 2, 0);
    scene.add(westWall);
    walls.push(westWall);

    // Add white walls at gate barriers
    const northGateWhiteWall = createWhiteWall();
    northGateWhiteWall.position.set(0, 15, -300); // Position at the gate
    scene.add(northGateWhiteWall);

    const southGateWhiteWall = createWhiteWall();
    southGateWhiteWall.position.set(0, 15, 300); // Position at the gate
    scene.add(southGateWhiteWall);

    // Add to walls array if enemies should collide
    walls.push(northGateWhiteWall);
    walls.push(southGateWhiteWall);
}

function createWhiteWall() {
    const wallGeometry = new THREE.BoxGeometry(10, 30, 2); // Adjust size as needed
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); // White color
    const whiteWall = new THREE.Mesh(wallGeometry, wallMaterial);
    whiteWall.userData.isWhiteWall = true; // Flag to identify white walls
    return whiteWall;
}

function createStructure() {
    const building = new THREE.Group();

    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const wallThickness = 2;
    const wallHeight = 30;
    const wallLength = 50;
	const wallColor = 0x8B4513;

    const frontWallShape = new THREE.Shape();
    frontWallShape.moveTo(-wallLength / 2, 0);
    frontWallShape.lineTo(wallLength / 2, 0);
    frontWallShape.lineTo(wallLength / 2, wallHeight);
    frontWallShape.lineTo(-wallLength / 2, wallHeight);
    frontWallShape.lineTo(-wallLength / 2, 0);

    const doorWidth = 10;
    const doorHeight = 20;
    const doorX = -doorWidth / 2;
    const doorY = 0;

    const doorHole = new THREE.Path();
    doorHole.moveTo(doorX, doorY);
    doorHole.lineTo(doorX + doorWidth, doorY);
    doorHole.lineTo(doorX + doorWidth, doorY + doorHeight);
    doorHole.lineTo(doorX, doorY + doorHeight);
    doorHole.lineTo(doorX, doorY);
    frontWallShape.holes.push(doorHole);

    const frontWallGeometry = new THREE.ShapeGeometry(frontWallShape);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.z = -wallLength / 2;
    building.add(frontWall);

    const backWallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.z = wallLength / 2;
    backWall.position.y = wallHeight / 2;
    building.add(backWall);

    const leftWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallLength);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.x = -wallLength / 2;
    leftWall.position.y = wallHeight / 2;
    building.add(leftWall);

    const rightWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallLength);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.x = wallLength / 2;
    rightWall.position.y = wallHeight / 2;
    building.add(rightWall);

    const roofGeometry = new THREE.ConeGeometry(35, 15, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = wallHeight + 7.5;
    building.add(roof);

    building.userData.walls = [frontWall, backWall, leftWall, rightWall];

    return building;
}

function createFriendlyNPC(color = 0x00ff00, name = 'Friendly NPC', dialogue = 'Hello!') {
    const npc = createHumanoid(color);
    npc.userData.type = 'friendly';
    npc.userData.name = name;
    npc.userData.dialogue = dialogue;
    return npc;
}
