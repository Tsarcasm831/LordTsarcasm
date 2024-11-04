// inventory.js

function addItemToInventory(item) {
    playerInventory.push(item);
    updateInventoryDisplay();
}

function updateInventoryDisplay() {
    for (let i = 1; i <= 6; i++) {
        const grid = document.getElementById(`inventoryGridTab${i}`);
        grid.innerHTML = ''; // Clear previous content
        for (let j = 0; j < 56; j++) { // Ensures a full grid
            const slot = document.createElement('div');
            slot.classList.add('inventory-slot');
            if (playerInventory[j]) {
                slot.innerText = playerInventory[j].name;
                slot.setAttribute('data-name', playerInventory[j].name);
                slot.setAttribute('data-description', playerInventory[j].description || 'No description');
            }
            grid.appendChild(slot);
        }
    }
}


function loadInventory() {
    if (inventoryLoaded) {
        toggleInventoryDisplay();
        return;
    }

    fetch('inventory.html')
        .then(response => response.text())
        .then(html => {
            const inventoryPlaceholder = document.getElementById('inventoryPlaceholder');
            inventoryPlaceholder.innerHTML = html;
            inventoryLoaded = true;
            initializeInventory();
            toggleInventoryDisplay();
        })
        .catch(error => console.error('Error loading inventory:', error));
}

// In inventory.js, modify the populateInventoryGrid function:

function populateInventoryGrid(gridElement, items) {
    gridElement.innerHTML = '';
    for (let i = 0; i < 56; i++) {
        const slot = document.createElement('div');
        slot.classList.add('inventory-slot');
        if (items[i]) {
            slot.innerText = items[i].name;
            
            // Add data attributes for tooltip
            slot.setAttribute('data-name', items[i].name);
            slot.setAttribute('data-description', items[i].description || 'No description available');
            if (items[i].stats) {
                const statsText = Object.entries(items[i].stats)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');
                slot.setAttribute('data-stats', statsText);
            }
            slot.setAttribute('data-rarity', items[i].rarity || 'Common');

            // Add event listeners for tooltip
            slot.addEventListener('mouseenter', onInventoryItemHover);
            slot.addEventListener('mousemove', onInventoryItemHover);
            slot.addEventListener('mouseleave', () => {
                entityTooltip.style.display = 'none';
            });
        }
        gridElement.appendChild(slot);
    }
}

// Modify onInventoryItemHover in tooltips.js:
function onInventoryItemHover(event) {
    const itemSlot = event.target;
    const itemName = itemSlot.getAttribute('data-name');
    if (!itemName) return;

    const itemDescription = itemSlot.getAttribute('data-description');
    const itemStats = itemSlot.getAttribute('data-stats');
    const itemRarity = itemSlot.getAttribute('data-rarity');

    // Create tooltip content with styling
    entityTooltip.innerHTML = `
        <div style="font-size: 14px; padding: 8px;">
            <div style="color: ${getRarityColor(itemRarity)}; font-weight: bold; margin-bottom: 4px;">
                ${itemName}
            </div>
            <div style="color: #aaa; font-style: italic; margin-bottom: 4px;">
                ${itemRarity}
            </div>
            <div style="margin-bottom: 4px;">
                ${itemDescription}
            </div>
            ${itemStats ? `<div style="color: #88ff88;">${itemStats.replace(/\n/g, '<br>')}</div>` : ''}
        </div>
    `;

    // Position tooltip
    const rect = event.target.getBoundingClientRect();
    entityTooltip.style.left = `${rect.right + 10}px`;
    entityTooltip.style.top = `${rect.top}px`;
    entityTooltip.style.display = 'block';
}

// Add helper function for rarity colors
function getRarityColor(rarity) {
    const rarityColors = {
        'Common': '#ffffff',
        'Uncommon': '#1eff00',
        'Rare': '#0070dd',
        'Epic': '#a335ee',
        'Legendary': '#ff8000'
    };
    return rarityColors[rarity] || rarityColors.Common;
}

// Event listeners for inventory tabs
function setupInventoryTabs() {
    const tabs = document.querySelectorAll('.inventory-tab');
    const tabContents = document.querySelectorAll('.inventory-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            tab.classList.add('active');
            const activeTabContent = document.getElementById(tab.dataset.tab);
            activeTabContent.classList.add('active');
        });
    });

    tabs[0].classList.add('active');
    tabContents[0].classList.add('active');
}

