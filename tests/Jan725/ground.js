// ground.js
import * as THREE from 'three';

function createGround(scene) {
    // Create a ground plane
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    
    // Load the ground texture
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('https://file.garden/Zy7B0LkdIVpGyzA1/broken%20concrete.webp');
    
    // Configure texture properties
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(100, 100); // Repeat the texture many times
    
    // Create material with the texture
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.8,
        metalness: 0.2
    });
    
    // Create the ground mesh
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.receiveShadow = true;
    
    // Add to scene
    scene.add(ground);
    
    return ground;
}

function addSkyboxAboveGround(scene) {
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

export { createGround, addSkyboxAboveGround };
