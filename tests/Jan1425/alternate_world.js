// alternate_world.js - Handles the alternate world instance and teleportation

let alternateScene, alternateCamera, alternatePlayer;
let isInAlternateWorld = false;

function initAlternateWorld() {
    // Create a new scene
    alternateScene = new THREE.Scene();
    
    // Set up camera similar to main world
    alternateCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    alternateCamera.position.set(0, 50, 50);
    alternateCamera.lookAt(0, 0, 0);

    // Add sky
    alternateScene.background = new THREE.Color(0x4B0082); // Different sky color for distinction

    // Add ground with different texture/color
    const groundGeometry = new THREE.PlaneGeometry(10000, 10000);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x483D8B }); // Dark slate blue
    const alternateGround = new THREE.Mesh(groundGeometry, groundMaterial);
    alternateGround.rotation.x = -Math.PI / 2;
    alternateGround.position.y = 0;
    alternateScene.add(alternateGround);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    alternateScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    alternateScene.add(directionalLight);

    // Create alternate world player
    alternatePlayer = createHumanoid(); // Reuse the humanoid creation function
    alternateScene.add(alternatePlayer);
}

function handleTeleportation(fromMainWorld = true) {
    if (fromMainWorld) {
        // Store main world state
        previousPosition = {
            x: player.position.x,
            y: player.position.y,
            z: player.position.z
        };
        
        // Switch to alternate world
        isInAlternateWorld = true;
        alternatePlayer.position.set(0, 0, 0); // Start at origin in alternate world
    } else {
        // Return to main world
        isInAlternateWorld = false;
        if (previousPosition) {
            player.position.set(
                previousPosition.x + 10, // Offset slightly to prevent immediate re-teleport
                previousPosition.y,
                previousPosition.z
            );
        }
    }
}

function renderAlternateWorld() {
    if (!isInAlternateWorld) return;
    
    // Use the same renderer but render alternate scene
    renderer.render(alternateScene, alternateCamera);
    
    // Update alternate world camera position
    const cameraOffset = new THREE.Vector3(0, 50, 50);
    alternateCamera.position.copy(alternatePlayer.position).add(cameraOffset);
    alternateCamera.lookAt(alternatePlayer.position);
}

// Export functions and variables
export {
    initAlternateWorld,
    handleTeleportation,
    renderAlternateWorld,
    isInAlternateWorld,
    alternateScene,
    alternateCamera,
    alternatePlayer
};
