// main.js
let shouldRenderMinimap = true; // Flag for conditional rendering
let shouldRenderFullscreenMap = false; // Track if fullscreen map is open

// Add throttle variables at the top
let lastQuadrupedUpdate = 0;
let lastFullscreenMapUpdate = 0;
let lastEnemyMaintenanceUpdate = 0;
const QUADRUPED_UPDATE_INTERVAL = 50; // Update every 50ms
const FULLSCREEN_MAP_UPDATE_INTERVAL = 100; // Update every 100ms
const ENEMY_MAINTENANCE_INTERVAL = 1000; // Check enemy count every second

// Cache minimap DOM elements and dimensions
let minimapContainer, minimapRect, canvasRect, mapWidth, mapHeight, minimapX, minimapY;
let minimapDimensionsNeedUpdate = true;

// Function to update minimap dimensions
function updateMinimapDimensions() {
    minimapContainer = document.getElementById('minimapContainer');
    mapWidth = minimapContainer.clientWidth;
    mapHeight = minimapContainer.clientHeight;
    minimapRect = minimapContainer.getBoundingClientRect();
    canvasRect = renderer.domElement.getBoundingClientRect();
    minimapX = minimapRect.left - canvasRect.left;
    minimapY = minimapRect.top - canvasRect.top;
    minimapDimensionsNeedUpdate = false;
}

// Update minimap dimensions on window resize
window.addEventListener('resize', () => {
    minimapDimensionsNeedUpdate = true;
});

function renderMinimap() {
    if (minimapDimensionsNeedUpdate) {
        updateMinimapDimensions();
    }

    minimapCamera.position.x = player.position.x;
    minimapCamera.position.z = player.position.z;

    renderer.setViewport(minimapX, canvasRect.height - minimapY - mapHeight, mapWidth, mapHeight);
    renderer.setScissor(minimapX, canvasRect.height - minimapY - mapHeight, mapWidth, mapHeight);
    renderer.setScissorTest(true);
    renderer.render(scene, minimapCamera);
}

