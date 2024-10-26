// Inventory.js
export class Inventory {
    constructor() {
        this.items = Array(36).fill(null);
        this.selectedSlot = 0;
    }

    addItem(item) {
        const existingSlot = this.items.findIndex(slot => slot && slot.name === item && slot.count < 10);
        if (existingSlot !== -1) {
            this.items[existingSlot].count++;
        } else {
            const emptySlot = this.items.findIndex(slot => slot === null);
            if (emptySlot !== -1) {
                this.items[emptySlot] = { name: item, count: 1 };
            } else {
                return false;
            }
        }
        this.updateUI();
        this.updateInHandDisplay();
        return true;
    }

    removeItem(slot) {
        if (this.items[slot] !== null) {
            const item = this.items[slot].name;
            this.items[slot].count--;
            if (this.items[slot].count === 0) {
                this.items[slot] = null;
            }
            this.updateUI();
            this.updateInHandDisplay();
            return item;
        }
        return null;
    }

    updateUI() {
        const hotbar = document.getElementById('hotbar');
        const inventoryGrid = document.getElementById('inventory-grid');
        
        hotbar.innerHTML = '';
        inventoryGrid.innerHTML = '';

        for (let i = 0; i < 36; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.setAttribute('data-slot', i);
            if (this.items[i]) {
                slot.textContent = this.items[i].name;
                const count = document.createElement('span');
                count.className = 'item-count';
                count.textContent = this.items[i].count;
                slot.appendChild(count);
            }
            slot.addEventListener('click', () => this.selectSlot(i));
            if (i === this.selectedSlot) slot.classList.add('selected');
            
            slot.draggable = true;
            slot.addEventListener('dragstart', this.dragStart.bind(this));
            slot.addEventListener('dragover', this.dragOver);
            slot.addEventListener('drop', this.drop.bind(this));

            if (i < 9) {
                hotbar.appendChild(slot);
            } else {
                inventoryGrid.appendChild(slot);
            }
        }
    }

    selectSlot(slot) {
        this.selectedSlot = slot;
        this.updateUI();
        this.updateInHandDisplay();
    }

    toggleInventoryAndCrafting() {
        const inventoryGrid = document.getElementById('inventory-grid');
        const craftingMenu = document.getElementById('crafting-menu');
        if (inventoryGrid.style.display === 'none') {
            inventoryGrid.style.display = 'grid';
            craftingMenu.style.display = 'flex';
            this.isPaused = true;
            document.exitPointerLock();
        } else {
            inventoryGrid.style.display = 'none';
            craftingMenu.style.display = 'none';
            this.isPaused = false;
            renderer.domElement.requestPointerLock();
        }
    }

    dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-slot'));
    }

    dragOver(e) {
        e.preventDefault();
    }

    drop(e) {
        e.preventDefault();
        const fromSlot = parseInt(e.dataTransfer.getData('text'));
        const toSlot = parseInt(e.target.getAttribute('data-slot'));
        
        if (fromSlot !== toSlot) {
            const temp = this.items[fromSlot];
            this.items[fromSlot] = this.items[toSlot];
            this.items[toSlot] = temp;
            this.updateUI();
            this.updateInHandDisplay();
        }
    }

    createItemMesh(item) {
        let geometry, material;
        switch (item) {
            case 'Stick':
                geometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
                material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
                break;
            case 'Cactus Spine':
                geometry = new THREE.ConeGeometry(0.05, 0.5, 8);
                material = new THREE.MeshPhongMaterial({ color: 0x2F4F4F });
                break;
            // ... (rest of the item cases)
        }
        return new THREE.Mesh(geometry, material);
    }

    updateInHandDisplay() {
        const canvas = document.getElementById('player-hand-canvas');
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        renderer.setSize(200, 200);
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const scene = new THREE.Scene();

        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(0, 0, 10);
        scene.add(light);

        const handGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.2);
        const handMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
        const hand = new THREE.Mesh(handGeometry, handMaterial);
        hand.position.set(0, -0.5, -1);
        hand.rotation.x = Math.PI / 6;
        scene.add(hand);

        const selectedItem = this.items[this.selectedSlot];
        if (selectedItem) {
            const itemMesh = this.createItemMesh(selectedItem.name);
            itemMesh.position.set(0, 0, -1);
            itemMesh.rotation.set(Math.PI / 4, Math.PI / 4, 0);
            hand.add(itemMesh);
        }

        renderer.render(scene, camera);
    }
}