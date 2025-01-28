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

    // Initialize tooltip
    this.tooltip = document.getElementById('item-tooltip');
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.id = 'item-tooltip';
      document.body.appendChild(this.tooltip);
    }
    this.tooltip.style.opacity = '0';

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
      this.attachSlotEventListeners(slot);
      container.appendChild(slot);
    }
  }

  attachSlotEventListeners(slot) {
    slot.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const index = parseInt(e.currentTarget.dataset.index);
      if (this.slots[index]) {
        this.dropItem(index);
      }
    });
    
    slot.addEventListener('mouseenter', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      if (this.slots[index]) {
        this.showTooltip(index, e.clientX, e.clientY);
      }
    });
    
    slot.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });
  }

  setupEventListeners() {
    document.querySelector('.close-btn').addEventListener('click', () => 
      this.toggleInventory()
    );
    
    // Add event listeners to hotbar slots
    const hotbarSlots = document.querySelectorAll('#hotbar .inventory-slot');
    hotbarSlots.forEach(slot => {
      this.attachSlotEventListeners(slot);
    });
  }

  showTooltip(index, x, y, specificItem = null) {
    const item = specificItem || this.slots[index];
    if (!item) return;
    
    // Calculate position to keep tooltip on screen
    const tooltipWidth = 200; // Approximate width
    const tooltipHeight = 150; // Approximate height
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let left = x + 15;
    let top = y + 15;
    
    // Adjust if tooltip would go off screen
    if (left + tooltipWidth > windowWidth) {
      left = x - tooltipWidth - 5;
    }
    if (top + tooltipHeight > windowHeight) {
      top = y - tooltipHeight - 5;
    }
    
    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
    
    const quantity = index >= 0 ? this.stackQuantities[index] : 0;
    this.tooltip.innerHTML = `
      <div class="tooltip-header">
        ${item.icon} 
        <h4>${item.name}</h4>
        ${quantity > 1 ? `<span class="tooltip-quantity">x${quantity}</span>` : ''}
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
    this.tooltip.style.opacity = '1';
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.opacity = '0';
    }
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
    // Update both hotbar and inventory slots
    const allSlots = document.querySelectorAll('.inventory-slot');
    allSlots.forEach(slot => {
      const index = parseInt(slot.dataset.index);
      const item = this.slots[index];
      
      // Clear existing content
      slot.innerHTML = '';
      slot.className = 'inventory-slot';
      
      if (item) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(item.icon, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        slot.appendChild(svgElement);
        
        if (item.stackable && this.stackQuantities[index] > 1) {
          const stackCount = document.createElement('div');
          stackCount.className = 'stack-count';
          stackCount.textContent = this.stackQuantities[index];
          slot.appendChild(stackCount);
        }
        
        slot.classList.add('has-item');
      }
    });

    this.updateStats();
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