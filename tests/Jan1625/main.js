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

    // Store the original ambient light intensity
    const originalAmbientLight = scene.children.find(child => child instanceof THREE.AmbientLight);
    const originalIntensity = originalAmbientLight ? originalAmbientLight.intensity : 0;

    // Temporarily increase ambient light intensity for minimap
    if (originalAmbientLight) {
        originalAmbientLight.intensity = 1.5; // Increased brightness for minimap
    }

    minimapCamera.position.x = player.position.x;
    minimapCamera.position.z = player.position.z;

    renderer.setViewport(minimapX, canvasRect.height - minimapY - mapHeight, mapWidth, mapHeight);
    renderer.setScissor(minimapX, canvasRect.height - minimapY - mapHeight, mapWidth, mapHeight);
    renderer.setScissorTest(true);
    renderer.render(scene, minimapCamera);

    // Restore original ambient light intensity
    if (originalAmbientLight) {
        originalAmbientLight.intensity = originalIntensity;
    }
}

function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();
    const delta = clock.getDelta();

    // Critical updates that need to happen every frame
    if (isMouseDown && mouseDestination) {
        destination = mouseDestination.clone();
    }

    // Initialize grass system if not already initialized
    if (!window.grassSystem && typeof GrassSystem !== 'undefined') {
        window.grassSystem = new GrassSystem(scene, {
            patchSize: 100,
            bladesPerPatch: 50,
            bladeHeight: 1,
            bladeWidth: 0.1,
            renderDistance: 2
        });
    }

    // Update grass system if initialized
    if (window.grassSystem) {
        window.grassSystem.update(player.position);
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
    
    // Update falling trees
    if (window.updateFallingTrees) {
        updateFallingTrees(delta);
    }

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
    updateGathering(delta);

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

    // Check for tree intersections first
    const treeIntersects = raycaster.intersectObjects(trees, true);
    if (treeIntersects.length > 0) {
        const treePoint = treeIntersects[0].point;
        const treeObject = getEntityWithName(treeIntersects[0].object);
        
        // Calculate a position slightly away from the tree
        const direction = new THREE.Vector3().subVectors(treePoint, player.position).normalize();
        const distanceFromTree = 3; // Distance to stand from the tree
        const destinationPoint = new THREE.Vector3(
            treePoint.x - direction.x * distanceFromTree,
            player.position.y,
            treePoint.z - direction.z * distanceFromTree
        );
        
        mouseDestination = destinationPoint;
        destination = destinationPoint;
        
        // Start gathering when player reaches the tree
        if (!isGathering) {
            const checkGatheringStart = setInterval(() => {
                if (!player.isMoving && player.position.distanceTo(destinationPoint) < 4) {
                    startGathering(treeObject);
                    clearInterval(checkGatheringStart);
                }
            }, 100);
        }
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

    // Store the original ambient light intensity
    const originalAmbientLight = scene.children.find(child => child instanceof THREE.AmbientLight);
    const originalIntensity = originalAmbientLight ? originalAmbientLight.intensity : 0;

    // Temporarily increase ambient light intensity for minimap
    if (originalAmbientLight) {
        originalAmbientLight.intensity = 1.5; // Increased brightness for minimap
    }

    minimapCamera.position.x = player.position.x;
    minimapCamera.position.z = player.position.z;

    renderer.setViewport(minimapX, canvasRect.height - minimapY - mapHeight, mapWidth, mapHeight);
    renderer.setScissor(minimapX, canvasRect.height - minimapY - mapHeight, mapWidth, mapHeight);
    renderer.setScissorTest(true);
    renderer.render(scene, minimapCamera);

    // Restore original ambient light intensity
    if (originalAmbientLight) {
        originalAmbientLight.intensity = originalIntensity;
    }
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

    /**
     * Selects a random color from the provided array.
     * @param {Array} colorArray - Array of color hex values.
     * @returns {Number} - Selected color hex value.
     */
    function getRandomColor(colorArray) {
        return colorArray[Math.floor(Math.random() * colorArray.length)];
    }

    /**
     * Creates a MeshStandardMaterial with enhanced shading and textures.
     * @param {Number} colorValue - Hex color value.
     * @returns {THREE.MeshStandardMaterial} - Created material.
     */
    function createMaterial(colorValue) {
        // Create normal map for 3D surface detail
        const normalCanvas = document.createElement('canvas');
        normalCanvas.width = 256;
        normalCanvas.height = 256;
        const normalCtx = normalCanvas.getContext('2d');
        
        // Create a more complex normal map pattern
        normalCtx.fillStyle = '#808080'; // Neutral normal map base
        normalCtx.fillRect(0, 0, 256, 256);
        
        // Add some surface variation
        for (let y = 0; y < normalCanvas.height; y += 4) {
            for (let x = 0; x < normalCanvas.width; x += 4) {
                const noise = Math.random() * 30 + 100;
                normalCtx.fillStyle = `rgb(${noise},${noise},255)`;
                normalCtx.fillRect(x, y, 4, 4);
            }
        }

        // Create roughness map for surface texture
        const roughnessCanvas = document.createElement('canvas');
        roughnessCanvas.width = 256;
        roughnessCanvas.height = 256;
        const roughnessCtx = roughnessCanvas.getContext('2d');
        
        // Create a subtle texture pattern
        roughnessCtx.fillStyle = '#FFFFFF';
        roughnessCtx.fillRect(0, 0, 256, 256);
        
        for (let y = 0; y < roughnessCanvas.height; y += 8) {
            for (let x = 0; x < roughnessCanvas.width; x += 8) {
                const roughness = Math.random() * 0.3 + 0.5;
                roughnessCtx.fillStyle = `rgb(${roughness * 255},${roughness * 255},${roughness * 255})`;
                roughnessCtx.fillRect(x, y, 8, 8);
            }
        }

        // Create ambient occlusion map
        const aoCanvas = document.createElement('canvas');
        aoCanvas.width = 256;
        aoCanvas.height = 256;
        const aoCtx = aoCanvas.getContext('2d');
        
        // Create subtle ambient occlusion
        aoCtx.fillStyle = '#FFFFFF';
        aoCtx.fillRect(0, 0, 256, 256);
        
        for (let y = 0; y < aoCanvas.height; y += 16) {
            for (let x = 0; x < aoCanvas.width; x += 16) {
                const ao = Math.random() * 0.2 + 0.8;
                aoCtx.fillStyle = `rgb(${ao * 255},${ao * 255},${ao * 255})`;
                aoCtx.fillRect(x, y, 16, 16);
            }
        }

        // Create and configure textures
        const normalMap = new THREE.CanvasTexture(normalCanvas);
        const roughnessMap = new THREE.CanvasTexture(roughnessCanvas);
        const aoMap = new THREE.CanvasTexture(aoCanvas);

        // Configure texture settings
        [normalMap, roughnessMap, aoMap].forEach(map => {
            map.wrapS = THREE.RepeatWrapping;
            map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(2, 2);
        });

        // Create enhanced material
        return new THREE.MeshStandardMaterial({
            color: colorValue,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(0.5, 0.5),
            roughnessMap: roughnessMap,
            roughness: 0.7,
            metalness: 0.1,
            aoMap: aoMap,
            aoMapIntensity: 0.5,
            envMapIntensity: 1.0,
            side: THREE.DoubleSide,
            flatShading: false
        });
    }

    /**
     * Configures shadow properties for a mesh.
     * @param {THREE.Mesh} mesh - The mesh to configure.
     * @returns {THREE.Mesh} - Configured mesh.
     */
    function configureShadows(mesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    // Randomly assigned colors
    const selectedSkinColor = getRandomColor(skinColors);
    const selectedHairColor = getRandomColor(hairColors);

    // ----------------------------------------------------
    // 2. TORSO & SHOULDERS (LatheGeometry, more points)
    // ----------------------------------------------------
    const torsoPoints = [
        new THREE.Vector2(1.3, 0),   // Start at waist
        new THREE.Vector2(1.8, 3),   // Lower abdomen / hips
        new THREE.Vector2(2.4, 5.5), // Rib cage
        new THREE.Vector2(2.7, 7),   // Bust area
        new THREE.Vector2(2.5, 9),   // Upper chest near shoulders
        new THREE.Vector2(2.8, 10)   // Shoulder top
    ];
    const torsoGeometry = new THREE.LatheGeometry(torsoPoints, 24);
    const torsoMaterial = createMaterial(selectedSkinColor);
    const torso = configureShadows(new THREE.Mesh(torsoGeometry, torsoMaterial));

    // Move torso downward slightly
    torso.position.set(0, 17, 0);
    torso.rotation.x = Math.PI;  // Rotate 180 degrees to flip it right-side up

    // Close the top of the Lathe
    {
        const topRadius = torsoPoints[torsoPoints.length - 1].x; // ~2.8
        const topSegments = 24;
        const topDiskGeom = new THREE.CircleGeometry(topRadius, topSegments);
        const topDisk = configureShadows(new THREE.Mesh(topDiskGeom, torsoMaterial));
        topDisk.rotation.x = -Math.PI / 2;
        topDisk.position.set(0, torsoPoints[torsoPoints.length - 1].y, 0);
        torso.add(topDisk);
    }

    // Breasts
    const breastRadius = 1.2;
    const leftBreastGeom = new THREE.SphereGeometry(breastRadius, 24, 24);
    const leftBreast = configureShadows(new THREE.Mesh(leftBreastGeom, torsoMaterial));
    leftBreast.position.set(-1.2, 12.5, 1.3);
    leftBreast.scale.set(1, 0.9, 1.2);

    const rightBreastGeom = new THREE.SphereGeometry(breastRadius, 24, 24);
    const rightBreast = configureShadows(new THREE.Mesh(rightBreastGeom, torsoMaterial));
    rightBreast.position.set(1.2, 12.5, 1.3);
    rightBreast.scale.set(1, 0.9, 1.2);

    humanoidGroup.add(torso, leftBreast, rightBreast);

    // ----------------------------------------------------
    // 3. PELVIS (LatheGeometry for smooth hips)
    // ----------------------------------------------------
    const pelvisPoints = [
        new THREE.Vector2(2.1, 0),   // top (matching the waist where torso ends)
        new THREE.Vector2(2.0, 1.5), // narrow near the crotch area
        new THREE.Vector2(2.2, 3)    // slightly out near top of thighs
    ];
    const pelvisGeometry = new THREE.LatheGeometry(pelvisPoints, 24);
    const pelvisMaterial = createMaterial(selectedSkinColor);
    const pelvis = configureShadows(new THREE.Mesh(pelvisGeometry, pelvisMaterial));

    // REMOVE the flip that made the torso upside-down:
    // pelvis.rotation.x = Math.PI; // <— This line was removed

    // Slightly move the pelvis upward
    pelvis.position.set(0, 9.3, 0);
    humanoidGroup.add(pelvis);

    // ----------------------------------------------------
    // 4. NECK & HEAD
    // ----------------------------------------------------
    const neckJoint = configureShadows(
        new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), createMaterial(selectedSkinColor))
    );
    neckJoint.position.set(0, 18, 0);

    const headGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const headMaterial = createMaterial(selectedSkinColor);
    const head = configureShadows(new THREE.Mesh(headGeometry, headMaterial));
    head.position.set(0, 1.5, 0);
    neckJoint.add(head);

    // Simple "hair helmet"
    const hairGeometry = new THREE.SphereGeometry(1.9, 32, 32);
    const hairMaterial = createMaterial(selectedHairColor);
    const hair = configureShadows(new THREE.Mesh(hairGeometry, hairMaterial));
    hair.scale.set(1, 0.85, 1);
    hair.position.set(0, 0.3, 0);
    head.add(hair);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = createMaterial(0x000000);
    const leftEye = configureShadows(new THREE.Mesh(eyeGeometry, eyeMaterial));
    const rightEye = configureShadows(new THREE.Mesh(eyeGeometry, eyeMaterial));
    leftEye.position.set(-0.45, 0.1, 1.2);
    rightEye.position.set(0.45, 0.1, 1.2);
    head.add(leftEye, rightEye);

    // Nose
    const noseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.35, 8);
    const nose = configureShadows(new THREE.Mesh(noseGeometry, headMaterial));
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0, 1.4);
    head.add(nose);

    humanoidGroup.add(neckJoint);

    // ----------------------------------------------------
    // 5. ARMS (LatheGeometry for upper arms/forearms)
    // ----------------------------------------------------
    function createArm(side) {
        const armRoot = new THREE.Group();

        const shoulderJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 16), createMaterial(selectedSkinColor))
        );
        armRoot.add(shoulderJoint);

        const upperArmPoints = [
            new THREE.Vector2(0.7, 0),
            new THREE.Vector2(0.65, 2),
            new THREE.Vector2(0.5, 4)
        ];
        const upperArmGeom = new THREE.LatheGeometry(upperArmPoints, 16);
        const upperArm = configureShadows(new THREE.Mesh(upperArmGeom, createMaterial(selectedSkinColor)));
        upperArm.rotation.x = -Math.PI/2;  // Make arm point outward horizontally
        shoulderJoint.add(upperArm);

        const elbowJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), createMaterial(selectedSkinColor))
        );
        elbowJoint.position.set(0, 4, 0);
        upperArm.add(elbowJoint);

        const forearmPoints = [
            new THREE.Vector2(0.45, 0),
            new THREE.Vector2(0.4, 2),
            new THREE.Vector2(0.35, 4)
        ];
        const forearmGeom = new THREE.LatheGeometry(forearmPoints, 16);
        const forearm = configureShadows(new THREE.Mesh(forearmGeom, createMaterial(selectedSkinColor)));
        forearm.rotation.x = -Math.PI/2;  // Make forearm point outward horizontally
        elbowJoint.add(forearm);

        const wristJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), createMaterial(selectedSkinColor))
        );
        wristJoint.position.set(0, 4, 0);
        forearm.add(wristJoint);

        // Hand
        const handGroup = new THREE.Group();
        const palmGeom = new THREE.BoxGeometry(0.8, 0.4, 1);
        const palm = configureShadows(new THREE.Mesh(palmGeom, createMaterial(selectedSkinColor)));
        palm.position.set(0, -0.2, 0);
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
            finger.position.set((i - 1.5) * 0.2, 0, 0.55);
            handGroup.add(finger);
        }
        // Thumb
        const thumb = configureShadows(new THREE.Mesh(
            new THREE.CylinderGeometry(fingerRadius, fingerRadius, 0.4, 8),
            createMaterial(selectedSkinColor)
        ));
        thumb.rotation.z = Math.PI / 6;
        thumb.rotation.y = -Math.PI / 6;
        thumb.position.set(0.45, 0, 0.2);
        handGroup.add(thumb);

        wristJoint.add(handGroup);

        // Position & Swap
        const armXPosition = side === 'left' ? -2.8 : 2.8; 
        const armYPosition = 10.5 + 2.5; // arms moved up by 2.5
        armRoot.position.set(armXPosition, armYPosition, 0);

        // Subtle outward rotation
        if (side === 'left') {
            armRoot.rotation.z = -Math.PI/12;  // Slight outward angle
        } else {
            armRoot.rotation.z = Math.PI/12;   // Slight outward angle
        }

        return armRoot;
    }

    const leftArm = createArm('left');   // Now correctly on the left side
    const rightArm = createArm('right'); // Now correctly on the right side
    humanoidGroup.add(leftArm, rightArm);

    // No additional rotations needed since arms are properly oriented in createArm
    // leftArm.rotation.set(0, 0, 0);  
    // rightArm.rotation.set(0, 0, 0); 

    // Set the initial rotation of the left arm to 90 degrees counterclockwise and the right arm to 90 degrees clockwise
    // leftArm.rotation.set(0, 0, Math.PI);
    // rightArm.rotation.set(0, 0, -Math.PI);

    // ----------------------------------------------------
    // 6. LEGS (LatheGeometry for thighs/calves)
    // ----------------------------------------------------
    function createLeg(side) {
        const legRoot = new THREE.Group();

        // Hip joint
        const hipJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), createMaterial(selectedSkinColor))
        );
        legRoot.add(hipJoint);

        // Thigh
        const thighPoints = [
            new THREE.Vector2(0.8, 0),
            new THREE.Vector2(0.9, 2),
            new THREE.Vector2(0.5, 4)
        ];
        const thighGeom = new THREE.LatheGeometry(thighPoints, 16);
        const thigh = configureShadows(new THREE.Mesh(thighGeom, createMaterial(selectedSkinColor)));
        thigh.rotation.x = -Math.PI/2; // Rotate to point down
        hipJoint.add(thigh);

        // Knee
        const kneeJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), createMaterial(selectedSkinColor))
        );
        kneeJoint.position.set(0, 4, 0);
        thigh.add(kneeJoint);

        // Calf
        const calfPoints = [
            new THREE.Vector2(0.45, 0),
            new THREE.Vector2(0.4, 2),
            new THREE.Vector2(0.35, 4)
        ];
        const calfGeom = new THREE.LatheGeometry(calfPoints, 16);
        const calf = configureShadows(new THREE.Mesh(calfGeom, createMaterial(selectedSkinColor)));
        calf.rotation.x = -Math.PI/2; // Rotate to point down
        kneeJoint.add(calf);

        // Ankle
        const ankleJoint = configureShadows(
            new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), createMaterial(selectedSkinColor))
        );
        ankleJoint.position.set(0, 4, 0);
        calf.add(ankleJoint);

        // Foot
        const footGeom = new THREE.BoxGeometry(1, 0.5, 2);
        const foot = configureShadows(new THREE.Mesh(footGeom, createMaterial(selectedSkinColor)));
        foot.position.set(0, -0.25, 0.5);
        foot.rotation.x = Math.PI/2; // Rotate foot to point forward
        ankleJoint.add(foot);

        // Position legs
        legRoot.position.set(side === 'left' ? -1.3 : 1.3, 7.0, 0);
        
        // Rotate the entire leg to point forward and down
        legRoot.rotation.x = -Math.PI/2; // Changed from Math.PI/2 to -Math.PI/2
        
        return legRoot;
    }

    const leftLeg = createLeg('left');
    const rightLeg = createLeg('right');
    humanoidGroup.add(leftLeg, rightLeg);

    // ----------------------------------------------------
    // 7. OPTIONAL: PUBIC HAIR
    // ----------------------------------------------------
    const pubicHairGeom = new THREE.PlaneGeometry(1.8, 1);
    const pubicHairMat = new THREE.MeshLambertMaterial({ 
        color: selectedHairColor, 
        side: THREE.DoubleSide 
    });
    const pubicHair = configureShadows(new THREE.Mesh(pubicHairGeom, pubicHairMat));
    pubicHair.rotation.x = Math.PI / 2;
    pubicHair.position.set(0, 3.8, 1.1);
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

    // Always update animation time for breathing
    humanoid.animationTime += deltaTime * humanoid.animationSpeed;

    if (humanoid.isMoving) {
        // Walking animation
        const armSwingAmplitude    = 0.55;
        const torsoTwistAmplitude  = 0.09;
        const bodyBobAmplitude     = 0.12;
        const headBobAmplitude     = 0.1;
        const forwardLean          = 0.15;
        const breathingAmplitude   = 0.02;

        const swing     = Math.sin(humanoid.animationTime * humanoid.armSwingSpeed);
        const breathing = Math.sin(humanoid.animationTime * 0.5) * breathingAmplitude;

        // Arms swing
        if (humanoid.leftArm && humanoid.rightArm) {
            // Forward/backward swing
            humanoid.leftArm.rotation.x = -Math.PI/2 + swing * armSwingAmplitude;
            humanoid.rightArm.rotation.x = -Math.PI/2 - swing * armSwingAmplitude;

            // Keep slight outward angle
            humanoid.leftArm.rotation.z = -Math.PI/12;
            humanoid.rightArm.rotation.z = Math.PI/12;
        }

        // Body bob and forward lean
        if (humanoid.body) {
            humanoid.body.position.y = 17 + Math.abs(swing) * bodyBobAmplitude + breathing;
            humanoid.body.rotation.x = Math.PI - forwardLean;
            humanoid.body.rotation.y = swing * torsoTwistAmplitude;
            humanoid.body.rotation.z = 0;
        }

        // Head bob
        if (humanoid.head) {
            humanoid.head.parent.position.y = 18 + Math.abs(swing) * headBobAmplitude + breathing * 0.8;
            humanoid.head.rotation.x = swing * 0.06;
        }
    } else if (window.isGathering && humanoid === player) {
        // Chopping animation
        const strikePhase = window.strikeProgress / 0.3; // Normalize to 0-1
        const chopArmAngle = -Math.PI * 0.7; // Base angle for chopping
        const chopSwingRange = Math.PI * 0.6; // How far the arms swing
        const breathing = Math.sin(humanoid.animationTime * 0.5) * 0.02;

        if (strikePhase < 0.3) {
            // Wind up phase - raise arms back
            const windupProgress = strikePhase / 0.3;
            if (humanoid.leftArm && humanoid.rightArm) {
                // Both arms swing back together
                humanoid.leftArm.rotation.x = chopArmAngle - chopSwingRange * windupProgress;
                humanoid.rightArm.rotation.x = chopArmAngle - chopSwingRange * windupProgress;
                
                // Arms come together
                humanoid.leftArm.rotation.z = -Math.PI/24;
                humanoid.rightArm.rotation.z = Math.PI/24;
            }
            
            // Lean back slightly
            if (humanoid.body) {
                humanoid.body.rotation.x = Math.PI + 0.2 * windupProgress;
                humanoid.body.position.y = 17 + breathing;
            }
        } else if (strikePhase < 1) {
            // Strike phase - swing arms forward
            const strikeProgress = (strikePhase - 0.3) / 0.7;
            if (humanoid.leftArm && humanoid.rightArm) {
                // Both arms swing forward together
                const swingAngle = chopArmAngle - chopSwingRange + chopSwingRange * 1.2 * strikeProgress;
                humanoid.leftArm.rotation.x = swingAngle;
                humanoid.rightArm.rotation.x = swingAngle;
                
                // Keep arms together
                humanoid.leftArm.rotation.z = -Math.PI/24;
                humanoid.rightArm.rotation.z = Math.PI/24;
            }
            
            // Lean forward during strike
            if (humanoid.body) {
                humanoid.body.rotation.x = Math.PI + 0.2 - 0.4 * strikeProgress;
                humanoid.body.position.y = 17 + breathing;
            }
        } else {
            // Reset pose between strikes but keep arms ready
            if (humanoid.leftArm && humanoid.rightArm) {
                humanoid.leftArm.rotation.x = chopArmAngle;
                humanoid.rightArm.rotation.x = chopArmAngle;
                humanoid.leftArm.rotation.z = -Math.PI/24;
                humanoid.rightArm.rotation.z = Math.PI/24;
            }
            
            if (humanoid.body) {
                humanoid.body.rotation.x = Math.PI;
                humanoid.body.position.y = 17 + breathing;
            }
        }
        
        // Head always looks down during gathering
        if (humanoid.head) {
            humanoid.head.parent.position.y = 18 + breathing * 0.8;
            humanoid.head.rotation.x = 0.3;
        }
    } else {
        resetHumanoidPose(humanoid);
    }
}

function resetHumanoidPose(humanoid) {
    if (!humanoid) return;
    humanoid.animationTime = 0;

    // Body
    if (humanoid.body) {
        humanoid.body.position.y = 17;
        humanoid.body.rotation.set(Math.PI, 0, 0);
    }

    // Head
    if (humanoid.head) {
        humanoid.head.rotation.set(0, 0, 0);
        humanoid.head.parent.position.y = 18;
    }

    // Arms - keep them horizontal with slight outward angle
    if (humanoid.leftArm) {
        humanoid.leftArm.rotation.set(-Math.PI/2, 0, -Math.PI/12);
    }
    if (humanoid.rightArm) {
        humanoid.rightArm.rotation.set(-Math.PI/2, 0, Math.PI/12);
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