function generatePlayerInventoryGrid() {
	const grid = document.getElementById('playerInventoryGrid');
	grid.innerHTML = '';
	const numColumns = 7;
	const numRows = Math.ceil(playerInventory.length / numColumns); // Adjust rows based on items
	grid.style.gridTemplateColumns = `repeat(${numColumns}, 50px)`;
	for (let i = 0; i < numColumns * numRows; i++) {
		const slot = document.createElement('div');
		slot.classList.add('inventory-slot');
		grid.appendChild(slot);
	}
}

function generateInventoryGrid(gridElement, numColumns, numRows) {
    gridElement.style.gridTemplateColumns = `repeat(${numColumns}, 50px)`;
    gridElement.innerHTML = '';
    for (let i = 0; i < numColumns * numRows; i++) {
        const slot = document.createElement('div');
        slot.classList.add('inventory-slot');
        gridElement.appendChild(slot);
    }
}

function generateInventorySlots() {
    for (let i = 1; i <= 6; i++) {
        const grid = document.getElementById('inventoryGridTab' + i);
        grid.innerHTML = '';
        for (let j = 0; j < 56; j++) {
            const slot = document.createElement('div');
            slot.classList.add('inventory-slot');
            grid.appendChild(slot);
        }
    }
}

function setupInventorySlotEventListeners(sourceGrid, sourceItems, targetItems, targetGrid) {
    const slots = sourceGrid.querySelectorAll('.inventory-slot');
    slots.forEach((slot, index) => {
        slot.addEventListener('click', () => {
            if (sourceItems[index]) {
                // Find first empty slot in targetItems
                let emptyIndex = targetItems.findIndex(item => item == null);
                if (emptyIndex === -1) {
                    alert('No space in target inventory.');
                    return;
                }
                // Transfer item
                targetItems[emptyIndex] = sourceItems[index];
                sourceItems[index] = null;

                // Update grids
                populateInventoryGrid(sourceGrid, sourceItems);
                populateInventoryGrid(targetGrid, targetItems);
            }
        });
    });
}

function addItemToInventory(item) {
    // Assuming item includes name and description
    playerInventory.push(item);
    updateInventoryDisplay();
}

function toggleInventoryDisplay() {
    const inventory = document.getElementById('inventory');
    if (inventory) {
        inventory.style.display = inventory.style.display === 'none' ? 'block' : 'none';
    }
}

// Load inventory when 'I' key is pressed
document.addEventListener('keydown', (event) => {
    if (event.key === 'I' || event.key === 'i') {
        loadInventory();
    }
});

function setupInventorySlots() {
    const slots = document.querySelectorAll('.inventory-slot');
    slots.forEach(slot => {
        slot.addEventListener('mouseenter', (event) => {
            const item = slot.getAttribute('data-item');
            if (item) {
                const itemData = JSON.parse(item);
                showItemTooltip(event, itemData);
            }
        });

        slot.addEventListener('mouseleave', () => {
            hideTooltip();
        });

        slot.addEventListener('mousemove', (event) => {
            updateTooltipPosition(event);
        });
    });
}

function showItemTooltip(event, itemData) {
    const tooltip = document.getElementById('entityTooltip');
    tooltip.innerHTML = `
        <div class="item-tooltip">
            <div class="item-name ${itemData.rarity.toLowerCase()}">${itemData.name}</div>
            <div class="item-type">${itemData.type}</div>
            <div class="item-description">${itemData.description}</div>
            ${generateStatsHTML(itemData.stats)}
            <div class="item-value">Value: ${itemData.value} gold</div>
        </div>
    `;
    tooltip.style.display = 'block';
    updateTooltipPosition(event);
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('entityTooltip');
    const padding = 10;
    let x = event.clientX + padding;
    let y = event.clientY + padding;

    // Prevent tooltip from going off-screen
    const rect = tooltip.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
        x = event.clientX - rect.width - padding;
    }
    if (y + rect.height > window.innerHeight) {
        y = event.clientY - rect.height - padding;
    }

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
}

function generateStatsHTML(stats) {
    if (!stats) return '';
    return Object.entries(stats)
        .map(([stat, value]) => `<div class="item-stat">${stat}: ${value}</div>`)
        .join('');
}


setupInventoryTabs();
generateInventorySlots();