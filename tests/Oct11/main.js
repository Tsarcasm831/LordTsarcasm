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

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (isMouseDown && mouseDestination) {
        destination = mouseDestination.clone();
    }

    if (destination) {
        movePlayerTowardsDestination();
    } else {
        player.isMoving = false;
    }

    // Maintain minimum of 50 enemies
    maintainEnemyCount();

    animateHumanoid(player, delta);
    moveEnemies(delta);
    animateDeadEnemies(delta);
    moveQuadrupeds(delta); // Ensure quadrupeds are moving
    updateTeleportation(delta);
    updateLooting(delta);

    // Animate quadrupeds
    quadrupeds.forEach(quadruped => {
        animateQuadruped(quadruped, delta);
    });

    // Handle camera rotation
    if (rotateLeft) {
        cameraTargetAngle -= cameraRotationSpeed;
    }
    if (rotateRight) {
        cameraTargetAngle += cameraRotationSpeed;
    }

    // Smoothly interpolate current angle towards target angle
    currentCameraAngle += (cameraTargetAngle - currentCameraAngle) * 0.1;


    // Update camera position based on current angle
    const cameraRadius = 100;
    const cameraHeight = 50;

    const cameraOffset = new THREE.Vector3(
        Math.sin(currentCameraAngle) * cameraRadius,
        cameraHeight,
        Math.cos(currentCameraAngle) * cameraRadius
    );

    camera.position.copy(player.position).add(cameraOffset);
    camera.lookAt(player.position);


    // Render Main Scene
    renderer.clear();
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissorTest(false);
    renderer.render(scene, camera);

    // Render Minimap
    minimapCamera.position.x = player.position.x;
    minimapCamera.position.z = player.position.z;

    const minimapContainer = document.getElementById('minimapContainer');
    const mapWidth = minimapContainer.clientWidth;
    const mapHeight = minimapContainer.clientHeight;
    const minimapRect = minimapContainer.getBoundingClientRect();
    const canvasRect = renderer.domElement.getBoundingClientRect();
    const minimapX = minimapRect.left - canvasRect.left;
    const minimapY = minimapRect.top - canvasRect.top;

    renderer.setViewport(minimapX, canvasRect.height - minimapY - mapHeight, mapWidth, mapHeight);
    renderer.setScissor(minimapX, canvasRect.height - minimapY - mapHeight, mapWidth, mapHeight);
    renderer.setScissorTest(true);
    renderer.render(scene, minimapCamera);

    // Render Fullscreen Map if visible
    const fullscreenMap = document.getElementById('fullscreenMap');
    if (fullscreenMap.style.display === 'block') {
        renderMap();
    }
}

function onDocumentKeyDown(event) {
    if (inventoryOpen || statsOpen || adminConsoleOpen) {
        if (inventoryOpen && (event.key.toLowerCase() === 'i' || event.key.toLowerCase() === 'b')) {
            inventoryOpen = false;
            document.getElementById('inventory').style.display = 'none';
        } else if (statsOpen && event.key.toLowerCase() === 'c') {
            statsOpen = false;
            document.getElementById('stats').style.display = 'none';
        } else if (adminConsoleOpen && event.key === '`') {
            closeAdminConsole();
        }
        return;
				
    }
			
    if (event.key === 'Escape') { // Handle Esc key
        closeAllMenus();
        return;
    }

	if (event.key.toLowerCase() === 'y') {
        openBestiary();
        return;
    }


    if (event.key.toLowerCase() === 'i' || event.key.toLowerCase() === 'b') {
        inventoryOpen = !inventoryOpen;
        document.getElementById('inventory').style.display = inventoryOpen ? 'block' : 'none';
        return;
    }

    if (event.key.toLowerCase() === 'c') {
        statsOpen = !statsOpen;
        document.getElementById('stats').style.display = statsOpen ? 'block' : 'none';
        return;
    }

    if (event.key === '`') {
        if (adminConsoleOpen) {
            closeAdminConsole();
        } else {
            openAdminConsole();
        }
        return;
    }


	// Handle toggling of admin window
    if (event.key === '`') {
        if (!isAdminLoggedIn) {
            openAdminConsole();
        } else {
            closeAdminConsole();
        }
        return;
    }

	// Handle toggling of help window
    if (event.key.toLowerCase() === 'h') {
        helpWindowOpen = !helpWindowOpen;
        document.getElementById('helpWindow').style.display = helpWindowOpen ? 'block' : 'none';
        return;
    }

    // Set rotation flags
    if (event.key.toLowerCase() === 'a') {
        rotateLeft = true;
        return;
    }
    if (event.key.toLowerCase() === 'd') {
        rotateRight = true;
        return;
    }

    if (isTeleporting || isLooting) return;

    if (event.key.toLowerCase() === 't') {
        if (!isTeleporting) {
            startTeleportation();
        }
    }
            
    if (event.key.toLowerCase() === 'q') {
        questLogOpen = !questLogOpen;
        document.getElementById('questLog').style.display = questLogOpen ? 'block' : 'none';
        return;
    }


    if (event.key.toLowerCase() === 'k') {
        if (document.getElementById('skillTree').style.display === 'block') {
            closeSkillTree();
        } else {
            openSkillTree();
        }
        return;
    }
}

