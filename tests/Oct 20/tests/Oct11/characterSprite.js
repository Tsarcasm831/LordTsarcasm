// characterSprite.js

function renderCharacterSprite() {
    // Create a renderer for the character sprite
    const spriteRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    spriteRenderer.setSize(256, 256); // Adjust size as needed

    // Create a scene for the character sprite
    const spriteScene = new THREE.Scene();

    // Create a camera for the character sprite
    const spriteCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    spriteCamera.position.set(0, 15, 50);
    spriteCamera.lookAt(0, 10, 0);

    // Clone the player model and apply visual changes based on stats
    const playerClone = player.clone();

    // Example Visual Changes Based on Stats
    // Mana Effect: Blend color based on mana
    const manaRatio = Math.min(characterStats.mana / 100, 1); // Assuming 100 is max mana
    const baseColor = new THREE.Color(0x0000ff); // Base color blue
    const blendedColor = baseColor.clone().lerp(new THREE.Color(0xffffff), manaRatio); // Blend towards white as mana increases
    playerClone.body.material.color.set(blendedColor);

    // Karma Effect: Add halo or aura
    if (characterStats.karma > 50) {
        addHaloEffect(playerClone);
    } else if (characterStats.karma < -50) {
        addDarkAuraEffect(playerClone);
    }

    // Reputation Effect: Scale based on reputation
    if (characterStats.reputation > 100) {
        playerClone.scale.set(1.2, 1.2, 1.2); // Increase size
    } else if (characterStats.reputation < -50) {
        playerClone.scale.set(0.8, 0.8, 0.8); // Decrease size
    } else {
        playerClone.scale.set(1, 1, 1); // Normal size
    }

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

// Functions to add visual effects
function addHaloEffect(playerClone) {
    if (!playerClone.halo) {
        const haloGeometry = new THREE.RingGeometry(6, 7, 32);
        const haloMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        halo.rotation.x = Math.PI / 2;
        playerClone.add(halo);
        playerClone.halo = halo;
    }
}

function addDarkAuraEffect(playerClone) {
    if (!playerClone.aura) {
        const auraGeometry = new THREE.SphereGeometry(5, 32, 32);
        const auraMaterial = new THREE.MeshBasicMaterial({ color: 0x8B0000, transparent: true, opacity: 0.5 });
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        aura.position.y = 10;
        playerClone.add(aura);
        playerClone.aura = aura;
    }
}
