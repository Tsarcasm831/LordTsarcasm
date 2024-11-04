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
            // Type 4: Circular Building
            addCircularWalls(building, wallMaterial);
            addDomeRoof(building, roofMaterial);
            break;
        case 5:
            // Type 5: Corner Building with Ramp
            addCornerBuilding(building, wallMaterial, roofMaterial);
            break;
        default:
            addStandardWalls(building, wallMaterial);
            addStandardRoof(building, roofMaterial);
    }

    return building;
}

function addStandardWalls(building, material) {
    const wallLength = 50;
    const wallHeight = 30;
    const wallThickness = 2;

    // Front Wall
    const frontWallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);
    const frontWall = new THREE.Mesh(frontWallGeometry, material);
    frontWall.position.z = -wallLength / 2;
    building.add(frontWall);

    // Back Wall
    const backWall = frontWall.clone();
    backWall.position.z = wallLength / 2;
    building.add(backWall);

    // Left Wall
    const sideWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallLength);
    const leftWall = new THREE.Mesh(sideWallGeometry, material);
    leftWall.position.x = -wallLength / 2;
    building.add(leftWall);

    // Right Wall
    const rightWall = leftWall.clone();
    rightWall.position.x = wallLength / 2;
    building.add(rightWall);
}

function addStandardRoof(building, material) {
    const roofGeometry = new THREE.ConeGeometry(35, 15, 4);
    const roof = new THREE.Mesh(roofGeometry, material);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 30 + 7.5; // wallHeight + half of roof height
    building.add(roof);
}
function addCornerBuilding(building, wallMaterial, roofMaterial) {
    // Base Floor
    const baseFloorGeometry = new THREE.BoxGeometry(200, 30, 200); // 4x standard size
    const baseFloor = new THREE.Mesh(baseFloorGeometry, wallMaterial);
    baseFloor.position.y = 15; // Half of wallHeight
    building.add(baseFloor);

    // Second Floor
    const secondFloorGeometry = new THREE.BoxGeometry(200, 30, 200);
    const secondFloor = new THREE.Mesh(secondFloorGeometry, wallMaterial);
    secondFloor.position.y = 45; // wallHeight + second floor height
    building.add(secondFloor);

    // Diagonal Ramp (Ramp can be a simple inclined plane or a detailed ramp)
    const rampGeometry = new THREE.BoxGeometry(50, 5, 100);
    const ramp = new THREE.Mesh(rampGeometry, wallMaterial);
    ramp.rotation.x = Math.atan(50 / 100); // Adjust slope as needed
    ramp.position.set(75, 15, 50); // Position ramp appropriately
    building.add(ramp);

    // Roof for the second floor
    const roofGeometry = new THREE.ConeGeometry(50, 20, 4);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 60; // Position above the second floor
    building.add(roof);
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
