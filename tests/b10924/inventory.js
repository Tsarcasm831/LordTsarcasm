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
    for (let i = 1; i <= 6; i++) {
        const grid = document.getElementById(`inventoryGridTab${i}`);
        const itemsForTab = playerInventory.slice((i - 1) * 56, i * 56); // Assuming 56 slots per tab
        populateInventoryGrid(grid, itemsForTab);
    }
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

// Include functions showTooltip, moveTooltip, and hideTooltip if not already defined

