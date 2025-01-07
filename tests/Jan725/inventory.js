// inventory.js

// Function to add a single item to the player's inventory
function addItemToInventory(item) {
    playerInventory.push(item);
    updateInventoryDisplay();
}

// Function to add multiple items to the player's inventory
function addItemsToInventory(items) {
    playerInventory.push(...items);
    updateInventoryDisplay();
}

// Function to update the inventory display based on selected tab
function updateInventoryDisplay() {
    const inventoryContainer = document.getElementById('inventory');
    if (!inventoryContainer) {
        console.error('Inventory container not found');
        return;
    }

    // Create grid containers if they don't exist
    const tabs = document.querySelectorAll('.inventory-tab');
    tabs.forEach((tab, index) => {
        const gridId = `inventoryGridTab${index + 1}`;
        let grid = document.getElementById(gridId);
        
        if (!grid) {
            grid = document.createElement('div');
            grid.id = gridId;
            grid.className = 'inventory-grid';
            grid.setAttribute('role', 'tabpanel');
            grid.setAttribute('aria-labelledby', tab.dataset.tab);
            inventoryContainer.appendChild(grid);
        }

        // Get the tab identifier
        const tabId = tab.dataset.tab;
        const selectedType = getTypeByTabId(tabId);

        // Filter items based on selected type
        let filteredItems;
        if (selectedType === 'all') {
            filteredItems = [...playerInventory];
        } else {
            filteredItems = playerInventory.filter(item => item.type.toLowerCase() === selectedType);
        }

        // Sort items alphabetically by name
        filteredItems.sort((a, b) => a.name.localeCompare(b.name));

        // Populate the grid with filtered items
        populateInventoryGrid(grid, filteredItems);

        // Show only the active tab's grid
        grid.style.display = tab.classList.contains('active') ? 'grid' : 'none';
    });
}

// Helper function to map tabId to item type
function getTypeByTabId(tabId) {
    const mapping = {
        'tab1': 'all',          // Assuming 'tab1' is "All"
        'tab2': 'equipment',
        'tab3': 'material',
        'tab4': 'consumable',
        'tab5': 'quest',
        'tab6': 'misc',
        'tab7': 'special'       // If you have a seventh tab
    };
    return mapping[tabId] || 'misc';
}

// Function to populate a specific inventory grid with items and empty slots
function populateInventoryGrid(gridElement, items) {
    gridElement.innerHTML = ''; // Clear previous content

    const totalSlots = 56; // Number of slots per grid

    for (let i = 0; i < totalSlots; i++) {
        const slot = document.createElement('div');
        slot.classList.add('inventory-slot');

        if (items[i]) {
            const item = items[i];
            slot.innerText = item.name;
            slot.setAttribute('data-name', item.name);
            slot.setAttribute('data-description', item.description || 'No description');
            slot.setAttribute('data-type', item.type || 'misc');
            slot.setAttribute('data-rarity', item.rarity || 'Common');

            // Add data attributes for tooltip
            if (item.stats) {
                const statsText = Object.entries(item.stats)
                    .map(([key, value]) => `${formatStatKey(key)}: ${value}`)
                    .join('\n');
                slot.setAttribute('data-stats', statsText);
            }

            // Add event listeners for tooltip
            slot.addEventListener('mouseenter', onInventoryItemHover);
            slot.addEventListener('mousemove', onInventoryItemHover);
            slot.addEventListener('mouseleave', () => {
                entityTooltip.style.display = 'none';
            });
        } else {
            // Mark the slot as empty for styling purposes
            slot.classList.add('empty-slot');
        }

        gridElement.appendChild(slot);
    }
}

// Helper function to format stat keys (e.g., camelCase to Capitalized Words)
function formatStatKey(key) {
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase());
}

// Function to handle item hover for tooltip display
function onInventoryItemHover(event) {
    const itemSlot = event.target;
    const itemName = itemSlot.getAttribute('data-name');
    if (!itemName) return;

    const itemDescription = itemSlot.getAttribute('data-description');
    const itemStats = itemSlot.getAttribute('data-stats');
    const itemRarity = itemSlot.getAttribute('data-rarity');

    // Create tooltip content with styling
    entityTooltip.innerHTML = `
        <div style="font-size: 14px; padding: 8px; background: rgba(0,0,0,0.8); color: #fff; border-radius: 4px;">
            <div style="color: ${getRarityColor(itemRarity)}; font-weight: bold; margin-bottom: 4px;">
                ${itemName}
            </div>
            <div style="color: #aaa; font-style: italic; margin-bottom: 4px;">
                ${itemRarity}
            </div>
            <div style="margin-bottom: 4px;">
                ${itemDescription}
            </div>
            ${itemStats ? `<div style="color: #88ff88; white-space: pre-wrap;">${itemStats.replace(/\n/g, '<br>')}</div>` : ''}
        </div>
    `;

    // Position tooltip near the cursor
    positionTooltip(event);
    entityTooltip.style.display = 'block';
}

// Helper function to position the tooltip
function positionTooltip(event) {
    const tooltipWidth = entityTooltip.offsetWidth;
    const tooltipHeight = entityTooltip.offsetHeight;
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;

    let tooltipX = event.pageX + 15; // 15px to the right of cursor
    let tooltipY = event.pageY + 15; // 15px below the cursor

    // Adjust tooltip position if it goes beyond the viewport
    if (tooltipX + tooltipWidth > pageWidth) {
        tooltipX = event.pageX - tooltipWidth - 15;
    }

    if (tooltipY + tooltipHeight > pageHeight) {
        tooltipY = event.pageY - tooltipHeight - 15;
    }

    entityTooltip.style.left = `${tooltipX}px`;
    entityTooltip.style.top = `${tooltipY}px`;
}

// Helper function to get rarity color
function getRarityColor(rarity) {
    const rarityColors = {
        'Common': '#ffffff',
        'Uncommon': '#1eff00',
        'Rare': '#0070dd',
        'Epic': '#a335ee',
        'Legendary': '#ff8000',
        'Mythic': '#e6cc80' // Added if needed
    };
    return rarityColors[rarity] || rarityColors['Common'];
}

// Function to initialize inventory tabs and event listeners
function setupInventoryTabs() {
    const tabs = document.querySelectorAll('.inventory-tab');
    const tabContents = document.querySelectorAll('.inventory-tab-content');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Remove 'active' class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            // Add 'active' class to the selected tab and corresponding content
            tab.classList.add('active');
            const activeTabContent = document.getElementById(tab.dataset.tab);
            activeTabContent.classList.add('active');

            // Update the inventory display based on the selected tab
            updateInventoryDisplay();
        });
    });

    // Set the first tab as active by default
    if (tabs.length > 0) {
        tabs[0].classList.add('active');
    }
    if (tabContents.length > 0) {
        tabContents[0].classList.add('active');
    }
}

// Function to load the inventory UI
function loadInventory() {
    if (inventoryLoaded) {
        toggleInventoryDisplay();
        return;
    }

    const inventory = document.getElementById('inventory');
    if (!inventory) {
        console.error('Inventory element not found in the DOM');
        return;
    }

    inventoryLoaded = true;
    initializeInventory();
    toggleInventoryDisplay();
}

// Function to initialize inventory after loading HTML
function initializeInventory() {
    setupInventoryTabs();
    updateInventoryDisplay(); // Initialize display with all items
}

// Function to toggle inventory display visibility
function toggleInventoryDisplay() {
    const inventory = document.getElementById('inventory');
    if (inventory) {
        inventory.style.display = inventory.style.display === 'none' || inventory.style.display === '' ? 'block' : 'none';
    }
}

// Function to close inventory (if you have a close button)
function closeInventory() {
    inventoryLoaded = false;
    const inventory = document.getElementById("inventory");
    if (inventory) {
        inventory.style.display = "none";
    }
}

// Event listener to load inventory when 'I' key is pressed
document.addEventListener('keydown', (event) => {
    if (event.key === 'I' || event.key === 'i') {
        loadInventory();
    }
});

// Function to map tabId to types, in case needed
function getTypeByTabId(tabId) {
    const mapping = {
        'tab1': 'all',          // Assuming 'tab1' is "All"
        'tab2': 'equipment',
        'tab3': 'material',
        'tab4': 'consumable',
        'tab5': 'quest',
        'tab6': 'misc',
        'tab7': 'special'       // If you have a seventh tab
    };
    return mapping[tabId] || 'misc';
}

// Tooltip handling is already managed in the onInventoryItemHover function

// Use the playerInventory array that's already declared in first.js

// Initialize inventory when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize empty inventory
    updateInventoryDisplay();
});
