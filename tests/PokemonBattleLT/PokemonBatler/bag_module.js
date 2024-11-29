// Bag Module for Pokémon Battle Game

class BagManager {
    constructor() {
        // Item definitions
        this.items = [
            { 
                name: 'Potion', 
                type: 'healing', 
                effect: 'heal', 
                amount: 20,
                description: 'Restores 20 HP to a Pokémon'
            },
            { 
                name: 'Super Potion', 
                type: 'healing', 
                effect: 'heal', 
                amount: 50,
                description: 'Restores 50 HP to a Pokémon'
            },
            { 
                name: 'Antidote', 
                type: 'status', 
                effect: 'cure', 
                status: 'poison',
                description: 'Cures poison status'
            }
        ];

        // Pokéball definitions
        this.pokeballs = [
            { 
                name: 'Poké Ball', 
                catchRate: 1,
                description: 'A standard Pokéball'
            },
            { 
                name: 'Great Ball', 
                catchRate: 1.5,
                description: 'An improved Pokéball with higher catch rate'
            },
            { 
                name: 'Ultra Ball', 
                catchRate: 2,
                description: 'A high-performance Pokéball'
            }
        ];
    }

    // Open bag menu
    openBag() {
        const bagMenu = document.getElementById('bag-menu');
        
        // If bag menu is already open, close it
        if (!bagMenu.classList.contains('hidden')) {
            bagMenu.classList.add('hidden');
            return;
        }

        // Clear and show bag menu
        bagMenu.innerHTML = `
            <div class="close-btn-container">
                <button onclick="closeCurrentInterface()" class="close-interface-btn" title="Close">✕</button>
            </div>
        `;

        // Create tab menu
        const tabMenu = document.createElement('div');
        tabMenu.classList.add('tab-menu');

        const itemsTab = document.createElement('button');
        itemsTab.textContent = 'Items';
        itemsTab.classList.add('active');
        itemsTab.onclick = () => this.switchTab('items', itemsTab);
        tabMenu.appendChild(itemsTab);

        const ballsTab = document.createElement('button');
        ballsTab.textContent = 'Balls';
        ballsTab.onclick = () => this.switchTab('balls', ballsTab);
        tabMenu.appendChild(ballsTab);

        bagMenu.appendChild(tabMenu);

        // Content container
        const contentContainer = document.createElement('div');
        contentContainer.id = 'bag-content';
        bagMenu.appendChild(contentContainer);

        // Show items by default
        this.showItems(contentContainer);

        // Remove hidden class to show menu
        bagMenu.classList.remove('hidden');
    }

    // Switch between items and balls tabs
    switchTab(tab, button) {
        const buttons = document.querySelectorAll('.tab-menu button');
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const contentContainer = document.getElementById('bag-content');
        if (tab === 'items') {
            this.showItems(contentContainer);
        } else if (tab === 'balls') {
            this.showBalls(contentContainer);
        }
    }

    // Display items in the bag
    showItems(container) {
        container.innerHTML = '';
        this.items.forEach(item => {
            const itemButton = document.createElement('button');
            itemButton.textContent = item.name;
            itemButton.onclick = () => this.useItem(item);
            container.appendChild(itemButton);
        });
    }

    // Display Pokéballs in the bag
    showBalls(container) {
        container.innerHTML = '';
        this.pokeballs.forEach(ball => {
            const ballButton = document.createElement('button');
            ballButton.textContent = ball.name;
            ballButton.onclick = () => this.throwBall(ball);
            container.appendChild(ballButton);
        });
    }

    // Use an item on a Pokémon
    useItem(item) {
        const dialogue = document.getElementById('dialogue');
        const playerHp = document.getElementById('player-hp');
        const bagMenu = document.getElementById('bag-menu');

        // Close bag menu
        bagMenu.classList.add('hidden');

        // Healing items
        if (item.effect === 'heal') {
            const playerPokemon = window.playerPokemon; // Assuming global player Pokémon object
            
            if (playerPokemon.currentHp >= playerPokemon.hp) {
                dialogue.innerHTML = `${playerPokemon.name}'s HP is already full!`;
                return;
            }

            // Heal Pokémon
            playerPokemon.currentHp = Math.min(
                playerPokemon.hp, 
                playerPokemon.currentHp + item.amount
            );

            // Update HP bar
            const hpPercentage = Math.floor((playerPokemon.currentHp / playerPokemon.hp) * 100);
            playerHp.style.width = `${hpPercentage}%`;

            dialogue.innerHTML = `Used ${item.name}! ${playerPokemon.name} restored ${item.amount} HP!`;
        }

        // Status healing items
        if (item.effect === 'cure') {
            dialogue.innerHTML = `Used ${item.name}, but no status to cure.`;
        }

        // Trigger enemy turn after using item
        setTimeout(() => {
            if (typeof enemyTurn === 'function') {
                enemyTurn();
            }
        }, 1000);
    }

    // Throw a Pokéball to catch a Pokémon
    throwBall(ball) {
        const dialogue = document.getElementById('dialogue');
        const bagMenu = document.getElementById('bag-menu');

        // Close bag menu
        bagMenu.classList.add('hidden');

        // Assuming global enemy Pokémon object
        const enemyPokemon = window.enemyPokemon;

        dialogue.innerHTML = `Threw a ${ball.name}!`;

        // Simplified catch probability
        const catchProbability = (
            (3 * enemyPokemon.hp - 2 * enemyPokemon.currentHp) * ball.catchRate
        ) / (3 * enemyPokemon.hp);

        const random = Math.random();

        if (random < catchProbability) {
            dialogue.innerHTML += `<br/>Caught ${enemyPokemon.name}!`;
            
            // Trigger new Pokémon spawn or game state change
            setTimeout(() => {
                if (typeof fetchEnemyPokemon === 'function') {
                    fetchEnemyPokemon();
                }
            }, 2000);
        } else {
            dialogue.innerHTML += `<br/>${enemyPokemon.name} broke free!`;
            
            // Trigger enemy turn
            setTimeout(() => {
                if (typeof enemyTurn === 'function') {
                    enemyTurn();
                }
            }, 1000);
        }
    }
}

// Create global bag manager instance
window.bagManager = new BagManager();

// Expose global functions for HTML onclick events
function openBag() {
    window.bagManager.openBag();
}