function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();
    const delta = clock.getDelta();

    // Critical updates that need to happen every frame
    if (isMouseDown && mouseDestination) {
        destination = mouseDestination.clone();
    }

    if (destination) {
        movePlayerTowardsDestination();
    } else {
        player.isMoving = false;
    }

    // Player and enemy updates (critical)
    animateHumanoid(player, delta);
    moveEnemies(delta);
    animateDeadEnemies(delta);

    // Check for floor collision
    checkFloorCollision(player.position);

    // Maintain enemy count (throttled to every second)
    if (currentTime - lastEnemyMaintenanceUpdate > ENEMY_MAINTENANCE_INTERVAL) {
        maintainEnemyCount();
        lastEnemyMaintenanceUpdate = currentTime;
    }

    // Throttled updates for less critical animations
    if (currentTime - lastQuadrupedUpdate > QUADRUPED_UPDATE_INTERVAL) {
        moveQuadrupeds(delta);
        quadrupeds.forEach(quadruped => {
            animateQuadruped(quadruped, delta);
        });
        lastQuadrupedUpdate = currentTime;
    }

    updateTeleportation(delta);
    updateLooting(delta);

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

    // Render minimap every frame (no throttling)
    if (shouldRenderMinimap) {
        renderMinimap();
    }

    // Throttle only fullscreen map updates
    if (shouldRenderFullscreenMap && currentTime - lastFullscreenMapUpdate > FULLSCREEN_MAP_UPDATE_INTERVAL) {
        renderMap();
        lastFullscreenMapUpdate = currentTime;
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
        } else if (!statsOpen && event.key.toLowerCase() === 'c') {
            statsOpen = true;
            document.getElementById('stats').style.display = 'block';
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
    if (minimapDimensionsNeedUpdate) {
        updateMinimapDimensions();
    }

    minimapCamera.position.x = player.position.x;
    minimapCamera.position.z = player.position.z;

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
    const humanoidGroup = new THREE.Group();
    humanoidGroup.isHumanoid = true; // Flag to identify humanoids

    // ----------------------------------------------------
    // 1. COLORS & MATERIAL HELPERS
    // ----------------------------------------------------
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

    function getRandomColor(colorArray) {
        return colorArray[Math.floor(Math.random() * colorArray.length)];
    }

    function createMaterial(colorValue) {
        return new THREE.MeshStandardMaterial({
            color: colorValue,
            roughness: 0.7,
            metalness: 0.0,
            side: THREE.DoubleSide
        });
    }

    function configureShadows(mesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    // Randomly assigned colors
    const selectedSkinColor = getRandomColor(skinColors);
    const selectedHairColor = getRandomColor(hairColors);

    // ----------------------------------------------------
    // 2. TORSO
    // ----------------------------------------------------
    // Using LatheGeometry for a more human-like torso
    const torsoPoints = [
        new THREE.Vector2(1.4, 0), // Waist
        new THREE.Vector2(2.2, 2), // Stomach/abdomen
        new THREE.Vector2(2.7, 4), // Chest
        new THREE.Vector2(2.5, 6)  // Shoulders
    ];
    const torsoGeometry = new THREE.LatheGeometry(torsoPoints, 16);
    const torsoMaterial = createMaterial(selectedSkinColor);
    const torso = configureShadows(new THREE.Mesh(torsoGeometry, torsoMaterial));
    torso.position.set(0, 10, 0);

    // --- NEW: Add a flat disk at the top to close the geometry ---
    {
        // The top radius should match the last point's x-value (2.5)
        const topRadius = torsoPoints[torsoPoints.length - 1].x; // = 2.5
        const topSegments = 16;
        const topDiskGeom = new THREE.CircleGeometry(topRadius, topSegments);
        const topDisk = configureShadows(new THREE.Mesh(topDiskGeom, torsoMaterial));

        // Orient the disk so it's horizontal (facing "down" to cover the hollow top)
        topDisk.rotation.x = -Math.PI / 2;

        // Position it at the same y as the last lathe point (6), in the torso's local coordinates
        topDisk.position.set(0, torsoPoints[torsoPoints.length - 1].y, 0);

        // Attach the disk to the torso so it moves with the torso
        torso.add(topDisk);
    }

    // Slight chest geometry (pectorals) — these are part of the body, not clothing
    const leftPectoralGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const leftPectorals = configureShadows(new THREE.Mesh(leftPectoralGeometry, torsoMaterial));
    leftPectorals.position.set(-1.5, 14, 1.5);
    const rightPectoralGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const rightPectorals = configureShadows(new THREE.Mesh(rightPectoralGeometry, torsoMaterial));
    rightPectorals.position.set(1.5, 14, 1.5);
    humanoidGroup.add(torso, leftPectorals, rightPectorals);

    // ----------------------------------------------------
    // 3. PELVIS
    // ----------------------------------------------------
    const pelvisGeometry = new THREE.CylinderGeometry(1.5, 2.5, 3, 16);
    const pelvisMaterial = createMaterial(selectedSkinColor);
    const pelvis = configureShadows(new THREE.Mesh(pelvisGeometry, pelvisMaterial));
    pelvis.position.set(0, 9, 0);
    humanoidGroup.add(pelvis);

    // ----------------------------------------------------
    // 4. NECK & HEAD
    // ----------------------------------------------------
    const neckJoint = configureShadows(
        new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), createMaterial(selectedSkinColor))
    );
    neckJoint.position.set(0, 15.5, 0);

    const headGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const headMaterial = createMaterial(selectedSkinColor);
    const head = configureShadows(new THREE.Mesh(headGeometry, headMaterial));
    head.position.set(0, 17.5, 0);

    // Hair
    const hairGeometry = new THREE.SphereGeometry(1.55, 16, 16);
    const hairMaterial = createMaterial(selectedHairColor);
    const hair = configureShadows(new THREE.Mesh(hairGeometry, hairMaterial));
    hair.scale.set(1, 0.7, 1);
    hair.position.set(0, 0.3, 0);
    head.add(hair);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = createMaterial(0x000000);
    const leftEye = configureShadows(new THREE.Mesh(eyeGeometry, eyeMaterial));
    const rightEye = configureShadows(new THREE.Mesh(eyeGeometry, eyeMaterial));
    leftEye.position.set(-0.4, 0.1, 1.3);
    rightEye.position.set(0.4, 0.1, 1.3);
    head.add(leftEye, rightEye);

    // Nose
    const noseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
    const nose = configureShadows(new THREE.Mesh(noseGeometry, torsoMaterial));
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0, 1.4);
    head.add(nose);

    humanoidGroup.add(neckJoint, head);

    // ----------------------------------------------------
    // 5. ARMS
    // ----------------------------------------------------
    function createArm(side) {
        const armRoot = new THREE.Group();

        // Shoulder Joint
        const shoulderJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), createMaterial(selectedSkinColor))
        );
        shoulderJoint.position.set(0, 0, 0);
        armRoot.add(shoulderJoint);

        // Upper Arm
        const upperArmGeom = new THREE.CylinderGeometry(0.4, 0.5, 3, 8);
        const upperArm = configureShadows(new THREE.Mesh(upperArmGeom, createMaterial(selectedSkinColor)));
        upperArm.position.set(0, -1.5, 0);
        shoulderJoint.add(upperArm);

        // Elbow
        const elbowJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), createMaterial(selectedSkinColor))
        );
        elbowJoint.position.set(0, -1.5, 0);
        upperArm.add(elbowJoint);

        // Forearm
        const forearmGeom = new THREE.CylinderGeometry(0.35, 0.45, 3, 8);
        const forearm = configureShadows(new THREE.Mesh(forearmGeom, createMaterial(selectedSkinColor)));
        forearm.position.set(0, -1.5, 0);
        elbowJoint.add(forearm);

        // Wrist
        const wristJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), createMaterial(selectedSkinColor))
        );
        wristJoint.position.set(0, -1.5, 0);
        forearm.add(wristJoint);

        // Hand
        const handGroup = new THREE.Group();
        const palmGeom = new THREE.BoxGeometry(0.8, 0.3, 1);
        const palm = configureShadows(new THREE.Mesh(palmGeom, createMaterial(selectedSkinColor)));
        palm.position.set(0, -0.15, 0);
        handGroup.add(palm);

        // Fingers
        const fingerRadius = 0.06;
        const fingerLength = 0.5;
        for (let i = 0; i < 4; i++) {
            const finger = configureShadows(new THREE.Mesh(
                new THREE.CylinderGeometry(fingerRadius, fingerRadius, fingerLength, 8),
                createMaterial(selectedSkinColor)
            ));
            finger.rotation.x = Math.PI / 2;
            finger.position.set((i - 1.5) * 0.2, 0, 0.5);
            handGroup.add(finger);
        }
        // Thumb
        const thumb = configureShadows(new THREE.Mesh(
            new THREE.CylinderGeometry(fingerRadius, fingerRadius, 0.4, 8),
            createMaterial(selectedSkinColor)
        ));
        thumb.rotation.z = Math.PI / 6;
        thumb.rotation.y = -Math.PI / 6;
        thumb.position.set(0.4, 0, 0.2);
        handGroup.add(thumb);

        wristJoint.add(handGroup);

        // Position entire arm
        armRoot.position.set(side === 'left' ? -3.5 : 3.5, 14, 0);
        return armRoot;
    }

    const leftArm = createArm('left');
    const rightArm = createArm('right');
    humanoidGroup.add(leftArm, rightArm);

    // ----------------------------------------------------
    // 6. LEGS
    // ----------------------------------------------------
    function createLeg(side) {
        const legRoot = new THREE.Group();
        const legOffsetY = 0.7;

        // Hip joint
        const hipJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), createMaterial(selectedSkinColor))
        );
        hipJoint.position.set(0, legOffsetY, 0);
        legRoot.add(hipJoint);

        // Upper Leg
        const upperLegGeom = new THREE.CylinderGeometry(0.5, 0.6, 4, 8);
        const upperLeg = configureShadows(new THREE.Mesh(upperLegGeom, createMaterial(selectedSkinColor)));
        upperLeg.position.set(0, -2 + legOffsetY, 0);
        hipJoint.add(upperLeg);

        // Knee joint
        const kneeJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), createMaterial(selectedSkinColor))
        );
        kneeJoint.position.set(0, -2 + legOffsetY, 0);
        upperLeg.add(kneeJoint);

        // Lower Leg
        const lowerLegGeom = new THREE.CylinderGeometry(0.45, 0.5, 4, 8);
        const lowerLeg = configureShadows(new THREE.Mesh(lowerLegGeom, createMaterial(selectedSkinColor)));
        lowerLeg.position.set(0, -2, 0);
        kneeJoint.add(lowerLeg);

        // Ankle
        const ankleJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), createMaterial(selectedSkinColor))
        );
        ankleJoint.position.set(0, -2, 0);
        lowerLeg.add(ankleJoint);

        // Foot
        const footGeom = new THREE.BoxGeometry(1, 0.5, 2);
        const foot = configureShadows(new THREE.Mesh(footGeom, createMaterial(selectedSkinColor)));
        foot.position.set(0, -0.25, 1);
        ankleJoint.add(foot);

        // Move entire leg group to the correct side
        legRoot.position.set(side === 'left' ? -1.5 : 1.5, 7 + legOffsetY, 0);
        return legRoot;
    }

    const leftLeg = createLeg('left');
    const rightLeg = createLeg('right');
    humanoidGroup.add(leftLeg, rightLeg);

    // ----------------------------------------------------
    // 7. OPTIONAL: PUBIC HAIR
    // ----------------------------------------------------
    const pubicHairGeom = new THREE.PlaneGeometry(2, 1);
    const pubicHairMat = new THREE.MeshLambertMaterial({ 
        color: selectedHairColor, 
        side: THREE.DoubleSide 
    });
    const pubicHair = configureShadows(new THREE.Mesh(pubicHairGeom, pubicHairMat));
    pubicHair.rotation.x = Math.PI / 2;
    pubicHair.position.set(0, 7, 1);
    humanoidGroup.add(pubicHair);

    // ----------------------------------------------------
    // 8. STORE REFERENCES FOR ANIMATION & METADATA
    // ----------------------------------------------------
    humanoidGroup.head     = head;
    humanoidGroup.body     = torso;
    humanoidGroup.pelvis   = pelvis;
    humanoidGroup.leftArm  = leftArm;
    humanoidGroup.rightArm = rightArm;
    humanoidGroup.leftLeg  = leftLeg;
    humanoidGroup.rightLeg = rightLeg;

    // Animation-related
    humanoidGroup.animationTime   = 0;
    humanoidGroup.animationSpeed  = 1.0;
    humanoidGroup.armSwingSpeed   = 2.0;
    humanoidGroup.isMoving        = false;
    humanoidGroup.isAttacking     = false;
    humanoidGroup.attackTime      = 0;

    // User Data
    humanoidGroup.userData = {
        name: 'Friendly NPC',
        health: 100,
        dialogue: 'Hello!',
        weight: 1,
        type: 'friendly'
    };

    // ----------------------------------------------------
    // 9. APPLY BODY SHAPE AND PATTERN (if provided)
    // ----------------------------------------------------
    if (typeof applyBodyShape === 'function') {
        applyBodyShape(humanoidGroup, bodyShape);
    }
    if (typeof applyPattern === 'function') {
        humanoidGroup.traverse(child => {
            if (child.isMesh) {
                applyPattern(child, pattern);
            }
        });
    }

    return humanoidGroup;
}

