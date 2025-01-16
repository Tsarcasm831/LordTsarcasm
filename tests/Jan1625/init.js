//init.js
function initializeInventory() {
    const tabs = document.querySelectorAll('.inventory-tab');
    const tabContents = document.querySelectorAll('.inventory-tab-content');

    // Only show the first tab initially
    if (tabContents.length > 0) tabContents[0].style.display = 'block';

    // Set up listeners only for tabs not currently active
    tabs.forEach((tab, index) => {
        if (index !== 0) {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                tabContents.forEach(content => {
                    content.style.display = content.id === tabId ? 'block' : 'none';
                });
            });
        }
    });
}


function addSky() {
    // Define your desired sky color (e.g., light blue)
    const skyColor = 0x87ceeb; // Hex code for light blue

    // Set the scene background to the solid color
    scene.background = new THREE.Color(skyColor);

    // Optional: If you still need the skyPlane for markers or other purposes,
    // adjust its material to have a visible color or keep it transparent as needed.

    
    const skyboxSize = 10000; // Large enough to encompass the scene

    // Create a transparent plane that hovers above the ground as a marker
    const groundHeight = 3; // 3px above current ground level
    const geometry = new THREE.PlaneGeometry(skyboxSize, skyboxSize);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0,
        transparent: true
    });
    const skyPlane = new THREE.Mesh(geometry, material);

    // Position the skyPlane slightly above the ground
    skyPlane.position.y = groundHeight;
    skyPlane.rotation.x = -Math.PI / 2; // Rotate to be parallel with ground

    // Add the plane to the scene
    scene.add(skyPlane);
    

    // If the skyPlane is no longer needed, you can remove or comment out the above code.
}

