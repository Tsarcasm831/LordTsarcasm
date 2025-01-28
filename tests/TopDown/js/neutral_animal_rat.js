export class Rat {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 24;
    this.interactable = true;
    this.animationPhase = 0;
    this.inCombat = false;
    this.hp = 100;
    this.currentHp = this.hp;
    this.moves = [
      { name: 'Bite', power: 20, accuracy: 95 },
      { name: 'Tail Whip', power: 10, accuracy: 100 }
    ];
  }

  update(deltaTime) {
    this.animationPhase += deltaTime * 5;
  }

  checkClick(worldX, worldY) {
    const isHovering = worldX > this.x - this.width/2 && 
        worldX < this.x + this.width/2 &&
        worldY > this.y - this.height/2 && 
        worldY < this.y + this.height/2;

    if (isHovering && 
        worldX > this.x - this.width/2 && 
        worldX < this.x + this.width/2 &&
        worldY > this.y - this.height/2 && 
        worldY < this.y + this.height/2) {
      this.startCombat();
      return true;
    }
    return false;
  }

  startCombat() {
    if (!this.inCombat) {
      this.inCombat = true;
      
      // Reset combat state
      this.currentHp = this.hp;
      
      // Update UI elements
      document.getElementById('enemy-hp-text').textContent = `${this.currentHp}/${this.hp}`;
      document.getElementById('enemy-hp-bar').style.width = `${(this.currentHp / this.hp) * 100}%`;
      
      // Clear previous combat log
      const combatLog = document.getElementById('combat-log');
      combatLog.innerHTML = '<div>Combat started with the Rat!</div>';
      
      // Setup combat buttons
      const combatButtons = document.getElementById('combat-buttons');
      combatButtons.innerHTML = '';
      this.moves.forEach(move => {
        const button = document.createElement('button');
        button.textContent = move.name;
        button.onclick = () => this.useMove(move);
        combatButtons.appendChild(button);
      });
      
      // Show the modal
      const modal = document.getElementById('combat-modal');
      modal.classList.add('active');

      // Setup close button handler
      const closeBtn = modal.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.onclick = () => {
          this.inCombat = false;
          modal.classList.remove('active');
        };
      }
    }
  }

  useMove(move) {
    if (!this.inCombat) return;

    const hitRoll = Math.random() * 100;
    const combatLog = document.getElementById('combat-log');
    
    if (hitRoll <= move.accuracy) {
      // Calculate damage
      const damage = move.power;
      this.currentHp = Math.max(0, this.currentHp - damage);
      
      // Update UI
      document.getElementById('enemy-hp-text').textContent = `${this.currentHp}/${this.hp}`;
      document.getElementById('enemy-hp-bar').style.width = `${(this.currentHp / this.hp) * 100}%`;
      
      combatLog.innerHTML += `<div>You used ${move.name}! Dealt ${damage} damage!</div>`;
      
      // Check if rat is defeated
      if (this.currentHp <= 0) {
        this.endCombat(true);
        return;
      }
    } else {
      combatLog.innerHTML += `<div>You used ${move.name}! But it missed!</div>`;
    }

    // Rat's turn
    setTimeout(() => this.ratTurn(), 1000);
  }

  ratTurn() {
    if (!this.inCombat) return;

    const move = this.moves[Math.floor(Math.random() * this.moves.length)];
    const hitRoll = Math.random() * 100;
    const combatLog = document.getElementById('combat-log');
    
    if (hitRoll <= move.accuracy) {
      const damage = move.power;
      const playerHp = parseInt(document.getElementById('health-value').textContent);
      const newPlayerHp = Math.max(0, playerHp - damage);
      
      // Update player HP
      document.getElementById('health-value').textContent = newPlayerHp;
      document.getElementById('player-hp-text').textContent = `${newPlayerHp}/100`;
      document.getElementById('player-hp-bar').style.width = `${newPlayerHp}%`;
      
      combatLog.innerHTML += `<div>Rat used ${move.name}! Dealt ${damage} damage!</div>`;
      
      // Check if player is defeated
      if (newPlayerHp <= 0) {
        this.endCombat(false);
        return;
      }
    } else {
      combatLog.innerHTML += `<div>Rat used ${move.name}! But it missed!</div>`;
    }
    
    // Auto-scroll combat log
    combatLog.scrollTop = combatLog.scrollHeight;
  }

  endCombat(victory) {
    this.inCombat = false;
    const combatLog = document.getElementById('combat-log');
    combatLog.innerHTML += `<div>${victory ? 'You defeated the Rat!' : 'You were defeated by the Rat!'}</div>`;
    
    // Hide the modal after a short delay
    setTimeout(() => {
      const modal = document.getElementById('combat-modal');
      modal.classList.remove('active');
    }, 2000);
  }

  getTooltipContent() {
    return {
      icon: `<svg viewBox="0 0 32 32" width="24" height="24">
        <path fill="#888" d="M16 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm2 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
      </svg>`,
      title: 'Rat',
      type: 'Creature - Wasteland Vermin',
      description: 'A common wasteland creature. Known for its quick bites and agile movements.'
    };
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Animated tail
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(-8, 4);
    ctx.bezierCurveTo(
      -12 - Math.sin(this.animationPhase)*2, 
      8 + Math.cos(this.animationPhase)*4,
      -16, 
      12,
      -20, 
      16
    );
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Body
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#999';
    ctx.beginPath();
    ctx.arc(-6, -8, 4, 0, Math.PI * 2);
    ctx.arc(6, -8, 4, 0, Math.PI * 2);
    ctx.fill();

    // Nose twitch
    ctx.fillStyle = 'pink';
    ctx.beginPath();
    ctx.arc(0, 0, 2 + Math.sin(this.animationPhase)*0.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-4, -4, 2, 0, Math.PI * 2);
    ctx.arc(4, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    [-Math.PI/6, 0, Math.PI/6].forEach(angle => {
      ctx.moveTo(8, 0);
      ctx.lineTo(8 + Math.cos(angle)*6, Math.sin(angle)*6);
    });
    ctx.stroke();

    ctx.restore();
  }
}