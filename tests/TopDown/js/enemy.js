export class Enemy {
  constructor(x, y, playAreaWidth, playAreaHeight) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 48;
    this.speed = 300; // Adjusted speed for enemies
    this.direction = 'down';
    this.playAreaWidth = playAreaWidth;
    this.playAreaHeight = playAreaHeight;
    this.moving = false;

    // Animation properties
    this.animationPhase = 0;

    // Enemy-specific properties
    this.health = 3;
    this.interactable = true;
    this.alive = true;
    this.deathAngle = 0;

    // Animation state properties
    this.swingIntensity = 0;
    this.footOffset = 0;
    this.lastMovement = performance.now();

    // AI movement flags
    this.moveUp = false;
    this.moveDown = false;
    this.moveLeft = false;
    this.moveRight = false;

    // Initialize AI movement timer
    this.nextMoveTime = performance.now() + this.getRandomMoveInterval();
  }

  // Helper method to get a random interval for AI movement changes
  getRandomMoveInterval() {
    return 1000 + Math.random() * 2000; // 1 to 3 seconds
  }

  // Update method with AI movement logic
  update(deltaTime) {
    if (this.alive) {
      // Update animation phase
      this.animationPhase += deltaTime * 5;

      // Handle AI movement decisions
      const now = performance.now();
      if (now >= this.nextMoveTime) {
        this.chooseRandomDirection();
        this.nextMoveTime = now + this.getRandomMoveInterval();
      }

      let moveX = 0, moveY = 0;

      if (this.moveUp) moveY -= 1;
      if (this.moveDown) moveY += 1;
      if (this.moveLeft) moveX -= 1;
      if (this.moveRight) moveX += 1;

      // Normalize diagonal movement
      if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
      }

      this.x += moveX * this.speed * deltaTime;
      this.y += moveY * this.speed * deltaTime;

      // Keep enemy within bounds
      this.x = Math.max(0, Math.min(this.playAreaWidth - this.width, this.x));
      this.y = Math.max(0, Math.min(this.playAreaHeight - this.height, this.y));

      // Update animation states
      this.swingIntensity = this.moving ? 
        Math.min(1, this.swingIntensity + deltaTime * 2) :
        Math.max(0, this.swingIntensity - deltaTime * 2);
      
      this.footOffset = Math.sin(Date.now() * 0.003) * 2;

      // Track last movement for idle detection
      if (moveX !== 0 || moveY !== 0) {
        this.lastMovement = now;
      }
    }
  }

  // Simple AI to choose random movement direction
  chooseRandomDirection() {
    const directions = ['up', 'down', 'left', 'right', 'idle'];
    const choice = directions[Math.floor(Math.random() * directions.length)];

    this.moveUp = false;
    this.moveDown = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moving = false;

    switch(choice) {
      case 'up':
        this.moveUp = true;
        this.direction = 'up';
        this.moving = true;
        break;
      case 'down':
        this.moveDown = true;
        this.direction = 'down';
        this.moving = true;
        break;
      case 'left':
        this.moveLeft = true;
        this.direction = 'left';
        this.moving = true;
        break;
      case 'right':
        this.moveRight = true;
        this.direction = 'right';
        this.moving = true;
        break;
      case 'idle':
        // Remain idle
        this.moving = false;
        break;
    }
  }

  // Method to check if the enemy is clicked
  checkClick(worldX, worldY) {
    return this.alive && 
      worldX > this.x - this.width / 2 && 
      worldX < this.x + this.width / 2 &&
      worldY > this.y - this.height / 2 && 
      worldY < this.y + this.height / 2;
  }

  // Method to apply damage to the enemy
  takeDamage(amount) {
    if (!this.alive) return;
    
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;
      this.deathAngle = Math.random() * Math.PI / 4 - Math.PI / 8;
    }
  }

  // Render method to draw the enemy on the canvas
  render(ctx) {
    const isMoving = this.moving;
    const idleTime = (performance.now() - this.lastMovement) / 1000;
    const isIdle = idleTime > 3;
    
    ctx.save();
    ctx.translate(this.x + 16, this.y + 24);

    if (!this.alive) {
      ctx.rotate(this.deathAngle);
      // Blood pool
      ctx.fillStyle = '#8a0303';
      ctx.beginPath();
      ctx.ellipse(0, this.height / 2 + 10, 30, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 30, 16 + Math.abs(this.footOffset), 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.alive) {
      // Body base with dynamic lighting
      this.drawBody(ctx, isMoving, isIdle);
      this.drawClothing(ctx);
      this.drawHead(ctx, isIdle);
      this.drawDirectionIndicator(ctx);
    }

    // Breathing animation for enemies if idle
    if (this.alive && isIdle) {
      ctx.translate(0, Math.sin(idleTime * 2) * 3);
      
      if (Math.random() < 0.02) {
        this.createThoughtBubble(ctx);
      }
    }

    ctx.restore();
  }

  // Method to draw the body similar to Player
  drawBody(ctx, isMoving, isIdle) {
    // Animated torso
    ctx.fillStyle = '#FF6347'; // Different color to distinguish enemies
    ctx.beginPath();
    ctx.moveTo(-8, -12);  // Left shoulder moved out
    ctx.lineTo(8, -12);   // Right shoulder moved out
    ctx.lineTo(10 - Math.sin(Date.now() * 0.005) * this.swingIntensity * 2, 12);
    ctx.lineTo(-10 + Math.sin(Date.now() * 0.005) * this.swingIntensity * 2, 12);
    ctx.closePath();
    ctx.fill();
    
    // Muscle definition (arms) - moved out slightly
    ctx.fillStyle = '#CD5C5C'; // Different color for enemy arms
    ctx.beginPath();
    ctx.arc(-8 + this.swingIntensity * 2, -4, 4, 0, Math.PI * 2);  // Left arm moved out
    ctx.arc(8 - this.swingIntensity * 2, -4, 4, 0, Math.PI * 2);   // Right arm moved out
    ctx.fill();

    // Legs with walking animation
    ctx.fillStyle = '#FF6347';
    const legSwing = Math.sin(Date.now() * 0.01) * this.swingIntensity * 20;
    
    // Left leg
    ctx.save();
    ctx.translate(-5, 12);
    ctx.rotate(-legSwing * Math.PI / 180); // Convert to radians
    ctx.fillRect(-3, 0, 6, 16);
    ctx.restore();
    
    // Right leg (opposite swing)
    ctx.save();
    ctx.translate(5, 12);
    ctx.rotate(legSwing * Math.PI / 180); // Convert to radians
    ctx.fillRect(-3, 0, 6, 16);
    ctx.restore();
  }

  // Method to draw clothing similar to Player
  drawClothing(ctx) {
    // Shirt
    ctx.fillStyle = '#8B0000'; // Different color for enemy clothing
    ctx.fillRect(-8, -8, 16, 20);
    
    // Overalls
    ctx.fillStyle = '#800000';
    ctx.fillRect(-8, 2, 16, 6);
    ctx.fillRect(-4, -8, 8, 16);
    
    // Belt
    ctx.fillStyle = '#654321';
    ctx.fillRect(-8, 6, 16, 2);
  }

  // Method to draw the head similar to Player
  drawHead(ctx, isIdle) {
    ctx.save();
    
    if (this.direction === 'up') {
      // When facing up, draw only hair covering the whole head
      ctx.fillStyle = '#654321';
      ctx.beginPath();
      ctx.arc(0, -20, 10, 0, Math.PI*2);
      ctx.fill();
    } else {
      // Head base for other directions
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.arc(0, -20, 10, 0, Math.PI*2);
      ctx.fill();

      // Hair with subtle movement
      ctx.fillStyle = '#654321';
      ctx.beginPath();
      if (this.direction === 'left') {
        // Hair swept to the right when facing left
        ctx.arc(0, -24, 12, 0, Math.PI * 0.4);
        ctx.lineTo(0, -24);
        ctx.closePath();
        ctx.fill();
      } else if (this.direction === 'right') {
        // Hair swept to the left
        ctx.arc(0, -24, 12, Math.PI * 0.8, Math.PI * 1.2);
        ctx.lineTo(0, -24);
        ctx.closePath();
        ctx.fill();
      }

      // Face expression
      ctx.fillStyle = '#333';
      // Blinking eyes
      if (this.direction !== 'up' && (!isIdle || Math.random() > 0.002)) { 
        ctx.beginPath();
        if (this.direction === 'left') {
          // Only show left eye when facing left
          ctx.arc(-4, -22, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.direction === 'right') {
          // Only show right eye when facing right
          ctx.arc(4, -22, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.direction === 'down') {
          // Show both eyes when facing down
          ctx.beginPath();
          ctx.arc(-4, -22, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(4, -22, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Mouth animation
      ctx.beginPath();
      ctx.moveTo(-3, -18);
      ctx.quadraticCurveTo(0, -16 + (isIdle ? 1 : 0), 3, -18);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Hat
    ctx.fillStyle='#2F4F4F';
    ctx.beginPath();
    ctx.moveTo(-12, -30);
    ctx.lineTo(12, -30);
    ctx.lineTo(8, -36);
    ctx.lineTo(-8, -36);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Method to create a thought bubble (optional for enemies)
  createThoughtBubble(ctx) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(20 + Math.sin(Date.now()*0.01)*5, -50, 8, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(35 + Math.cos(Date.now()*0.008)*3, -60, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(45 + Math.sin(Date.now()*0.012)*4, -62, 4, 0, Math.PI*2);
    ctx.fill();
  }

  // Method to draw direction indicator similar to Player
  drawDirectionIndicator(ctx) {
    ctx.fillStyle = `rgba(255,255,255,${this.moving ? 0.3 : 0.1})`;
    ctx.beginPath();
    switch(this.direction) {
      case 'up': 
        ctx.arc(0, -34, 5, 0, Math.PI*2);
        ctx.moveTo(0, -40);
        ctx.lineTo(-4, -34);
        ctx.lineTo(4, -34);
        ctx.closePath();
        break;
      case 'down':
        ctx.arc(0, 14, 5, 0, Math.PI*2);
        ctx.moveTo(0, 20);
        ctx.lineTo(-4, 14);
        ctx.lineTo(4, 14);
        ctx.closePath();
        break;
      case 'left':
        ctx.arc(-24, -10, 5, 0, Math.PI*2);
        ctx.moveTo(-30, -10);
        ctx.lineTo(-24, -14);
        ctx.lineTo(-24, -6);
        ctx.closePath();
        break;
      case 'right':
        ctx.arc(24, -10, 5, 0, Math.PI*2);
        ctx.moveTo(30, -10);
        ctx.lineTo(24, -14);
        ctx.lineTo(24, -6);
        ctx.closePath();
        break;
    }
    ctx.fill();
  }
}