function animateHumanoid(humanoid, deltaTime) {
    if (!humanoid) return;

    if (humanoid.isMoving) {
        humanoid.animationTime += deltaTime * humanoid.animationSpeed * 3.5;

        const legSwingAmplitude = 0.65;
        const armSwingAmplitude = 0.55;
        const kneeBendAmplitude = 1.1;
        const footRollAmplitude = 0.35;
        const torsoTwistAmplitude = 0.09;
        const bodyBobAmplitude = 0.12;
        const headBobAmplitude = 0.1;
        const forwardLean = 0.15;
        const breathingAmplitude = 0.02;

        const swing = Math.sin(humanoid.animationTime * humanoid.armSwingSpeed);
        const breathing = Math.sin(humanoid.animationTime * 0.5) * breathingAmplitude;

        // Arms
        if (humanoid.leftArm && humanoid.rightArm) {
            humanoid.leftArm.rotation.x = swing * armSwingAmplitude;
            humanoid.rightArm.rotation.x = -swing * armSwingAmplitude;
            humanoid.leftArm.rotation.z = -0.15 + 0.1 * Math.max(0, swing);
            humanoid.rightArm.rotation.z = 0.15 - 0.1 * Math.max(0, -swing);
        }

        // Legs
        if (humanoid.leftLeg && humanoid.rightLeg) {
            humanoid.leftLeg.rotation.x = -swing * legSwingAmplitude;
            humanoid.rightLeg.rotation.x = swing * legSwingAmplitude;

            humanoid.leftLeg.children[0]?.children[0]?.rotation.set(
                Math.abs(swing) * kneeBendAmplitude, 0, 0
            );
            humanoid.rightLeg.children[0]?.children[0]?.rotation.set(
                Math.abs(-swing) * kneeBendAmplitude, 0, 0
            );

            humanoid.leftLeg.children[0]?.children[0]?.children[0]?.children[0]?.rotation.set(
                Math.max(0, swing) * footRollAmplitude, 0, 0
            );
            humanoid.rightLeg.children[0]?.children[0]?.children[0]?.children[0]?.rotation.set(
                Math.max(0, -swing) * footRollAmplitude, 0, 0
            );
        }

        // Body
        if (humanoid.body) {
            humanoid.body.position.y = 10 + Math.abs(swing) * bodyBobAmplitude + breathing;
            humanoid.body.rotation.set(-forwardLean, swing * torsoTwistAmplitude, 0);
        }

        // Head
        if (humanoid.head) {
            humanoid.head.position.y = 18 + Math.abs(swing) * headBobAmplitude + breathing * 0.5;
            humanoid.head.rotation.x = swing * 0.06;
        }
    } else {
        resetHumanoidPose(humanoid);
    }
}

