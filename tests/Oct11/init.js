//init.js
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

function addSkyboxAboveGround() {
    const skyboxSize = 10000; // Large enough to encompass the scene

    // Load skybox textures (assuming paths to six images for each face of the cube)
    const loader = new THREE.CubeTextureLoader();
    const skyboxTexture = loader.load([
        'textures/skybox_px.jpg', // Positive X
        'textures/skybox_nx.jpg', // Negative X
        'textures/skybox_py.jpg', // Positive Y
        'textures/skybox_ny.jpg', // Negative Y
        'textures/skybox_pz.jpg', // Positive Z
        'textures/skybox_nz.jpg'  // Negative Z
    ]);

    // Set the scene background to the skybox texture
    scene.background = skyboxTexture;

    // Create a transparent plane that hovers above the ground as a marker
    const groundHeight = 3; // 3px above current ground level
    const geometry = new THREE.PlaneGeometry(skyboxSize, skyboxSize);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0,
        transparent: true
    });
    const skyPlane = new THREE.Mesh(geometry, material);

    // Position the skybox slightly above the ground
    skyPlane.position.y = groundHeight;
    skyPlane.rotation.x = -Math.PI / 2; // Rotate to be parallel with ground

    // Add the plane to the scene
    scene.add(skyPlane);
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

        


    document.getElementById('helpWindow').style.display = 'block';

    const groundShape = new THREE.Shape();
    groundShape.moveTo(-5000, -5000);
    groundShape.lineTo(5000, -5000);
    groundShape.lineTo(5000, 5000);
    groundShape.lineTo(-5000, 5000);
    groundShape.lineTo(-5000, -5000);

    const safeZoneSize = 600;
    const holePath = new THREE.Path();
    holePath.moveTo(-safeZoneSize, -safeZoneSize);
    holePath.lineTo(-safeZoneSize, safeZoneSize);
    holePath.lineTo(safeZoneSize, safeZoneSize);
    holePath.lineTo(safeZoneSize, -safeZoneSize);
    holePath.lineTo(-safeZoneSize, -safeZoneSize);
    groundShape.holes.push(holePath);

    const groundGeometry = new THREE.ShapeGeometry(groundShape);
    console.log(groundGeometry.attributes.uv); // Inspect UVs in the console

    // Load the texture and apply it to the ground material
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load(
        'ground.png',
        (texture) => {
            // Configure texture once it's loaded
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(50, 50); // Larger repeat values for more texture repetition
            texture.encoding = THREE.sRGBEncoding;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            
            // Update the material with the loaded texture
            groundMaterial.map = texture;
            groundMaterial.needsUpdate = true;
            
            console.log('Ground texture loaded successfully');
        },
        undefined, // onProgress callback not needed
        (error) => {
            console.error('Error loading ground texture:', error);
        }
    );
    
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(25, 25); // Adjust the repeat to scale the texture as desired


    // const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });

    // ground = new THREE.Mesh(groundGeometry, groundMaterial);
    // ground.rotation.x = -Math.PI / 2;
    // ground.name = 'ground';
    // scene.add(ground);
    const groundMaterial = new THREE.MeshLambertMaterial({
        map: groundTexture,
        side: THREE.DoubleSide
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.name = 'ground';
    scene.add(ground);
    
    const safeZoneGroundGeometry = new THREE.PlaneGeometry(1200, 1200);
    const safeZoneGroundMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    safeZoneGround = new THREE.Mesh(safeZoneGroundGeometry, safeZoneGroundMaterial);
    safeZoneGround.rotation.x = -Math.PI / 2;
    safeZoneGround.position.y = 0.1;
    scene.add(safeZoneGround);

    const safeZoneBarrierGeometry = new THREE.BoxGeometry(1200, 50, 1200);
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
    teleportPad.position.y = 0.15;
    teleportPad.name = 'teleportPad';
    shrineGroup.add(teleportPad);

    shrineGroup.position.set(0, 0, 0);
    scene.add(shrineGroup);
    addSkyboxAboveGround();

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
        const structure = createStructure();
        structure.position.set(pos.x, 0, pos.z);
        scene.add(structure);
        walls.push(...structure.userData.walls);
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

        // Add the NPC to the scene and friendlies array
        scene.add(npc);
        friendlies.push(npc);
    });

    player = createHumanoid(0x0000ff);
    player.position.y = 0; 
    scene.add(player);

	function checkEnemiesInSafeZone() {
		const safeZoneRadius = 600; // Radius of the safe zone

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

