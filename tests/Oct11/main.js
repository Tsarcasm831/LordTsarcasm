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
const npc = createHumanoid(color);

// Helper function for easing (optional)
function easeInOutSine(t) {
    return 0.5 * (1 - Math.cos(Math.PI * t));
}

// Create Humanoid Function
function createHumanoid(color, texture, pattern, height, bodyShape) {
    const group = new THREE.Group();

    // Define color palettes for random selection
    const skinColors = [
        0xf5cba7, // Light skin tone
        0xe0ac69, // Medium skin tone
        0xd2b48c, // Tan
        0xffdbac, // Fair
        0xc68642  // Darker skin tone
    ];

    const hairColors = [
        0x4b3621, // Dark brown
        0x2c1b18, // Black
        0xa52a2a, // Brown
        0xffd700, // Blonde
        0x8b4513  // SaddleBrown
    ];

    // Clothing colors
    const clothingColors = [
        0x0000ff, // Blue
        0xff0000, // Red
        0x00ff00, // Green
        0xffff00, // Yellow
        0xffa500  // Orange
    ];

    // Helper function to get a random color from an array
    const getRandomColor = (colorArray) => {
        return colorArray[Math.floor(Math.random() * colorArray.length)];
    };

    // Randomly assign colors
    const selectedSkinColor = getRandomColor(skinColors);
    const selectedHairColor = getRandomColor(hairColors);
    const selectedClothingColor = getRandomColor(clothingColors);

    const skinMaterial = new THREE.MeshLambertMaterial({ color: selectedSkinColor });
    const clothingMaterial = new THREE.MeshLambertMaterial({ color: selectedClothingColor });

    // Torso
    const bodyGeometry = new THREE.BoxGeometry(5, 7, 2);
    const body = new THREE.Mesh(bodyGeometry, skinMaterial);
    body.position.y = 11.5;
    group.add(body);

    // Cover torso with clothing
    const bodyClothingGeometry = new THREE.BoxGeometry(5.1, 7.1, 2.1);
    const bodyClothing = new THREE.Mesh(bodyClothingGeometry, clothingMaterial);
    bodyClothing.position.copy(body.position);
    group.add(bodyClothing);

    // Lower Body (Pelvic Region)
    const lowerBodyGeometry = new THREE.BoxGeometry(4, 3, 2.5);
    const lowerBody = new THREE.Mesh(lowerBodyGeometry, skinMaterial);
    lowerBody.position.set(0, 8.5, 0);  // Positioned below the torso
    group.add(lowerBody);

    // Cover lower body with clothing
    const lowerBodyClothingGeometry = new THREE.BoxGeometry(4.1, 3.1, 2.6);
    const lowerBodyClothing = new THREE.Mesh(lowerBodyClothingGeometry, clothingMaterial);
    lowerBodyClothing.position.copy(lowerBody.position);
    group.add(lowerBodyClothing);

    // Head
    const headGeometry = new THREE.BoxGeometry(3, 3, 3);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 18;
    group.add(head);

    // Neck Joint (connecting head to torso)
    const neckJoint = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        skinMaterial
    );
    neckJoint.position.set(0, 15.5, 0);
    group.add(neckJoint);

    // Hair
    const hairGeometry = new THREE.BoxGeometry(3.2, 0.5, 3.2);
    const hairMaterial = new THREE.MeshLambertMaterial({ color: selectedHairColor });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 1.5;
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
    const nose = new THREE.Mesh(noseGeometry, skinMaterial);
    nose.position.set(0, 0, 1.6);
    head.add(nose);

    // Pectorals (chest muscles)
    const pectoralGeometry = new THREE.BoxGeometry(4.5, 1.5, 1);
    const pectorals = new THREE.Mesh(pectoralGeometry, skinMaterial);
    pectorals.position.set(0, 14, 1.1);
    group.add(pectorals);

    // Cover pectorals with clothing
    const pectoralClothingGeometry = new THREE.BoxGeometry(4.6, 1.6, 1.1);
    const pectoralClothing = new THREE.Mesh(pectoralClothingGeometry, clothingMaterial);
    pectoralClothing.position.copy(pectorals.position);
    group.add(pectoralClothing);

    // Arms (shortened)
    const armGeometry = new THREE.BoxGeometry(1, 6, 1);  // Shortened length to 6
    const armMaterial = new THREE.MeshLambertMaterial({ color: selectedSkinColor });

    const createArm = (side) => {
        const armGroup = new THREE.Group();

        // Shoulder Joint (slightly larger for overlap)
        const shoulderJoint = new THREE.Mesh(
            new THREE.SphereGeometry(0.75, 16, 16),
            skinMaterial
        );
        shoulderJoint.position.set(0, 0, 0); // Origin at shoulder joint
        armGroup.add(shoulderJoint);

        // Arm (entire length)
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.y = -3; // Adjusted for shortened length
        armGroup.add(arm);

        // Position the entire arm group based on side
        armGroup.position.set(side === 'left' ? -3.5 : 3.5, 15, 0);
        return armGroup;
    };

    const leftArm = createArm('left');
    group.add(leftArm);

    const rightArm = createArm('right');
    group.add(rightArm);

    // Legs with Knee Joints
    const legMaterial = new THREE.MeshLambertMaterial({ color: selectedSkinColor });

    const createLeg = (side) => {
        const legGroup = new THREE.Group();

        // Upper Leg Group
        const upperLegGroup = new THREE.Group();

        // Hip Joint
        const hipJoint = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 16),
            skinMaterial
        );
        hipJoint.position.set(0, 0, 0); // At the top of upper leg
        upperLegGroup.add(hipJoint);

        // Upper Leg
        const upperLegGeometry = new THREE.BoxGeometry(1.5, 4, 1.5);
        const upperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
        upperLeg.position.y = -2; // Centered at -2 (since height is 4)
        upperLegGroup.add(upperLeg);

        // Cover upper leg with clothing
        const upperLegClothingGeometry = new THREE.BoxGeometry(1.6, 4.1, 1.6);
        const upperLegClothing = new THREE.Mesh(upperLegClothingGeometry, clothingMaterial);
        upperLegClothing.position.copy(upperLeg.position);
        upperLegGroup.add(upperLegClothing);

        // Lower Leg Group
        const lowerLegGroup = new THREE.Group();
        lowerLegGroup.position.y = -4; // Position at bottom of upper leg

        // Knee Joint
        const kneeJoint = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 16, 16),
            skinMaterial
        );
        kneeJoint.position.set(0, 0, 0); // At the top of lower leg (relative to lowerLegGroup)
        lowerLegGroup.add(kneeJoint);

        // Lower Leg (Adjusted to stop where the foot begins)
        const lowerLegHeight = 3.5; // Reduced from 4 to 3.5
        const lowerLegGeometry = new THREE.BoxGeometry(1.5, lowerLegHeight, 1.5);
        const lowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
        lowerLeg.position.y = -lowerLegHeight / 2; // Centered based on new height
        lowerLegGroup.add(lowerLeg);

        // Foot
        const footGeometry = new THREE.BoxGeometry(1.5, 1, 2);
        const foot = new THREE.Mesh(footGeometry, legMaterial);
        foot.position.set(0, -lowerLegHeight - 0.5, 0.25); // Positioned at the bottom of the lower leg
        lowerLegGroup.add(foot);

        // Cover foot with clothing
        const footClothingGeometry = new THREE.BoxGeometry(1.6, 1.1, 2.1);
        const footClothing = new THREE.Mesh(footClothingGeometry, clothingMaterial);
        footClothing.position.copy(foot.position);
        lowerLegGroup.add(footClothing);

        // Add lowerLegGroup to upperLegGroup
        upperLegGroup.add(lowerLegGroup);

        // Add upperLegGroup to legGroup
        legGroup.add(upperLegGroup);

        // Position the legGroup at hip position
        legGroup.position.set(side === 'left' ? -1.5 : 1.5, 6.5, 0);
        
        // Store references to upper and lower leg groups for animation
        legGroup.upperLegGroup = upperLegGroup;
        legGroup.lowerLegGroup = lowerLegGroup;

        return legGroup;
    };

    const leftLeg = createLeg('left');
    group.add(leftLeg);

    const rightLeg = createLeg('right');
    group.add(rightLeg);

    // Optional: Remove Pubic Hair if not needed
    /*
    const pubicHairGeometry = new THREE.PlaneGeometry(2, 1);
    const pubicHairMaterial = new THREE.MeshLambertMaterial({ color: selectedHairColor, side: THREE.DoubleSide });
    const pubicHair = new THREE.Mesh(pubicHairGeometry, pubicHairMaterial);
    pubicHair.position.set(0, 6.8, 1.1); // Positioned to align with lower body region
    pubicHair.rotation.x = Math.PI / 2;
    group.add(pubicHair);
    */

    // Assign Parts for Animation
    group.head = head;
    group.body = body;
    group.lowerBody = lowerBody;
    group.leftArm = leftArm;
    group.rightArm = rightArm;
    group.leftLeg = leftLeg;
    group.rightLeg = rightLeg;

    // Animation Properties
    group.animationTime = 0;
    group.animationSpeed = 1.0;
    group.armSwingSpeed = 2.0;
    group.isMoving = false;
    group.isAttacking = false;
    group.attackTime = 0;

    // User Data
    group.userData = {
        name: 'Friendly NPC',
        health: 100,
        dialogue: 'Hello!',
        weight: 1,
        type: 'friendly'
    };

    // Apply Body Shape and Pattern if needed
    if (typeof applyBodyShape === 'function') {
        applyBodyShape(group, bodyShape);
    }
    if (typeof applyPattern === 'function') {
        group.traverse(child => {
            if (child.isMesh) {
                applyPattern(child, pattern);
            }
        });
    }

    // **Adjustment to Raise the Humanoid**
    // Shift the entire group upward so the bottom of the feet are at y = 0
    group.position.y += 1.5;

    return group;
}