function resetHumanoidPose(humanoid) {
    if (humanoid.leftArm) humanoid.leftArm.rotation.set(0, 0, -0.15);
    if (humanoid.rightArm) humanoid.rightArm.rotation.set(0, 0, 0.15);

    if (humanoid.leftLeg) humanoid.leftLeg.rotation.set(0, 0, 0);
    if (humanoid.rightLeg) humanoid.rightLeg.rotation.set(0, 0, 0);

    humanoid.leftLeg?.children[0]?.children[0]?.rotation.set(0, 0, 0);
    humanoid.rightLeg?.children[0]?.children[0]?.rotation.set(0, 0, 0);

    humanoid.leftLeg?.children[0]?.children[0]?.children[0]?.children[0]?.rotation.set(0, 0, 0);
    humanoid.rightLeg?.children[0]?.children[0]?.children[0]?.children[0]?.rotation.set(0, 0, 0);

    if (humanoid.body) {
        humanoid.body.position.y = 10;
        humanoid.body.rotation.set(0, 0, 0);
    }

    if (humanoid.head) {
        humanoid.head.position.y = 18;
        humanoid.head.rotation.set(0, 0, 0);
    }

    humanoid.traverse((child) => {
        if (child.name === 'Shorts' || child.name === 'Shirt') {
            child.rotation.set(0, 0, 0);
            child.updateMatrixWorld(true);
        }
    });
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

function closeInventory() {
    inventoryOpen = false;
    document.getElementById('inventory').style.display = 'none';
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

// Inventory management
function initializeInventory() {
    const inventoryGrid = document.querySelector('.inventoryGrid');
    const ROWS = 6;
    const COLS = 10;
    
    // Clear existing content
    inventoryGrid.innerHTML = '';
    
    // Generate grid slots
    for (let i = 0; i < ROWS * COLS; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.dataset.index = i;
        inventoryGrid.appendChild(slot);
    }

    // Add event listeners for inventory interactions
    document.querySelectorAll('.inventory-slot, .equipment-slot, .weapon-slot').forEach(slot => {
        slot.addEventListener('click', handleSlotClick);
        slot.addEventListener('dragstart', handleDragStart);
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
    });
}

function handleSlotClick(event) {
    const slot = event.currentTarget;
    // Handle slot click logic here
}

function handleDragStart(event) {
    const slot = event.currentTarget;
    event.dataTransfer.setData('text/plain', slot.dataset.index);
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const sourceIndex = event.dataTransfer.getData('text/plain');
    const targetSlot = event.currentTarget;
    // Handle item drop logic here
}

// Initialize inventory when the game loads
document.addEventListener('DOMContentLoaded', () => {
    initializeInventory();
});

// Create countdown display
const countdownDisplay = document.createElement('div');
countdownDisplay.style.position = 'fixed';
countdownDisplay.style.top = '50%';
countdownDisplay.style.left = '50%';
countdownDisplay.style.transform = 'translate(-50%, -50%)';
countdownDisplay.style.fontSize = '48px';
countdownDisplay.style.color = 'white';
countdownDisplay.style.display = 'none';
document.body.appendChild(countdownDisplay);

let countdownInterval;
let isCountdownActive = false;

function startCountdown() {
    if (isCountdownActive) return;
    
    isCountdownActive = true;
    let count = 5;
    countdownDisplay.style.display = 'block';
    
    countdownDisplay.textContent = count;
    
    countdownInterval = setInterval(() => {
        count--;
        countdownDisplay.textContent = count;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.style.display = 'none';
            isCountdownActive = false;
        }
    }, 1000);
}

function checkFloorCollision(playerPosition) {
    const purpleStructure = scene.getObjectByProperty('type', 'Group');
    if (!purpleStructure) return;

    const floor = purpleStructure.userData.floor;
    if (!floor) return;

    const floorBoundingBox = new THREE.Box3().setFromObject(floor);
    const playerBoundingBox = new THREE.Box3();
    playerBoundingBox.min.set(
        playerPosition.x - 1,
        playerPosition.y - 2,
        playerPosition.z - 1
    );
    playerBoundingBox.max.set(
        playerPosition.x + 1,
        playerPosition.y,
        playerPosition.z + 1
    );

    if (floorBoundingBox.intersectsBox(playerBoundingBox)) {
        startCountdown();
    }
}

init();
initMap();
animate();
