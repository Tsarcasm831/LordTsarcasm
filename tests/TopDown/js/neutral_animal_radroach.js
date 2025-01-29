export class Radroach {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 24;
    this.interactable = true;
    this.animationPhase = 0;
    this.inCombat = false;
    this.hp = 80;  // Slightly less HP than rat
    this.currentHp = this.hp;
    this.moves = [
      { name: 'Toxic Bite', power: 15, accuracy: 90 },
      { name: 'Shell Bash', power: 25, accuracy: 75 },
      { name: 'Scuttle', power: 5, accuracy: 100 }
    ];

    // Load the sprite image
    this.sprite = new Image();
    this.sprite.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/rad_roach.png';
  }

  getTooltipContent() {
    return {
      icon: '<svg viewBox="0 0 32 32" width="24" height="24"><path fill="#654321" d="M16 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm2 12h-4v-2h4v2z"/></svg>',
      title: 'Radroach',
      type: 'Mutated Insect',
      description: `A mutated insect with a tough shell\nHP: ${this.currentHp}/${this.hp}`
    };
  }

  update(deltaTime) {
    this.animationPhase += deltaTime * 4;
  }

  checkClick(worldX, worldY) {
    if (worldX > this.x - this.width/2 && 
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
      document.getElementById('enemy-name').textContent = 'Radroach';
      document.getElementById('enemy-hp-text').textContent = `${this.currentHp}/${this.hp}`;
      document.getElementById('enemy-hp-bar').style.width = `${(this.currentHp / this.hp) * 100}%`;
      
      // Clear previous combat log
      const combatLog = document.getElementById('combat-log');
      combatLog.innerHTML = '<div>A mutated Radroach skitters towards you!</div>';
      
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
      // Calculate damage with slight randomization
      const damage = Math.floor(move.power * (0.9 + Math.random() * 0.2));
      this.currentHp = Math.max(0, this.currentHp - damage);
      
      // Update UI
      document.getElementById('enemy-hp-text').textContent = `${this.currentHp}/${this.hp}`;
      document.getElementById('enemy-hp-bar').style.width = `${(this.currentHp / this.hp) * 100}%`;
      
      // Special move effects
      let effectText = '';
      if (move.name === 'Toxic Bite') {
        effectText = ' The poison slowly spreads...';
        setTimeout(() => this.applyPoisonDamage(), 1000);
      }
      
      combatLog.innerHTML += `<div>You used ${move.name}! Dealt ${damage} damage!${effectText}</div>`;
      
      // Check if radroach is defeated
      if (this.currentHp <= 0) {
        this.endCombat(true);
        return;
      }
    } else {
      combatLog.innerHTML += `<div>You used ${move.name}! But it missed!</div>`;
    }

    // Radroach's turn
    setTimeout(() => this.radroachTurn(), 1000);
  }

  applyPoisonDamage() {
    if (!this.inCombat) return;
    const poisonDamage = 5;
    this.currentHp = Math.max(0, this.currentHp - poisonDamage);
    document.getElementById('enemy-hp-text').textContent = `${this.currentHp}/${this.hp}`;
    document.getElementById('enemy-hp-bar').style.width = `${(this.currentHp / this.hp) * 100}%`;
    document.getElementById('combat-log').innerHTML += `<div>Poison deals ${poisonDamage} damage!</div>`;
    
    if (this.currentHp <= 0) {
      this.endCombat(true);
    }
  }

  radroachTurn() {
    if (!this.inCombat) return;

    const move = this.moves[Math.floor(Math.random() * this.moves.length)];
    const hitRoll = Math.random() * 100;
    const combatLog = document.getElementById('combat-log');
    
    if (hitRoll <= move.accuracy) {
      const damage = Math.floor(move.power * (0.9 + Math.random() * 0.2));
      const playerHp = parseInt(document.getElementById('health-value').textContent);
      const newPlayerHp = Math.max(0, playerHp - damage);
      
      // Update player HP
      document.getElementById('health-value').textContent = newPlayerHp;
      document.getElementById('player-hp-text').textContent = `${newPlayerHp}/100`;
      document.getElementById('player-hp-bar').style.width = `${newPlayerHp}%`;
      
      let effectText = '';
      if (move.name === 'Scuttle') {
        effectText = ' The quick movement catches you off guard!';
      } else if (move.name === 'Shell Bash') {
        effectText = ' The hard carapace slams into you!';
      }
      
      combatLog.innerHTML += `<div>Radroach used ${move.name}! Dealt ${damage} damage!${effectText}</div>`;
      
      // Check if player is defeated
      if (newPlayerHp <= 0) {
        this.endCombat(false);
        return;
      }
    } else {
      combatLog.innerHTML += `<div>Radroach used ${move.name}! But it missed!</div>`;
    }
    
    // Auto-scroll combat log
    combatLog.scrollTop = combatLog.scrollHeight;
  }

  endCombat(victory) {
    this.inCombat = false;
    const combatLog = document.getElementById('combat-log');
    if (victory) {
      combatLog.innerHTML += `<div>You defeated the Radroach! It scuttles away in defeat...</div>`;
    } else {
      combatLog.innerHTML += `<div>The Radroach overwhelms you with its mutated strength!</div>`;
    }
    
    // Hide the modal after a short delay
    setTimeout(() => {
      const modal = document.getElementById('combat-modal');
      modal.classList.remove('active');
    }, 2000);
  }

  render(ctx) {
    if (!this.sprite.complete) return; // Don't render if image hasn't loaded yet
    
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Draw the sprite centered on the position
    ctx.drawImage(
      this.sprite,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    
    ctx.restore();
  }
}