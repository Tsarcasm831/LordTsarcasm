// game.js (Corrected / Comprehensive)

import { Player } from './player.js';
import { World } from './world.js';
import { Inventory } from './inventory.js';
import { TimeSystem } from './timeSystem.js';
import { CraftingSystem } from './crafting.js';
import { NPC } from './npc.js';
import { Rat } from './neutral_animal_rat.js';
import { Radroach } from './neutral_animal_radroach.js';
import { QuestSystem } from './quests.js';
import { HealthSystem } from './health.js';
import { ITEMS } from './items.js';
import { LootableContainer } from './world_objects/container_lootable_small.js';
import { Enemy } from './enemy.js';
import { WoodenWall } from './world_objects/wooden_wall.js';
import { BrokenCar } from './world_objects/broken_car.js';
import { House } from './world_objects/house.js';
import { HouseInterior } from './world_objects/house_interior.js';
import { Rock } from './world_objects/rock.js';
import { CopperOre } from './world_objects/mineable_ore_copper.js';
import { IronOre } from './world_objects/mineable_ore_iron.js';
import { TinOre } from './world_objects/mineable_ore_tin.js';
import { PineTree } from './world_objects/tree_pine.js';
import { FirTree } from './world_objects/tree_fir.js';
import { DeadTree } from './world_objects/tree_dead.js';
import { MapleTree } from './world_objects/tree_maple.js';
import { EquippedGear } from './equipped_gear.js';
import { InventoryView } from './inventory_view.js';

const PLAY_AREA_WIDTH = 10240;
const PLAY_AREA_HEIGHT = 7680;

let game;

