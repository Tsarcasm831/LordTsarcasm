import { ITEMS } from './items.js';

export class CraftingSystem {
  constructor(inventory) {
    this.inventory = inventory;
    this.recipes = {
      axe: {
        name: 'Axe',
        icon: ITEMS.axe.icon,
        requires: [
          { item: 'wood', quantity: 5 },
          { item: 'stone', quantity: 3 }
        ],
        output: { item: 'axe', quantity: 1 },
        description: 'Basic woodcutting tool'
      },
      cottage: {
        name: 'Cottage',
        icon: ITEMS.cottage.icon,
        requires: [
          { item: 'wood', quantity: 20 },
          { item: 'stone', quantity: 15 }
        ],
        output: { item: 'cottage', quantity: 1 },
        description: 'A cozy home'
      },
      furnace: {
        name: 'Furnace',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24">
          <path fill="#8B4513" d="M8 4h16v24H8z"/>
          <path fill="#DEB887" d="M10 6h12v20H10z"/>
          <path fill="#FF4500" d="M12 8h8v4h-8z"/>
        </svg>`,
        requires: [
          { item: 'stone', quantity: 20 },
          { item: 'iron_ore', quantity: 5 }
        ],
        output: { item: 'furnace', quantity: 1 },
        description: 'Smelts ores into ingots'
      }
    };
    
    this.setupDOM();
  }

  setupDOM() {
    this.resourceGrid = document.getElementById('resource-grid');
    this.recipeList = document.getElementById('recipe-list');
  }

  updateUI() {
    this.updateResourceGrid();
    this.updateRecipeList();
  }

  updateResourceGrid() {
    if (!this.resourceGrid) return;
    
    this.resourceGrid.innerHTML = '';
    const resources = this.getPlayerResources();
    
    resources.forEach(({item, quantity}) => {
      const resourceItem = document.createElement('div');
      resourceItem.className = 'resource-item';
      resourceItem.innerHTML = `
        ${item.icon}
        <span>${item.name}: ${quantity}</span>
      `;
      this.resourceGrid.appendChild(resourceItem);
    });
  }

  updateRecipeList() {
    if (!this.recipeList) return;
    
    this.recipeList.innerHTML = '';
    
    Object.entries(this.recipes).forEach(([key, recipe]) => {
      const recipeItem = document.createElement('div');
      recipeItem.className = 'recipe-item';
      const canCraft = this.canCraft(key);
      if (!canCraft) recipeItem.classList.add('disabled');
      
      const requirements = recipe.requires.map(req => {
        const hasEnough = this.inventory.getItemCount(req.item) >= req.quantity;
        const itemData = ITEMS[req.item.toLowerCase()];
        if (!itemData) return ''; // Skip if item data not found
        
        return `
          <div class="requirement ${hasEnough ? 'met' : 'unmet'}">
            ${itemData.icon}
            ${req.quantity}
          </div>
        `;
      }).join('');

      recipeItem.innerHTML = `
        <div class="recipe-header">
          ${recipe.icon}
          <h3>${recipe.name}</h3>
        </div>
        <div class="recipe-description">${recipe.description}</div>
        <div class="recipe-requirements">
          ${requirements}
        </div>
        <button class="craft-button" ${!canCraft ? 'disabled' : ''}>
          Craft
        </button>
      `;
      
      recipeItem.querySelector('.craft-button').addEventListener('click', () => {
        if (canCraft) {
          this.craft(key);
          this.updateUI();
        }
      });
      
      this.recipeList.appendChild(recipeItem);
    });
  }

  getPlayerResources() {
    const resources = [];
    const counted = new Set();
    
    this.inventory.slots.forEach((item, index) => {
      if (item && !counted.has(item.name)) {
        counted.add(item.name);
        resources.push({
          item,
          quantity: this.inventory.getItemCount(item.name)
        });
      }
    });
    
    return resources;
  }

  canCraft(recipeKey) {
    const recipe = this.recipes[recipeKey];
    if (!recipe) return false;

    return recipe.requires.every(({ item, quantity }) => {
      const itemCount = this.inventory.getItemCount(item);
      return itemCount >= quantity;
    });
  }

  craft(recipeKey) {
    if (!this.canCraft(recipeKey)) return false;
    
    const recipe = this.recipes[recipeKey];
    
    // Remove required items
    recipe.requires.forEach(({ item, quantity }) => {
      for (let i = 0; i < quantity; i++) {
        const index = this.inventory.slots.findIndex(
          slot => slot?.name.toLowerCase() === item.toLowerCase()
        );
        if (index !== -1) {
          this.inventory.removeItem(index);
        }
      }
    });

    // Add crafted item
    const outputItem = ITEMS[recipe.output.item.toLowerCase()];
    if (outputItem) {
      this.inventory.addItem(outputItem);
      return true;
    }
    
    return false;
  }
}