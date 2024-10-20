// JavaScript source code
// Add a Purple Structure a Little Ways Away from Town
    const purpleStructure = createPurpleStructure();
    purpleStructure.position.set(800, 0, -800); // Adjust position as desired
    scene.add(purpleStructure);

    
// Function to Create Purple Structure
function createPurpleStructure() {
	const building = new THREE.Group();

	// Define wall material and dimensions
	const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x800080 }); // Purple color
	const wallThickness = 2;
	const wallHeight = 30;
	const wallLength = 50;

	// Front Wall
	const frontWallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);
	const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
	frontWall.position.z = -wallLength / 2;
	building.add(frontWall);

	// Back Wall
	const backWall = frontWall.clone();
	backWall.position.z = wallLength / 2;
	building.add(backWall);

	// Left Wall
	const leftWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallLength);
	const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
	leftWall.position.x = -wallLength / 2;
	leftWall.position.y = wallHeight / 2;
	building.add(leftWall);

	// Right Wall
	const rightWall = leftWall.clone();
	rightWall.position.x = wallLength / 2;
	building.add(rightWall);

	// Roof
	const roofGeometry = new THREE.ConeGeometry(35, 15, 4);
	const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x800080 }); // Purple color
	const roof = new THREE.Mesh(roofGeometry, roofMaterial);
	roof.rotation.y = Math.PI / 4;
	roof.position.y = wallHeight + 7.5;
	building.add(roof);

	// Add walls to userData for collision detection
	building.userData.walls = [frontWall, backWall, leftWall, rightWall];

	// Add a black floor
	const floorGeometry = new THREE.PlaneGeometry(50, 50);
	const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = 0.1; // Slightly above ground to avoid z-fighting
	building.add(floor);

	return building;
}