// Inventory.js

import { ITEMS } from './items.js';

export class Inventory {
  constructor(game) { 
    this.game = game; 
    this.slots = new Array(24).fill(null); 
    this.selectedSlot = 0;
    this.categories = {
      all: 'All Items',
      resource: 'Resources',
      tool: 'Tools',
      building: 'Buildings',
      component: 'Components',
      material: 'Materials',
      armor: 'Armor'
    };
    this.currentCategory = 'all';

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
      this.addItem(ITEMS.bronze_bar);
      this.addItem(ITEMS.rotten_log);
      this.addItem(ITEMS.cloth_chest);
      this.addItem(ITEMS.pine_log);
      this.addItem(ITEMS.fir_log);
      this.addItem(ITEMS.maple_log);
      this.addItem(ITEMS.birch_log);
      this.addItem(ITEMS.copper_ore);
      this.addItem(ITEMS.copper_bar);
    }, 100);
  }

  /**
   * Sets up event listeners for existing DOM elements.
   */
  setupEventListeners() {
    // Note: InventoryView handles category button events and close button events
    // Therefore, no need to attach them here

    // Attach event listeners to inventory slots
    this.updateInventoryGrid();
  }

  /**
   * Shows tooltip for a given item.
   * @param {number} index - Index of the item in the inventory slots. Use -1 for equipped gear.
   * @param {number} x - X-coordinate for tooltip positioning.
   * @param {number} y - Y-coordinate for tooltip positioning.
   * @param {Object} specificItem - Specific item object (used for equipped gear).
   */
  showTooltip(index, x, y, specificItem = null) {
    const item = specificItem || this.slots[index];
    if (!item) return;
    
    // Calculate position to keep tooltip on screen
    const tooltipWidth = 220; // Match max-width in CSS
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
    
    const quantity = (index >= 0 && this.slots[index]?.stackable) ? this.stackQuantities[index] : 0;
    this.tooltip.innerHTML = `
      <div class="tooltip-header">
        <img src="${item.icon}" alt="${item.name}" class="tooltip-icon">
        <h4>${item.name}</h4>
        ${item.stackable && quantity > 1 ? `<span class="tooltip-quantity">x${quantity}</span>` : ''}
      </div>
      <div class="tooltip-body">
        <div>Type: ${this.categories[item.type] || item.type}</div>
        ${item.description ? `<div>${item.description.replace(/\n/g, '<br>')}</div>` : ''}
        ${item.durability ? `<div>Durability: ${item.durability}</div>` : ''}
        ${item.defense ? `<div>Defense: +${item.defense}</div>` : ''}
        ${item.attack ? `<div>Attack: +${item.attack}</div>` : ''}
        ${item.miningPower ? `<div>Mining Power: +${item.miningPower}</div>` : ''}
      </div>
    `;
    this.tooltip.classList.add('iv-show');
  }

  /**
   * Hides the tooltip.
   */
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('iv-show');
    }
  }

  /**
   * Drops an item from a specific slot.
   * @param {number} index - Index of the slot.
   */
  dropItem(index) {
    if (this.slots[index]) {
      this.removeItem(index);
      this.updateInventoryGrid();
    }
  }

  /**
   * Adds an item to the inventory.
   * @param {Object} item - Item object to add.
   * @returns {boolean} - True if added successfully, false otherwise.
   */
  addItem(item) {
    // Handle stackable items
    if (item.stackable) {
      const existingSlotIndex = this.slots.findIndex(slot => 
        slot?.name.toLowerCase() === item.name.toLowerCase()
      );
      
      if (existingSlotIndex !== -1) {
        // Increase stack quantity
        this.stackQuantities[existingSlotIndex]++;
        this.updateInventoryGrid();
        return true;
      }
    }
    
    // For non-stackable or new stackable items, find empty slot
    const emptySlot = this.slots.findIndex(slot => slot === null);
    if (emptySlot !== -1) {
      this.slots[emptySlot] = item;
      this.stackQuantities[emptySlot] = 1;
      this.updateInventoryGrid();
      return true;
    }
    return false;
  }

  /**
   * Removes an item from a specific slot.
   * @param {number} index - Index of the slot.
   * @returns {Object|null} - The removed item or null if slot was empty.
   */
  removeItem(index) {
    if (this.slots[index]) {
      const item = this.slots[index];
      if (this.stackQuantities[index] > 1) {
        this.stackQuantities[index]--;
      } else {
        this.slots[index] = null;
        this.stackQuantities[index] = 0;
      }
      this.updateInventoryGrid();
      return item;
    }
    return null;
  }

  /**
   * Gets the total count of a specific item in the inventory.
   * @param {string} itemName - Name of the item.
   * @returns {number} - Total count.
   */
  getItemCount(itemName) {
    let total = 0;
    this.slots.forEach((slot, index) => {
      if (slot?.name.toLowerCase() === itemName.toLowerCase()) {
        total += this.stackQuantities[index];
      }
    });
    return total;
  }

  /**
   * Updates the inventory grid UI based on current slots and category filter.
   */
  updateInventoryGrid() {
    const container = document.getElementById('iv-inventory-slots');
    if (!container) return;
    container.innerHTML = '';

    // We'll show up to 24 slots
    const totalSlots = 24;

    for (let i = 0; i < totalSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'iv-inventory-slot';
      slot.dataset.index = i;

      const item = this.slots[i];
      if (item) {
        // Check category filter
        if (this.currentCategory !== 'all' && item.type !== this.currentCategory) {
          slot.classList.add('iv-hidden');
        } else {
          slot.classList.remove('iv-hidden');
          
          // Insert the item’s image icon
          const img = document.createElement('img');
          img.src = item.icon;
          img.alt = item.name;
          img.className = 'iv-item-icon';
          slot.appendChild(img);

          // Show stack count if stackable
          if (item.stackable && this.stackQuantities[i] > 1) {
            const stackCount = document.createElement('div');
            stackCount.className = 'iv-stack-count';
            stackCount.textContent = this.stackQuantities[i];
            slot.appendChild(stackCount);
          }

          slot.classList.add('iv-has-item');
        }
      }

      // Tooltip for each slot on hover
      slot.addEventListener('mouseenter', (e) => {
        const slotIndex = parseInt(e.currentTarget.dataset.index, 10);
        const hoveredItem = this.slots[slotIndex];
        if (hoveredItem && (this.currentCategory === 'all' || hoveredItem.type === this.currentCategory)) {
          this.showTooltip(slotIndex, e.clientX, e.clientY);
        }
      });

      slot.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });

      // Right-click to drop item
      slot.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const index = parseInt(e.currentTarget.dataset.index, 10);
        if (this.slots[index]) {
          this.dropItem(index);
        }
      });

      container.appendChild(slot);
    }

    this.updateStats();
  }

  /**
   * Toggles the inventory modal.
   */
  toggleInventory() {
    const modal = document.getElementById('inventory-view-modal');
    if (!modal) return;

    modal.classList.toggle('iv-active');
    
    if (modal.classList.contains('iv-active')) {
      this.updateInventoryGrid();
      // Assuming you have a method to update stats elsewhere
    }
  }

  /**
   * Updates the current category filter and refreshes the inventory grid.
   * @param {string} category - The category to filter by.
   */
  updateCategoryFilter(category) {
    this.currentCategory = category;
    this.updateInventoryGrid();
  }

  /**
   * Updates character stats based on equipped gear and inventory.
   */
  updateStats() {
    // This method can be expanded based on your game's logic
    // For demonstration, we'll just log the stats
    // You might want to interact with InventoryView's updateStats instead
  }
}