function onDocumentKeyUp(event) {
    if (event.key.toLowerCase() === 'a') {
        rotateLeft = false;
        return;
    }
    if (event.key.toLowerCase() === 'd') {
        rotateRight = false;
        return;
    }
}

// Add keyup event listener
document.addEventListener('keyup', onDocumentKeyUp, false);

function onDocumentMouseDown(event) {
    // Set destination if clicking on ground
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const chestIntersects = raycaster.intersectObjects(treasureChests, true);
    if (chestIntersects.length > 0) {
        const chestObject = chestIntersects[0].object;
        openChestPopup(chestObject);
        return;
    }

    // If any popups are open or other conditions are met, don't process other keys
    if (inventoryOpen || statsOpen || adminConsoleOpen || isTeleporting || isLooting || helpWindowOpen) return;

    const objects = [ground, safeZoneGround, teleportPad, ...enemies, ...friendlies];
    const intersects = raycaster.intersectObjects([ground, safeZoneGround, teleportPad, ...enemies, ...friendlies], true);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const parent = intersectedObject.parent;

        if (intersectedObject === ground || intersectedObject === safeZoneGround) {
            const point = intersects[0].point;
            mouseDestination = new THREE.Vector3(point.x, player.position.y, point.z);
            destination = new THREE.Vector3(point.x, player.position.y, point.z);
        } else if (intersectedObject === teleportPad) {
            if (previousPosition) {
                player.position.copy(previousPosition);
                destination = null;
                previousPosition = null;
                alert('Teleported back to your previous location.');
            } else {
                alert('No previous location to teleport to.');
            }
        } else if (parent.userData && parent.userData.type === 'hostile') {
            if (parent.userData.isDead) {
                lootEnemy(parent);
            } else {
                attackEnemy(parent);
            }
        } else if (friendlies.includes(parent)) {
            if (npcAdminEnabled) {
                openNpcAdminPopup(parent);
                return;
            }
            openNpcPopup(parent);
        } else if (parent.userData && parent.userData.type === 'nonHostile') {
			alert('You see a peaceful creature.');
		} else if (npcAdminEnabled) {
			if (structures.includes(parent)) {
				openStructureAdminPopup(parent);
				return;
			}
			if (settlementWalls.includes(intersectedObject)) {
				openSettlementWallAdminPopup(intersectedObject);
				return;
			}
		} else if (friendlies.includes(parent)) {
            if (npcAdminEnabled) {
                openNpcAdminPopup(parent);
                return;
            }
            openNpcPopup(parent);
        }
    }
}

function onDocumentMouseUp(event) {
    isMouseDown = false;
    mouseDestination = null;
}

// Structure Functions:
function openStructureAdminPopup(structure) {
	currentStructure = structure;
	document.getElementById('structureScaleInput').value = structure.scale.x;
	document.getElementById('structureColorInput').value = '#' + structure.userData.color.getHexString();
	document.getElementById('structureAdminPopup').style.display = 'block';
}

function closeStructureAdminPopup() {
	document.getElementById('structureAdminPopup').style.display = 'none';
	currentStructure = null;
}

function saveStructureChanges() {
	if (currentStructure) {
		const scale = parseFloat(document.getElementById('structureScaleInput').value);
		const colorValue = document.getElementById('structureColorInput').value;
		const color = new THREE.Color(colorValue);

		currentStructure.scale.set(scale, scale, scale);

		// Update color of all child meshes
		currentStructure.traverse(child => {
			if (child.isMesh) {
				child.material.color.set(color);
			}
		});

		currentStructure.userData.color = color; // Store the new color

		alert('Structure changes saved.');
		closeStructureAdminPopup();
	}
}

// Implement Map Rendering:
function renderMap() {
    mapRenderer.render(mapScene, mapCamera);

    // Optionally, add markers for player, enemies, etc.
    addMapMarkers();
}

function addMapMarkers() {
    // Clear existing markers
    mapScene.children = mapScene.children.filter(child => !child.userData.isMapMarker);

    // Player Marker
    const playerMarkerGeometry = new THREE.SphereGeometry(10, 16, 16);
    const playerMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const playerMarker = new THREE.Mesh(playerMarkerGeometry, playerMarkerMaterial);
    playerMarker.position.set(player.position.x, 0, player.position.z);
    playerMarker.userData.isMapMarker = true;
    mapScene.add(playerMarker);

    // Enemy Markers
    enemies.forEach(enemy => {
        if (!enemy.userData.isDead) { // Only mark active enemies
            const enemyMarkerGeometry = new THREE.SphereGeometry(5, 8, 8);
            const enemyMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const enemyMarker = new THREE.Mesh(enemyMarkerGeometry, enemyMarkerMaterial);
            enemyMarker.position.set(enemy.position.x, 0, enemy.position.z);
            enemyMarker.userData.isMapMarker = true;
            mapScene.add(enemyMarker);
        }
    });

    // Add other markers as needed (e.g., friendly NPCs, settlements)
}
   

function createQuadruped(color = 0x996633) {
    const group = new THREE.Group();

    // Body
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 5), bodyMaterial);
    body.position.y = 5;
    group.add(body);

    // Head
    const headMaterial = new THREE.MeshLambertMaterial({ color });
    const head = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), headMaterial);
    head.position.set(7, 7, 0);
    group.add(head);

    // Legs
    const legMaterial = new THREE.MeshLambertMaterial({ color });
    const legGeometry = new THREE.BoxGeometry(1, 5, 1);

    const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
    frontLeftLeg.position.set(4, 2.5, 2);
    group.add(frontLeftLeg);

    const frontRightLeg = frontLeftLeg.clone();
    frontRightLeg.position.z = -2;
    group.add(frontRightLeg);

    const backLeftLeg = frontLeftLeg.clone();
    backLeftLeg.position.x = -4;
    group.add(backLeftLeg);

    const backRightLeg = frontRightLeg.clone();
    backRightLeg.position.x = -4;
    group.add(backRightLeg);

    // Tail
    const tailMaterial = new THREE.MeshLambertMaterial({ color });
    const tail = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 5), tailMaterial);
    tail.position.set(-7, 6, 0);
    tail.rotation.y = Math.PI / 4;
    group.add(tail);

    // Animation properties
    group.isMoving = false;
    group.animationTime = 0;
    group.animationSpeed = 5.0;

    // Store legs for animation
    group.legs = [frontLeftLeg, frontRightLeg, backLeftLeg, backRightLeg];

    // Direction for movement
    group.userData.direction = new THREE.Vector3();

    // Assign user data
    group.userData.type = 'nonHostile';
    group.userData.name = 'Quadruped';

    return group;
}

