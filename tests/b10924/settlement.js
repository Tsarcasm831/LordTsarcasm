// settlement.js

// Function to create settlement walls
function createSettlementWalls() {
    const wallsGroup = new THREE.Group();

    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const wallHeight = 30;
    const wallThickness = 2;
    const wallLength = 600;

    const northWallLeftGeometry = new THREE.BoxGeometry(wallLength / 2 - 50, wallHeight, wallThickness);
    const northWallLeft = new THREE.Mesh(northWallLeftGeometry, wallMaterial);
    northWallLeft.position.set(-wallLength / 4 - 25, wallHeight / 2, -300);
    wallsGroup.add(northWallLeft);
    walls.push(northWallLeft);

    const northWallRight = new THREE.Mesh(northWallLeftGeometry, wallMaterial);
    northWallRight.position.set(wallLength / 4 + 25, wallHeight / 2, -300);
    wallsGroup.add(northWallRight);
    walls.push(northWallRight);

    const gateBarrierGeometry = new THREE.BoxGeometry(100, wallHeight, wallThickness);
    const gateBarrierMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    const northGateBarrier = new THREE.Mesh(gateBarrierGeometry, gateBarrierMaterial);
    northGateBarrier.position.set(0, wallHeight / 2, -300);
    wallsGroup.add(northGateBarrier);
    enemyWalls.push(northGateBarrier);

    const southWallLeft = northWallLeft.clone();
    southWallLeft.position.set(-wallLength / 4 - 25, wallHeight / 2, 300);
    wallsGroup.add(southWallLeft);
    walls.push(southWallLeft);

    const southWallRight = northWallRight.clone();
    southWallRight.position.set(wallLength / 4 + 25, wallHeight / 2, 300);
    wallsGroup.add(southWallRight);
    walls.push(southWallRight);

    const southGateBarrier = northGateBarrier.clone();
    southGateBarrier.position.set(0, wallHeight / 2, 300);
    wallsGroup.add(southGateBarrier);
    enemyWalls.push(southGateBarrier);

    const eastWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallLength);
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.set(300, wallHeight / 2, 0);
    wallsGroup.add(eastWall);
    walls.push(eastWall);

    const westWall = eastWall.clone();
    westWall.position.set(-300, wallHeight / 2, 0);
    wallsGroup.add(westWall);
    walls.push(westWall);

    // Add white walls at gate barriers
    const northGateWhiteWall = createWhiteWall();
    northGateWhiteWall.position.set(0, 15, -300);
    wallsGroup.add(northGateWhiteWall);

    const southGateWhiteWall = createWhiteWall();
    southGateWhiteWall.position.set(0, 15, 300);
    wallsGroup.add(southGateWhiteWall);

    walls.push(northGateWhiteWall);
    walls.push(southGateWhiteWall);

    return wallsGroup;
}

// Function to create settlement
function createSettlement(x, y, z) {
    const settlementGroup = new THREE.Group();

    // Create settlement walls
    const wallsGroup = createSettlementWalls();
    wallsGroup.position.set(x, y, z);
    settlementGroup.add(wallsGroup);

    // Create structures and NPCs
    const positions = [
        { x: x + 50, z: z + 50 },
        { x: x - 50, z: z + 50 },
        { x: x + 50, z: z - 50 },
        { x: x - 50, z: z - 50 },
        { x: x, z: z + 70 },
    ];

    positions.forEach(pos => {
        const structure = createStructure();
        structure.position.set(pos.x, y, pos.z);
        settlementGroup.add(structure);
        walls.push(...structure.userData.walls);
        structures.push(structure);

        const npc = createFriendlyNPC();
        npc.position.set(pos.x, y, pos.z);
        settlementGroup.add(npc);
        friendlies.push(npc);
    });

    scene.add(settlementGroup);
}
