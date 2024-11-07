// main.js
let shouldRenderMinimap = true; // Flag for conditional rendering
let shouldRenderFullscreenMap = false; // Track if fullscreen map is open

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
    moveQuadrupeds(delta);

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

    // Render Minimap only when needed
    if (shouldRenderMinimap) {
        renderMinimap();
    }

    // Render Fullscreen Map if visible
    if (shouldRenderFullscreenMap) {
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

// Separate the minimap rendering function
function renderMinimap() {
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
}

// Control minimap and fullscreen map rendering
function toggleFullscreenMap() {
    const fullscreenMap = document.getElementById('fullscreenMap');
    if (fullscreenMap.style.display === 'none') {
        fullscreenMap.style.display = 'block';
        shouldRenderFullscreenMap = true; // Flag to render fullscreen map
        renderMap();
    } else {
        fullscreenMap.style.display = 'none';
        shouldRenderFullscreenMap = false;
    }
}

function renderMap() {
    mapRenderer.render(mapScene, mapCamera);
    addMapMarkers();
}

let mapMarkersUpdated = false;

function addMapMarkers() {
    if (mapMarkersUpdated) return;

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
        if (!enemy.userData.isDead) {
            const enemyMarkerGeometry = new THREE.SphereGeometry(5, 8, 8);
            const enemyMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const enemyMarker = new THREE.Mesh(enemyMarkerGeometry, enemyMarkerMaterial);
            enemyMarker.position.set(enemy.position.x, 0, enemy.position.z);
            enemyMarker.userData.isMapMarker = true;
            mapScene.add(enemyMarker);
        }
    });

    mapMarkersUpdated = true;
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

    const clothingColors = [
        0x3333ff, 0xff3333, 0x33ff33, 0xffff33, 0xff33ff, 0x33ffff, 0xff9900, 0x9900ff,
        0x0099ff, 0xff0066, 0x00cc66, 0xcc33ff, 0x993333, 0x66ccff, 0xff6699, 0x66ff99, 0x9966ff
    ];

    // Helper function to get a random color from an array
    const getRandomColor = (colorArray) => {
        return colorArray[Math.floor(Math.random() * colorArray.length)];
    };

    // Randomly assign colors
    const selectedSkinColor = getRandomColor(skinColors);
    const selectedHairColor = getRandomColor(hairColors);
    const selectedClothingColor = getRandomColor(clothingColors);

    // Torso
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: selectedSkinColor });
    const bodyGeometry = new THREE.BoxGeometry(5, 7, 2);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 11.5;
    group.add(body);

    // Shirt (1px larger than torso)
    const shirtMaterial = new THREE.MeshLambertMaterial({ color: selectedClothingColor });
    const shirtGeometry = new THREE.BoxGeometry(6.5, 8.55, 3.5);
    const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
    shirt.position.copy(body.position);
    group.add(shirt);

    // Cover pectorals with the shirt
    const pectoralGeometry = new THREE.BoxGeometry(4.5, 1.5, 1);
    const pectoralMaterial = shirtMaterial; // Ensure pectorals are covered by the shirt
    const pectorals = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
    pectorals.position.set(0, 14, 1.1);
    group.add(pectorals);

    // Lower Body (Pelvic Region)
    const lowerBodyGeometry = new THREE.BoxGeometry(4, 3, 2.5);
    const lowerBodyMaterial = new THREE.MeshLambertMaterial({ color: selectedSkinColor });
    const lowerBody = new THREE.Mesh(lowerBodyGeometry, lowerBodyMaterial);
    lowerBody.position.set(0, 8.5, 0);
    group.add(lowerBody);

    // Shorts (1px larger than lower body)
    const shortsMaterial = new THREE.MeshLambertMaterial({ color: selectedClothingColor });
    const shortsGeometry = new THREE.BoxGeometry(5, 7, 3);
    const shorts = new THREE.Mesh(shortsGeometry, shortsMaterial);
    shorts.position.copy(lowerBody.position);
    group.add(shorts);

    // Head
    const headGeometry = new THREE.BoxGeometry(3, 3, 3);
    const headMaterial = new THREE.MeshLambertMaterial({ color: selectedSkinColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 18;
    group.add(head);

    // Neck Joint
    const neckJoint = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshStandardMaterial({ color: selectedSkinColor })
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
    const nose = new THREE.Mesh(noseGeometry, bodyMaterial);
    nose.position.set(0, 0, 1.6);
    head.add(nose);

    // Arms
    const armGeometry = new THREE.BoxGeometry(1, 6, 1);
    const armMaterial = new THREE.MeshLambertMaterial({ color: selectedSkinColor });

    const createArm = (side) => {
        const armGroup = new THREE.Group();

        const shoulderJoint = new THREE.Mesh(
            new THREE.SphereGeometry(0.75, 16, 16),
            new THREE.MeshStandardMaterial({ color: selectedSkinColor })
        );
        shoulderJoint.position.set(0, 0, 0);
        armGroup.add(shoulderJoint);

        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.y = -3;
        armGroup.add(arm);

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
        const upperLegGroup = new THREE.Group();

        const hipJoint = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 16),
            new THREE.MeshStandardMaterial({ color: selectedSkinColor })
        );
        hipJoint.position.set(0, 0, 0);
        upperLegGroup.add(hipJoint);

        const upperLegGeometry = new THREE.BoxGeometry(1.5, 4, 1.5);
        const upperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
        upperLeg.position.y = -2;
        upperLegGroup.add(upperLeg);

        const lowerLegGroup = new THREE.Group();
        lowerLegGroup.position.y = -4;

        const kneeJoint = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 16, 16),
            new THREE.MeshStandardMaterial({ color: selectedSkinColor })
        );
        kneeJoint.position.set(0, 0, 0);
        lowerLegGroup.add(kneeJoint);

        const lowerLegGeometry = new THREE.BoxGeometry(1.5, 4, 1.5);
        const lowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
        lowerLeg.position.y = -2;
        lowerLegGroup.add(lowerLeg);

        const footGeometry = new THREE.BoxGeometry(1.5, 0.5, 2);
        const foot = new THREE.Mesh(footGeometry, legMaterial);
        foot.position.set(0, -2.25, 0.25);
        lowerLegGroup.add(foot);

        upperLegGroup.add(lowerLegGroup);
        legGroup.add(upperLegGroup);

        legGroup.position.set(side === 'left' ? -1.5 : 1.5, 6.5, 0);
        legGroup.upperLegGroup = upperLegGroup;
        legGroup.lowerLegGroup = lowerLegGroup;

        return legGroup;
    };

    const leftLeg = createLeg('left');
    group.add(leftLeg);

    const rightLeg = createLeg('right');
    group.add(rightLeg);

    // Pubic Hair
    const pubicHairGeometry = new THREE.PlaneGeometry(2, 1);
    const pubicHairMaterial = new THREE.MeshLambertMaterial({ color: selectedHairColor, side: THREE.DoubleSide });
    const pubicHair = new THREE.Mesh(pubicHairGeometry, pubicHairMaterial);
    pubicHair.position.set(0, 6.8, 1.1);
    pubicHair.rotation.x = Math.PI / 2;
    group.add(pubicHair);

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

    return group;
}

