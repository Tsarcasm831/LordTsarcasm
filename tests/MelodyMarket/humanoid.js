function createHumanoid(scene, THREE, options = {}) {
    // Default options for the humanoid
    const defaultOptions = {
        color: 0x808080,  // Gray color
        height: 1.8,      // Standard human height
        position: { x: 0, y: 1, z: 0 },
        rotation: 0,      // Rotation around Y-axis
        name: 'Vendor'    // Default name
    };

    // Merge default options with provided options
    const config = { ...defaultOptions, ...options };

    // Create humanoid body parts
    const bodyGroup = new THREE.Group();
    bodyGroup.name = config.name;

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const headMaterial = new THREE.MeshLambertMaterial({ color: config.color });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = config.height - 0.5;
    bodyGroup.add(head);

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1, 32);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: config.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = config.height - 1.2;
    bodyGroup.add(body);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 32);
    const armMaterial = new THREE.MeshLambertMaterial({ color: config.color });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.4, config.height - 1, 0);
    leftArm.rotation.z = Math.PI / 4;
    bodyGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.4, config.height - 1, 0);
    rightArm.rotation.z = -Math.PI / 4;
    bodyGroup.add(rightArm);

    // Position and rotate the entire humanoid
    bodyGroup.position.set(
        config.position.x, 
        config.position.y, 
        config.position.z
    );
    bodyGroup.rotation.y = config.rotation;

    // Add the humanoid to the scene
    scene.add(bodyGroup);

    return {
        mesh: bodyGroup,
        updatePosition: function(newPosition) {
            bodyGroup.position.copy(newPosition);
        },
        updateRotation: function(newRotation) {
            bodyGroup.rotation.y = newRotation;
        }
    };
}

// Export the function if using modules, otherwise it's globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = createHumanoid;
}
