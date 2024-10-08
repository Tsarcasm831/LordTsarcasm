// tooltips.js

// Create a tooltip element
const entityTooltip = document.createElement('div');
entityTooltip.id = 'entityTooltip';
entityTooltip.style.position = 'absolute';
entityTooltip.style.pointerEvents = 'none';
entityTooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
entityTooltip.style.color = '#fff';
entityTooltip.style.padding = '5px 10px';
entityTooltip.style.borderRadius = '5px';
entityTooltip.style.fontSize = '14px';
entityTooltip.style.display = 'none';
document.body.appendChild(entityTooltip);

// Function to handle mouse move and show tooltip
function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // List of entities to check for tooltips
    const entities = [...enemies, ...friendlies, ...quadrupeds];

    const intersects = raycaster.intersectObjects(entities, true);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        let parentEntity = intersectedObject;

        // Traverse up to find the parent entity
        while (parentEntity.parent && !entities.includes(parentEntity)) {
            parentEntity = parentEntity.parent;
        }

        if (parentEntity && parentEntity.userData && parentEntity.userData.name) {
            // Position the tooltip
            entityTooltip.style.left = `${event.clientX + 10}px`;
            entityTooltip.style.top = `${event.clientY + 10}px`;
            entityTooltip.innerText = parentEntity.userData.name;
            entityTooltip.style.display = 'block';
        } else {
            entityTooltip.style.display = 'none';
        }
    } else {
        entityTooltip.style.display = 'none';
    }
}

// Add event listener for mouse move
renderer.domElement.addEventListener('mousemove', onMouseMove, false);

// Hide tooltip when mouse leaves the canvas
renderer.domElement.addEventListener('mouseleave', () => {
    entityTooltip.style.display = 'none';
}, false);
