// Tree interaction handling

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Handle mouse click for tree selection
function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, window.camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(window.trees, true);

    if (intersects.length > 0) {
        // Find the tree object (it might be a child of the tree)
        let treeObject = intersects[0].object;
        while (treeObject.parent && !treeObject.userData.type) {
            treeObject = treeObject.parent;
        }

        if (treeObject.userData.type === 'tree') {
            // Toggle selection of the tree
            window.toggleTreeSelection(treeObject);
        }
    }
}

// Add keyboard shortcut to remove selected trees
function onKeyDown(event) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
        window.removeSelectedTrees();
    }
}

// Initialize event listeners
window.addEventListener('click', onMouseClick, false);
window.addEventListener('keydown', onKeyDown, false);
