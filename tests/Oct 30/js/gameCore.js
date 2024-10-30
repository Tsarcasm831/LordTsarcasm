import { THREE } from './libs.js';

export let scene, camera, renderer;
export let player, raycaster; // Player and raycaster are defined here for shared access across modules

// Initialize the main scene
export function initScene() {
    // Create a new scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x343434);  // Dark gray background color
    scene.fog = new THREE.Fog(0x343434, 50, 1000); // Add fog for depth effect

    // Create the camera with perspective view
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, 2, 5); // Position the camera initially
    scene.add(camera);

    // Initialize the WebGL renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;  // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadow mapping
    document.body.appendChild(renderer.domElement);  // Attach renderer to the DOM
}

// Initialize lighting in the scene
export function initLighting() {
    // Directional light simulating sunlight
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(100, 100, 100);  // Light direction
    light.castShadow = true;            // Enable shadows
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    scene.add(light);

    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);
}

// Basic player object setup
export function initPlayer() {
    player = new THREE.Object3D();
    player.add(camera); // Attach the camera to the player for first-person view
    player.position.set(0, getTerrainHeight(0, 0) + 2, 0); // Position player on terrain
    scene.add(player);
}

// Terrain height placeholder function (adjust based on your terrain logic)
function getTerrainHeight(x, z) {
    const baseNoise = simplex.noise2D(x / 500, z / 500);
    const detailNoise = simplex.noise2D(x / 100, z / 100) * 0.5;
    const combinedNoise = (baseNoise + detailNoise) / 1.5;
    return combinedNoise * settings.terrainHeight;
}

// Initialize pointer lock to capture mouse movement
export function lockPointer() {
    renderer.domElement.requestPointerLock();
}

// Initialize the raycaster for object interaction
export function initRaycaster() {
    raycaster = new THREE.Raycaster(); // Initialize raycasting for object interactions
}

// Main render loop
export function animate() {
    requestAnimationFrame(animate);

    if (!isPaused) {
        if (isLocked) {
            const delta = Math.min(clock.getDelta(), 0.1);

            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.normalize();

            if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
            if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

            const terrainHeight = getTerrainHeight(player.position.x, player.position.z);
            const waterSurfaceHeight = settings.terrainHeight * settings.waterLevel - 10;

            if (jump && canJump && player.position.y <= terrainHeight + 2) {
                velocity.y = settings.jumpForce;
                canJump = false;
                setTimeout(() => { canJump = true; }, 500);
            }

            velocity.y += settings.gravity * delta;

            if (player.position.y < waterSurfaceHeight) {
                velocity.y *= settings.swimDrag;
                if (jump) {
                    velocity.y += settings.swimForce * delta;
                }
            }

            player.translateX(-velocity.x * delta);
            player.translateZ(velocity.z * delta);
            player.position.y += velocity.y * delta;

            if (player.position.y < terrainHeight + 2) {
                player.position.y = terrainHeight + 2;
                velocity.y = 0;
                canJump = true;
            }

            if (mouseDown && breakingObject) {
                const progress = (Date.now() - mouseDownTime) / breakTime;
                breakingIndicator.scale.set(progress, progress, 1);
                breakingIndicator.material.opacity = 1 - progress;

                if (progress >= 1) {
                    breakObject(breakingObject);
                    breakingObject = null;
                    breakingIndicator.visible = false;
                }
            }

            water.position.x = camera.position.x;
            water.position.z = camera.position.z;

            camera.getWorldDirection(direction);
            
            decreaseHunger();  
            
            for (let mob of mobs) {
                mob.update(delta);
            }

            if (health <= 0) {
                console.log("Game Over");
                isLocked = false;
                document.exitPointerLock();
            }
        }

        const sunRotationSpeed = 0.1;
        const sun = scene.getObjectByName('sun');
        if (sun) {
            sun.position.x = 1000 * Math.cos(sunRotationSpeed * Date.now() / 1000);
            sun.position.y = 500 * Math.sin(sunRotationSpeed * Date.now() / 1000) + 500;
            sun.position.z = 1000 * Math.sin(sunRotationSpeed * Date.now() / 1000);
        }

        updateChunks();
        updateWeather();
        renderer.render(scene, camera);
    }
}

// Resize handler for window adjustments
export function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;  // Update camera aspect ratio
    camera.updateProjectionMatrix();  // Apply the aspect ratio change
    renderer.setSize(window.innerWidth, window.innerHeight); // Update renderer size
}

// Set up the environment and call the render loop
export function initGameCore() {
    initScene();           // Initialize the scene
    initLighting();        // Set up lighting
    initPlayer();          // Initialize the player
    initRaycaster();       // Initialize the raycaster
    window.addEventListener('resize', onWindowResize, false); // Resize event listener
    animate();             // Start the animation loop
}

// Export any additional core utility functions or shared objects as needed
export { THREE };
