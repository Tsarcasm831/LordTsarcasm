// characterSprite.js

function renderCharacterSprite() {
    // Create a renderer for the character sprite
    const spriteRenderer = new THREE.WebGLRenderer({ alpha: true });
    spriteRenderer.setSize(256, 256); // Adjust size as needed

    // Create a scene for the character sprite
    const spriteScene = new THREE.Scene();

    // Create a camera for the character sprite
    const spriteCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    spriteCamera.position.set(0, 15, 50);
    spriteCamera.lookAt(0, 10, 0);

    // Clone the player model
    const playerClone = player.clone();
    spriteScene.add(playerClone);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff);
    spriteScene.add(ambientLight);

    // Render to a canvas
    spriteRenderer.render(spriteScene, spriteCamera);

    // Convert to image
    const dataURL = spriteRenderer.domElement.toDataURL();

    // Create an image element
    const img = document.createElement('img');
    img.src = dataURL;
    img.style.width = '140%'; // Enlarge by 40%
    img.style.height = '140%';

    // Embed into the inventory screen
    const inventoryDiv = document.getElementById('inventory');
    const existingSprite = document.getElementById('characterSprite');
    if (existingSprite) {
        existingSprite.src = dataURL;
    } else {
        img.id = 'characterSprite';
        inventoryDiv.insertBefore(img, inventoryDiv.firstChild);
    }
}

// Call renderCharacterSprite whenever the character's appearance changes

