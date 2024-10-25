// settlement.js

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

function createSettlementWalls() {
    const safeZoneSize = 1200;  // Match the exact size of the grey safe zone
    const wallHeight = 30;
    const wallThickness = 2;
    const gateWidth = 100;

    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });

    // North Wall (Split into two segments)
    const sideLength = (safeZoneSize - gateWidth) / 2;
    
    // North Walls
    const northLeftWall = new THREE.Mesh(
        new THREE.BoxGeometry(sideLength, wallHeight, wallThickness),
        wallMaterial
    );
    northLeftWall.position.set(-safeZoneSize/4 - gateWidth/4, wallHeight/2, -safeZoneSize/2);
    scene.add(northLeftWall);
    walls.push(northLeftWall);

    const northRightWall = new THREE.Mesh(
        new THREE.BoxGeometry(sideLength, wallHeight, wallThickness),
        wallMaterial
    );
    northRightWall.position.set(safeZoneSize/4 + gateWidth/4, wallHeight/2, -safeZoneSize/2);
    scene.add(northRightWall);
    walls.push(northRightWall);

    // South Walls
    const southLeftWall = northLeftWall.clone();
    southLeftWall.position.set(-safeZoneSize/4 - gateWidth/4, wallHeight/2, safeZoneSize/2);
    scene.add(southLeftWall);
    walls.push(southLeftWall);

    const southRightWall = northRightWall.clone();
    southRightWall.position.set(safeZoneSize/4 + gateWidth/4, wallHeight/2, safeZoneSize/2);
    scene.add(southRightWall);
    walls.push(southRightWall);

    // Side Walls
    const eastWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, safeZoneSize),
        wallMaterial
    );
    eastWall.position.set(safeZoneSize/2, wallHeight/2, 0);
    scene.add(eastWall);
    walls.push(eastWall);

    const westWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, safeZoneSize),
        wallMaterial
    );
    westWall.position.set(-safeZoneSize/2, wallHeight/2, 0);
    scene.add(westWall);
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
    scene.add(northGate);
    enemyWalls.push(northGate);  // Only add to enemyWalls

    const southGate = northGate.clone();
    southGate.position.set(0, wallHeight/2, safeZoneSize/2);
    scene.add(southGate);
    enemyWalls.push(southGate);  // Only add to enemyWalls
}