function addGroundPlane(scene, options = {}) {
    // Destructure options with default values
    const {
        size = 10000,          // Size of the ground plane
        color = 0x228B22,     // Default color: ForestGreen
        textureURL = null,    // URL of the texture image (optional)
        rotation = { x: -Math.PI / 2, y: -0.1, z: 0 }, // Default rotation to lie flat
        position = { x: 0, y: 0, z: 0 },           // Default position at y = 0
        receiveShadow = true, // Whether the ground receives shadows
        name = 'ground',      // Name of the ground mesh
        textureRepeat = { x: size / 100, y: size / 100 }, // Texture repeat values
    } = options;

    let material;

    if (textureURL) {
        // If a texture URL is provided, load and apply the texture
        const textureLoader = new THREE.TextureLoader();
        console.log('Attempting to load texture from:', textureURL);
        
        const texture = textureLoader.load(
            textureURL,
            (texture) => {
                // Configure texture once it's loaded
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(textureRepeat.x, textureRepeat.y);
                texture.encoding = THREE.sRGBEncoding;
                texture.anisotropy = 16;
                console.log('Ground texture loaded successfully');
            },
            undefined,
            (error) => {
                console.error('Error loading ground texture:', error);
                // Fallback to brown color on error
                material.color.setHex(0x8B4513);
            }
        );

        material = new THREE.MeshStandardMaterial({ 
            map: texture,
            side: THREE.DoubleSide,
            roughness: 0.8,
            metalness: 0.2
        });
    } else {
        // Use a solid color material
        material = new THREE.MeshStandardMaterial({ 
            color: color, 
            side: THREE.DoubleSide,
            roughness: 0.8,
            metalness: 0.2
        });
    }

    // Create the ground geometry
    const geometry = new THREE.PlaneGeometry(size, size);
    const ground = new THREE.Mesh(geometry, material);
    ground.name = name;

    // Apply rotation to make the plane horizontal
    ground.rotation.x = rotation.x;
    ground.rotation.y = rotation.y;
    ground.rotation.z = rotation.z;

    // Position the ground in the scene
    ground.position.set(position.x, position.y, position.z);

    // Enable shadow receiving if needed
    ground.receiveShadow = receiveShadow;

    // Add the ground to the scene
    scene.add(ground);

    console.log('Ground plane added to the scene.');

    return ground; // Return the ground mesh in case further modifications are needed
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

    // Enable shadow mapping in the renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    minimapCamera = new THREE.OrthographicCamera(-200, 200, 200, -200, 0.1, 10000);
    minimapCamera.position.set(0, 500, 0);
    minimapCamera.up.set(0, 0, -1);
    minimapCamera.lookAt(0, 0, 0);
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Configure directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2000, 3000, 1000);  // Moved much higher and further back
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;  // High resolution for quality
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 10000;  // Match ground plane size
    directionalLight.shadow.camera.left = -5000;  // Half the ground plane size
    directionalLight.shadow.camera.right = 5000;
    directionalLight.shadow.camera.top = 5000;
    directionalLight.shadow.camera.bottom = -5000;
    directionalLight.shadow.bias = -0.001;
    
    // Add a target at the center of the world
    const lightTarget = new THREE.Object3D();
    lightTarget.position.set(0, 0, 0);
    scene.add(lightTarget);
    directionalLight.target = lightTarget;
    
    scene.add(directionalLight);
    addQuadrupeds();

    // Initialize the day/night cycle after lights are set up
    if (typeof window.initDayNightCycle === 'function') {
        window.initDayNightCycle();
    }

    // Add the ground plane using the addGroundPlane function
    ground = addGroundPlane(scene, {
        size: 10000,
        textureURL: 'https://file.garden/Zy7B0LkdIVpGyzA1/ground.png', // Direct web URL
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        position: { x: 0, y: 0.1, z: 0 },  // Raised slightly above 0
        receiveShadow: true,
        name: 'ground',
        textureRepeat: { x: 100, y: 100 }
    });

    // Add the safe zone ground
    const safeZoneGroundGeometry = new THREE.PlaneGeometry(1200, 1200);
    
    // Load and configure the texture
    const textureLoader = new THREE.TextureLoader();
    const safeZoneTexture = textureLoader.load('https://file.garden/Zy7B0LkdIVpGyzA1/concrete.webp');
    safeZoneTexture.wrapS = THREE.RepeatWrapping;
    safeZoneTexture.wrapT = THREE.RepeatWrapping;
    safeZoneTexture.repeat.set(50, 50); // Adjust repeat to match the scale
    
    const safeZoneGroundMaterial = new THREE.MeshStandardMaterial({
        map: safeZoneTexture,
        roughness: 0.8,
        metalness: 0.2
    });
    
    safeZoneGround = new THREE.Mesh(safeZoneGroundGeometry, safeZoneGroundMaterial);
    safeZoneGround.rotation.x = -Math.PI / 2;
    safeZoneGround.position.y = 0.4;
    safeZoneGround.receiveShadow = true;  
    scene.add(safeZoneGround);

    // Add the safe zone barrier
    const safeZoneBarrierGeometry = new THREE.BoxGeometry(1200, 50, 1200);
    const safeZoneBarrierMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    const safeZoneBarrier = new THREE.Mesh(safeZoneBarrierGeometry, safeZoneBarrierMaterial);
    safeZoneBarrier.position.set(0, 25, 0);
    scene.add(safeZoneBarrier);
    enemyWalls.push(safeZoneBarrier);

    const initialSettlementWalls = createSettlementWalls(scene, walls, enemyWalls);
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
    teleportPad.position.y = 0.15;
    teleportPad.name = 'teleportPad';
    shrineGroup.add(teleportPad);

    shrineGroup.position.set(0, 0.1, 0);
    scene.add(shrineGroup);

    addSky();

    const structurePositions = [
        // Row 1 (z = 200)
        { x: -200, z: 200 },
        { x: 0, z: 200 },
        { x: 200, z: 200 },
        // Row 2 (z = -200)
        { x: -200, z: -200 },
        { x: 0, z: -200 },
        { x: 200, z: -200 },
    ];
    
    structurePositions.forEach(pos => {
        const structure = createBuilding(Math.floor(Math.random() * 5) + 1); // Random building type 1-5
        structure.position.set(pos.x, 0, pos.z);
        scene.add(structure);
        if (structure.userData && structure.userData.walls) {
            walls.push(...structure.userData.walls);
        }
        structures.push(structure);

        // Usage example
        const npcInfo = getRandomNPC();
        if (npcInfo) {
            console.log(npcInfo);
        } else {
            console.log("No more unique NPCs left to select.");
        }

        // Create the NPC with the selected data
        const npc = createFriendlyNPC(0x00ff00, npcInfo.name, npcInfo.dialogue);

        // Position the NPC at the structure's position
        npc.position.copy(structure.position);
        npc.rotation.y = Math.PI;

        // Add the NPC to the scene and friendlies array
        scene.add(npc);
        friendlies.push(npc);
    });

    player = createHumanoid(
        0x0000ff,  // Blue color
        'textures/enemies/humans.png',  // Use human texture as base
        'plain',  // Simple pattern
        1.8,  // Standard height
        'muscular'  // Muscular body shape
    );
    player.position.y = 0.1;  // Raised slightly off the ground for better shadow casting
    player.castShadow = true;
    player.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            applyPattern(child, 'plain');
        }
    });
    applyBodyShape(player, 'muscular');  // Apply body shape
    scene.add(player);
    

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    canvas.addEventListener('mousedown', onDocumentMouseDown, false);
    canvas.addEventListener('mouseup', onDocumentMouseUp, false);
    canvas.addEventListener('dblclick', function(event) { /* Do nothing */ }, false);
}

let mapInitialized = false;  
function initMap() {
    if (mapInitialized) return;
    mapInitialized = true;
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
