let inventoryLoaded = false;

function loadInventory() {
    if (inventoryLoaded) {
        toggleInventoryDisplay();
        return;
    }

    fetch('inventory.html')
        .then(response => response.text())
        .then(html => {
            const gameContainer = document.getElementById('gameContainer');
            gameContainer.insertAdjacentHTML('beforeend', html);
            inventoryLoaded = true;
            initializeInventory();
            toggleInventoryDisplay();
        })
        .catch(error => console.error('Error loading inventory:', error));
}

function initializeInventory() {
    const tabs = document.querySelectorAll('.inventory-tab');
    const tabContents = document.querySelectorAll('.inventory-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.style.display = content.id === tabId ? 'block' : 'none';
            });
        });
    });

    // Show the first tab by default
    if (tabContents.length > 0) {
        tabContents[0].style.display = 'block';
    }
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