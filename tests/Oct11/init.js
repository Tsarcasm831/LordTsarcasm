function initializeInventory() {
    const tabs = document.querySelectorAll('.inventory-tab');
    const tabContents = document.querySelectorAll('.inventory-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.style.display = content.id === tabId ? 'block' : 'none';
            });
        });
    });

    // Show the first tab by default
    if (tabContents.length > 0) {
        tabContents[0].style.display = 'block';
    }
}

function init() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    }, false);
    initializeInventory();
    const canvas = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    minimapCamera = new THREE.OrthographicCamera(-200, 200, 200, -200, 0.1, 10000);
    minimapCamera.position.set(0, 500, 0);
    minimapCamera.up.set(0, 0, -1);
    minimapCamera.lookAt(0, 0, 0);
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 100, 0);
    scene.add(directionalLight);
	addQuadrupeds();

        

    // Help Window Open on Start
    helpWindowOpen = true;
    document.getElementById('helpWindow').style.display = 'block';

    
    

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
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.name = 'ground';
    scene.add(ground);

    const safeZoneGroundGeometry = new THREE.PlaneGeometry(600, 600);
    const safeZoneGroundMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    safeZoneGround = new THREE.Mesh(safeZoneGroundGeometry, safeZoneGroundMaterial);
    safeZoneGround.rotation.x = -Math.PI / 2;
    safeZoneGround.position.y = 0.1;
    scene.add(safeZoneGround);

    const safeZoneBarrierGeometry = new THREE.BoxGeometry(600, 50, 600);
    const safeZoneBarrierMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    const safeZoneBarrier = new THREE.Mesh(safeZoneBarrierGeometry, safeZoneBarrierMaterial);
    safeZoneBarrier.position.set(0, 25, 0);
    scene.add(safeZoneBarrier);
    enemyWalls.push(safeZoneBarrier);

    const initialSettlementWalls = createSettlementWalls();
    scene.add(initialSettlementWalls);
            
    const shrineGroup = new THREE.Group();

    const floorGeometry = new THREE.CircleGeometry(20, 32);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.1;
    shrineGroup.add(floor);

    const teleportPadGeometry = new THREE.CircleGeometry(5, 32);
    const teleportPadMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    teleportPad = new THREE.Mesh(teleportPadGeometry, teleportPadMaterial);
    teleportPad.rotation.x = -Math.PI / 2;
    teleportPad.position.y = 0.11;
    teleportPad.name = 'teleportPad';
    shrineGroup.add(teleportPad);

    shrineGroup.position.set(0, 0, 0);
    scene.add(shrineGroup);

    // Spawn Red Enemies (Regular)
    for (let i = 0; i < 10; i++) {
        let position = getRandomPositionOutsideTown(300, 1000);
        let enemy = createEnemy(position.x, 0, position.z, 'red');
        enemies.push(enemy);
        scene.add(enemy);
    }

    // Spawn Blue Enemies
    for (let i = 0; i < 3; i++) { // Adjust the number as desired
        let position = getRandomPositionOutsideTown(300, 1000);
        let blueEnemy = createEnemy(position.x, 0, position.z, 'blue');
        enemies.push(blueEnemy);
        scene.add(blueEnemy);
    }

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

    player = createHumanoid(0x0000ff);
    player.position.y = 0; 
    scene.add(player);

	function checkEnemiesInSafeZone() {
		const safeZoneRadius = 300; // Radius of the safe zone

		enemies.forEach((enemy) => {
			if (enemy.userData.isDead) return;

			const distanceFromCenter = Math.sqrt(
				enemy.position.x * enemy.position.x + enemy.position.z * enemy.position.z
			);

			if (distanceFromCenter < safeZoneRadius) {
				const angle = Math.random() * Math.PI * 2;
				const teleportDistance = 1000;
				enemy.position.x = Math.cos(angle) * teleportDistance;
				enemy.position.z = Math.sin(angle) * teleportDistance;
				enemy.position.y = 0; 
			}
		});
	}

	

    // Function to add diverse plants to the terrain
    function addPlantsToTerrain() {
        const numElements = 3000; // Total number of natural elements

        const elementTypes = [
            {
                // Tree
				geometry: new THREE.ConeGeometry(20, 200, 20),
                material: new THREE.MeshLambertMaterial({ color: 0x228B22 }),
                yOffset: 5,
            },
            {
                geometry: new THREE.CylinderGeometry(0.5, 0.5, 5, 8),
                material: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
                yOffset: 2.5,
            },
            {
                geometry: new THREE.SphereGeometry(3, 8, 8),
                material: new THREE.MeshLambertMaterial({ color: 0x006400 }),
                yOffset: 3,
            },
			{
				//Large Bush
                geometry: new THREE.SphereGeometry(4, 12, 13),
                material: new THREE.MeshLambertMaterial({ color: 0x006400 }),
                yOffset: 3,
            },
            {
				//Rock
                geometry: new THREE.DodecahedronGeometry(3, 2),
                material: new THREE.MeshLambertMaterial({ color: 0x808080 }),
                yOffset: 3,
            },
        ];

        for (let i = 0; i < numElements; i++) {
            const typeIndex = Math.floor(Math.random() * elementTypes.length);
            const element = new THREE.Mesh(
                elementTypes[typeIndex].geometry,
                elementTypes[typeIndex].material
            );

            // Random position within the terrain bounds, avoiding the safe zone
            let x = Math.random() * 10000 - 5000;
            let z = Math.random() * 10000 - 5000;
            while (Math.sqrt(x * x + z * z) < 400) { // Ensure elements are not in the safe zone
                x = Math.random() * 10000 - 5000;
                z = Math.random() * 10000 - 5000;
            }

            element.position.set(x, elementTypes[typeIndex].yOffset, z);
            element.rotation.y = Math.random() * Math.PI * 2; // Random rotation
            scene.add(element);
        }
    }

    addPlantsToTerrain(); // Call the function to add plants and rocks

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    canvas.addEventListener('mousedown', onDocumentMouseDown, false);
    canvas.addEventListener('mouseup', onDocumentMouseUp, false);

}
    
function initMap() {
    const mapCanvas = document.getElementById('mapCanvas');
    mapRenderer = new THREE.WebGLRenderer({ canvas: mapCanvas, alpha: true });
    mapRenderer.setSize(window.innerWidth, window.innerHeight);
    mapScene = new THREE.Scene();

    // Orthographic camera for 2D map
    const aspect = window.innerWidth / window.innerHeight;
    const d = 5000; // Adjust based on your game world's size
    mapCamera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 10000);
    mapCamera.position.set(0, 1000, 0); // High above the game world
    mapCamera.up.set(0, 0, -1); // Adjust to match the game world's orientation
    mapCamera.lookAt(new THREE.Vector3(0, 0, 0));

    // Add similar lighting to the main scene
    const ambientLight = new THREE.AmbientLight(0x404040);
    mapScene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 100, 0);
    mapScene.add(directionalLight);
}

