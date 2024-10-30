// Select elements
const healthBar = document.querySelector('#health-bar .bar-fill');
const hungerBar = document.querySelector('#hunger-bar .bar-fill');
const hotbar = document.getElementById('hotbar');
const inventoryGrid = document.getElementById('inventory-grid');

// Update health and hunger bars
export function updateStatusBars(health, hunger) {
    healthBar.style.width = `${health}%`;
    hungerBar.style.width = `${hunger}%`;
}

// Set up inventory and crafting menu
export function initInventory() {
    for (let i = 0; i < 3; i++) {
        inventory.addItem('Apple');
    }
    inventory.updateUI();
    document.addEventListener('keydown', (event) => {
        if (event.code === 'KeyE') {
            inventory.toggleInventoryAndCrafting();
        } else if (event.code >= 'Digit1' && event.code <= 'Digit9') {
            inventory.selectSlot(parseInt(event.code.charAt(5)) - 1);
            updateInHandDisplay();
        } else if (event.code === 'KeyP') { 
            togglePause();
        }
        if (event.code === 'Backquote') {
            toggleAdminConsole();
        }
    });

    document.getElementById('craft-button').addEventListener('click', () => crafting.craft());
    document.getElementById('spawn-mob-button').addEventListener('click', () => {
        const x = player.position.x + (Math.random() - 0.5) * 20;
        const z = player.position.z + (Math.random() - 0.5) * 20;
        const y = getTerrainHeight(x, z) + 1;

        const mobTypeSelect = document.getElementById('mob-type-select');
        const selectedType = mobTypeSelect.value;

        const mob = new Mob(new THREE.Vector3(x, y, z), selectedType);
        mobs.push(mob);
        console.log(`${selectedType} spawned.`);
    });



    document.getElementById('set-time-button').addEventListener('click', () => {
        const timeOfDay = document.getElementById('time-of-day').value;
        setTimeOfDay(timeOfDay);
    });

    document.getElementById('set-weather-button').addEventListener('click', () => {
        const weather = document.getElementById('weather').value;
        setWeather(weather);
    });

    document.getElementById('set-health-button').addEventListener('click', () => {
        const newHealth = parseInt(document.getElementById('player-health').value);
        health = Math.max(0, Math.min(100, newHealth));
        updateStatusBars();
    });

    document.getElementById('set-hunger-button').addEventListener('click', () => {
        const newHunger = parseInt(document.getElementById('player-hunger').value);
        hunger = Math.max(0, Math.min(100, newHunger));
        updateStatusBars();
    });

    document.getElementById('give-item-button').addEventListener('click', () => {
        const selectedItem = document.getElementById('give-item').value;
        if (!inventory.addItem(selectedItem)) {
            console.log("Inventory is full or item cannot be added.");
        } else {
            console.log(`${selectedItem} added to inventory.`);
        }
    });

    document.getElementById('set-gravity-button').addEventListener('click', () => {
        const newGravity = parseFloat(document.getElementById('gravity').value);
        settings.gravity = newGravity;
        console.log(`Gravity set to ${newGravity}.`);
    });

    document.getElementById('set-jump-force-button').addEventListener('click', () => {
        const newJumpForce = parseFloat(document.getElementById('jump-force').value);
        settings.jumpForce = newJumpForce;
        console.log(`Jump force set to ${newJumpForce}.`);
    });

    document.getElementById('spawn-mob-button').addEventListener('click', () => {
        const x = player.position.x + (Math.random() - 0.5) * 20;
        const z = player.position.z + (Math.random() - 0.5) * 20;
        const y = getTerrainHeight(x, z) + 1;
        const mob = new Mob(new THREE.Vector3(x, y, z));
        mobs.push(mob);
        console.log("Mob spawned.");
    });

    document.getElementById('remove-mobs-button').addEventListener('click', () => {
        for (let mob of mobs) {
            scene.remove(mob.mesh);
        }
        mobs.length = 0;
        console.log("All mobs removed.");
    });

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const tabId = 'tab-' + button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}