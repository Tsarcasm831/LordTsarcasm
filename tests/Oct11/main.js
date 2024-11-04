// main.js
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
    // Close menus based on key presses when already open
    if (inventoryOpen || statsOpen || adminConsoleOpen) {
        if (inventoryOpen && (event.key.toLowerCase() === 'i' || event.key.toLowerCase() === 'b')) {
            inventoryOpen = false;
            document.getElementById('inventory').style.display = 'none';
        } else if (statsOpen && event.key.toLowerCase() === 'c') {
            statsOpen = false;
            document.getElementById('stats').style.display = 'none';
        } else if (adminConsoleOpen && event.key === '`') {
            closeAdminConsole();
        } else if (event.key === 'Escape') { // Esc closes all open menus
            closeAllMenus();
        }
        return; // Stop further execution if a menu is closed
    }

    // Handle specific menu toggle keys
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

    if (event.key.toLowerCase() === 'h') {
        helpWindowOpen = !helpWindowOpen;
        document.getElementById('helpWindow').style.display = helpWindowOpen ? 'block' : 'none';
        return;
    }

    if (event.key.toLowerCase() === 'y') {
        openBestiary();
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

    // Ensure teleporting or looting blocks further action
    if (isTeleporting || isLooting) return;

    if (event.key.toLowerCase() === 't') {
        if (!isTeleporting) {
            startTeleportation();
        }
        return;
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

document.getElementById('closeHelp').addEventListener('click', function() {
    document.getElementById('helpWindow').style.display = 'none';
    helpWindowOpen = false; // Ensure the variable tracks the state properly
});

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

// Function to create a quadruped
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
// Create an array to track previously selected NPCs
let selectedNPCs = [];

// Function to select a random NPC that hasn't been selected before
function getRandomNPC() {
    if (selectedNPCs.length === npcData.length) {
        console.log("All NPCs have been selected.");
        return null; // All NPCs have already been selected
    }

    let npc;
    do {
        npc = npcData[Math.floor(Math.random() * npcData.length)];
    } while (selectedNPCs.includes(npc));

    // Add the selected NPC to the array
    selectedNPCs.push(npc);
    return npc;
}

// Combined createHumanoid function
function createHumanoid(color, texture, pattern, height, bodyShape) {
    const group = new THREE.Group();

    // Define realistic colors
    const skinColor = 0xf5cba7;  // Light skin tone
    const hairColor = 0x4b3621;  // Dark brown for hair
    const shirtColor = 0x1e90ff; // Blue shirt
    const pantsColor = 0x556b2f; // Dark olive green shorts
    const shoeColor = 0x333333;  // Dark gray for shoes

    // Torso (Adjusted to fit between shirt and head)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
    const bodyGeometry = new THREE.BoxGeometry(5, 7, 2); // Shortened height of torso
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 11.5; // Positioned to align with shirt and head
    group.add(body);

    // Head (Positioned just above the shirt)
    const headGeometry = new THREE.BoxGeometry(3, 3, 3);
    const headMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 18; // Positioned to rest on top of the shirt
    group.add(head);

    // Hair
    const hairGeometry = new THREE.BoxGeometry(3.2, 0.5, 3.2);
    const hairMaterial = new THREE.MeshLambertMaterial({ color: hairColor });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 1.5;  // Slightly above head
    head.add(hair);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.5, 0.5, 1.5);
    head.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.x = 0.5;
    head.add(rightEye);

    // Nose
    const noseGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.2);
    const nose = new THREE.Mesh(noseGeometry, bodyMaterial);
    nose.position.set(0, 0, 1.6);
    head.add(nose);

    // Arms (Adjusted to Swing from Shoulder)
    const armGeometry = new THREE.BoxGeometry(1, 8, 1);
    const armMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
    
    const createArm = (side) => {
        const armGroup = new THREE.Group();

        // Arm (entire length)
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.y = -4; // Position the arm to pivot from the shoulder
        armGroup.add(arm);

        // Position the entire arm group based on side
        armGroup.position.set(side === 'left' ? -3.5 : 3.5, 15, 0); // Attach at shoulder level
        return armGroup;
    };

    const leftArm = createArm('left');
    group.add(leftArm);

    const rightArm = createArm('right');
    group.add(rightArm);

    // Legs (Segmented into two parts with shorts and shoes)
    const legMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
    const pantsMaterial = new THREE.MeshLambertMaterial({ color: pantsColor });
    const shoeMaterial = new THREE.MeshLambertMaterial({ color: shoeColor });

    const createLeg = () => {
        const legGroup = new THREE.Group();

        // Top half of the leg (Invisible)
        const upperLegGeometry = new THREE.BoxGeometry(2, 5, 2);
        const upperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
        upperLeg.position.y = 2.5;
        upperLeg.visible = false; // Make the top half invisible
        legGroup.add(upperLeg);

        // Bottom half of the leg (Visible)
        const lowerLegGeometry = new THREE.BoxGeometry(2, 5, 2);
        const lowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
        lowerLeg.position.y = -2.5;
        legGroup.add(lowerLeg);

        // Longer shorts segment
        const shortsGeometry = new THREE.BoxGeometry(2.1, 4, 2.1); // Lengthened shorts
        const shorts = new THREE.Mesh(shortsGeometry, pantsMaterial);
        shorts.position.y = 0.5; // Positioned to cover more of the leg
        legGroup.add(shorts);

        // Shoes at the bottom of each leg
        const shoeGeometry = new THREE.BoxGeometry(2.5, 1, 2.5); // Larger than leg
        const shoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
        shoe.position.y = -5.5; // Positioned at the end of the leg
        legGroup.add(shoe);

        return legGroup;
    };

    // Positioning the legs slightly higher so shoes don't touch the ground
    const leftLeg = createLeg();
    leftLeg.position.set(-1.5, 6, 0); // Raised by 1 unit
    group.add(leftLeg);

    const rightLeg = createLeg();
    rightLeg.position.set(1.5, 6, 0); // Raised by 1 unit
    group.add(rightLeg);

    // Shirt (Shortened to not overlap with shorts)
    const shirtGeometry = new THREE.BoxGeometry(6, 8, 3); // Shortened height
    const shirtMaterial = new THREE.MeshLambertMaterial({ color: shirtColor });
    const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
    shirt.position.y = 12; // Positioned higher to avoid overlapping with shorts
    group.add(shirt);

    // Assign Parts for Animation
    group.head = head;
    group.body = body;
    group.leftArm = leftArm;
    group.rightArm = rightArm;
    group.leftLeg = leftLeg;
    group.rightLeg = rightLeg;

    // Animation Properties
    group.animationTime = 0;
    group.animationSpeed = 10.0;      // Default speed for general movements
    group.armSwingSpeed = 0.5;        // 30% slower speed for arm swinging
    group.isMoving = false;
    group.isAttacking = false;
    group.attackTime = 0;

    // User Data
    group.userData = {
        name: 'Friendly NPC',
        health: 100,
        dialogue: 'Hello!',
        weight: 1,
        type: 'friendly' // Default type
    };

    // Apply Body Shape and Pattern if needed
    applyBodyShape(group, bodyShape);
    group.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return group;
}

const npc = createHumanoid(color);

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

function createFriendlyNPC(color = 0x00ff00, name = 'Friendly NPC', dialogue = 'Hello!') {
    const npc = createHumanoid(color);
    npc.userData.type = 'friendly';
    npc.userData.name = name;
    npc.userData.dialogue = dialogue;
    return npc;
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

// Ensure the help window properly adjusts when the window is resized
window.addEventListener('resize', onWindowResize);

// Adjusting for window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    minimapCamera.left = -200;
    minimapCamera.right = 200;
    minimapCamera.top = 200;
    minimapCamera.bottom = -200;
    minimapCamera.updateProjectionMatrix();
}



initMap();
init();
animate();




