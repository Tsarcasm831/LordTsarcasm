function createRedStall(scene, THREE) {
    const stallInfo = { x: 10, z: 10 };

    // Create a group for the stall
    const stallGroup = new THREE.Group();

    // External texture (minion image)
    const externalTextureLoader = new THREE.TextureLoader();
    const externalTexture = externalTextureLoader.load('https://file.garden/Zy7B0LkdIVpGyzA1/minion%20(1).png');

    // Create video element for internal view
    const videoElement = document.createElement('video');
    videoElement.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/flamewick.mp4';
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.autoplay = true;

    // Create video texture
    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    // Stall base geometry
    const stallGeometry = new THREE.BoxGeometry(4, 3, 4);

    // External wall material with minion image
    const externalWallMaterial = new THREE.MeshStandardMaterial({ 
        map: externalTexture,
        side: THREE.FrontSide
    });

    // Internal wall material with video
    const internalWallMaterial = new THREE.MeshStandardMaterial({ 
        map: videoTexture,
        side: THREE.BackSide
    });

    // Black roof material
    const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000,  // Black color
        side: THREE.FrontSide 
    });

    // Create the main stall mesh
    const stall = new THREE.Mesh(stallGeometry, externalWallMaterial);
    stall.position.set(stallInfo.x, 1.5, stallInfo.z);
    stallGroup.add(stall);

    // Create three walls
    const wallThickness = 0.1;
    const wallHeight = 3;
    
    const wallGeometries = [
        new THREE.BoxGeometry(4, wallHeight, wallThickness),  // Front wall
        new THREE.BoxGeometry(wallThickness, wallHeight, 4),  // Side wall
        new THREE.BoxGeometry(4, wallHeight, wallThickness)   // Back wall
    ];

    const wallPositions = [
        { x: stallInfo.x, y: 1.5, z: stallInfo.z + 2 },        // Front wall
        { x: stallInfo.x + 2, y: 1.5, z: stallInfo.z },        // Side wall
        { x: stallInfo.x, y: 1.5, z: stallInfo.z - 2 }         // Back wall
    ];

    // Create and position walls
    wallGeometries.forEach((geometry, index) => {
        const wall = new THREE.Mesh(geometry, index === 0 ? externalWallMaterial : internalWallMaterial);
        wall.position.set(
            wallPositions[index].x, 
            wallPositions[index].y, 
            wallPositions[index].z
        );
        stallGroup.add(wall);
    });

    // Create black roof
    const roofGeometry = new THREE.BoxGeometry(4, 0.5, 4);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(stallInfo.x, 3, stallInfo.z);
    stallGroup.add(roof);

    // Video and texture loading error handling
    videoElement.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded');
        videoElement.play();
    });

    videoElement.addEventListener('error', (e) => {
        console.error('Video loading error:', e);
    });

    scene.add(stallGroup);
    return stallGroup;
}

// Export the function if using modules, otherwise it will be a global function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = createRedStall;
}
