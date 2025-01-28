import { ITEMS } from './items.js';

export class Inventory {
  constructor(game) { 
    this.game = game; 
    this.slots = new Array(24).fill(null); 
    this.selectedSlot = 0;
    this.createInventoryModalUI();
    this.categories = {
      all: 'All Items',
      resource: 'Resources',
      tool: 'Tools',
      building: 'Buildings'
    };
    this.currentCategory = 'all';
    this.setupEventListeners();

    // Add stack quantities tracking
    this.stackQuantities = new Array(24).fill(0);

    // Add test items after a short delay to ensure icons are cached
    setTimeout(() => {
      this.addItem(ITEMS.wood);
      this.addItem(ITEMS.stone);
      this.addItem(ITEMS.axe);
      this.addItem(ITEMS.copper);
      this.addItem(ITEMS.iron_ore);
      this.addItem(ITEMS.engine_part);
    }, 100);
  }

  createInventoryModalUI() {
    const container = document.getElementById('inventory-modal-slots');
    for (let i = 0; i < 24; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.dataset.index = i;
      container.appendChild(slot);
    }
  }

  setupEventListeners() {
    document.querySelector('.close-btn').addEventListener('click', () => 
      this.toggleInventory()
    );
    
    document.querySelectorAll('.inventory-slot').forEach(slot => {
      slot.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.dropItem(parseInt(e.target.dataset.index));
      });
      
      slot.addEventListener('mouseenter', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.showTooltip(index, e.clientX, e.clientY);
      });
      
      slot.addEventListener('mouseleave', () => 
        this.hideTooltip()
      );
    });
  }

  showTooltip(index, x, y, specificItem = null) {
    const item = specificItem || this.slots[index];
    if (!item) return;
    
    const tooltip = document.getElementById('item-tooltip');
    tooltip.style.left = `${x + 12}px`;
    tooltip.style.top = `${y + 12}px`;
    tooltip.innerHTML = `
      <div class="tooltip-header">
        ${item.icon} 
        <h4>${item.name}</h4>
      </div>
      <div class="tooltip-body">
        <div>Type: ${item.type}</div>
        ${item.description ? `<div>${item.description}</div>` : ''}
        ${item.durability ? `<div>Durability: ${item.durability}</div>` : ''}
        ${item.defense ? `<div>Defense: +${item.defense}</div>` : ''}
        ${item.attack ? `<div>Attack: +${item.attack}</div>` : ''}
        ${item.miningPower ? `<div>Mining Power: +${item.miningPower}</div>` : ''}
      </div>
    `;
    tooltip.style.opacity = '1';
  }

  hideTooltip() {
    document.getElementById('item-tooltip').style.opacity = '0';
  }

  dropItem(index) {
    if (this.slots[index]) {
      this.slots[index] = null;
      this.stackQuantities[index] = 0;
      this.updateUI();
    }
  }

  addItem(item) {
    // Handle stackable items
    if (item.stackable) {
      const existingSlotIndex = this.slots.findIndex(slot => 
        slot?.name.toLowerCase() === item.name.toLowerCase()
      );
      
      if (existingSlotIndex !== -1) {
        // Increase stack quantity
        this.stackQuantities[existingSlotIndex]++;
        this.updateUI();
        return true;
      }
    }
    
    // For non-stackable or new stackable items, find empty slot
    const emptySlot = this.slots.findIndex(slot => slot === null);
    if (emptySlot !== -1) {
      this.slots[emptySlot] = item;
      this.stackQuantities[emptySlot] = 1;
      this.updateUI();
      return true;
    }
    return false;
  }

  removeItem(index) {
    if (this.slots[index]) {
      const item = this.slots[index];
      if (this.stackQuantities[index] > 1) {
        this.stackQuantities[index]--;
      } else {
        this.slots[index] = null;
        this.stackQuantities[index] = 0;
      }
      this.updateUI();
      return item;
    }
    return null;
  }

  getItemCount(itemName) {
    let total = 0;
    this.slots.forEach((slot, index) => {
      if (slot?.name.toLowerCase() === itemName.toLowerCase()) {
        total += this.stackQuantities[index];
      }
    });
    return total;
  }

  updateUI() {
    const inventorySlots = document.querySelectorAll('.inventory-slot');
    
    this.slots.forEach((item, index) => {
      const slot = inventorySlots[index];
      slot.innerHTML = '';
      
      if (item) {
        // Parse SVG properly
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(item.icon, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        slot.appendChild(svgElement);

        // Add stack count with improved visibility
        if (item.stackable && this.stackQuantities[index] > 1) {
          const stackCount = document.createElement('div');
          stackCount.className = 'stack-count';
          stackCount.textContent = this.stackQuantities[index];
          slot.appendChild(stackCount);
        }
      }
    });
  }

  toggleInventory() {
    const modal = document.getElementById('inventory-modal');
    modal.classList.toggle('active');
    
    if (modal.classList.contains('active')) {
      this.updateStats();
    }
  }

  updateCategoryFilter(category) {
    this.currentCategory = category;
    this.updateUI();
  }

  updateStats() {
    const activeTools = this.slots.filter(item => 
      item?.type === 'tool' && item.durability > 0
    );

    const miningBonus = activeTools.reduce((acc, tool) => 
      acc + (tool.name.includes('Pickaxe') ? 25 : 0), 0);

    document.getElementById('stat-speed').textContent = 
      `${this.game.player.speed}px/s`;
    document.getElementById('stat-light').textContent = 
      `${Math.round(this.game.timeSystem.getDayNightTint().radius)}px`;
    document.getElementById('stat-mining').textContent = 
      `+${miningBonus}% Efficiency`;
    document.getElementById('stat-attack').textContent = 
      activeTools.some(t => t.name === 'Axe') ? '150%' : '100%';
  }
}