export class InventoryView {
  constructor(inventory, equippedGear) {
    this.inventory = inventory;
    this.equippedGear = equippedGear;
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    if (!document.getElementById('inventory-view-modal')) {
      const modal = document.createElement('div');
      modal.id = 'inventory-view-modal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content inventory-view-content">
          <h2>Character</h2>
          <div class="inventory-view-container">
            <div class="equipment-section">
              <h3>Equipment</h3>
              <div class="gear-grid">
                <div class="gear-slot" data-slot="head">
                  <div class="gear-label">Head</div>
                  <div class="gear-item"></div>
                </div>
                <div class="gear-slot" data-slot="neck">
                  <div class="gear-label">Neck</div>
                  <div class="gear-item"></div>
                </div>
                <div class="gear-slot" data-slot="shoulders">
                  <div class="gear-label">Shoulders</div>
                  <div class="gear-item"></div>
                </div>
                <div class="gear-slot" data-slot="chest">
                  <div class="gear-label">Chest</div>
                  <div class="gear-item"></div>
                </div>
                <div class="gear-slot" data-slot="mainHand">
                  <div class="gear-label">Main Hand</div>
                  <div class="gear-item"></div>
                </div>
                <div class="gear-slot" data-slot="offHand">
                  <div class="gear-label">Off Hand</div>
                  <div class="gear-item"></div>
                </div>
                <div class="gear-slot" data-slot="belt">
                  <div class="gear-label">Belt</div>
                  <div class="gear-item"></div>
                </div>
                <div class="gear-slot" data-slot="gloves">
                  <div class="gear-label">Gloves</div>
                  <div class="gear-item"></div>
                </div>
                <div class="gear-slot" data-slot="shoes">
                  <div class="gear-label">Shoes</div>
                  <div class="gear-item"></div>
                </div>
              </div>
              <div class="stats-panel">
                <h3 class="stats-header">Character Stats</h3>
                <div class="stat-row">
                  <span class="stat-label">Defense:</span>
                  <span class="stat-value" id="iv-defense-value">0</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Attack Power:</span>
                  <span class="stat-value" id="iv-attack-value">0</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Mining Power:</span>
                  <span class="stat-value" id="iv-mining-power-value">0</span>
                </div>
              </div>
            </div>
            <div class="inventory-section">
              <h3>Inventory</h3>
              <div class="category-filter">
                <button class="category-btn active" data-category="all">All</button>
                <button class="category-btn" data-category="resource">Resources</button>
                <button class="category-btn" data-category="tool">Tools</button>
                <button class="category-btn" data-category="building">Buildings</button>
              </div>
              <div class="inventory-scroll">
                <div class="inventory-grid" id="iv-inventory-slots"></div>
              </div>
            </div>
          </div>
          <button class="close-btn"><i class="fas fa-times"></i></button>
        </div>
      `;
      document.body.appendChild(modal);
    }
  }

  setupEventListeners() {
    document.querySelector('#inventory-view-modal .close-btn')
      .addEventListener('click', () => this.toggle());

    document.querySelectorAll('#inventory-view-modal .category-btn')
      .forEach(btn => {
        btn.addEventListener('click', () => {
          this.inventory.updateCategoryFilter(btn.dataset.category);
          this.updateInventoryGrid();
        });
      });

    document.querySelectorAll('#inventory-view-modal .gear-slot')
      .forEach(slot => {
        slot.addEventListener('click', () => {
          const slotType = slot.dataset.slot;
          this.equippedGear.handleGearSlotClick(slotType);
          this.updateUI();
        });

        slot.addEventListener('mouseenter', (e) => {
          const gearItem = this.equippedGear.getEquippedItem(slot.dataset.slot);
          if (gearItem) {
            this.inventory.showTooltip(-1, e.clientX, e.clientY, gearItem);
          }
        });

        slot.addEventListener('mouseleave', () => {
          this.inventory.hideTooltip();
        });
      });
  }

  toggle() {
    const modal = document.getElementById('inventory-view-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
      this.updateUI();
    }
  }

  updateUI() {
    this.updateEquipmentGrid();
    this.updateInventoryGrid();
    this.updateStats();
  }

  updateEquipmentGrid() {
    document.querySelectorAll('#inventory-view-modal .gear-slot').forEach(slot => {
      const slotType = slot.dataset.slot;
      const gearItem = this.equippedGear.getEquippedItem(slotType);
      const itemContainer = slot.querySelector('.gear-item');
      
      itemContainer.innerHTML = '';
      if (gearItem) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(gearItem.icon, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        itemContainer.appendChild(svgElement);
        slot.classList.add('equipped');
      } else {
        slot.classList.remove('equipped');
      }
    });
  }

  updateInventoryGrid() {
    const container = document.getElementById('iv-inventory-slots');
    container.innerHTML = '';
    
    for (let i = 0; i < 24; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.dataset.index = i;
      
      const item = this.inventory.slots[i];
      if (item) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(item.icon, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        slot.appendChild(svgElement);

        if (item.stackable && this.inventory.stackQuantities[i] > 1) {
          const stackCount = document.createElement('div');
          stackCount.className = 'stack-count';
          stackCount.textContent = this.inventory.stackQuantities[i];
          slot.appendChild(stackCount);
        }
      }
      
      // Add tooltip event listeners
      slot.addEventListener('mouseenter', (e) => {
        const slotIndex = parseInt(e.currentTarget.dataset.index);
        const item = this.inventory.slots[slotIndex];
        if (item) {
          this.inventory.showTooltip(slotIndex, e.clientX, e.clientY);
        }
      });
      
      slot.addEventListener('mouseleave', () => {
        this.inventory.hideTooltip();
      });
      
      container.appendChild(slot);
    }
  }

  updateStats() {
    document.getElementById('iv-defense-value').textContent = 
      this.equippedGear.calculateDefenseStat();
    document.getElementById('iv-attack-value').textContent = 
      this.equippedGear.calculateAttackStat();
    document.getElementById('iv-mining-power-value').textContent = 
      this.equippedGear.calculateMiningPowerStat();
  }
}