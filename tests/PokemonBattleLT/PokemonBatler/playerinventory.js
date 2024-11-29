// Simplified Inventory System
(function() {
    // Ensure console logging works
    console.log('Inventory script is loading');

    // Create a simple div for inventory
    function createInventoryDiv() {
        const div = document.createElement('div');
        div.id = 'player-inventory';
        div.style.position = 'fixed';
        div.style.top = '50%';
        div.style.left = '50%';
        div.style.transform = 'translate(-50%, -50%)';
        div.style.backgroundColor = 'white';
        div.style.border = '2px solid black';
        div.style.padding = '20px';
        div.style.zIndex = '1000';
        div.innerHTML = `
            <h2>Player Inventory</h2>
            <p>Potion x5</p>
            <p>Pokéball x10</p>
            <button onclick="closeInventory()">Close</button>
        `;
        return div;
    }

    // Global function to open inventory
    window.openInventory = function() {
        console.log('Open inventory called');
        
        // Close existing inventory if open
        const existingInventory = document.getElementById('player-inventory');
        if (existingInventory) {
            document.body.removeChild(existingInventory);
            return;
        }

        // Create and add inventory
        const inventoryDiv = createInventoryDiv();
        document.body.appendChild(inventoryDiv);
    };

    // Global function to close inventory
    window.closeInventory = function() {
        const inventoryDiv = document.getElementById('player-inventory');
        if (inventoryDiv) {
            document.body.removeChild(inventoryDiv);
        }
    };

    // Log when script is fully loaded
    console.log('Inventory script loaded successfully');
})();