function createHumanoid(color) {
    const group = new THREE.Group();

    const bodyGeometry = new THREE.BoxGeometry(5, 10, 2);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(new THREE.BoxGeometry(5, 10, 2), bodyMaterial);
    body.position.y = 10;
    group.add(body);

    const headGeometry = new THREE.BoxGeometry(3, 3, 3);
    const headMaterial = new THREE.MeshLambertMaterial({ color });
    const head = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), headMaterial);
    head.position.y = 17;
    group.add(head);

    const armGeometry = new THREE.BoxGeometry(1, 8, 1);
    const armMaterial = new THREE.MeshLambertMaterial({ color });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-3.5, 10, 0);
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(3.5, 10, 0);
    group.add(rightArm);

    const legGeometry = new THREE.BoxGeometry(2, 10, 2);
    const legMaterial = new THREE.MeshLambertMaterial({ color });
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-1, 5, 0);
    group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(1, 5, 0);
    group.add(rightLeg);

    group.head = head;
    group.body = body;
    group.leftArm = leftArm;
    group.rightArm = rightArm;
    group.leftLeg = leftLeg;
    group.rightLeg = rightLeg;

    group.animationTime = 0;
    group.animationSpeed = 10.0;
    group.isMoving = false;
    group.isAttacking = false;
    group.attackTime = 0;

    group.userData = {
        name: 'Friendly NPC',
        health: 100,
        dialogue: 'Hello!',
        weight: 1
    };

    return group;
}

function animateQuadruped(quadruped, delta) {
    if (quadruped.isMoving) {
        quadruped.animationTime += delta * quadruped.animationSpeed;
        const angle = Math.sin(quadruped.animationTime) * (Math.PI / 6);

        // Front Left & Back Right Legs
        quadruped.legs[0].rotation.x = angle;
        quadruped.legs[3].rotation.x = angle;

        // Front Right & Back Left Legs
        quadruped.legs[1].rotation.x = -angle;
        quadruped.legs[2].rotation.x = -angle;
    } else {
        // Reset leg rotations
        quadruped.legs.forEach(leg => leg.rotation.x = 0);
    }
}

function animateHumanoid(humanoid, delta) {
    if (humanoid.isAttacking) {
        humanoid.attackTime += delta * humanoid.animationSpeed;
        const angle = Math.sin(humanoid.attackTime * 20) * (Math.PI / 4);

        humanoid.rightArm.rotation.x = -angle;

        if (humanoid.attackTime > 0.5) {
            humanoid.rightArm.rotation.x = 0;
            humanoid.isAttacking = false;
            humanoid.attackTime = 0;
        }
    } else if (humanoid.isMoving) {
        humanoid.animationTime += delta * humanoid.animationSpeed;
        const angle = Math.sin(humanoid.animationTime) * (Math.PI / 6);

        humanoid.leftArm.rotation.x = angle;
        humanoid.rightArm.rotation.x = -angle;
        humanoid.leftLeg.rotation.x = -angle;
        humanoid.rightLeg.rotation.x = angle;
    } else {
        humanoid.leftArm.rotation.x = 0;
        humanoid.rightArm.rotation.x = 0;
        humanoid.leftLeg.rotation.x = 0;
        humanoid.rightLeg.rotation.x = 0;
    }
}

function createTreasureChest(x, y, z) {
    const chestGeometry = new THREE.BoxGeometry(10, 10, 10);
    const chestMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const chest = new THREE.Mesh(chestGeometry, chestMaterial);
    chest.position.set(x, y + 5, z);

    chest.userData = {
        type: 'treasureChest',
        items: generateRandomItems(3),
        gold: Math.floor(Math.random() * 100) + 50
    };

    scene.add(chest);
    treasureChests.push(chest); // Keep track of treasure chests
    return chest;
}

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

function getRandomPositionOutsideTown(minDistance, maxDistance) {
    let angle = Math.random() * 2 * Math.PI;
    let distance = minDistance + Math.random() * (maxDistance - minDistance);
    let x = Math.cos(angle) * distance;
    let z = Math.sin(angle) * distance;
    return { x: x, z: z };
}

function createEnemy(x, y, z, type = 'red') {
    let color;
    let damageRate; // Damage per second

    if (type === 'blue') {
        color = 0x0000ff; // Blue color
        damageRate = 4; // 2x damage assuming base is 2
    } else {
        color = 0xff0000; // Red color
        damageRate = 2; // Base damage per second
    }

    const enemy = createHumanoid(color);
    enemy.position.set(x, 0, z);
    enemy.userData.type = 'hostile';
    enemy.userData.isDead = false; 
    enemy.userData.hasBeenLooted = false; // Initialize flag
    enemy.userData.deathTime = 0; // Existing initialization
    enemy.userData.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    enemy.isMoving = true; 
    enemy.userData.damageRate = damageRate; // Assign damage rate
    scene.add(enemy);
    return enemy;
}

function moveQuadrupeds(delta) {
    quadrupeds.forEach((quadruped) => {
        if (quadruped.isDead) return; // Optional: Handle dead quadrupeds

        // Simple wandering logic
        if (!quadruped.isMoving) {
            // Decide to move or stay
            if (Math.random() < 0.01) { // 1% chance to start moving each frame
                quadruped.isMoving = true;
                // Random direction
                const angle = Math.random() * 2 * Math.PI;
                quadruped.userData.direction.set(Math.cos(angle), 0, Math.sin(angle));
                // Rotate to face direction
                quadruped.rotation.y = angle;
            }
        } else {
            // Move in the set direction
            const moveDistance = globalEnemySpeed * delta * 10; // Adjust speed as needed
            quadruped.position.add(quadruped.userData.direction.clone().multiplyScalar(moveDistance));

            // Check for collisions with walls
            let collided = false;
            for (let wall of walls) {
                const quadrupedBox = new THREE.Box3().setFromObject(quadruped);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (quadrupedBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            for (let wall of enemyWalls) {
                const quadrupedBox = new THREE.Box3().setFromObject(quadruped);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (quadrupedBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            if (collided) {
                quadruped.position.sub(quadruped.userData.direction.clone().multiplyScalar(moveDistance));
                quadruped.isMoving = false;
            } else {
                quadruped.isMoving = true;
            }

            // Stop moving after a certain distance or time
            if (Math.random() < 0.005) { // 0.5% chance to stop moving each frame
                quadruped.isMoving = false;
            }
        }

        // Animate quadruped
        animateQuadruped(quadruped, delta);
    });
}
        
function toggleFullscreenMap() {
    const fullscreenMap = document.getElementById('fullscreenMap');
    if (fullscreenMap.style.display === 'none') {
        fullscreenMap.style.display = 'block';
        renderMap(); // Initial render
    } else {
        fullscreenMap.style.display = 'none';
    }
}

function closeFullscreenMap() {
    const fullscreenMap = document.getElementById('fullscreenMap');
    fullscreenMap.style.display = 'none';
}
		
function addQuadrupeds() {
	for (let i = 0; i < 5; i++) {
		let position = getRandomPositionOutsideTown(300, 1000);
		const quadruped = createQuadruped();
		quadruped.position.set(position.x, 0, position.z);
		quadrupeds.push(quadruped);
		scene.add(quadruped);
	}
}

function movePlayerTowardsDestination() {
    const direction = new THREE.Vector3().subVectors(destination, player.position);
    const distance = direction.length();
    if (distance > 0.1) {
        direction.normalize();
        const moveDistance = Math.min(speed, distance);
        const oldPosition = player.position.clone();
        player.position.add(direction.multiplyScalar(moveDistance));

        let collided = false;
        for (let wall of walls) {
            const playerBox = new THREE.Box3().setFromObject(player);
            const wallBox = new THREE.Box3().setFromObject(wall);
            if (playerBox.intersectsBox(wallBox)) {
                collided = true;
                break;
            }
        }

        if (collided) {
            player.position.copy(oldPosition);
            destination = null;
            player.isMoving = false;
        } else {
            player.isMoving = true;
            // Rotate player to face the direction of movement
            player.rotation.y = Math.atan2(direction.x, direction.z);
        }
    } else {
        player.position.copy(destination);
        destination = null;
        player.isMoving = false;
    }
}

function createWhiteWall() {
    const wallGeometry = new THREE.BoxGeometry(10, 30, 2); // Adjust size as needed
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); // White color
    const whiteWall = new THREE.Mesh(wallGeometry, wallMaterial);
    whiteWall.userData.isWhiteWall = true; // Flag to identify white walls
    return whiteWall;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    minimapCamera.left = -200;
    minimapCamera.right = 200;
    minimapCamera.top = 200;
    minimapCamera.bottom = -200;
    minimapCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

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

initMap();
init();
animate();