function animateHumanoid(humanoid, deltaTime) {
    if (humanoid.isMoving) {
        humanoid.animationTime += deltaTime * humanoid.animationSpeed * 3.5;

        // Parameters
        const swingAmplitude = 0.3;
        const armSwingAmplitude = 0.2;
        const kneeBendAmplitude = 0.7;
        const headBobAmplitude = 0.05;
        const bodyTiltAmplitude = 0.05;

        // Compute swing angles
        const swing = Math.sin(humanoid.animationTime * humanoid.armSwingSpeed);
        const swingPositive = Math.max(0, swing);
        const swingNegative = Math.max(0, -swing);

        // Arms swing
        humanoid.leftArm.rotation.x = swing * armSwingAmplitude;
        humanoid.rightArm.rotation.x = -swing * armSwingAmplitude;

        // Upper legs swing opposite to arms
        humanoid.leftLeg.upperLegGroup.rotation.x = -swing * swingAmplitude;
        humanoid.rightLeg.upperLegGroup.rotation.x = swing * swingAmplitude;

        // Lower legs bend at the knee
        humanoid.leftLeg.lowerLegGroup.rotation.x = swingNegative * kneeBendAmplitude;
        humanoid.rightLeg.lowerLegGroup.rotation.x = swingPositive * kneeBendAmplitude;

        // Foot rotation
        humanoid.leftLeg.lowerLegGroup.children[2].rotation.x = swingNegative * 0.2;
        humanoid.rightLeg.lowerLegGroup.children[2].rotation.x = swingPositive * 0.2;

        // Slight body tilt
        humanoid.body.rotation.z = swing * bodyTiltAmplitude;

        // Head bobbing
        const headBob = Math.abs(swing) * headBobAmplitude;
        humanoid.head.position.y = 18 + headBob;

    } else {
        // Reset rotations and positions when not moving
        humanoid.leftArm.rotation.x = 0;
        humanoid.rightArm.rotation.x = 0;
        humanoid.leftLeg.upperLegGroup.rotation.x = 0;
        humanoid.rightLeg.upperLegGroup.rotation.x = 0;
        humanoid.leftLeg.lowerLegGroup.rotation.x = 0;
        humanoid.rightLeg.lowerLegGroup.rotation.x = 0;
        humanoid.leftLeg.lowerLegGroup.children[2].rotation.x = 0;
        humanoid.rightLeg.lowerLegGroup.children[2].rotation.x = 0;
        humanoid.body.rotation.z = 0;
        humanoid.head.position.y = 18;
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




