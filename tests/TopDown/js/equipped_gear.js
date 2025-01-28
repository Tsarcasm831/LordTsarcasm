export class EquippedGear {
  constructor(inventory, game) {
    this.inventory = inventory;
    this.game = game;
    this.equipment = {
      head: null,
      neck: null,
      shoulders: null,
      chest: null,
      mainHand: null,
      offHand: null,
      belt: null,
      gloves: null,
      shoes: null
    };
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.querySelectorAll('.gear-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const slotType = slot.dataset.slot;
        this.handleGearSlotClick(slotType);
      });
      
      slot.addEventListener('mouseenter', (e) => {
        const gearItem = this.equipment[slot.dataset.slot];
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
    const modal = document.getElementById('equipped-gear-modal');
    modal.classList.toggle('active');
  
    if (modal.classList.contains('active')) {
      this.updateUI();
    }
  }

  updateUI() {
    // Update gear slots
    document.querySelectorAll('.gear-slot').forEach(slot => {
      const slotType = slot.dataset.slot;
      const gearItem = this.equipment[slotType];
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

    // Update stats
    const defense = this.calculateDefenseStat();
    const attack = this.calculateAttackStat();
    const miningPower = this.calculateMiningPowerStat();

    document.getElementById('defense-value').textContent = defense;
    document.getElementById('attack-value').textContent = attack;
    document.getElementById('mining-power-value').textContent = miningPower;
  }

  handleGearSlotClick(slotType) {
    const currentItem = this.equipment[slotType];
    
    if (currentItem) {
      // Unequip current item
      if (this.inventory.addItem(currentItem)) {
        this.equipment[slotType] = null;
        this.updateUI();
      }
    } else {
      // Try to equip from selected inventory slot
      const selectedItem = this.inventory.slots[this.inventory.selectedSlot];
      if (selectedItem && this.canEquipInSlot(selectedItem, slotType)) {
        this.equipment[slotType] = selectedItem;
        this.inventory.removeItem(this.inventory.selectedSlot);
        this.updateUI();
      }
    }
  }

  canEquipInSlot(item, slotType) {
    // Define equipment slot requirements
    const slotRequirements = {
      head: ['helmet', 'hat', 'crown'],
      neck: ['amulet', 'necklace', 'pendant'],
      shoulders: ['pauldrons', 'spaulders'],
      chest: ['armor', 'robe', 'tunic'],
      mainHand: ['weapon', 'tool'],
      offHand: ['shield', 'tool', 'tome'],
      belt: ['belt', 'sash'],
      gloves: ['gauntlets', 'gloves', 'mitts'],
      shoes: ['boots', 'shoes', 'greaves']
    };

    return item.equipSlot && slotRequirements[slotType]?.includes(item.equipSlot);
  }

  calculateDefenseStat() {
    return Object.values(this.equipment)
      .reduce((total, item) => total + (item?.defense || 0), 0);
  }

  calculateAttackStat() {
    return Object.values(this.equipment)
      .reduce((total, item) => total + (item?.attack || 0), 0);
  }

  calculateMiningPowerStat() {
    return Object.values(this.equipment)
      .reduce((total, item) => total + (item?.miningPower || 0), 0);
  }

  getEquippedItem(slot) {
    return this.equipment[slot];
  }

  equipItem(item, slot) {
    if (!this.canEquipInSlot(item, slot)) return false;
    
    const currentItem = this.equipment[slot];
    
    // Unequip current item if exists
    if (currentItem) {
      this.inventory.addItem(currentItem);
    }
    
    this.equipment[slot] = item;
    this.updateUI();
    return true;
  }

  unequipItem(slot) {
    const item = this.equipment[slot];
    if (item && this.inventory.addItem(item)) {
      this.equipment[slot] = null;
      this.updateUI();
      return true;
    }
    return false;
  }
}