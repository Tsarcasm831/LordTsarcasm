// InventoryView.js

export class InventoryView { 
  constructor(inventory, equippedGear) {
    this.inventory = inventory;
    this.equippedGear = equippedGear;
    this.createModal();
    this.setupEventListeners();
  }

  /**
   * Creates the Inventory modal if it doesn't already exist in the DOM.
   * The modal has two main sections:
   *    1) Equipment (gear slots + stats)
   *    2) Inventory (with category filters)
   */
  createModal() {
    if (!document.getElementById('inventory-view-modal')) {
      const modal = document.createElement('div');
      modal.id = 'inventory-view-modal';
      modal.className = 'iv-modal';

      modal.innerHTML = `
        <div class="iv-modal-content">
          <button class="iv-close-btn" id="iv-close-btn" title="Close Inventory">
            <i class="fas fa-times"></i>
          </button>
          <h2 class="iv-section-header">Character</h2>
          
          <div class="iv-container">
            
            <!-- Equipment / Stats Section -->
            <div class="iv-equipment-section">
              <h3 class="iv-sub-header">Equipment</h3>
              <div class="iv-gear-grid">
                <!-- Each gear-slot has data-slot attribute for logic -->
                <div class="iv-gear-slot" data-slot="head">
                  <div class="iv-gear-label">Head</div>
                  <div class="iv-gear-item"></div>
                </div>
                <div class="iv-gear-slot" data-slot="neck">
                  <div class="iv-gear-label">Neck</div>
                  <div class="iv-gear-item"></div>
                </div>
                <div class="iv-gear-slot" data-slot="shoulders">
                  <div class="iv-gear-label">Shoulders</div>
                  <div class="iv-gear-item"></div>
                </div>
                <div class="iv-gear-slot" data-slot="chest">
                  <div class="iv-gear-label">Chest</div>
                  <div class="iv-gear-item"></div>
                </div>
                <div class="iv-gear-slot" data-slot="mainHand">
                  <div class="iv-gear-label">Main Hand</div>
                  <div class="iv-gear-item"></div>
                </div>
                <div class="iv-gear-slot" data-slot="offHand">
                  <div class="iv-gear-label">Off Hand</div>
                  <div class="iv-gear-item"></div>
                </div>
                <div class="iv-gear-slot" data-slot="belt">
                  <div class="iv-gear-label">Belt</div>
                  <div class="iv-gear-item"></div>
                </div>
                <div class="iv-gear-slot" data-slot="gloves">
                  <div class="iv-gear-label">Gloves</div>
                  <div class="iv-gear-item"></div>
                </div>
                <div class="iv-gear-slot" data-slot="shoes">
                  <div class="iv-gear-label">Shoes</div>
                  <div class="iv-gear-item"></div>
                </div>
              </div>

              <div class="iv-stats-panel">
                <h3 class="iv-sub-header">Character Stats</h3>
                <div class="iv-stat-row">
                  <span class="iv-stat-label">Defense:</span>
                  <span class="iv-stat-value" id="iv-defense-value">0</span>
                </div>
                <div class="iv-stat-row">
                  <span class="iv-stat-label">Attack Power:</span>
                  <span class="iv-stat-value" id="iv-attack-value">0</span>
                </div>
                <div class="iv-stat-row">
                  <span class="iv-stat-label">Mining Power:</span>
                  <span class="iv-stat-value" id="iv-mining-power-value">0</span>
                </div>
              </div>
            </div>

            <!-- Inventory Section -->
            <div class="iv-inventory-section">
              <h3 class="iv-sub-header">Inventory</h3>
              <div class="iv-category-filter">
                <button class="iv-category-btn active" data-category="all">All</button>
                <button class="iv-category-btn" data-category="resource">Resources</button>
                <button class="iv-category-btn" data-category="tool">Tools</button>
                <button class="iv-category-btn" data-category="building">Buildings</button>
                <!-- Add more category buttons if needed -->
              </div>
              <div class="iv-inventory-scroll">
                <div class="iv-inventory-grid" id="iv-inventory-slots"></div>
              </div>
            </div>

          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
  }

  /**
   * Sets up click/mouse events for:
   *   - The close button
   *   - Category filter buttons
   *   - Gear slot interactions
   */
  setupEventListeners() {
    const closeBtn = document.getElementById('iv-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggle());
    }

    // Category Filter Buttons
    document.querySelectorAll('.iv-category-btn')
      .forEach(btn => {
        btn.addEventListener('click', () => {
          // Update active button
          document.querySelectorAll('.iv-category-btn')
            .forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          // Tell the inventory which category is selected, then update
          this.inventory.updateCategoryFilter(btn.dataset.category);
          this.inventory.updateInventoryGrid();
        });
      });

    // Gear Slots
    document.querySelectorAll('.iv-gear-slot')
      .forEach(slot => {
        const slotType = slot.dataset.slot;
        
        // Equip/Unequip on click
        slot.addEventListener('click', () => {
          this.equippedGear.handleGearSlotClick(slotType);
          this.updateUI();
        });

        // Tooltip on hover
        slot.addEventListener('mouseenter', (e) => {
          const gearItem = this.equippedGear.getEquippedItem(slotType);
          if (gearItem) {
            this.inventory.showTooltip(-1, e.clientX, e.clientY, gearItem);
          }
        });

        slot.addEventListener('mouseleave', () => {
          this.inventory.hideTooltip();
        });
      });
  }

  /**
   * Opens or closes the inventory modal.
   */
  toggle() {
    const modal = document.getElementById('inventory-view-modal');
    if (!modal) return;
    modal.classList.toggle('iv-active');
    if (modal.classList.contains('iv-active')) {
      this.updateUI();
    }
  }

  /**
   * Updates all UI elements (equipment, inventory, stats).
   */
  updateUI() {
    this.updateEquipmentGrid();
    this.inventory.updateInventoryGrid();
    this.updateStats();
  }

  /**
   * Renders the currently equipped items in their respective gear slots.
   */
  updateEquipmentGrid() {
    const gearSlots = document.querySelectorAll('.iv-gear-slot');
    gearSlots.forEach(slot => {
      const slotType = slot.dataset.slot;
      const gearItem = this.equippedGear.getEquippedItem(slotType);
      const itemContainer = slot.querySelector('.iv-gear-item');

      // Clear any existing icon
      itemContainer.innerHTML = '';
      slot.classList.remove('iv-equipped');

      if (gearItem) {
        // Insert the item’s image icon
        const img = document.createElement('img');
        img.src = gearItem.icon;
        img.alt = gearItem.name;
        img.className = 'iv-gear-icon';
        itemContainer.appendChild(img);

        slot.classList.add('iv-equipped');
      }
    });
  }

  /**
   * Pulls stat values from equippedGear and updates DOM.
   */
  updateStats() {
    document.getElementById('iv-defense-value').textContent =
      this.equippedGear.calculateDefenseStat();
    document.getElementById('iv-attack-value').textContent =
      this.equippedGear.calculateAttackStat();
    document.getElementById('iv-mining-power-value').textContent =
      this.equippedGear.calculateMiningPowerStat();
  }
}
