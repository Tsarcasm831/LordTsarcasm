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
  constructor() {
    game = this; 
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.handleResize();
    
    this.world = new World(32, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
    this.player = new Player(5120, 3840, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
    this.inventory = new Inventory(this);
    this.equippedGear = new EquippedGear(this.inventory, this);
    this.inventoryView = new InventoryView(this.inventory, this.equippedGear);
    this.timeSystem = new TimeSystem();
    this.craftingSystem = new CraftingSystem(this.inventory);
    this.interactionCooldown = 0;
    this.camera = { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height };
    this.playerHouse = true; 
    this.npc = new NPC(this.player.x + 200, this.player.y + 100);
    this.rat = new Rat(this.player.x + 150, this.player.y + 80);
    this.radroach = new Radroach(this.player.x - 150, this.player.y + 120);
    this.questSystem = new QuestSystem();
    this.healthSystem = new HealthSystem();
    this.isInHouse = false;
    this.houseInterior = null;
    this.setupEventListeners();
    this.setupTreeGathering();
    this.setupNPCEvents();
    this.setupQuestUI();
    this.setupDeathHandling();
    this.spawnEnemies();
    this.lastTime = 0;
    this.setupHoverEvents();
    
    this.iconCache = new Map();
    this.cacheAllIcons();
    
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
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.interactionCooldown <= 0) {
        this.handleInteraction();
        this.interactionCooldown = 0.5; 
        e.preventDefault();
      }
      if (e.code === 'KeyI') {
        this.toggleInventory();
        e.preventDefault();
      }
      if (e.code === 'KeyC') {
        this.toggleCrafting();
        e.preventDefault();
      }
      if (e.code === 'KeyQ') {
        this.toggleQuestLog();
        e.preventDefault();
      }
      if (e.code === 'KeyP') {
        this.equippedGear.toggle();
        e.preventDefault();
      }
      if (e.code === 'KeyO') {
        this.inventoryView.toggle();
        e.preventDefault();
      }
    });
    
    window.addEventListener('keydown', (e) => {
      this.player.handleKeyDown(e);
    });
    
    window.addEventListener('keyup', (e) => {
      this.player.handleKeyUp(e);
    });

    document.getElementById('rest-button').addEventListener('click', () => this.restPlayer());
    document.querySelectorAll('.category-btn').forEach(btn => 
      btn.addEventListener('click', () => this.inventory.updateCategoryFilter(btn.dataset.category))
    );

    this.initializeCraftingUI();
    this.setupContainerEvents();
    
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target.closest('.modal-content')) return;
        modal.classList.remove('active');
      });
      
      modal.querySelector('.modal-content').addEventListener('click', (e) => {
        if (e.target.classList.contains('close-btn')) {
          modal.classList.remove('active');
        }
      });
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + this.camera.x;
      const worldY = e.clientY - rect.top + this.camera.y;

      const enemy = this.world.objects.find(obj => 
        obj instanceof Enemy && obj.checkClick(worldX, worldY)
      );

      if (enemy) {
        enemy.takeDamage(1);
        this.createBloodSplat(enemy.x, enemy.y);
      }

      const container = this.world.objects.find(obj => 
        (obj instanceof LootableContainer || obj instanceof BrokenCar) &&
        obj.checkClick(worldX, worldY)
      );

      if (container) {
        this.showContainerLoot(container);
      }
    });
    this.setupOreGathering();
  }

  setupContainerEvents() {
  }

  setupNPCEvents() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + this.camera.x;
      const worldY = e.clientY - rect.top + this.camera.y;
      
      if (this.npc.checkClick(worldX, worldY)) {
        this.showNPCDialog();
      }
      else if (this.rat.checkClick(worldX, worldY)) {
        this.showRatDialog();
      }
      else if (this.radroach.checkClick(worldX, worldY)) {
        this.radroach.startCombat();
      }
    });
  }

  setupQuestUI() {
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

  toggleQuestLog() {
    const questLog = document.getElementById('quest-log');
    questLog.classList.toggle('active');
  }

  updateQuestProgress(item, quantity) {
    this.questSystem.updateProgress(item, quantity);
    this.updateQuestUI();
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

  toggleCrafting() {
    const craftingMenu = document.getElementById('crafting-menu');
    craftingMenu.classList.toggle('active');
    if (craftingMenu.classList.contains('active')) {
      this.craftingSystem.updateUI();
    }
  }

  initializeCraftingUI() {
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

  handleInteraction() {
    const interactionPos = this.getInteractionPosition();
    
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
    
    const house = this.world.objects.find(obj => 
      obj instanceof House && obj.checkClick(interactionPos.x, interactionPos.y)
    );
    
    if (house) {
      this.enterHouse(house);
      return;
    }

    if (this.isInHouse) {
      if (this.houseInterior?.checkExitClick(interactionPos.x, interactionPos.y)) {
        this.exitHouse();
      }
      return;
    }

    const tileX = Math.floor(interactionPos.x / this.world.tileSize);
    const tileY = Math.floor(interactionPos.y / this.world.tileSize);
    
    if (this.world.tiles[tileY]?.[tileX] === 'grass') {
      this.world.updateTile(tileX, tileY, 'dirt');  
      this.showMessage('Tilled soil!');
      this.updateEnergy(-10);
    }

    const interactedObject = this.world.objects.find(obj => {
      if (obj instanceof PineTree || obj instanceof FirTree || obj instanceof MapleTree || obj instanceof DeadTree) {
        return obj.checkClick(interactionPos.x, interactionPos.y);
      }
      return Math.abs(obj.x - interactionPos.x) < 40 && 
             Math.abs(obj.y - interactionPos.y) < 40;
    });

    if (interactedObject) {
      interactedObject.health--;
      if (interactedObject.health <= 0) {
        const item = (interactedObject.type === 'tree' || interactedObject instanceof PineTree || interactedObject instanceof FirTree || interactedObject instanceof MapleTree) ? 'wood' : 'stone';
        if (this.inventory.addItem(ITEMS[item])) {
          this.updateQuestProgress(item, 1);  
          this.showMessage(`Got ${item}!`);
        }
        this.world.objects = this.world.objects.filter(o => o !== interactedObject);
      }
    }
  }

  getInteractionPosition() {
    const offset = 20;
    return {
      x: this.player.x + this.player.width/2 + (
        this.player.direction === 'left' ? -offset : 
        this.player.direction === 'right' ? offset : 0
      ),
      y: this.player.y + this.player.height/2 + (
        this.player.direction === 'up' ? -offset : 
        this.player.direction === 'down' ? offset : 0
      )
    };
  }

  createParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
      particle.style.width = particle.style.height = `${Math.random() * 6 + 4}px`;
      particle.style.borderRadius = '50%';
      document.getElementById('particle-container').appendChild(particle);
      
      setTimeout(() => particle.remove(), 1500);
    }
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

  showMessage(text) {
    const messageElement = document.getElementById('interaction-message');
    messageElement.textContent = text;
    messageElement.style.opacity = '1';
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      messageElement.style.opacity = '0';
    }, 2000);
  }

  restPlayer() {
    if (this.playerHouse && parseInt(document.getElementById('gold-value').textContent) >= 50) {
      this.timeSystem.minutes = 360; 
      document.getElementById('energy-value').textContent = 100;
      document.getElementById('gold-value').textContent = 
        parseInt(document.getElementById('gold-value').textContent) - 50;
      this.showMessage('Restored energy!');
    }
  }

  showNPCDialog() {
    const dialog = document.getElementById('npc-dialog');
    const textElement = dialog.querySelector('.dialog-text');
    
    this.npc.dialogIndex = 0;
    textElement.innerHTML = this.npc.dialogs[0];
    dialog.classList.add('active');

    dialog.querySelector('.next-btn').onclick = () => {
      this.npc.dialogIndex++;
      if (this.npc.dialogIndex >= this.npc.dialogs.length) {
        dialog.classList.remove('active');
        return;
      }
      textElement.innerHTML = this.npc.dialogs[this.npc.dialogIndex];
    };
  }

  showRatDialog() {
    if (this.rat) {
      this.rat.startCombat();
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

  spawnEnemies() {
    for (let i = 0; i < 8; i++) {
      this.world.objects.push(new Enemy(
        this.player.x + Math.cos(Math.PI*2*i/8) * 400 + Math.random()*200,
        this.player.y + Math.sin(Math.PI*2*i/8) * 400 + Math.random()*200
      ));
    }
  }

  updateCamera() {
    const targetX = this.player.x + this.player.width/2 - this.camera.width/2;
    const targetY = this.player.y + this.player.height/2 - this.camera.height/2;
    
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.camera.y) * 0.1;
    
    this.camera.x = Math.max(0, Math.min(PLAY_AREA_WIDTH - this.camera.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(PLAY_AREA_HEIGHT - this.camera.height, this.camera.y));
  }

  handleWallCollisions() {
    const collidableObjects = this.world.objects.filter(obj => 
      obj instanceof WoodenWall || obj instanceof House
    );

    collidableObjects.forEach(obj => {
      if (obj.checkCollision(this.player.x, this.player.y, this.player.width, this.player.height)) {
        const dx = (this.player.x + this.player.width/2) - obj.x;
        const dy = (this.player.y + this.player.height/2) - obj.y;
        
        const combinedHalfWidths = (this.player.width + obj.width)/2;
        const combinedHalfHeights = (this.player.height + obj.height)/2;

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
  }

  createBloodSplat(x, y) {
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle blood';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = `rgba(138,3,3,${0.8-Math.random()*0.3})`;
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

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.isInHouse) {
      this.ctx.save();
      this.ctx.translate(-this.camera.x, -this.camera.y);
      
      // Draw dark background
      this.ctx.fillStyle = '#111';
      this.ctx.fillRect(
        this.camera.x, 
        this.camera.y, 
        this.camera.width, 
        this.camera.height
      );
      
      this.houseInterior.render(this.ctx);
      this.player.render(this.ctx);
      
      this.ctx.restore();
    } else {
      this.ctx.save();
      this.ctx.translate(-this.camera.x, -this.camera.y);
      
      this.world.render(this.ctx);
      this.player.render(this.ctx);
      this.npc.render(this.ctx);
      this.rat.render(this.ctx);
      this.radroach.render(this.ctx);
      
      this.ctx.restore();

      const tint = this.timeSystem.getDayNightTint();
      const playerX = this.player.x - this.camera.x + this.player.width/2;
      const playerY = this.player.y - this.camera.y + this.player.height/2;
      
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
    }

    this.drawMinimap();

    this.renderHotbar();
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

      ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
      ctx.beginPath();
      ctx.roundRect(x, yPos, slotSize, slotSize, 4);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#deb887' : '#5a432c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, yPos, slotSize, slotSize, 4);
      ctx.stroke();

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
          ctx.font = '12px "Press Start 2P"';
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
    
    ctx.fillStyle = '#ff5555';
    ctx.fillRect(
      this.player.x * scaleX - 2,
      this.player.y * scaleY - 2,
      4, 4
    );

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
    document.getElementById('reset-button').onclick = () => {
      window.location.reload();
    };
  }

  enterHouse(house) {
    this.isInHouse = true;
    this.houseInterior = new HouseInterior(house.x, house.y);
    
    // Store player's outdoor position
    this.playerOutdoorX = this.player.x;
    this.playerOutdoorY = this.player.y;
    
    // Move player to interior door position
    this.player.x = this.houseInterior.doorX;
    this.player.y = this.houseInterior.doorY - 50;
    
    // Adjust camera to interior scene
    this.camera.x = this.houseInterior.x - this.camera.width/2 + 300;
    this.camera.y = this.houseInterior.y - this.camera.height/2 + 200;
  }

  exitHouse() {
    this.isInHouse = false;
    
    // Restore player's outdoor position
    this.player.x = this.playerOutdoorX;
    this.player.y = this.playerOutdoorY;
    
    // Reset camera to follow player
    this.updateCamera();
    
    this.houseInterior = null;
  }

  setupHoverEvents() {
    this.hoveredObject = null;
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + this.camera.x;
      const worldY = e.clientY - rect.top + this.camera.y;
      
      this.hoveredObject = this.world.objects.find(obj => {
        const isTree = obj instanceof PineTree || 
                      obj instanceof FirTree || 
                      obj instanceof MapleTree || 
                      obj instanceof DeadTree;
        const isMineral = obj instanceof Rock || 
                         obj instanceof CopperOre || 
                         obj instanceof IronOre || 
                         obj instanceof TinOre;
        return (isTree || isMineral) && this.checkObjectHover(obj, worldX, worldY);
      });
      
      this.updateObjectTooltip(e.clientX, e.clientY);
    });
  }

  checkObjectHover(obj, worldX, worldY) {
    return worldX > obj.x - obj.width/2 &&
           worldX < obj.x + obj.width/2 &&
           worldY > obj.y - obj.height/2 &&
           worldY < obj.y + obj.height/2;
  }

  updateObjectTooltip(clientX, clientY) {
    const tooltip = document.getElementById('item-tooltip');
    if (!this.hoveredObject) {
      tooltip.style.opacity = '0';
      return;
    }

    tooltip.style.left = `${clientX + 15}px`;
    tooltip.style.top = `${clientY + 15}px`;
    tooltip.style.opacity = '1';

    const isPine = this.hoveredObject instanceof PineTree;
    const isFir = this.hoveredObject instanceof FirTree;
    const isMaple = this.hoveredObject instanceof MapleTree;
    const isDead = this.hoveredObject instanceof DeadTree;
    const isRock = this.hoveredObject instanceof Rock;
    const isCopper = this.hoveredObject instanceof CopperOre;
    const isIron = this.hoveredObject instanceof IronOre;
    const isTin = this.hoveredObject instanceof TinOre;
    const health = this.hoveredObject.health || 3;
  
    if (isPine || isFir) {
      tooltip.innerHTML = `
        <div class="tooltip-header">
          <svg viewBox="0 0 32 32" width="24" height="24">
            ${isFir ? `
              <path fill="#245c2c" d="M16 2L2 16h28L16 2zm0 4l10 10H6L16 6z"/>
            ` : `
              <path fill="#2d5a27" d="M16 2L2 16h28L16 2zm0 4l10 10H6L16 6z"/>
            `}
          </svg>
          <h4>${isFir ? 'Fir Tree' : 'Pine Tree'}</h4>
        </div>
        <div class="tooltip-body">
          <div>Type: ${isFir ? 'Evergreen' : 'Coniferous'}</div>
          <div>Health: ${health}</div>
          <div>${isFir ? 'Source of sturdy timber' : 'Produces pine resin'}</div>
        </div>
      `;
    } else if (isMaple) {
      tooltip.innerHTML = `
        <div class="tooltip-header">
          <svg viewBox="0 0 32 32" width="24" height="24">
            <path fill="#${this.hoveredObject.seasonalHue < 180 ? 'b22222' : '228b22'}" 
                  d="M16 2l5 10 11 2-8 7 2 11-10-5-10 5 2-11-8-7 11-2z"/>
          </svg>
          <h4>Maple Tree</h4>
        </div>
        <div class="tooltip-body">
          <div>Type: Deciduous</div>
          <div>Health: ${health}</div>
          <div>Seasonal syrup source</div>
          <div>Foliage hue: ${Math.round(this.hoveredObject.seasonalHue)}°</div>
        </div>
      `;
    } else if (isDead) {
      tooltip.innerHTML = `
        <div class="tooltip-header">
          <svg viewBox="0 0 32 32" width="24" height="24">
            <path fill="#a3a3a3" d="M16 2L6 22h20L16 2zm-4 8l-4 8h8l-4-8z"/>
          </svg>
          <h4>Dead Tree</h4>
        </div>
        <div class="tooltip-body">
          <div>Type: Decayed</div>
          <div>Health: ${health}</div>
          <div>Brittle dry wood</div>
          <div>Harvests: 2x wood</div>
        </div>
      `;
    } else if (isRock || isCopper || isIron || isTin) {
      const mineralType = this.hoveredObject.type;
      const color = isRock ? '#808080' : 
                   isCopper ? '#b87333' : 
                   isIron ? '#a0a0a0' : 
                   '#c0c0c0';  // Tin color
      const description = isRock ? 'Basic mining resource' : 
                         isCopper ? 'Common metal ore' : 
                         isIron ? 'Strong metal ore' :
                         'Soft metal ore';
      const miningLevel = isRock ? 1 : 
                         isCopper ? 1 : 
                         isIron ? 2 : 
                         1.5;  // Tin mining level
      tooltip.innerHTML = `
        <div class="tooltip-header">
          <svg viewBox="0 0 32 32" width="24" height="24">
            <path fill="${color}" d="M16 4l12 7v10H4V11l12-7z"/>
          </svg>
          <h4>${mineralType.charAt(0).toUpperCase() + mineralType.slice(1)}</h4>
        </div>
        <div class="tooltip-body">
          <div>Type: Mineral</div>
          <div>Health: ${health}</div>
          <div>${description}</div>
          <div>Mining Level: ${miningLevel}</div>
        </div>
      `;
    }
  }

  cacheAllIcons() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 34;  
    tempCanvas.height = 34;
    const tempCtx = tempCanvas.getContext('2d');

    Object.values(ITEMS).forEach(item => {
      const img = new Image();
      const svg = new Blob([item.icon], {type: 'image/svg+xml'});
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

  setupTreeGathering() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const worldX = e.clientX - rect.left + this.camera.x;
      const worldY = e.clientY - rect.top + this.camera.y;

      // Find clicked tree
      const clickedTree = this.world.objects.find(obj => {
        return (obj instanceof PineTree || 
                obj instanceof FirTree || 
                obj instanceof MapleTree || 
                obj instanceof DeadTree) && 
               obj.checkClick(worldX, worldY);
      });

      if (clickedTree) {
        // Check if player has axe equipped
        const hasAxe = this.inventory.slots.some(item => item?.name === 'Axe');
        
        if (hasAxe) {
          // Decrease tree health
          clickedTree.health--;
          
          // Create gathering effect
          this.createGatheringEffect(clickedTree.x, clickedTree.y);
          
          // If tree is fully gathered
          if (clickedTree.health <= 0) {
            // Add wood to inventory
            const woodQuantity = clickedTree instanceof DeadTree ? 2 : 1;
            for (let i = 0; i < woodQuantity; i++) {
              if (this.inventory.addItem(ITEMS.wood)) {
                this.updateQuestProgress('wood', 1);
              }
            }
            
            // Remove tree from world
            this.world.objects = this.world.objects.filter(obj => obj !== clickedTree);
            
            // Show message
            this.showMessage('Gathered wood from tree!');
          } else {
            // Show progress message
            this.showMessage(`Chopping tree... ${((1 - clickedTree.health/clickedTree.maxHealth) * 100).toFixed(0)}%`);
          }
        } else {
          this.showMessage('Need an axe to chop trees!');
        }
      }
    });
  }

  createGatheringEffect(x, y) {
    // Create wood chip particles
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

      // Find clicked ore
      const clickedOre = this.world.objects.find(obj => {
        return (obj instanceof CopperOre || 
                obj instanceof IronOre || 
                obj instanceof TinOre) && 
               obj.checkClick(worldX, worldY);
      });

      if (clickedOre) {
        // Check if player has pickaxe (you can add this item later)
        const hasPickaxe = true; // For now always allow mining
        
        if (hasPickaxe) {
          // Start mining
          if (clickedOre.startMining()) {
            // If mining is complete, add ore to inventory
            const oreType = clickedOre instanceof CopperOre ? 'copper' :
                          clickedOre instanceof IronOre ? 'iron_ore' : 'tin_ore';
            
            if (this.inventory.addItem(ITEMS[oreType])) {
              // Create mining effect
              this.createMiningEffect(clickedOre.x, clickedOre.y);
            }
            
            // Remove ore from world
            this.world.objects = this.world.objects.filter(obj => obj !== clickedOre);
            
            // Show message
            this.showMessage(`Mined ${oreType.replace('_', ' ')}!`);
          } else {
            // Show progress message
            this.showMessage(`Mining... ${clickedOre.progress.toFixed(0)}%`);
          }
        } else {
          this.showMessage('Need a pickaxe to mine ores!');
        }
      }
    });
  }

  createMiningEffect(x, y) {
    // Create ore particle effects
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

  gameLoop(currentTime = 0) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }
}

// Create game instance outside the class definition
new Game();