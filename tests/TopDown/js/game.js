/*************************************************************
 * game.js (Mirror-On-Demand Rewrite)
 *
 * This version DOES NOT mirror the 4D world every frame.
 * Instead, you must manually call `syncWorld4D()` whenever
 * you want to clone or mirror the main world into the 4D world.
 *************************************************************/

// Core imports
import { Player } from './player.js';
import { World } from './chunk.js';
import { World4D } from './chunk4d1.js';  // The 4D world
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
import { MapleTree } from './world_objects/tree_maple.js';
import { DeadTree } from './world_objects/tree_dead.js';
import { EquippedGear } from './equipped_gear.js';
import { InventoryView } from './inventory_view.js';
import { OverworldMap } from './world_objects/large_map.js';
import { CollisionSystem } from './collision.js';

// Some constants for the main play area
const PLAY_AREA_WIDTH = 10240;
const PLAY_AREA_HEIGHT = 7680;

// A global-ish reference if needed
let game;

/**
 * The main Game class sets up our:
 * - Canvas & rendering
 * - Worlds (2D / 4D)
 * - Player, NPCs, and creatures
 * - UI systems (inventory, quest log, crafting)
 * - Event listeners & interactions
 * - Main game loop (update & render)
 */
export class Game {
  constructor() {
    // Keep a global reference if you need it
    game = this;
    
    // Get our main HTML canvas & context
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // We also create an offscreen canvas for double-buffering to reduce flicker
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');

    // Basic frame-timing variables
    this.lastTime = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.currentFps = 0;
    this.targetFps = 60;
    this.frameInterval = 1000 / this.targetFps;
    this.accumulatedTime = 0;

    // Call handleResize() now to match window dimensions
    this.handleResize();

    // Grab a reference to any tooltip element in the DOM
    this.tooltip = document.getElementById('item-tooltip');
    if (!this.tooltip) {
      console.error('Tooltip element not found! Make sure you have an element with id="item-tooltip".');
    }

    /************************************************************
     * Worlds & Player
     * - We create the main World and the parallel "4D" World.
     * - The 4D world will NOT automatically mirror each frame;
     *   you must call `syncWorld4D()` yourself to clone updates.
     ************************************************************/
    this.world = new World(32, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
    this.world4D = new World4D(32, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);

    this.player = new Player(5120, 3840, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
    this.overworldMap = new OverworldMap(this.world, this.player);

    /************************************************************
     * House / Interiors
     ************************************************************/
    this.setupHouseOverlayHandling();
    this.playerHouse = true;  // We'll say the player "owns" a house
    this.houseInterior = new HouseInterior();

    /************************************************************
     * Inventory, Gear, and UI
     ************************************************************/
    this.inventory = new Inventory(this);
    this.equippedGear = new EquippedGear(this.inventory, this);
    this.inventoryView = new InventoryView(this.inventory, this.equippedGear);

    /************************************************************
     * Systems: Time, Crafting, Quests, Health
     ************************************************************/
    this.timeSystem = new TimeSystem();
    this.craftingSystem = new CraftingSystem(this.inventory);
    this.questSystem = new QuestSystem();
    this.healthSystem = new HealthSystem();
    this.interactionCooldown = 0;

    /************************************************************
     * Camera Setup
     ************************************************************/
    this.camera = {
      x: 0,
      y: 0,
      width: this.canvas.width,
      height: this.canvas.height
    };
    // Center the camera on the player initially
    this.camera.x = this.player.x + this.player.width / 2 - this.camera.width / 2;
    this.camera.y = this.player.y + this.player.height / 2 - this.camera.height / 2;
    // Clamp camera so it doesn't go outside the map
    this.camera.x = Math.max(0, Math.min(PLAY_AREA_WIDTH - this.camera.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(PLAY_AREA_HEIGHT - this.camera.height, this.camera.y));

    /************************************************************
     * Example NPC / Creatures
     ************************************************************/
    this.npc = new NPC(this.player.x + 200, this.player.y + 100);
    this.rat = new Rat(this.player.x + 150, this.player.y + 80);
    this.radroach = new Radroach(this.player.x - 150, this.player.y + 120);
    // Add creatures to the main world
    this.world.objects.push(this.rat);
    this.world.objects.push(this.radroach);

    /************************************************************
     * Setup event listeners (keyboard, mouse, UI, etc.)
     ************************************************************/
    this.setupHoverEvents();       // For mouse hover tooltips
    this.setupEventListeners();    // Keyboard, containers, etc.
    this.setupNPCEvents();
    this.setupTreeGathering();
    this.setupOreGathering();
    this.setupQuestUI();
    this.setupDeathHandling();

    // Finally, spawn some enemies in the main world
    this.spawnEnemies();

    // For item icon caching
    this.iconCache = new Map();
    this.cacheAllIcons();

    // Start the main game loop
    this.gameLoop();
  }

  /********************************************************************
   * Call this method only when you want to clone the main world
   * into the 4D world. E.g. a button or hotkey calls `syncWorld4D()`.
   ********************************************************************/
  syncWorld4D() {
    // Mirror the main world's data to the 4D world
    this.world4D.mirrorFromMainWorld(this.world);
    // Optionally, update the 4D world immediately if you want
    // it to progress its own state once right now
    // this.world4D.update(0);
  }

  /********************************************************************
   * Handle window resizing
   ********************************************************************/
  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update both main canvas and our offscreen canvas
    this.canvas.width = width;
    this.canvas.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;

    if (this.camera) {
      this.camera.width = width;
      this.camera.height = height;
    }
  }

  /********************************************************************
   * House overlay (exiting the house, etc.)
   ********************************************************************/
  setupHouseOverlayHandling() {
    const overlay = document.getElementById('house-interior-overlay');
    if (!overlay) return;

    const closeBtn = overlay.querySelector('.close-btn');
    if (!closeBtn) return;

    closeBtn.addEventListener('click', () => {
      // If the player is in house, restore them outside
      if (this.player.isInHouse) {
        this.player.x = this.player.worldX;
        this.player.y = this.player.worldY;
        this.player.isInHouse = false;
        this.player.houseInteriorBounds = null;

        // Immediately set camera to correct position
        if (this.camera) {
          this.camera.x = this.player.x + this.player.width / 2 - this.camera.width / 2;
          this.camera.y = this.player.y + this.player.height / 2 - this.camera.height / 2;
          // Clamp
          this.camera.x = Math.max(0, Math.min(PLAY_AREA_WIDTH - this.camera.width, this.camera.x));
          this.camera.y = Math.max(0, Math.min(PLAY_AREA_HEIGHT - this.camera.height, this.camera.y));
        }

        overlay.style.display = 'none';
        overlay.classList.remove('active');
      }
    });
  }

  /********************************************************************
   * Setup event listeners for keyboard, UI, etc.
   ********************************************************************/
  setupEventListeners() {
    // Handle window resizing
    window.addEventListener('resize', () => this.handleResize());

    // Keyboard events for player movement & UI toggles
    window.addEventListener('keydown', (e) => {
      // Space => handleInteraction
      if (e.code === 'Space' && this.interactionCooldown <= 0) {
        this.handleInteraction();
        this.interactionCooldown = 0.5;  // 0.5 seconds cooldown
        e.preventDefault();
      }
      // Inventory
      if (e.code === 'KeyI') {
        this.toggleInventory();
        e.preventDefault();
      }
      // Crafting
      if (e.code === 'KeyC') {
        this.toggleCrafting();
        e.preventDefault();
      }
      // Quest log
      if (e.code === 'KeyQ') {
        this.toggleQuestLog();
        e.preventDefault();
      }
      // Gear
      if (e.code === 'KeyP') {
        this.equippedGear.toggle();
        e.preventDefault();
      }
      // Combined inventory view
      if (e.code === 'KeyO') {
        this.inventoryView.toggle();
        e.preventDefault();
      }

      // Forward movement key to player
      this.player.handleKeyDown(e);
    });

    window.addEventListener('keyup', (e) => {
      this.player.handleKeyUp(e);
    });

    // House interior overlay close button
    const houseOverlayCloseBtn = document.querySelector('#house-interior-overlay .close-btn');
    if (houseOverlayCloseBtn) {
      houseOverlayCloseBtn.addEventListener('click', () => {
        document.getElementById('house-interior-overlay')?.classList.remove('active');
      });
    }

    // Rest button => toggle day/night
    const restBtn = document.getElementById('rest-button');
    if (restBtn) {
      restBtn.addEventListener('click', () => this.restPlayer());
    }

    // Inventory category filters
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.inventory.updateCategoryFilter(btn.dataset.category);
      });
    });

    // Crafting UI initialization
    this.initializeCraftingUI();

    // Container events
    this.setupContainerEvents();

    // Generic modal close
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target.closest('.modal-content')) return;
        modal.classList.remove('active');
      });
      const modalContent = modal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.addEventListener('click', (evt) => {
          if (evt.target.classList.contains('close-btn')) {
            modal.classList.remove('active');
          }
        });
      }
    });

    // Main canvas click => check house door, enemy, container, etc.
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + (this.camera ? this.camera.x : 0);
      const worldY = e.clientY - rect.top + (this.camera ? this.camera.y : 0);

      // 1) Check for house door
      const houses = this.world.objects.filter(obj => obj instanceof House);
      const houseClicked = houses.find(obj => obj.checkDoorClick(worldX, worldY));
      if (houseClicked) {
        this.enterHouse(houseClicked);
        return;
      }

      // 2) Check for enemy
      const enemy = this.world.objects.find(
        obj => obj instanceof Enemy && obj.checkClick(worldX, worldY)
      );
      if (enemy) {
        enemy.takeDamage(1);
        this.createBloodSplat(enemy.x, enemy.y);
        return;
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
  }

  /********************************************************************
   * For house entry logic
   ********************************************************************/
  enterHouse(houseObj) {
    const overlay = document.getElementById('house-interior-overlay');
    if (!overlay) {
      console.error('House interior overlay not found!');
      return;
    }
    const interiorCanvas = document.getElementById('house-interior-canvas');
    if (!interiorCanvas) {
      console.error('House interior canvas not found!');
      return;
    }
    const ctx = interiorCanvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get interior canvas context!');
      return;
    }

    // Show house overlay
    interiorCanvas.width = 600;
    interiorCanvas.height = 400;
    overlay.style.display = 'block';
    overlay.classList.add('active');

    // Move player inside house
    this.player.worldX = this.player.x;
    this.player.worldY = this.player.y;
    this.player.x = interiorCanvas.width / 2;
    this.player.y = interiorCanvas.height - 100;
    this.player.isInHouse = true;
    this.player.houseInteriorBounds = {
      width: interiorCanvas.width,
      height: interiorCanvas.height
    };

    // Render once
    ctx.clearRect(0, 0, interiorCanvas.width, interiorCanvas.height);
    this.houseInterior.render(ctx);
    this.player.render(ctx);
  }

  /********************************************************************
   * Container event setup (currently empty in your code)
   ********************************************************************/
  setupContainerEvents() {
    // If you need to attach extra container-related logic or listeners
    // you can do that here.
  }

  /********************************************************************
   * NPC event setup
   ********************************************************************/
  setupNPCEvents() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + (this.camera ? this.camera.x : 0);
      const worldY = e.clientY - rect.top + (this.camera ? this.camera.y : 0);

      if (this.npc && this.npc.checkClick(worldX, worldY)) {
        this.showNPCDialog();
      } else if (this.rat && this.rat.checkClick(worldX, worldY)) {
        this.showRatDialog();
      } else if (this.radroach && this.radroach.checkClick(worldX, worldY)) {
        this.radroach.startCombat();
      }
    });
  }

  /********************************************************************
   * Basic quest log UI setup
   ********************************************************************/
  setupQuestUI() {
    const questContainer = document.querySelector('.quest-entries');
    if (!questContainer) return;

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
      // If quest is completed, color it green
      element.querySelector('h4').style.color = quest.completed ? '#71aa34' : 'white';
    });
  }

  toggleQuestLog() {
    const questLog = document.getElementById('quest-log');
    if (!questLog) return;
    questLog.classList.toggle('active');
  }

  /********************************************************************
   * Crafting UI initialization
   ********************************************************************/
  initializeCraftingUI() {
    // If you have special logic to init the crafting panel, do it here.
  }

  toggleCrafting() {
    const craftingMenu = document.getElementById('crafting-menu');
    if (!craftingMenu) return;
    craftingMenu.classList.toggle('active');
    if (craftingMenu.classList.contains('active')) {
      this.craftingSystem.updateUI();
    }
  }

  updateCraftingUI() {
    this.craftingSystem.updateUI();
  }

  /********************************************************************
   * Inventory UI toggling
   ********************************************************************/
  toggleInventory() {
    const modal = document.getElementById('inventory-modal');
    if (!modal) return;
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
      this.inventory.updateStats();
    }
  }

  /********************************************************************
   * Container Loot UI
   ********************************************************************/
  showContainerLoot(container) {
    const lootModal = document.getElementById('loot-modal');
    if (!lootModal) return;
    const slots = lootModal.querySelector('.loot-slots');
    const lootAllBtn = document.getElementById('loot-all-btn');

    slots.innerHTML = '';
    container.isOpen = true;

    // Populate each item slot
    container.contents.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.className = 'loot-slot';
      slot.innerHTML = `
        <div class="item-icon">${item.icon}</div>
        <div class="item-name">${item.name}</div>
      `;
      slot.addEventListener('click', () => {
        if (this.inventory.addItem(item)) {
          container.contents.splice(index, 1);
          this.showContainerLoot(container);
          if (container.contents.length === 0 && !(container instanceof BrokenCar)) {
            this.world.objects = this.world.objects.filter(c => c !== container);
            lootModal.classList.remove('active');
          }
        }
      });
      slots.appendChild(slot);
    });

    // Loot All button
    lootAllBtn.onclick = () => {
      const successfullyLooted = [];
      container.contents.forEach((item, idx) => {
        if (this.inventory.addItem(item)) {
          successfullyLooted.push(idx);
        }
      });
      // Remove looted items (reverse order)
      successfullyLooted.reverse().forEach(idx => {
        container.contents.splice(idx, 1);
      });

      if (container.contents.length === 0) {
        if (!(container instanceof BrokenCar)) {
          this.world.objects = this.world.objects.filter(c => c !== container);
        }
        lootModal.classList.remove('active');
      } else {
        this.showContainerLoot(container);
      }
    };

    lootModal.classList.add('active');
  }

  /********************************************************************
   * Player Interaction (Space / E)
   * Checking objects, ores, trees, etc.
   ********************************************************************/
  handleInteraction() {
    const interactionPos = this.getInteractionPosition();

    // Check for various objects in a typical priority:
    // 1) Iron ore
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

    // 2) Copper
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

    // 3) Tin
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

    // 4) Normal rocks => stone
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

    // 5) Tilling grass
    const tileX = Math.floor(interactionPos.x / this.world.tileSize);
    const tileY = Math.floor(interactionPos.y / this.world.tileSize);
    if (this.world.tiles[tileY]?.[tileX] === 'grass') {
      this.world.updateTile(tileX, tileY, 'dirt');
      this.showMessage('Tilled soil!');
      this.updateEnergy(-10);
      return;
    }

    // 6) Trees or other objects
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
      // Deplete object health
      interactedObject.health--;
      if (interactedObject.health <= 0) {
        // If it's a tree, we get wood, else stone, etc.
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
    // A small offset in front of the player (based on direction)
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

  /********************************************************************
   * Quest progress updates
   ********************************************************************/
  updateQuestProgress(item, quantity) {
    this.questSystem.updateProgress(item, quantity);
    this.updateQuestUI();
  }

  /********************************************************************
   * Spawn some enemies
   ********************************************************************/
  spawnEnemies() {
    for (let i = 0; i < 8; i++) {
      this.world.objects.push(new Enemy(
        this.player.x + Math.cos(Math.PI * 2 * i / 8) * 400 + Math.random() * 200,
        this.player.y + Math.sin(Math.PI * 2 * i / 8) * 400 + Math.random() * 200
      ));
    }
  }

  /********************************************************************
   * Blood splat effect (for combat)
   ********************************************************************/
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
      document.getElementById('particle-container')?.appendChild(particle);

      setTimeout(() => particle.remove(), 1000);
    }
  }

  /********************************************************************
   * Game Update (logic) each frame
   ********************************************************************/
  update(deltaTime) {
    // If the browser tab is hidden, you might skip updates:
    if (document.hidden) {
      return;
    }

    // 1) Update main world
    this.world.update(deltaTime);

    // (NO automatic 4D mirroring here)

    // Interaction cooldown
    if (this.interactionCooldown > 0) {
      this.interactionCooldown -= deltaTime;
    }

    // Time system
    this.timeSystem.update(deltaTime);

    // Player
    this.player.update(deltaTime);

    // Camera
    this.updateCamera();

    // Check collisions with certain objects (walls, houses, trees)
    this.handleWallCollisions();

    // NPC / Creature updates (distance-based culling)
    const playerX = this.player.x;
    const playerY = this.player.y;
    const updateRadius = 1000; // Only update if within 1000px

    if (this.npc && this.isInRange(this.npc, playerX, playerY, updateRadius)) {
      this.npc.update(deltaTime);
    }
    if (this.rat && this.isInRange(this.rat, playerX, playerY, updateRadius)) {
      this.rat.update(deltaTime);
    }
    if (this.radroach && this.isInRange(this.radroach, playerX, playerY, updateRadius)) {
      this.radroach.update(deltaTime);
    }
  }

  /********************************************************************
   * Utility: check if an entity is in a certain radius from the player
   ********************************************************************/
  isInRange(entity, playerX, playerY, radius) {
    const dx = entity.x - playerX;
    const dy = entity.y - playerY;
    return (dx * dx + dy * dy) <= (radius * radius);
  }

  /********************************************************************
   * Camera updates (smooth follow)
   ********************************************************************/
  updateCamera() {
    const targetX = this.player.x + this.player.width / 2 - this.camera.width / 2;
    const targetY = this.player.y + this.player.height / 2 - this.camera.height / 2;

    // Smooth movement (lerp ~ 0.1)
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.camera.y) * 0.1;

    // Clamp camera
    this.camera.x = Math.max(0, Math.min(PLAY_AREA_WIDTH - this.camera.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(PLAY_AREA_HEIGHT - this.camera.height, this.camera.y));
  }

  /********************************************************************
   * Collision with walls, houses, trees
   ********************************************************************/
  handleWallCollisions() {
    const collidableObjects = this.world.objects.filter(
      obj => obj instanceof WoodenWall ||
             obj instanceof House ||
             obj instanceof PineTree ||
             obj instanceof FirTree ||
             obj instanceof MapleTree ||
             obj instanceof DeadTree
    );
    CollisionSystem.handleCollisions(this.player, collidableObjects);
  }

  /********************************************************************
   * Game Render
   ********************************************************************/
  render() {
    // Clear offscreen first
    this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

    // If the player is not in a house interior, render the main world
    if (!this.player.isInHouse) {
      // 1) Draw the world
      this.offscreenCtx.save();
      this.offscreenCtx.translate(-this.camera.x, -this.camera.y);
      this.world.render(this.offscreenCtx, this.camera);
      // Draw player, npc, etc.
      this.player.render(this.offscreenCtx);
      this.npc.render(this.offscreenCtx);
      this.rat.render(this.offscreenCtx);
      this.radroach.render(this.offscreenCtx);
      this.offscreenCtx.restore();

      // 2) Day/Night overlay
      const tint = this.timeSystem.getDayNightTint();
      const playerX = this.player.x - this.camera.x + this.player.width / 2;
      const playerY = this.player.y - this.camera.y + this.player.height / 2;

      // Create or update cached gradient if needed
      if (!this.lastTint ||
          this.lastTint.darkness !== tint.darkness ||
          this.lastTint.radius !== tint.radius) {
        this.gradientCache = this.offscreenCtx.createRadialGradient(
          playerX, playerY, 0,
          playerX, playerY, tint.radius
        );
        this.gradientCache.addColorStop(0, `rgba(0,0,0,${tint.darkness * 0.3})`);
        this.gradientCache.addColorStop(1, `rgba(0,0,0,${tint.darkness})`);
        this.lastTint = tint;
      }

      this.offscreenCtx.fillStyle = this.gradientCache;
      this.offscreenCtx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

      // 3) Minimap & hotbar
      this.drawMinimap();
      this.renderHotbar();
    }

    // Copy offscreen to main canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);

    // If player is in house, render them in the house canvas
    if (this.player.isInHouse) {
      const interiorCanvas = document.getElementById('house-interior-canvas');
      if (interiorCanvas) {
        const ctx = interiorCanvas.getContext('2d');
        ctx.clearRect(0, 0, interiorCanvas.width, interiorCanvas.height);
        this.houseInterior.render(ctx);
        this.player.render(ctx);
      }
    }
  }

  /**
   * Optional separate method to render the 4D dimension
   * on our offscreen context (or anywhere else). Only call
   * this if you actually want the 4D dimension displayed,
   * *after* you call `syncWorld4D()` if you want fresh data.
   */
  renderFourDWorld() {
    // Example usage: draw it in the top-left corner of the screen
    // Or anywhere else you desire:
    const offsetX = 50;
    const offsetY = 50;
    
    this.offscreenCtx.save();
    this.offscreenCtx.translate(offsetX, offsetY);

    // We can reuse the main camera. Or define a separate "camera4D".
    // For now let's just use the main camera for demonstration:
    this.world4D.render(this.offscreenCtx, this.camera);

    this.offscreenCtx.restore();
  }

  /********************************************************************
   * Draw the minimap
   ********************************************************************/
  drawMinimap() {
    const minimap = document.getElementById('minimap');
    if (!minimap) return;
    const ctx = minimap.getContext('2d');

    minimap.width = 200;
    minimap.height = 150;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, minimap.width, minimap.height);

    // Draw the world minimap image
    ctx.drawImage(
      this.world.minimapCanvas,
      0, 0,
      this.world.minimapCanvas.width, this.world.minimapCanvas.height,
      0, 0,
      minimap.width, minimap.height
    );

    const scaleX = minimap.width / this.world.playAreaWidth;
    const scaleY = minimap.height / this.world.playAreaHeight;

    // Player dot
    ctx.fillStyle = '#ff5555';
    ctx.beginPath();
    ctx.arc(
      this.player.x * scaleX,
      this.player.y * scaleY,
      3, 0, Math.PI * 2
    );
    ctx.fill();

    // Camera box
    if (this.camera) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.strokeRect(
        this.camera.x * scaleX,
        this.camera.y * scaleY,
        this.camera.width * scaleX,
        this.camera.height * scaleY
      );

      // Inner line
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        this.camera.x * scaleX,
        this.camera.y * scaleY,
        this.camera.width * scaleX,
        this.camera.height * scaleY
      );
    }
  }

  /********************************************************************
   * Render the hotbar at the bottom of the screen
   ********************************************************************/
  renderHotbar() {
    const ctx = this.ctx;
    const slotSize = 50;
    const padding = 8;
    const totalWidth = (slotSize + padding) * 12 - padding;
    const startX = (this.canvas.width - totalWidth) / 2;
    const yPos = this.canvas.height - slotSize - 20;

    // Draw background box for hotbar
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
        // If stackable, show quantity
        if (item.stackable) {
          ctx.fillStyle = 'rgba(0,0,0,0.8)';
          ctx.beginPath();
          ctx.roundRect(x + slotSize - 20, yPos + slotSize - 20, 20, 20, 3);
          ctx.fill();

          ctx.fillStyle = 'white';
          ctx.font = '12px "Press Start 2P"';
          ctx.textAlign = 'center';
          ctx.fillText(quantity, x + slotSize - 10, yPos + slotSize - 7);
        }
      }
    }
  }

  /********************************************************************
   * setupHoverEvents(): For mouse hover tooltips with spatial hashing
   ********************************************************************/
  setupHoverEvents() {
    // A basic throttle function so mousemove doesn't fire too rapidly
    const throttle = (func, limit) => {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    };

    // We'll create a spatial hash grid for objects
    this.spatialGrid = {
      cellSize: 100,
      cells: new Map(),

      getCell(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
      },

      add(obj) {
        const cell = this.getCell(obj.x, obj.y);
        if (!this.cells.has(cell)) {
          this.cells.set(cell, new Set());
        }
        this.cells.get(cell).add(obj);
      },

      getNearby(x, y) {
        const cell = this.getCell(x, y);
        return this.cells.get(cell) || new Set();
      }
    };

    // Populate the spatial grid with the main world's objects
    this.world.objects.forEach(obj => {
      this.spatialGrid.add(obj);
    });

    const handleMouseMove = throttle((e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = (e.clientX - rect.left) * (this.canvas.width / rect.width) +
                     (this.camera?.x || 0);
      const worldY = (e.clientY - rect.top) * (this.canvas.height / rect.height) +
                     (this.camera?.y || 0);

      // Only check objects in the same cell
      const nearbyObjects = this.spatialGrid.getNearby(worldX, worldY);
      const hoveredObject = Array.from(nearbyObjects).find(obj => {
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
          return (worldX >= obj.x - halfWidth &&
                  worldX <= obj.x + halfWidth &&
                  worldY >= obj.y - halfHeight &&
                  worldY <= obj.y + halfHeight);
        }
        return false;
      });

      // If we got a new hovered object, update the tooltip
      if (hoveredObject !== this.hoveredObject) {
        this.hoveredObject = hoveredObject;
        this.updateObjectTooltip(e.clientX, e.clientY);
      } else if (hoveredObject) {
        // If still on the same object, update position
        this.updateObjectTooltip(e.clientX, e.clientY);
      }
    }, 16); // ~60 FPS

    // Register mouse events
    this.canvas.addEventListener('mousemove', handleMouseMove);
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredObject = null;
      this.updateObjectTooltip();
    });
  }

  /********************************************************************
   * Show & position tooltips for hovered objects
   ********************************************************************/
  updateObjectTooltip(clientX, clientY) {
    const tooltip = document.getElementById('item-tooltip');
    if (!tooltip) {
      console.error('Tooltip element not found!');
      return;
    }

    // If no hovered object, hide the tooltip
    if (!this.hoveredObject) {
      tooltip.style.opacity = '0';
      return;
    }

    try {
      // Attempt to get tooltip content from the object
      const tooltipContent = this.hoveredObject.getTooltipContent?.();
      if (!tooltipContent) {
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

      // Position the tooltip near the mouse
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipRect = tooltip.getBoundingClientRect();

      let left = clientX + 15;
      let top = clientY + 15;

      // Keep within viewport
      if (left + tooltipRect.width > viewportWidth) {
        left = clientX - tooltipRect.width - 15;
      }
      if (top + tooltipRect.height > viewportHeight) {
        top = clientY - tooltipRect.height - 15;
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.opacity = '1';
    } catch (err) {
      console.error('Error updating tooltip:', err);
    }
  }

  /********************************************************************
   * General UI pop-up messages in the corner
   ********************************************************************/
  showMessage(text) {
    const messageElement = document.getElementById('interaction-message');
    if (!messageElement) return;

    if (typeof text === 'object') {
      // If it's an object, we might show a custom layout
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

  /********************************************************************
   * Update Player Energy
   ********************************************************************/
  updateEnergy(amount) {
    const energyElement = document.getElementById('energy-value');
    if (!energyElement) return;
    let energy = parseInt(energyElement.textContent) || 0;
    energy += amount;
    energy = Math.max(0, Math.min(100, energy));
    energyElement.textContent = energy;

    if (energy <= 0) {
      this.showMessage('Too tired... need to sleep!');
    }
  }

  /********************************************************************
   * Rest => toggles day/night
   ********************************************************************/
  restPlayer() {
    this.timeSystem.toggleDayNight();
    const currentHour = this.timeSystem.minutes / 60;
    const timeOfDay = (currentHour >= 6 && currentHour < 18) ? 'day' : 'night';
    this.showMessage(`Changed to ${timeOfDay}time!`);
  }

  /********************************************************************
   * NPC Dialogs
   ********************************************************************/
  showNPCDialog() {
    const dialog = document.getElementById('npc-dialog');
    if (!dialog) return;
    const textElement = dialog.querySelector('.dialog-text');
    if (!textElement) return;

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

  /********************************************************************
   * Death Handling
   ********************************************************************/
  setupDeathHandling() {
    // If the health system fires a 'death' event, show the death screen
    this.healthSystem.deathEvent.addEventListener('death', () => {
      this.showDeathScreen();
    });
  }

  showDeathScreen() {
    const deathModal = document.getElementById('death-modal');
    if (!deathModal) return;
    deathModal.classList.add('active');

    const resetBtn = document.getElementById('reset-button');
    if (resetBtn) {
      resetBtn.onclick = () => {
        window.location.reload();
      };
    }
  }

  /********************************************************************
   * Setup tree gathering (axe required)
   ********************************************************************/
  setupTreeGathering() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + (this.camera ? this.camera.x : 0);
      const worldY = e.clientY - rect.top + (this.camera ? this.camera.y : 0);

      // Find a tree
      const clickedTree = this.world.objects.find(obj =>
        (obj instanceof PineTree ||
         obj instanceof FirTree ||
         obj instanceof MapleTree ||
         obj instanceof DeadTree) &&
        obj.checkClick(worldX, worldY)
      );
      if (!clickedTree) return;

      // Check if we have an axe
      const hasAxe = this.inventory.slots.some(item => item?.name === 'Axe');
      if (hasAxe) {
        clickedTree.health--;
        this.createGatheringEffect(clickedTree.x, clickedTree.y);
        if (clickedTree.health <= 0) {
          // If it's a dead tree, yield extra wood
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
    });
  }

  createGatheringEffect(x, y) {
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = '#8B4513';
      particle.style.width = particle.style.height = `${Math.random() * 4 + 2}px`;
      particle.style.transform = `translate(
        ${Math.random() * 40 - 20}px,
        ${Math.random() * 40 - 20}px
      )`;
      document.getElementById('particle-container')?.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  }

  /********************************************************************
   * Setup ore gathering
   ********************************************************************/
  setupOreGathering() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + (this.camera ? this.camera.x : 0);
      const worldY = e.clientY - rect.top + (this.camera ? this.camera.y : 0);

      // Check for any ore
      const clickedOre = this.world.objects.find(obj =>
        (obj instanceof CopperOre ||
         obj instanceof IronOre ||
         obj instanceof TinOre) &&
        obj.checkClick(worldX, worldY)
      );
      if (!clickedOre) return;

      // Assume we have a pickaxe
      if (clickedOre.startMining()) {
        let oreType;
        if (clickedOre instanceof CopperOre) oreType = 'copper';
        else if (clickedOre instanceof IronOre) oreType = 'iron_ore';
        else oreType = 'tin_ore';

        if (this.inventory.addItem(ITEMS[oreType])) {
          this.createMiningEffect(clickedOre.x, clickedOre.y);
        }
        this.world.objects = this.world.objects.filter(obj => obj !== clickedOre);
        this.showMessage(`Mined ${oreType.replace('_', ' ')}!`);
      } else {
        this.showMessage(`Mining... ${clickedOre.progress.toFixed(0)}%`);
      }
    });
  }

  createMiningEffect(x, y) {
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = '#808080';
      particle.style.width = particle.style.height = `${Math.random() * 4 + 2}px`;
      particle.style.transform = `translate(
        ${Math.random() * 40 - 20}px,
        ${Math.random() * 40 - 20}px
      )`;
      document.getElementById('particle-container')?.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  }

  /********************************************************************
   * Pre-cache item icons (SVG => Canvas)
   ********************************************************************/
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

  /********************************************************************
   * The main game loop (fixed timestep approach)
   ********************************************************************/
  gameLoop(currentTime = 0) {
    // Calculate deltaTime (in seconds)
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // max 0.1
    this.accumulatedTime += deltaTime * 1000; // track ms

    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }

    // Fixed timestep updates
    while (this.accumulatedTime >= this.frameInterval) {
      this.update(this.frameInterval / 1000);
      this.accumulatedTime -= this.frameInterval;
    }

    // Render
    this.render();

    // Update lastTime
    this.lastTime = currentTime;

    // Request the next frame
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }
}

/**********************************************************************
 * Finally, create the Game instance once the DOM is ready
 **********************************************************************/
window.addEventListener('DOMContentLoaded', () => {
  console.log('Creating game instance');
  new Game();
});
