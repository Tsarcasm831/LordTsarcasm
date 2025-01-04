// trading.js

// Track trade state
let tradeWindowOpen = false;
let currentTradeNPC = null;

// Initialize trade UI elements
function initializeTradeWindow() {
    const tradeContainer = document.createElement('div');
    tradeContainer.id = 'tradeWindow';
    tradeContainer.style.display = 'none';
    tradeContainer.innerHTML = `
        <h2 id="tradeNPCName">Trade with NPC</h2>
        <div id="npcInventoryGrid" class="inventoryGrid"></div>
        <div id="playerInventoryGrid" class="inventoryGrid"></div>
        <div>
            <button id="confirmTradeButton">Confirm Trade</button>
            <button onclick="closeTradeWindow()">Cancel</button>
        </div>
    `;
    document.body.appendChild(tradeContainer);

    // Set up event listeners
    document.getElementById('confirmTradeButton').addEventListener('click', confirmTrade);
}

// Open the trade window with a specified NPC
function openTradeWindow(npc) {
    if (tradeWindowOpen) {
        closeTradeWindow();
        return;
    }
    
    currentTradeNPC = npc;
    document.getElementById('tradeNPCName').innerText = `Trade with ${npc.userData.name}`;
    
    // Populate NPC and player inventories
    populateInventoryGrid(document.getElementById('npcInventoryGrid'), npc.userData.inventory || []);
    populateInventoryGrid(document.getElementById('playerInventoryGrid'), playerInventory);
    
    document.getElementById('tradeWindow').style.display = 'block';
    tradeWindowOpen = true;
}

// Populate inventory grids
function populateInventoryGrid(gridElement, items) {
    gridElement.innerHTML = '';
    items.forEach(item => {
        const slot = document.createElement('div');
        slot.classList.add('inventory-slot');
        slot.innerText = item.name;
        slot.addEventListener('click', () => selectItemForTrade(item, gridElement));
        gridElement.appendChild(slot);
    });
}

// Close trade window
function closeTradeWindow() {
    document.getElementById('tradeWindow').style.display = 'none';
    tradeWindowOpen = false;
    currentTradeNPC = null;
}

// Handle trade item selection and confirmation
function selectItemForTrade(item, gridElement) {
    // Implement selection behavior (e.g., highlight selected items for trade)
}

function confirmTrade() {
    // Implement trade confirmation logic: update inventories based on selections
    alert('Trade confirmed!');
    closeTradeWindow();
}

// Initialize the trade window UI on load
document.addEventListener('DOMContentLoaded', initializeTradeWindow);

// Event listener to open trade with NPC on interaction
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'e' && currentTradeNPC) {  // Assuming 'E' key to open trade when near NPC
        openTradeWindow(currentTradeNPC);
    }
});
