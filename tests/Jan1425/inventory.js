// inventory.js

// Function to add a single item to the player's inventory
function addItemToInventory(item) {
    if (!window.playerInventory) {
        window.playerInventory = [];
    }
    console.log('Adding item to inventory:', item);
    window.playerInventory.push(item);
    console.log('Current inventory:', window.playerInventory);
    updateInventoryDisplay();
}

// Function to add multiple items to the player's inventory
function addItemsToInventory(items) {
    if (!window.playerInventory) {
        window.playerInventory = [];
    }
    window.playerInventory.push(...items);
    updateInventoryDisplay();
}

// Function to update the inventory display based on selected tab
function updateInventoryDisplay() {
    const inventoryContainer = document.getElementById('inventory');
    if (!inventoryContainer) {
        console.error('Inventory container not found');
        return;
    }

    // Get all tab content divs
    const tabContents = document.querySelectorAll('.inventory-tab-content');
    tabContents.forEach(tabContent => {
        const tabId = tabContent.id; // This will be 'tab1', 'tab2', etc.
        const selectedType = getTypeByTabId(tabId);
        console.log('Processing tab content:', tabId, 'type:', selectedType);

        // Get or create the grid
        const gridId = `inventoryGridTab${tabId.replace('tab', '')}`;
        let grid = document.getElementById(gridId);
        if (!grid) {
            console.log('Creating grid:', gridId);
            grid = document.createElement('div');
            grid.id = gridId;
            grid.className = 'inventory-grid';
            tabContent.appendChild(grid);
        }

        // Filter items based on selected type
        let filteredItems = [];
        if (window.playerInventory) {
            if (selectedType === 'all') {
                filteredItems = [...window.playerInventory];
            } else {
                filteredItems = window.playerInventory.filter(item => item.type.toLowerCase() === selectedType);
            }
        }
        console.log('Filtered items for', tabId, ':', filteredItems);

        // Sort items alphabetically by name
        filteredItems.sort((a, b) => a.name.localeCompare(b.name));

        // Clear and populate the grid
        grid.innerHTML = '';
        filteredItems.forEach(item => {
            const slot = document.createElement('div');
            slot.classList.add('inventory-slot');
            slot.innerText = item.name;
            slot.setAttribute('data-name', item.name);
            slot.setAttribute('data-description', item.description || 'No description');
            slot.setAttribute('data-type', item.type || 'misc');
            slot.setAttribute('data-rarity', item.rarity || 'Common');
            grid.appendChild(slot);
        });

        // Add empty slots to fill the grid
        const totalSlots = 56;
        const emptySlots = totalSlots - filteredItems.length;
        for (let i = 0; i < emptySlots; i++) {
            const slot = document.createElement('div');
            slot.classList.add('inventory-slot', 'empty');
            grid.appendChild(slot);
        }

        // Show/hide based on tab state
        tabContent.style.display = tabContent.classList.contains('active') ? 'block' : 'none';
    });
}

// Helper function to map tabId to item type
function getTypeByTabId(tabId) {
    const mapping = {
        'tab1': 'all',          // All Items
        'tab2': 'equipment',    // Equipment
        'tab3': 'material',     // Materials
        'tab4': 'consumable',   // Consumables
        'tab5': 'quest',        // Quest Items
        'tab6': 'misc',         // Miscellaneous
        'tab7': 'special'       // Special Items
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
            slot.addEventListener('mouseenter', showTooltip);
            slot.addEventListener('mousemove', moveTooltip);
            slot.addEventListener('mouseleave', hideTooltip);

            // Add drag and drop functionality
            slot.draggable = true;
            slot.addEventListener('dragstart', handleDragStart);
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('drop', handleDrop);
        } else {
            // Empty slot
            slot.setAttribute('data-empty', 'true');
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

    // Function to switch tabs
    function switchTab(selectedTab) {
        // Remove active class from all tabs and contents
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });

        // Add active class to selected tab
        selectedTab.classList.add('active');

        // Show selected tab content
        const tabId = selectedTab.getAttribute('data-tab');
        const selectedContent = document.getElementById(tabId);
        if (selectedContent) {
            selectedContent.classList.add('active');
            selectedContent.style.display = 'block';
        }

        // Update inventory display
        updateInventoryDisplay();
    }

    // Add click handlers to tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab));
    });

    // Set first tab as active by default
    if (tabs.length > 0) {
        switchTab(tabs[0]);
    }
}

// Function to load the inventory UI
function loadInventory() {
    const inventory = document.getElementById('inventory');
    if (inventory) {
        inventory.style.display = inventory.style.display === 'none' ? 'block' : 'none';
        if (inventory.style.display === 'block') {
            setupInventoryTabs();
            updateInventoryDisplay();
        }
    }
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
        'tab1': 'all',          // All Items
        'tab2': 'equipment',    // Equipment
        'tab3': 'material',     // Materials
        'tab4': 'consumable',   // Consumables
        'tab5': 'quest',        // Quest Items
        'tab6': 'misc',         // Miscellaneous
        'tab7': 'special'       // Special Items
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

// New functions for tooltip handling
function showTooltip(event) {
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

function moveTooltip(event) {
    positionTooltip(event);
}

function hideTooltip() {
    entityTooltip.style.display = 'none';
}

// New functions for drag and drop handling
function handleDragStart(event) {
    event.dataTransfer.setData('text', event.target.getAttribute('data-name'));
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const itemName = event.dataTransfer.getData('text');
    const item = window.playerInventory.find(item => item.name === itemName);
    if (item) {
        // Handle item drop logic here
    }
}
