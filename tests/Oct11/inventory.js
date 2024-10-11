// inventory.js

function initializeInventory() {
    // Initialize inventory arrays and UI elements
    playerInventory = [];
    generateInventorySlots();
    setupInventoryTabs();
    updateInventoryDisplay();
}

function addItemToInventory(item) {
    playerInventory.push(item);
    updateInventoryDisplay();
}

function updateInventoryDisplay() {
    // Loop through all inventory tabs and update their grids
    for (let i = 1; i <= 6; i++) {
        const grid = document.getElementById(`inventoryGridTab${i}`);
        grid.innerHTML = ''; // Clear existing items
        playerInventory.forEach((invItem, index) => {
            if (index < 56) { // Assuming each tab has 56 slots
                const slot = document.createElement('div');
                slot.classList.add('inventory-slot');
                slot.innerText = invItem.name;
                grid.appendChild(slot);
            }
        });
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

function populateInventoryGrid(gridElement, items) {
    gridElement.innerHTML = '';
    for (let i = 0; i < 56; i++) {
        const slot = document.createElement('div');
        slot.classList.add('inventory-slot');
        if (items[i]) {
            slot.innerText = items[i].name;

            // Add data attributes for tooltip
            slot.setAttribute('data-name', items[i].name);
            slot.setAttribute('data-description', items[i].description || 'No description available.');

            // Event listeners for tooltip
            slot.addEventListener('mouseenter', showTooltip);
            slot.addEventListener('mousemove', moveTooltip);
            slot.addEventListener('mouseleave', hideTooltip);
        }
        gridElement.appendChild(slot);
    }
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

setupInventoryTabs();
generateInventorySlots();