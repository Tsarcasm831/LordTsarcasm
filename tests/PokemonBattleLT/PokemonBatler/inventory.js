// Inventory Management for Pokémon Battle Game

class InventoryManager {
    constructor() {
        // Initialize inventory categories
        this.categories = {
            pokemon: [],
            items: [],
            keyItems: []
        };
    }

    // Open inventory menu
    openInventory() {
        const inventoryMenu = document.getElementById('inventory-menu');
        
        // If menu is already open, close it
        if (!inventoryMenu.classList.contains('hidden')) {
            inventoryMenu.classList.add('hidden');
            return;
        }

        // Clear previous content
        inventoryMenu.innerHTML = '';

        // Create tab menu
        const tabMenu = document.createElement('div');
        tabMenu.classList.add('tab-menu');

        // Create tabs
        const tabs = [
            { name: 'Pokémon', category: 'pokemon' },
            { name: 'Items', category: 'items' },
            { name: 'Key Items', category: 'keyItems' }
        ];

        tabs.forEach((tab, index) => {
            const tabButton = document.createElement('button');
            tabButton.textContent = tab.name;
            tabButton.classList.add(index === 0 ? 'active' : '');
            tabButton.onclick = () => this.switchTab(tab.category, tabButton);
            tabMenu.appendChild(tabButton);
        });

        inventoryMenu.appendChild(tabMenu);

        // Content container
        const contentContainer = document.createElement('div');
        contentContainer.id = 'inventory-content';
        inventoryMenu.appendChild(contentContainer);

        // Show Pokémon by default
        this.showCategory('pokemon', contentContainer);

        // Remove hidden class to show menu
        inventoryMenu.classList.remove('hidden');
    }

    // Switch between inventory tabs
    switchTab(category, button) {
        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.tab-menu button');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to selected button
        button.classList.add('active');

        // Get content container
        const contentContainer = document.getElementById('inventory-content');
        
        // Show selected category
        this.showCategory(category, contentContainer);
    }

    // Display items in a specific category
    showCategory(category, container) {
        container.innerHTML = '';

        // If category is empty, show a message
        if (this.categories[category].length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = `No ${category} found.`;
            container.appendChild(emptyMessage);
            return;
        }

        // Create list of items/pokemon
        const list = document.createElement('ul');
        list.classList.add('inventory-list');

        this.categories[category].forEach(item => {
            const listItem = document.createElement('li');
            
            // Customize display based on category
            switch(category) {
                case 'pokemon':
                    listItem.textContent = `${item.name} (Lv. ${item.level})`;
                    break;
                case 'items':
                    listItem.textContent = `${item.name} x${item.quantity}`;
                    break;
                case 'keyItems':
                    listItem.textContent = item.name;
                    break;
            }

            list.appendChild(listItem);
        });

        container.appendChild(list);
    }

    // Add a Pokémon to inventory
    addPokemon(pokemon) {
        this.categories.pokemon.push(pokemon);
    }

    // Add an item to inventory
    addItem(item, quantity = 1) {
        const existingItem = this.categories.items.find(i => i.name === item.name);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.categories.items.push({ ...item, quantity });
        }
    }

    // Add a key item to inventory
    addKeyItem(keyItem) {
        // Prevent duplicates
        if (!this.categories.keyItems.some(item => item.name === keyItem.name)) {
            this.categories.keyItems.push(keyItem);
        }
    }
}

// Create global inventory manager instance
window.inventoryManager = new InventoryManager();

// Expose function for HTML onclick event
function openInventory() {
    window.inventoryManager.openInventory();
}

// Expose function globally
window.openInventory = openInventory;