function animateHumanoid(humanoid, deltaTime) {
    if (humanoid.isMoving) {
        // Adjust animation time with a smoother easing multiplier
        humanoid.animationTime += deltaTime * humanoid.animationSpeed * 3.5;

        // Enhanced natural walking motion parameters
        const legSwingAmplitude = 0.65;
        const armSwingAmplitude = 0.55;
        const kneeBendAmplitude = 1.1;
        const footRollAmplitude = 0.35;
        const hipSwayAmplitude = 0.1;
        const torsoTwistAmplitude = 0.09;
        const bodyBobAmplitude = 0.12;
        const headBobAmplitude = 0.1;
        const forwardLean = 0.15;
        const breathingAmplitude = 0.02;
        const minorOffset = 0.005;

        // Calculate phase using a continuous sine wave for fluidity
        const swing = Math.sin(humanoid.animationTime * humanoid.armSwingSpeed);
        const swingPositive = Math.max(0, swing);
        const swingNegative = Math.max(0, -swing);
        const breathing = Math.sin(humanoid.animationTime * 0.5) * breathingAmplitude;

        // Add slight randomness for realism
        const armOffset = Math.random() * minorOffset;
        const legOffset = Math.random() * minorOffset;

        // Arm movements - Reduced inward angles
        humanoid.leftArm.rotation.x = (swing + armOffset) * armSwingAmplitude;
        humanoid.leftArm.rotation.z = -0.15 + Math.max(0, swing) * 0.1; // Reduced inward angle
        humanoid.rightArm.rotation.x = (-swing + armOffset) * armSwingAmplitude;
        humanoid.rightArm.rotation.z = 0.15 - Math.max(0, -swing) * 0.1; // Reduced inward angle

        /* Weapon animation placeholder
        if (humanoid.equippedWeapon) {
            // Weapon follows right arm movement with offset
            const weaponRestAngle = -0.3; // Angle when standing still
            const weaponSwingAmplitude = 0.4; // How much it swings while walking
            
            // Position weapon relative to right arm
            humanoid.equippedWeapon.position.copy(humanoid.rightArm.position);
            humanoid.equippedWeapon.position.y += 2; // Adjust grip position
            humanoid.equippedWeapon.position.x += 1; // Offset from arm
            
            // Rotate weapon
            humanoid.equippedWeapon.rotation.x = humanoid.rightArm.rotation.x;
            humanoid.equippedWeapon.rotation.y = weaponRestAngle + swing * weaponSwingAmplitude;
            humanoid.equippedWeapon.rotation.z = humanoid.rightArm.rotation.z;
            
            // Optional: Add slight weapon bob
            const weaponBob = Math.sin(humanoid.animationTime * 2) * 0.05;
            humanoid.equippedWeapon.position.y += weaponBob;
            
            // Update weapon matrix
            humanoid.equippedWeapon.updateMatrixWorld(true);
        }
        */

        // Leg movements - Forward/backward motion (x-axis)
        humanoid.leftLeg.upperLegGroup.rotation.x = (-swing + legOffset) * legSwingAmplitude;
        humanoid.rightLeg.upperLegGroup.rotation.x = (swing + legOffset) * legSwingAmplitude;

        // Knee Bend - Only bend when leg is moving backward
        humanoid.leftLeg.lowerLegGroup.rotation.x = swingNegative * kneeBendAmplitude;
        humanoid.rightLeg.lowerLegGroup.rotation.x = swingPositive * kneeBendAmplitude;

        // Foot Roll - Synchronize with leg movement
        humanoid.leftLeg.lowerLegGroup.children[2].rotation.x = swingPositive * footRollAmplitude;
        humanoid.rightLeg.lowerLegGroup.children[2].rotation.x = swingNegative * footRollAmplitude;

        // Natural hip sway - Subtle side-to-side motion
        const hipSway = Math.cos(humanoid.animationTime * humanoid.armSwingSpeed) * hipSwayAmplitude;
        humanoid.leftLeg.upperLegGroup.position.y = 1 - swingPositive * 0.45 + minorOffset;
        humanoid.rightLeg.upperLegGroup.position.y = 1 - swingNegative * 0.45 + minorOffset;
        
        // Body movement
        humanoid.body.position.y = 12 + Math.abs(swing) * bodyBobAmplitude + breathing;
        humanoid.body.rotation.x = -forwardLean;
        humanoid.body.rotation.y = swing * torsoTwistAmplitude;
        humanoid.body.rotation.z = hipSway * 0.5;

        // Head movement
        humanoid.head.position.y = 18 + Math.abs(swing) * headBobAmplitude + breathing * 0.5;
        humanoid.head.rotation.x = swing * 0.06;
        humanoid.head.rotation.z = hipSway * 0.3;

        // Update shorts to follow leg movements
        humanoid.traverse((child) => {
            if (child.name.includes('Shorts')) {
                if (child.name.includes('Left')) {
                    child.rotation.x = humanoid.leftLeg.upperLegGroup.rotation.x * 0.8;
                    child.rotation.z = humanoid.leftLeg.upperLegGroup.rotation.z * 0.8;
                } else if (child.name.includes('Right')) {
                    child.rotation.x = humanoid.rightLeg.upperLegGroup.rotation.x * 0.8;
                    child.rotation.z = humanoid.rightLeg.upperLegGroup.rotation.z * 0.8;
                }
                child.updateMatrixWorld(true);
            }
            if (child.name.includes('Shirt')) {
                child.updateMatrixWorld(true);
            }
        });
    } else {
        // Reset to neutral positions when not moving
        humanoid.leftArm.rotation.set(0, 0, -0.15);  // Reduced inward angle at rest
        humanoid.rightArm.rotation.set(0, 0, 0.15);  // Reduced inward angle at rest
        humanoid.leftLeg.upperLegGroup.rotation.set(0, 0, 0);
        humanoid.rightLeg.upperLegGroup.rotation.set(0, 0, 0);
        humanoid.leftLeg.lowerLegGroup.rotation.x = 0;
        humanoid.rightLeg.lowerLegGroup.rotation.x = 0;
        humanoid.leftLeg.lowerLegGroup.children[2].rotation.x = 0;
        humanoid.rightLeg.lowerLegGroup.children[2].rotation.x = 0;
        humanoid.leftLeg.upperLegGroup.position.y = 0;
        humanoid.rightLeg.upperLegGroup.position.y = 0;
        humanoid.body.position.y = 12;
        humanoid.body.rotation.set(0, 0, 0);
        humanoid.head.position.y = 18;
        humanoid.head.rotation.set(0, 0, 0);

        /* Weapon reset placeholder
        if (humanoid.equippedWeapon) {
            // Reset weapon to default position
            humanoid.equippedWeapon.position.copy(humanoid.rightArm.position);
            humanoid.equippedWeapon.position.y += 2;
            humanoid.equippedWeapon.position.x += 1;
            humanoid.equippedWeapon.rotation.set(0, -0.3, 0.15);
            humanoid.equippedWeapon.updateMatrixWorld(true);
        }
        */

        // Reset shorts
        humanoid.traverse((child) => {
            if (child.name.includes('Shorts')) {
                child.rotation.set(0, 0, 0);
                child.updateMatrixWorld(true);
            }
        });
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




