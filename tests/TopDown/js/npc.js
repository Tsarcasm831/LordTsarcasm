export class NPC {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 42;
    this.height = 60;
    this.interactable = true;
    this.dialogIndex = 0;
    this.animationPhase = 0;
    this.blinkTimer = 0;
    this.emotion = 'neutral';
    this.fidgetTimer = 0;
    this.headTilt = 0;
    this.armSwing = 0;
    this.patrolPath = [];
    this.currentPatrolIndex = 0;
    this.schedule = [];
    this.name = this.generateName();
    this.clothingColors = {
      shirt: '#6495ED',
      pants: '#556B2F',
      shoes: '#8B4513',
      accessory: '#FFD700'
    };
    
    // Advanced dialog system
    this.dialogs = {
      greeting: [
        "Ah, {player}, good to see you!",
        "Looking sharp today, {player}!"
      ],
      quests: {
        available: "The mine's been overrun with critters. Could use your help!",
        completed: "You've cleaned out those pests? My thanks!"
      },
      idle: [
        "These crops won't water themselves...",
        "Hmm, need to check the north field later"
      ],
      emotional: {
        happy: "What a glorious day for farming!",
        angry: "Dang rabbits ate my seedlings again!",
        pensive: "I wonder if the old mine still has quality ore..."
      }
    };
    
    this.generateAppearance();
  }

  generateName() {
    const first = ['Clay', 'Marnie', 'Gus', 'Evelyn', 'Maru', 'Demetrius'][Math.floor(Math.random()*6)];
    const last = ['Rivera', 'Higgs', 'Maia', 'Thorne', 'Arbuckle', 'Green'][Math.floor(Math.random()*6)];
    return `${first} ${last}`;
  }

  generateAppearance() {
    // Randomized features
    this.features = {
      hair: {
        style: ['short', 'pony', 'bun'][Math.floor(Math.random()*3)],
        color: `hsl(${Math.random()*30+15}, 50%, ${Math.random()*20+30}%)`,
        strandVariation: Math.random() * 0.3
      },
      skinTone: `hsl(${Math.random()*15+25}, ${Math.random()*30+40}%, ${Math.random()*20+50}%)`,
      facialFeatures: {
        nose: ['button', 'straight', 'wide'][Math.floor(Math.random()*3)],
        jaw: ['round', 'square', 'oval'][Math.floor(Math.random()*3)]
      }
    };
  }

  update(deltaTime) {
    // Animation system
    this.animationPhase += deltaTime * 2;
    this.blinkTimer += deltaTime;
    this.headTilt = Math.sin(this.animationPhase) * 0.05;
    this.armSwing = Math.sin(this.animationPhase * 1.2) * 0.2;
    
    // Random blinking (3-6 sec interval)
    if(this.blinkTimer > 3 + Math.random()*3) {
      this.blinkTimer = -0.5; // Negative for blink duration
    }

    // Fidgeting system
    this.fidgetTimer += deltaTime;
    if(this.fidgetTimer > 5 + Math.random()*10) {
      this.doFidget();
      this.fidgetTimer = 0;
    }

    // Schedule-based movement
    this.updateScheduleMovement(deltaTime);
  }

  doFidget() {
    // Random character-specific fidgets
    const fidgets = [
      () => this.checkToolbelt(),
      () => this.adjustHat(),
      () => this.scratchHead()
    ];
    fidgets[Math.floor(Math.random()*fidgets.length)]();
  }

  checkToolbelt() {
    // Complex hand animation for tool check
    this.emotion = 'pensive';
    setTimeout(() => this.emotion = 'neutral', 2000);
  }

  adjustHat() {
    this.headTilt = -0.3;
    setTimeout(() => this.headTilt = 0, 500);
  }

  scratchHead() {
    this.armSwing = 0.5;
    setTimeout(() => this.armSwing = 0, 800);
  }

  updateScheduleMovement(deltaTime) {
    // ...existing pathfinding logic...
  }

  checkClick(worldX, worldY) {
    const range = this.width * 1.2;
    return Math.abs(worldX - this.x) < range/2 && 
           Math.abs(worldY - this.y) < this.height/2;
  }

  startInteraction(playerName) {
    this.facePlayer();
    this.showDialog(playerName);
  }

  facePlayer() {
    // Turn head toward player
    this.headTilt = (playerX > this.x) ? 0.1 : -0.1;
  }

  showDialog(playerName) {
    const dialog = document.getElementById('npc-dialog');
    dialog.querySelector('.npc-name').textContent = this.name;
    dialog.querySelector('.portrait').innerHTML = this.createPortraitSVG();
    this.updateDialogOptions(playerName);
    dialog.classList.add('active');
  }

  createPortraitSVG() {
    return `
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="30" r="20" fill="${this.features.skinTone}"/>
        ${this.renderHair()}
        <path d="M30,60 Q50,70 70,60" stroke="#8B4513" fill="none"/>
      </svg>
    `;
  }

  renderHair() {
    switch(this.features.hair.style) {
      case 'pony':
        return `<path d="M30,20 Q40,5 50,10 Q60,5 70,20 L50,35 Z" fill="${this.features.hair.color}"/>`;
      case 'bun':
        return `<circle cx="50" cy="25" r="15" fill="${this.features.hair.color}"/>`;
      default:
        return `<rect x="30" y="15" width="40" height="20" rx="5" fill="${this.features.hair.color}"/>`;
    }
  }

  updateDialogOptions(playerName) {
    const container = document.getElementById('dialog-options');
    container.innerHTML = '';
    
    const options = [
      { text: "What's new?", type: 'greeting' },
      { text: "Any work?", type: 'quests' },
      { text: "Goodbye", type: 'exit' }
    ];

    options.forEach(opt => {
      const button = document.createElement('button');
      button.textContent = opt.text;
      button.onclick = () => this.handleDialogChoice(opt.type, playerName);
      button.className = `dialog-option ${opt.type}`;
      container.appendChild(button);
    });
  }

  handleDialogChoice(type, playerName) {
    const response = document.getElementById('dialog-response');
    switch(type) {
      case 'greeting':
        response.innerHTML = this.dialogs.greeting[Math.floor(Math.random()*this.dialogs.greeting.length)]
          .replace('{player}', playerName);
        break;
      case 'quests':
        response.innerHTML = this.questSystem.getCurrentQuestText();
        break;
      case 'exit':
        document.getElementById('npc-dialog').classList.remove('active');
        break;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Body proportions
    const bodyWidth = 35;
    const neckHeight = 15;
    const shoulderWidth = 40;
    
    // Shadows under feet
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 45, 20 + Math.abs(this.headTilt)*10, 10, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Legs with walking animation
    ctx.fillStyle = this.clothingColors.pants;
    [-12, 12].forEach(x => {
      ctx.save();
      ctx.translate(x, 30);
      ctx.rotate(Math.sin(this.animationPhase + x/4) * 0.2);
      ctx.fillRect(-5, 0, 10, 40);
      ctx.restore();
    });
    
    // Torso with clothing
    ctx.fillStyle = this.clothingColors.shirt;
    ctx.beginPath();
    ctx.roundRect(-bodyWidth/2, -neckHeight, bodyWidth, 60, 10);
    ctx.fill();

    // Arms with swing animation
    ctx.fillStyle = this.clothingColors.shirt;
    [-1, 1].forEach(dir => {
      ctx.save();
      ctx.translate(dir * (shoulderWidth/2 + 5), 5);
      ctx.rotate(dir * this.armSwing);
      ctx.fillRect(-7, 0, 14, 40);
      ctx.restore();
    });

    // Head with expressions
    ctx.save();
    ctx.translate(0, -neckHeight);
    ctx.rotate(this.headTilt);
    
    // Face base
    ctx.fillStyle = this.features.skinTone;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI*2);
    ctx.fill();
    
    // Hair with movement
    ctx.fillStyle = this.features.hair.color;
    ctx.beginPath();
    ctx.arc(0, -8, 22, 0.2, Math.PI-0.2);
    ctx.fill();
    
    // Facial features
    this.renderEyes(ctx);
    this.renderMouth(ctx);
    
    ctx.restore();
    
    // Accessories
    ctx.fillStyle = this.clothingColors.accessory;
    ctx.fillRect(-15, 45, 30, 5); // Belt
    ctx.beginPath();
    ctx.arc(0, -10, 3, 0, Math.PI*2); // Necklace
    ctx.fill();
    
    // Tool belt items
    ctx.fillStyle = '#555';
    [-15, 0, 15].forEach(x => {
      ctx.beginPath();
      ctx.arc(x, 45, 3 + Math.sin(this.animationPhase + x)*0.5, 0, Math.PI*2);
      ctx.fill();
    });

    ctx.restore();
  }

  renderEyes(ctx) {
    const blink = this.blinkTimer < 0 ? Math.abs(this.blinkTimer)*10 : 0;
    const eyeHeight =  -5 - (blink/2);
    
    ctx.fillStyle = '#1a1a1a';
    [-10, 10].forEach(x => {
      ctx.beginPath();
      ctx.ellipse(
        x, 
        eyeHeight, 
        3, 
        Math.max(0, 3 - blink), 
        0, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
    });
    
    // Emotion-based changes
    if(this.emotion === 'happy') {
      ctx.strokeStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(0, 8, 6, 0.2, Math.PI-0.2);
      ctx.stroke();
    }
  }

  renderMouth(ctx) {
    ctx.strokeStyle = '#8B6B4D';
    ctx.lineWidth = 2;
    
    switch(this.emotion) {
      case 'happy':
        ctx.beginPath();
        ctx.moveTo(-8, 8);
        ctx.quadraticCurveTo(0, 12, 8, 8);
        ctx.stroke();
        break;
      case 'angry':
        ctx.beginPath();
        ctx.moveTo(-8, 10);
        ctx.lineTo(8, 10);
        ctx.stroke();
        break;
      default:
        ctx.beginPath();
        ctx.moveTo(-6, 10);
        ctx.quadraticCurveTo(0, 12, 6, 10);
        ctx.stroke();
    }
  }
}