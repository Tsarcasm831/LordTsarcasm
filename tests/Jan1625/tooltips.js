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
entityTooltip.style.zIndex = '1000'; // Ensure tooltip is above other elements
document.body.appendChild(entityTooltip);

// Helper function to find the ancestor with userData.name
function getEntityWithName(object) {
    while (object) {
        if (object.userData && object.userData.name) {
            return object;
        }
        object = object.parent;
    }
    return null;
}

// Rarity color mapping
const rarityColors = {
    'Common': '#ffffff',     // White
    'Uncommon': '#1eff00',   // Green
    'Rare': '#0070dd',      // Blue
    'Epic': '#a335ee',      // Purple
    'Legendary': '#ff8000',  // Orange
    'Mythic': '#ff0000'     // Red
};

// Function to format stat value
function formatStatValue(key, value) {
    if (typeof value === 'number') {
        if (key.toLowerCase().includes('chance') || key.toLowerCase().includes('multiplier')) {
            return `${value * 100}%`;
        }
        return `+${value}`;
    }
    return value;
}

// Function to format stat key
function formatStatKey(key) {
    return key
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .replace(/([A-Z])\s([A-Z])/g, '$1$2'); // Remove space between consecutive capitals
}

// Function to handle mouse move and show tooltip for entities
function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Separate checks for different entity types
    const enemyIntersects = raycaster.intersectObjects(enemies, true);
    const friendlyIntersects = raycaster.intersectObjects(friendlies, true);
    const quadrupedIntersects = raycaster.intersectObjects(quadrupeds, true);
    const treeIntersects = raycaster.intersectObjects(trees, true);

    // Display tooltip based on the first intersected object
    if (enemyIntersects.length > 0) {
        const intersectedObject = enemyIntersects[0].object;
        const enemy = getEntityWithName(intersectedObject);
        entityTooltip.innerHTML = `<strong>${(enemy && enemy.userData.name) || 'Enemy'}</strong>`;
        entityTooltip.style.left = `${event.clientX + 10}px`;
        entityTooltip.style.top = `${event.clientY + 10}px`;
        entityTooltip.style.display = 'block';
    } else if (friendlyIntersects.length > 0) {
        const intersectedObject = friendlyIntersects[0].object;
        const friendly = getEntityWithName(intersectedObject);
        entityTooltip.innerHTML = `<strong>${(friendly && friendly.userData.name) || 'Friendly NPC'}</strong>`;
        entityTooltip.style.left = `${event.clientX + 10}px`;
        entityTooltip.style.top = `${event.clientY + 10}px`;
        entityTooltip.style.display = 'block';
    } else if (quadrupedIntersects.length > 0) {
        const intersectedObject = quadrupedIntersects[0].object;
        const quadruped = getEntityWithName(intersectedObject);
        entityTooltip.innerHTML = `<strong>${(quadruped && quadruped.userData.name) || 'Creature'}</strong>`;
        entityTooltip.style.left = `${event.clientX + 10}px`;
        entityTooltip.style.top = `${event.clientY + 10}px`;
        entityTooltip.style.display = 'block';
    } else if (treeIntersects.length > 0) {
        const intersectedObject = treeIntersects[0].object;
        const tree = getEntityWithName(intersectedObject);
        entityTooltip.innerHTML = `<strong>${(tree && tree.userData.name) || 'Ancient Tree'}</strong>`;
        entityTooltip.style.left = `${event.clientX + 10}px`;
        entityTooltip.style.top = `${event.clientY + 10}px`;
        entityTooltip.style.display = 'block';
    } else {
        entityTooltip.style.display = 'none';
    }
}

// Function to handle tooltips for inventory items
function onInventoryItemHover(event) {
    const item = event.target.item;
    if (!item) return;

    const rarityColor = rarityColors[item.rarity] || '#ffffff';
    
    let tooltipContent = `
        <div style="color: ${rarityColor}; font-weight: bold; font-size: 16px;">${item.name}</div>
        <div style="color: ${rarityColor}; font-style: italic;">${item.rarity}</div>
        <div style="color: #cccccc; margin: 5px 0;">${item.description}</div>
    `;

    if (item.type) {
        tooltipContent += `<div style="color: #888888;">${item.type}</div>`;
    }

    if (item.stats) {
        tooltipContent += '<div style="margin-top: 8px; border-top: 1px solid #444444; padding-top: 8px;">';
        for (const [key, value] of Object.entries(item.stats)) {
            tooltipContent += `
                <div style="color: #aaaaaa;">
                    ${formatStatKey(key)}: <span style="color: #00ff00">${formatStatValue(key, value)}</span>
                </div>
            `;
        }
        tooltipContent += '</div>';
    }

    if (item.value) {
        tooltipContent += `
            <div style="margin-top: 8px; border-top: 1px solid #444444; padding-top: 8px;">
                <div style="color: #ffd700;">Value: ${item.value} gold</div>
            </div>
        `;
    }

    entityTooltip.innerHTML = tooltipContent;
    entityTooltip.style.display = 'block';
    entityTooltip.style.left = `${event.clientX + 10}px`;
    entityTooltip.style.top = `${event.clientY + 10}px`;
}

// Add event listener for mouse move on inventory items
function setupInventoryTooltips() {
    const inventorySlots = document.querySelectorAll('.inventory-slot');
    inventorySlots.forEach(slot => {
        slot.addEventListener('mouseenter', onInventoryItemHover);
        slot.addEventListener('mousemove', onInventoryItemHover);
        slot.addEventListener('mouseleave', () => {
            entityTooltip.style.display = 'none';
        });
    });
}

// Add event listeners for mouse move in the game world
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('mouseleave', () => {
    entityTooltip.style.display = 'none';
}, false);

// Function to Show Tooltip
function showTooltip(event) {
    const name = this.getAttribute('data-name');
    const description = this.getAttribute('data-description');
    entityTooltip.innerHTML = `<strong>${name}</strong><br>${description}`;
    entityTooltip.style.display = 'block';
}

// Function to Move Tooltip with Mouse
function moveTooltip(event) {
    const tooltipWidth = entityTooltip.offsetWidth;
    const tooltipHeight = entityTooltip.offsetHeight;
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;

    let x = event.clientX + 10;
    let y = event.clientY + 10;

    // Prevent tooltip from going off-screen
    if (x + tooltipWidth > pageWidth) {
        x = event.clientX - tooltipWidth - 10;
    }
    if (y + tooltipHeight > pageHeight) {
        y = event.clientY - tooltipHeight - 10;
    }

    entityTooltip.style.left = `${x}px`;
    entityTooltip.style.top = `${y}px`;
}

// Function to Hide Tooltip
function hideTooltip() {
    entityTooltip.style.display = 'none';
    entityTooltip.innerHTML = '';
}

// Make functions globally available
window.showTooltip = showTooltip;
window.moveTooltip = moveTooltip;
window.hideTooltip = hideTooltip;