export class Game {
  setupHoverEvents() {
    console.log('Setting up hover events');
    
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = (e.clientX - rect.left) * (this.canvas.width / rect.width) + this.camera.x;
      const worldY = (e.clientY - rect.top) * (this.canvas.height / rect.height) + this.camera.y;

      console.log('Mouse position:', {
        clientX: e.clientX,
        clientY: e.clientY,
        worldX,
        worldY
      });

      const hoveredObject = this.world.objects.find(obj => {
        if (obj instanceof PineTree || 
            obj instanceof FirTree || 
            obj instanceof MapleTree || 
            obj instanceof DeadTree ||
            obj instanceof Rock || 
            obj instanceof CopperOre || 
            obj instanceof IronOre || 
            obj instanceof TinOre ||
            obj instanceof Rat ||
            obj instanceof Radroach) {
          const halfWidth = obj.width / 2;
          const halfHeight = obj.height / 2;
          const isHovered = worldX >= obj.x - halfWidth && 
                          worldX <= obj.x + halfWidth && 
                          worldY >= obj.y - halfHeight && 
                          worldY <= obj.y + halfHeight;
          
          if (isHovered) {
            console.log('Hovering over:', obj);
          }
          return isHovered;
        }
        return false;
      });

      if (hoveredObject !== this.hoveredObject) {
        console.log('Hovered object changed:', hoveredObject);
        this.hoveredObject = hoveredObject;
        this.updateObjectTooltip(e.clientX, e.clientY);
      } else if (hoveredObject) {
        // Update tooltip position even if the hovered object hasn't changed
        this.updateObjectTooltip(e.clientX, e.clientY);
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      console.log('Mouse left canvas');
      this.hoveredObject = null;
      this.updateObjectTooltip();
    });
  }

  constructor() {
    game = this;
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.handleResize();

    // Initialize tooltip element
    this.tooltip = document.getElementById('item-tooltip');
    if (!this.tooltip) {
      console.error('Tooltip element not found!');
    }

    // Main world & player
    this.world = new World(32, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
    this.player = new Player(5120, 3840, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);

    // Inventory, gear, UI
    this.inventory = new Inventory(this);
    this.equippedGear = new EquippedGear(this.inventory, this);
    this.inventoryView = new InventoryView(this.inventory, this.equippedGear);

    // Time, crafting, quests, health
    this.timeSystem = new TimeSystem();
    this.craftingSystem = new CraftingSystem(this.inventory);
    this.questSystem = new QuestSystem();
    this.healthSystem = new HealthSystem();

    this.interactionCooldown = 0;

    // Camera object
    this.camera = {
      x: 0,
      y: 0,
      width: this.canvas.width,
      height: this.canvas.height
    };

    this.setupHoverEvents();

    // We say the player 'owns' a house so rest is allowed
    this.playerHouse = true;

    // Create a single HouseInterior instance for the overlay
    this.houseInterior = new HouseInterior();

    // Example NPC & rats
    this.npc = new NPC(this.player.x + 200, this.player.y + 100);
    this.rat = new Rat(this.player.x + 150, this.player.y + 80);
    this.radroach = new Radroach(this.player.x - 150, this.player.y + 120);
    
    // Add creatures to world objects
    this.world.objects.push(this.rat);
    this.world.objects.push(this.radroach);

    // Setup
    this.lastTime = 0;
    this.setupEventListeners();
    this.setupNPCEvents();
    this.setupTreeGathering();
    this.setupQuestUI();
    this.setupDeathHandling();
    this.spawnEnemies();
    
    // Icon cache for items
    this.iconCache = new Map();
    this.cacheAllIcons();

    // Start the game loop
    this.gameLoop();
  }

  handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.camera) {
      this.camera.width = this.canvas.width;
      this.camera.height = this.canvas.height;
    }
  }

  setupEventListeners() {
    // Resize
    window.addEventListener('resize', () => this.handleResize());

    // Movement & interaction keys
    window.addEventListener('keydown', (e) => {
      // Space => handleInteraction
      if (e.code === 'Space' && this.interactionCooldown <= 0) {
        this.handleInteraction();
        this.interactionCooldown = 0.5;
        e.preventDefault();
      }
      // I => inventory
      if (e.code === 'KeyI') {
        this.toggleInventory();
        e.preventDefault();
      }
      // C => crafting
      if (e.code === 'KeyC') {
        this.toggleCrafting();
        e.preventDefault();
      }
      // Q => quest log
      if (e.code === 'KeyQ') {
        this.toggleQuestLog();
        e.preventDefault();
      }
      // P => show gear
      if (e.code === 'KeyP') {
        this.equippedGear.toggle();
        e.preventDefault();
      }
      // O => show combined inventory view
      if (e.code === 'KeyO') {
        this.inventoryView.toggle();
        e.preventDefault();
      }

      // Player movement
      this.player.handleKeyDown(e);
    });
    window.addEventListener('keyup', (e) => {
      this.player.handleKeyUp(e);
    });

    // Close button on house interior overlay
    document.querySelector('#house-interior-overlay .close-btn')
      .addEventListener('click', () => {
        document.getElementById('house-interior-overlay').classList.remove('active');
      });

    // Rest button
    document.getElementById('rest-button').addEventListener('click', () => this.restPlayer());

    // Category filters (inventory)
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.inventory.updateCategoryFilter(btn.dataset.category);
      });
    });

    // Initialize crafting UI if needed
    this.initializeCraftingUI();

    // Container events (currently empty in your code)
    this.setupContainerEvents();

    // Generic modal close behavior
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target.closest('.modal-content')) return;
        modal.classList.remove('active');
      });
      const modalContent = modal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.addEventListener('click', (e) => {
          if (e.target.classList.contains('close-btn')) {
            modal.classList.remove('active');
          }
        });
      }
    });

    // Main canvas click: check house door, enemy, container, etc.
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + this.camera.x;
      const worldY = e.clientY - rect.top + this.camera.y;

      // Debug output
      console.log('Click detected:', {
        clientX: e.clientX,
        clientY: e.clientY,
        worldX,
        worldY,
        cameraX: this.camera.x,
        cameraY: this.camera.y
      });

      // 1) Check if user clicked on a house door bounding box
      const houses = this.world.objects.filter(obj => obj instanceof House);
      console.log('Houses found:', houses.length);

      const houseClicked = houses.find(obj => obj.checkDoorClick(worldX, worldY));
      if (houseClicked) {
        console.log('Door clicked! Showing house interior...');
        const overlay = document.getElementById('house-interior-overlay');
        if (!overlay) {
          console.error('House interior overlay element not found!');
          return;
        }

        const canvas = document.getElementById('house-interior-canvas');
        if (!canvas) {
          console.error('House interior canvas element not found!');
          return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Failed to get house interior canvas context!');
          return;
        }

        // Set up canvas and show overlay
        canvas.width = 600;
        canvas.height = 400;
        this.houseInterior.render(ctx);
        overlay.classList.add('active');
        return; // Prevent other click handlers from firing
      }

      // 2) Check for enemy
      const enemy = this.world.objects.find(
        obj => obj instanceof Enemy && obj.checkClick(worldX, worldY)
      );
      if (enemy) {
        enemy.takeDamage(1);
        this.createBloodSplat(enemy.x, enemy.y);
      }

      // 3) Check for container
      const container = this.world.objects.find(
        obj => (obj instanceof LootableContainer || obj instanceof BrokenCar) &&
               obj.checkClick(worldX, worldY)
      );
      if (container) {
        this.showContainerLoot(container);
      }
    });

    this.setupOreGathering();
  }

  setupContainerEvents() {
    // optional or empty
  }

  setupNPCEvents() {
    // NPC, Rat, Radroach
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + this.camera.x;
      const worldY = e.clientY - rect.top + this.camera.y;

      if (this.npc.checkClick(worldX, worldY)) {
        this.showNPCDialog();
      } else if (this.rat.checkClick(worldX, worldY)) {
        this.showRatDialog();
      } else if (this.radroach.checkClick(worldX, worldY)) {
        this.radroach.startCombat();
      }
    });
  }

  setupQuestUI() {
    // Quest log setup
    const questContainer = document.querySelector('.quest-entries');
    this.questSystem.activeQuests.forEach(quest => {
      const questElement = document.createElement('div');
      questElement.className = 'quest-entry';
      questElement.innerHTML = `
        <h4>${quest.title}</h4>
        <div>${quest.description}</div>
        <div class="quest-progress">
          <div class="quest-progress-bar" style="width: ${this.calculateQuestProgress(quest)}%"></div>
        </div>
      `;
      questContainer.appendChild(questElement);
    });
  }

  calculateQuestProgress(quest) {
    const totalRequired = Object.values(quest.required).reduce((a, b) => a + b, 0);
    const totalProgress = Object.values(quest.progress).reduce((a, b) => a + b, 0);
    return (totalProgress / totalRequired) * 100;
  }

  updateQuestUI() {
    const questElements = document.querySelectorAll('.quest-entry');
    questElements.forEach((element, index) => {
      const quest = this.questSystem.activeQuests[index];
      const progressBar = element.querySelector('.quest-progress-bar');
      if (progressBar) {
        progressBar.style.width = `${this.calculateQuestProgress(quest)}%`;
      }
      element.querySelector('h4').style.color = quest.completed ? '#71aa34' : 'white';
    });
  }

  toggleQuestLog() {
    const questLog = document.getElementById('quest-log');
    questLog.classList.toggle('active');
  }

  initializeCraftingUI() {
    // your custom logic if needed
  }

  toggleCrafting() {
    const craftingMenu = document.getElementById('crafting-menu');
    craftingMenu.classList.toggle('active');
    if (craftingMenu.classList.contains('active')) {
      this.craftingSystem.updateUI();
    }
  }

  updateCraftingUI() {
    this.craftingSystem.updateUI();
  }

  toggleInventory() {
    const modal = document.getElementById('inventory-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
      this.inventory.updateStats();
    }
  }

  showContainerLoot(container) {
    const lootModal = document.getElementById('loot-modal');
    const slots = lootModal.querySelector('.loot-slots');
    slots.innerHTML = '';
    container.isOpen = true;

    container.contents.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.className = 'loot-slot';
      slot.innerHTML = item.icon;
      slot.addEventListener('click', () => {
        if (this.inventory.addItem(item)) {
          container.contents.splice(index, 1);
          this.showContainerLoot(container);
          if (container.contents.length === 0) {
            this.world.objects = this.world.objects.filter(c => c !== container);
            lootModal.classList.remove('active');
          }
        }
      });
      slots.appendChild(slot);
    });
    lootModal.classList.add('active');
  }

  // Main E/Space interaction:
  handleInteraction() {
    const interactionPos = this.getInteractionPosition();

    // 1) Ores / Rocks
    const ironOre = this.world.objects.find(obj =>
      obj instanceof IronOre && obj.checkClick(interactionPos.x, interactionPos.y)
    );
    if (ironOre) {
      ironOre.startMining();
      if (ironOre.progress >= 100) {
        if (this.inventory.addItem(ITEMS.iron_ore)) {
          this.showMessage('Mined iron ore!');
          this.world.objects = this.world.objects.filter(o => o !== ironOre);
        }
      } else {
        this.showMessage(`Mining iron... ${ironOre.progress}%`);
      }
      return;
    }

    const copperOre = this.world.objects.find(obj =>
      obj instanceof CopperOre && obj.checkClick(interactionPos.x, interactionPos.y)
    );
    if (copperOre) {
      copperOre.startMining();
      if (copperOre.progress >= 100) {
        if (this.inventory.addItem(ITEMS.copper)) {
          this.showMessage('Mined copper ore!');
          this.world.objects = this.world.objects.filter(o => o !== copperOre);
        }
      } else {
        this.showMessage(`Mining copper... ${copperOre.progress}%`);
      }
      return;
    }

    const tinOre = this.world.objects.find(obj =>
      obj instanceof TinOre && obj.checkClick(interactionPos.x, interactionPos.y)
    );
    if (tinOre) {
      tinOre.startMining();
      if (tinOre.progress >= 100) {
        if (this.inventory.addItem(ITEMS.tin_ore)) {
          this.showMessage('Mined tin ore!');
          this.world.objects = this.world.objects.filter(o => o !== tinOre);
        }
      } else {
        this.showMessage(`Mining tin... ${tinOre.progress}%`);
      }
      return;
    }

    const rock = this.world.objects.find(obj =>
      obj instanceof Rock && obj.checkClick(interactionPos.x, interactionPos.y)
    );
    if (rock) {
      rock.startMining();
      if (rock.progress >= 100) {
        if (this.inventory.addItem(ITEMS.stone)) {
          this.updateQuestProgress('stone', 1);
          this.showMessage('Mined stone!');
          this.world.objects = this.world.objects.filter(r => r !== rock);
        }
      } else {
        this.showMessage(`Mining... ${rock.progress}%`);
      }
      return;
    }

    // 2) Tilling grass
    const tileX = Math.floor(interactionPos.x / this.world.tileSize);
    const tileY = Math.floor(interactionPos.y / this.world.tileSize);
    if (this.world.tiles[tileY]?.[tileX] === 'grass') {
      this.world.updateTile(tileX, tileY, 'dirt');
      this.showMessage('Tilled soil!');
      this.updateEnergy(-10);
    }

    // 3) Trees or other objects
    const interactedObject = this.world.objects.find(obj => {
      if (
        obj instanceof PineTree ||
        obj instanceof FirTree ||
        obj instanceof MapleTree ||
        obj instanceof DeadTree
      ) {
        return obj.checkClick(interactionPos.x, interactionPos.y);
      }
      // fallback bounding check
      return (
        Math.abs(obj.x - interactionPos.x) < 40 &&
        Math.abs(obj.y - interactionPos.y) < 40
      );
    });
    if (interactedObject) {
      // Deplete its health
      interactedObject.health--;
      if (interactedObject.health <= 0) {
        // if tree => wood, else => stone, etc.
        const item = (
          interactedObject.type === 'tree' ||
          interactedObject instanceof PineTree ||
          interactedObject instanceof FirTree ||
          interactedObject instanceof MapleTree
        ) ? 'wood' : 'stone';
        if (this.inventory.addItem(ITEMS[item])) {
          this.updateQuestProgress(item, 1);
          this.showMessage(`Got ${item}!`);
        }
        this.world.objects = this.world.objects.filter(o => o !== interactedObject);
      }
    }
  }

  getInteractionPosition() {
    // small offset in front of the player
    const offset = 20;
    return {
      x: this.player.x + this.player.width / 2 + (
        this.player.direction === 'left' ? -offset :
        this.player.direction === 'right' ? offset : 0
      ),
      y: this.player.y + this.player.height / 2 + (
        this.player.direction === 'up' ? -offset :
        this.player.direction === 'down' ? offset : 0
      )
    };
  }

  // Message popups
  showMessage(text) {
    const messageElement = document.getElementById('interaction-message');
    if (!messageElement) return;

    if (typeof text === 'object') {
      // Format object into HTML
      messageElement.innerHTML = `
        <div style="text-align: center;">
          <div style="margin-bottom: 5px;">${text.title}</div>
          <div style="font-size: 10px; color: #aaa;">Type: ${text.type}</div>
          <div style="font-size: 10px; color: ${text.health > 2 ? '#90EE90' : '#FFB6C1'}">
            Health: ${text.health}
          </div>
          <div style="font-size: 10px; margin-top: 5px;">${text.description}</div>
        </div>
      `;
    } else {
      messageElement.textContent = text;
    }
    
    messageElement.style.opacity = '1';
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      messageElement.style.opacity = '0';
    }, 2000);
  }

  updateEnergy(amount) {
    const energyElement = document.getElementById('energy-value');
    let energy = parseInt(energyElement.textContent) + amount;
    energy = Math.max(0, Math.min(100, energy));
    energyElement.textContent = energy;
    
    if (energy <= 0) {
      this.showMessage('Too tired... need to sleep!');
    }
  }

  restPlayer() {
    // Example of spending gold to rest
    const goldElement = document.getElementById('gold-value');
    if (!goldElement) return; // if gold-value doesn't exist

    const currentGold = parseInt(goldElement.textContent) || 0;
    if (this.playerHouse && currentGold >= 50) {
      // Advance time
      this.timeSystem.minutes = 360;
      // Refill energy
      document.getElementById('energy-value').textContent = 100;
      // Subtract gold
      goldElement.textContent = currentGold - 50;
      this.showMessage('Restored energy!');
    }
  }

  // NPC Dialogue
  showNPCDialog() {
    const dialog = document.getElementById('npc-dialog');
    const textElement = dialog.querySelector('.dialog-text');
    this.npc.dialogIndex = 0;
    textElement.innerHTML = this.npc.dialogs[0];
    dialog.classList.add('active');

    const nextBtn = dialog.querySelector('.next-btn');
    if (nextBtn) {
      nextBtn.onclick = () => {
        this.npc.dialogIndex++;
        if (this.npc.dialogIndex >= this.npc.dialogs.length) {
          dialog.classList.remove('active');
          return;
        }
        textElement.innerHTML = this.npc.dialogs[this.npc.dialogIndex];
      };
    }
  }

  showRatDialog() {
    if (this.rat) {
      this.rat.startCombat();
    }
  }

  updateQuestProgress(item, quantity) {
    this.questSystem.updateProgress(item, quantity);
    this.updateQuestUI();
  }

  spawnEnemies() {
    // Basic example
    for (let i = 0; i < 8; i++) {
      this.world.objects.push(new Enemy(
        this.player.x + Math.cos(Math.PI * 2 * i / 8) * 400 + Math.random() * 200,
        this.player.y + Math.sin(Math.PI * 2 * i / 8) * 400 + Math.random() * 200
      ));
    }
  }

  // Combat SFX
  createBloodSplat(x, y) {
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle blood';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = `rgba(138,3,3,${0.8 - Math.random() * 0.3})`;
      particle.style.width = particle.style.height = `${Math.random() * 8 + 4}px`;
      particle.style.borderRadius = '50%';
      particle.style.transform = `translate(
        ${Math.random() * 40 - 20}px,
        ${Math.random() * 40 - 20}px
      )`;
      document.getElementById('particle-container').appendChild(particle);
      
      setTimeout(() => particle.remove(), 1000);
    }
  }

  // Main update
  update(deltaTime) {
    this.player.update(deltaTime);
    this.timeSystem.update(deltaTime);
    this.world.update(deltaTime);
    this.npc.update(deltaTime);
    this.rat.update(deltaTime);
    this.radroach.update(deltaTime);

    this.updateCamera();
    this.handleWallCollisions();

    if (this.interactionCooldown > 0) {
      this.interactionCooldown -= deltaTime;
    }

    // If the interior overlay is open, we update houseInterior
    const overlay = document.getElementById('house-interior-overlay');
    if (overlay && overlay.classList.contains('active')) {
      const interiorCanvas = document.getElementById('houseInteriorCanvas');
      if (interiorCanvas) {
        const ictx = interiorCanvas.getContext('2d');
        if (ictx) {
          this.houseInterior.update(deltaTime);
        }
      }
    }
  }

  updateCamera() {
    const targetX = this.player.x + this.player.width / 2 - this.camera.width / 2;
    const targetY = this.player.y + this.player.height / 2 - this.camera.height / 2;

    // smooth camera movement
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.camera.y) * 0.1;

    // clamp
    this.camera.x = Math.max(0, Math.min(PLAY_AREA_WIDTH - this.camera.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(PLAY_AREA_HEIGHT - this.camera.height, this.camera.y));
  }

  handleWallCollisions() {
    const collidableObjects = this.world.objects.filter(
      obj => obj instanceof WoodenWall || obj instanceof House
    );
    collidableObjects.forEach(obj => {
      if (obj.checkCollision(this.player.x, this.player.y, this.player.width, this.player.height)) {
        const dx = (this.player.x + this.player.width / 2) - obj.x;
        const dy = (this.player.y + this.player.height / 2) - obj.y;
        const combinedHalfWidths = (this.player.width + obj.width) / 2;
        const combinedHalfHeights = (this.player.height + obj.height) / 2;

        if (Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfHeights) {
          const overlapX = combinedHalfWidths - Math.abs(dx);
          const overlapY = combinedHalfHeights - Math.abs(dy);
          if (overlapX >= overlapY) {
            this.player.y += dy > 0 ? overlapY : -overlapY;
          } else {
            this.player.x += dx > 0 ? overlapX : -overlapX;
          }
        }
      }
    });
  }

  // Main render
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1) Draw world behind
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);
    this.world.render(this.ctx);
    this.player.render(this.ctx);
    this.npc.render(this.ctx);
    this.rat.render(this.ctx);
    this.radroach.render(this.ctx);
    this.ctx.restore();

    // 2) Day/Night overlay
    const tint = this.timeSystem.getDayNightTint();
    const playerX = this.player.x - this.camera.x + this.player.width / 2;
    const playerY = this.player.y - this.camera.y + this.player.height / 2;
    const gradient = this.ctx.createRadialGradient(
      playerX, playerY, 0,
      playerX, playerY, tint.radius
    );
    gradient.addColorStop(0, `rgba(0,0,0,${tint.darkness * 0.3})`);
    gradient.addColorStop(1, `rgba(0,0,0,${tint.darkness})`);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = `hsla(220, 50%, ${tint.lightness}%, ${tint.alpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 3) Minimap & hotbar
    this.drawMinimap();
    this.renderHotbar();

    // 4) If overlay is active, draw interior on second canvas
    const overlay = document.getElementById('house-interior-overlay');
    if (overlay && overlay.classList.contains('active')) {
      const interiorCanvas = document.getElementById('houseInteriorCanvas');
      if (interiorCanvas) {
        const ictx = interiorCanvas.getContext('2d');
        if (ictx) {
          this.houseInterior.render(ictx);
        }
      }
    }
  }

  renderHotbar() {
    const ctx = this.ctx;
    const slotSize = 50;
    const padding = 8;
    const totalWidth = (slotSize + padding) * 12 - padding;
    const startX = (this.canvas.width - totalWidth) / 2;
    const yPos = this.canvas.height - slotSize - 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(startX - 10, yPos - 10, totalWidth + 20, slotSize + 20, 8);
    ctx.fill();

    for (let i = 0; i < 12; i++) {
      const x = startX + i * (slotSize + padding);
      const isSelected = i === this.inventory.selectedSlot;
      const item = this.inventory.slots[i];
      const quantity = this.inventory.stackQuantities[i];

      // Slot background
      ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
      ctx.beginPath();
      ctx.roundRect(x, yPos, slotSize, slotSize, 4);
      ctx.fill();

      // Slot border
      ctx.strokeStyle = isSelected ? '#deb887' : '#5a432c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, yPos, slotSize, slotSize, 4);
      ctx.stroke();

      // Draw item icon + quantity
      if (item) {
        const iconCanvas = this.iconCache.get(item.name);
        if (iconCanvas) {
          ctx.drawImage(iconCanvas, x + 8, yPos + 8, 34, 34);
        }
        if (item.stackable) {
          ctx.fillStyle = 'rgba(0,0,0,0.8)';
          ctx.beginPath();
          ctx.roundRect(x + slotSize - 20, yPos + slotSize - 20, 20, 20, 3);
          ctx.fill();
          
          ctx.fillStyle = 'white';
          ctx.font = '12px \"Press Start 2P\"';
          ctx.textAlign = 'center';
          ctx.fillText(quantity, x + slotSize - 10, yPos + slotSize - 7);
        }
      }
    }
  }

  drawMinimap() {
    const minimap = document.getElementById('minimap');
    const ctx = minimap.getContext('2d');
    
    minimap.width = 200;
    minimap.height = 150;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, minimap.width, minimap.height);

    ctx.drawImage(
      this.world.minimapCanvas,
      0, 0, this.world.minimapCanvas.width, this.world.minimapCanvas.height,
      0, 0, minimap.width, minimap.height
    );

    const scaleX = minimap.width / this.world.tileSize;
    const scaleY = minimap.height / this.world.tileSize;

    // Player dot
    ctx.fillStyle = '#ff5555';
    ctx.fillRect(
      this.player.x * scaleX - 2,
      this.player.y * scaleY - 2,
      4, 4
    );

    // Camera box
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(
      this.camera.x * scaleX,
      this.camera.y * scaleY,
      this.camera.width * scaleX,
      this.camera.height * scaleY
    );
  }

  setupDeathHandling() {
    this.healthSystem.deathEvent.addEventListener('death', () => {
      this.showDeathScreen();
    });
  }

  showDeathScreen() {
    const deathModal = document.getElementById('death-modal');
    deathModal.classList.add('active');
    const resetBtn = document.getElementById('reset-button');
    if (resetBtn) {
      resetBtn.onclick = () => {
        window.location.reload();
      };
    }
  }

  setupTreeGathering() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + this.camera.x;
      const worldY = e.clientY - rect.top + this.camera.y;

      // Find a clicked tree
      const clickedTree = this.world.objects.find(obj =>
        (obj instanceof PineTree ||
         obj instanceof FirTree ||
         obj instanceof MapleTree ||
         obj instanceof DeadTree) &&
        obj.checkClick(worldX, worldY)
      );
      if (clickedTree) {
        const hasAxe = this.inventory.slots.some(item => item?.name === 'Axe');
        if (hasAxe) {
          clickedTree.health--;
          this.createGatheringEffect(clickedTree.x, clickedTree.y);
          if (clickedTree.health <= 0) {
            const woodQty = (clickedTree instanceof DeadTree) ? 2 : 1;
            for (let i = 0; i < woodQty; i++) {
              if (this.inventory.addItem(ITEMS.wood)) {
                this.updateQuestProgress('wood', 1);
              }
            }
            this.world.objects = this.world.objects.filter(obj => obj !== clickedTree);
            this.showMessage('Gathered wood from tree!');
          } else {
            const pct = ((1 - clickedTree.health / clickedTree.maxHealth) * 100).toFixed(0);
            this.showMessage(`Chopping tree... ${pct}%`);
          }
        } else {
          this.showMessage('Need an axe to chop trees!');
        }
      }
    });
  }

  createGatheringEffect(x, y) {
    // wood chip effect
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${x - this.camera.x}px`;
      particle.style.top = `${y - this.camera.y}px`;
      particle.style.background = '#8B4513';
      particle.style.width = particle.style.height = `${Math.random() * 4 + 2}px`;
      particle.style.transform = `translate(
        ${Math.random() * 40 - 20}px,
        ${Math.random() * 40 - 20}px
      )`;
      document.getElementById('particle-container').appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  }

  setupOreGathering() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + this.camera.x;
      const worldY = e.clientY - rect.top + this.camera.y;

      // check ore
      const clickedOre = this.world.objects.find(obj =>
        (obj instanceof CopperOre ||
         obj instanceof IronOre ||
         obj instanceof TinOre) &&
        obj.checkClick(worldX, worldY)
      );
      if (clickedOre) {
        // assume we have pickaxe
        if (clickedOre.startMining()) {
          const oreType = (
            clickedOre instanceof CopperOre ? 'copper' :
            clickedOre instanceof IronOre   ? 'iron_ore' :
                                              'tin_ore'
          );
          if (this.inventory.addItem(ITEMS[oreType])) {
            this.createMiningEffect(clickedOre.x, clickedOre.y);
          }
          this.world.objects = this.world.objects.filter(obj => obj !== clickedOre);
          this.showMessage(`Mined ${oreType.replace('_', ' ')}!`);
        } else {
          this.showMessage(`Mining... ${clickedOre.progress.toFixed(0)}%`);
        }
      }
    });
  }

  createMiningEffect(x, y) {
    // ore particle effect
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${x - this.camera.x}px`;
      particle.style.top = `${y - this.camera.y}px`;
      particle.style.background = '#808080';
      particle.style.width = particle.style.height = `${Math.random() * 4 + 2}px`;
      particle.style.transform = `translate(
        ${Math.random() * 40 - 20}px,
        ${Math.random() * 40 - 20}px
      )`;
      document.getElementById('particle-container').appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  }

  updateObjectTooltip(clientX, clientY) {
    console.log('Updating tooltip:', {
      hoveredObject: this.hoveredObject,
      clientX,
      clientY
    });

    const tooltip = document.getElementById('item-tooltip');
    if (!tooltip) {
      console.error('Tooltip element not found in updateObjectTooltip!');
      return;
    }

    if (!this.hoveredObject) {
      tooltip.style.opacity = '0';
      return;
    }

    const tooltipContent = this.hoveredObject.getTooltipContent();
    console.log('Tooltip content:', tooltipContent);

    if (!tooltipContent) {
      console.warn('No tooltip content returned from object');
      tooltip.style.opacity = '0';
      return;
    }

    tooltip.innerHTML = `
      <div class="tooltip-header">
        ${tooltipContent.icon || ''}
        <h4>${tooltipContent.title}</h4>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-type">${tooltipContent.type}</div>
        ${tooltipContent.health ? `<div class="tooltip-health">Health: ${tooltipContent.health}</div>` : ''}
        <div class="tooltip-desc">${tooltipContent.description}</div>
        ${tooltipContent.extraInfo ? `<div class="tooltip-extra">${tooltipContent.extraInfo}</div>` : ''}
      </div>
    `;

    // Position tooltip
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = clientX + 15;
    let top = clientY + 15;

    // Keep tooltip within viewport
    if (left + tooltipRect.width > viewportWidth) {
      left = clientX - tooltipRect.width - 15;
    }
    if (top + tooltipRect.height > viewportHeight) {
      top = clientY - tooltipRect.height - 15;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.opacity = '1';
    console.log('Tooltip positioned at:', { left, top });
  }

  // Item icon caching
  cacheAllIcons() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 34;
    tempCanvas.height = 34;
    const tempCtx = tempCanvas.getContext('2d');

    Object.values(ITEMS).forEach(item => {
      const img = new Image();
      const svg = new Blob([item.icon], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svg);
      img.onload = () => {
        tempCtx.clearRect(0, 0, 34, 34);
        tempCtx.drawImage(img, 0, 0, 34, 34);
        const iconCanvas = document.createElement('canvas');
        iconCanvas.width = 34;
        iconCanvas.height = 34;
        const iconCtx = iconCanvas.getContext('2d');
        iconCtx.drawImage(img, 0, 0, 34, 34);
        this.iconCache.set(item.name, iconCanvas);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  }

  // Main game loop
  gameLoop(currentTime = 0) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Create the game instance
window.addEventListener('DOMContentLoaded', () => {
  console.log('Creating game instance');
  new Game();
});
