// trading.js

let tradeWindowOpen = false;
let currentTradeNPC = null;
let selectedNPCItems = new Set();
let selectedPlayerItems = new Set();

// Initialize trade UI elements
function initializeTradeWindow() {
    // Remove existing trade window if it exists
    const existingWindow = document.getElementById('tradeWindow');
    if (existingWindow) {
        existingWindow.remove();
    }

    const tradeContainer = document.createElement('div');
    tradeContainer.id = 'tradeWindow';
    tradeContainer.style.display = 'none';
    tradeContainer.innerHTML = `
        <div class="trade-header">
            <h2 id="tradeNPCName">Trade Window</h2>
            <div class="gold-display">
                <span id="npcGoldAmount">Gold: 0</span>
            </div>
        </div>
        <div class="trade-content">
            <div class="trade-section">
                <h3>NPC Items</h3>
                <div id="npcInventoryGrid" class="inventory-grid"></div>
            </div>
            <div class="trade-section">
                <h3>Your Items</h3>
                <div id="playerInventoryGrid" class="inventory-grid"></div>
            </div>
        </div>
        <div class="trade-footer">
            <button id="confirmTradeButton">Confirm Trade</button>
            <button id="cancelTradeButton">Cancel Trade</button>
        </div>
    `;
    document.body.appendChild(tradeContainer);

    // Set up event listeners for trade buttons
    document.getElementById('confirmTradeButton').addEventListener('click', confirmTrade);
    document.getElementById('cancelTradeButton').addEventListener('click', closeTradeWindow);
}

// Open the trade window with a specified NPC
function openTradeWindow(npc) {
    if (tradeWindowOpen) {
        closeTradeWindow();
    }
    
    currentTradeNPC = npc;
    const npcName = npc && npc.userData ? npc.userData.name : 'NPC';
    const tradeTitle = document.getElementById('tradeNPCName');
    if (tradeTitle) {
        tradeTitle.innerText = `Trade with ${npcName}`;
    }
    
    // Reset selections
    selectedNPCItems.clear();
    selectedPlayerItems.clear();
    
    // Populate inventories
    populateInventoryGrid(document.getElementById('npcInventoryGrid'), npc.userData.inventory || [], true);
    populateInventoryGrid(document.getElementById('playerInventoryGrid'), playerInventory || [], false);
    
    document.getElementById('tradeWindow').style.display = 'block';
    tradeWindowOpen = true;
}

// Populate inventory grids
function populateInventoryGrid(gridElement, items, isNPC) {
    if (typeof gridElement === 'string') {
        gridElement = document.getElementById(gridElement);
        if (!gridElement) {
            console.error('Invalid gridElement ID:', gridElement);
            return;
        }
    }
    
    if (!gridElement) {
        console.error('Grid element is null');
        return;
    }
    
    gridElement.innerHTML = '';
    
    console.log('gridElement:', gridElement, 'Type:', typeof gridElement);
    
    items.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.classList.add('inventory-slot');
        
        // Create item display
        const itemDisplay = document.createElement('div');
        itemDisplay.classList.add('item-display');
        
        // Add item icon if available
        if (item.icon) {
            const icon = document.createElement('img');
            icon.src = item.icon;
            icon.alt = item.name;
            itemDisplay.appendChild(icon);
        }
        
        // Add item name
        const itemName = document.createElement('div');
        itemName.classList.add('item-name');
        itemName.textContent = item.name;
        itemDisplay.appendChild(itemName);
        
        // Add item quantity if applicable
        if (item.quantity && item.quantity > 1) {
            const quantity = document.createElement('div');
            quantity.classList.add('item-quantity');
            quantity.textContent = `x${item.quantity}`;
            itemDisplay.appendChild(quantity);
        }
        
        slot.appendChild(itemDisplay);
        
        // Add click handler
        slot.addEventListener('click', () => selectItemForTrade(item, index, isNPC));
        
        gridElement.appendChild(slot);
    });
}

// Handle item selection
function selectItemForTrade(item, index, isNPC) {
    const selectedSet = isNPC ? selectedNPCItems : selectedPlayerItems;
    const slot = event.currentTarget;
    
    if (selectedSet.has(index)) {
        selectedSet.delete(index);
        slot.classList.remove('selected');
    } else {
        selectedSet.add(index);
        slot.classList.add('selected');
    }
}

// Close trade window
function closeTradeWindow() {
    if (!tradeWindowOpen) return;
    
    document.getElementById('tradeWindow').style.display = 'none';
    currentTradeNPC = null;
    selectedNPCItems.clear();
    selectedPlayerItems.clear();
    tradeWindowOpen = false;
}

// Confirm trade
function confirmTrade() {
    if (!currentTradeNPC || !tradeWindowOpen) return;
    
    const npcItems = Array.from(selectedNPCItems).map(index => currentTradeNPC.userData.inventory[index]);
    const playerItems = Array.from(selectedPlayerItems).map(index => playerInventory[index]);
    
    // Implement your trade logic here
    // For example:
    try {
        // Remove items from NPC inventory
        selectedNPCItems.forEach(index => {
            const item = currentTradeNPC.userData.inventory[index];
            // Add to player inventory
            playerInventory.push(item);
        });
        
        // Remove items from player inventory
        selectedPlayerItems.forEach(index => {
            const item = playerInventory[index];
            // Add to NPC inventory
            currentTradeNPC.userData.inventory.push(item);
        });
        
        // Remove selected items (in reverse order to maintain correct indices)
        Array.from(selectedNPCItems).sort((a, b) => b - a).forEach(index => {
            currentTradeNPC.userData.inventory.splice(index, 1);
        });
        
        Array.from(selectedPlayerItems).sort((a, b) => b - a).forEach(index => {
            playerInventory.splice(index, 1);
        });
        
        // Show success message
        showNotification('Trade completed successfully!', 'success');
        
        // Close the trade window
        closeTradeWindow();
        
        // Update inventory displays
        if (typeof updateInventoryDisplay === 'function') {
            updateInventoryDisplay();
        }
    } catch (error) {
        console.error('Trade failed:', error);
        showNotification('Trade failed. Please try again.', 'error');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeTradeWindow);