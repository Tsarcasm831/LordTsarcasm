// ground.js
import * as THREE from 'three';

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

export { addSkyboxAboveGround };
