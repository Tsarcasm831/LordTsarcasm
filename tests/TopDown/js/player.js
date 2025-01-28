export class Player {
  constructor(x, y, playAreaWidth, playAreaHeight) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 48;
    this.speed = 400;
    this.direction = 'down';
    this.playAreaWidth = playAreaWidth;
    this.playAreaHeight = playAreaHeight;
    this.moving = false;
    
    this.moveUp = false;
    this.moveDown = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.animationPhase = 0;

    // Add new player properties
    this.jumpPhase = 0;
    this.swingIntensity = 0;
    this.footOffset = 0;
    this.lastMovement = performance.now();
  }

  handleKeyDown(e) {
    switch(e.code) {
      case 'KeyW': this.moveUp = true; break;
      case 'KeyS': this.moveDown = true; break;
      case 'KeyA': this.moveLeft = true; break;
      case 'KeyD': this.moveRight = true; break;
    }
    this.updateDirection();
    if (e.code === 'Space') {
      this.jumpPhase = 0.5;
    }
  }

  handleKeyUp(e) {
    switch(e.code) {
      case 'KeyW': this.moveUp = false; break;
      case 'KeyS': this.moveDown = false; break;
      case 'KeyA': this.moveLeft = false; break;
      case 'KeyD': this.moveRight = false; break;
    }
    this.updateDirection();
  }

  updateDirection() {
    this.moving = this.moveUp || this.moveDown || this.moveLeft || this.moveRight;
    if (this.moveUp) this.direction = 'up';
    else if (this.moveDown) this.direction = 'down';
    else if (this.moveLeft) this.direction = 'left';
    else if (this.moveRight) this.direction = 'right';
  }

  update(deltaTime) {
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

    // Keep player within bounds
    this.x = Math.max(0, Math.min(this.playAreaWidth - this.width, this.x));
    this.y = Math.max(0, Math.min(this.playAreaHeight - this.height, this.y));
    
    // Update animation states
    const now = performance.now();
    this.swingIntensity = this.moving ? 
      Math.min(1, this.swingIntensity + deltaTime * 2) :
      Math.max(0, this.swingIntensity - deltaTime * 2);
    
    this.footOffset = Math.sin(Date.now() * 0.003) * 2;
    
    // Track last movement for idle detection
    if (moveX !== 0 || moveY !== 0) {
      this.lastMovement = now;
    }
  }

  render(ctx) {
    const isMoving = this.moving;
    const idleTime = (performance.now() - this.lastMovement) / 1000;
    const isIdle = idleTime > 3;
    
    ctx.save();
    ctx.translate(this.x + 16, this.y + 24);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 16 + Math.abs(this.footOffset), 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body base with dynamic lighting
    this.drawBody(ctx, isMoving, isIdle);
    this.drawClothing(ctx);
    this.drawHead(ctx, isIdle);
    this.drawDirectionIndicator(ctx);

    // Breathing animation
    if (isIdle) {
      ctx.translate(0, Math.sin(idleTime * 2) * 3);
      
      if (Math.random() < 0.02) {
        this.createThoughtBubble(ctx);
      }
    }

    ctx.restore();
  }

  drawBody(ctx, isMoving, isIdle) {
    // Animated torso
    ctx.fillStyle = '#FFA07A';
    ctx.beginPath();
    ctx.moveTo(-8, -12);  // Left shoulder moved out
    ctx.lineTo(8, -12);   // Right shoulder moved out
    ctx.lineTo(10 - Math.sin(Date.now() * 0.005) * this.swingIntensity * 2, 12);
    ctx.lineTo(-10 + Math.sin(Date.now() * 0.005) * this.swingIntensity * 2, 12);
    ctx.closePath();
    ctx.fill();
    
    // Muscle definition (arms) - moved out slightly
    ctx.fillStyle = '#EE9A76';
    ctx.beginPath();
    ctx.arc(-8 + this.swingIntensity * 2, -4, 4, 0, Math.PI * 2);  // Left arm moved out
    ctx.arc(8 - this.swingIntensity * 2, -4, 4, 0, Math.PI * 2);   // Right arm moved out
    ctx.fill();

    // Legs with walking animation
    ctx.fillStyle = '#FFA07A';
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

  drawClothing(ctx) {
    // Shirt
    ctx.fillStyle = '#6B8E23';
    ctx.fillRect(-8, -8, 16, 20);
    
    // Overalls
    ctx.fillStyle = '#556B2F';
    ctx.fillRect(-8, 2, 16, 6);
    ctx.fillRect(-4, -8, 8, 16);
    
    // Belt
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-8, 6, 16, 2);
  }

  drawHead(ctx, isIdle) {
    ctx.save();
    
    if (this.direction === 'up') {
      // When facing up, draw only hair covering the whole head
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.arc(0, -20, 10, 0, Math.PI*2);
      ctx.fill();
    } else {
      // Head base for other directions
      ctx.fillStyle = '#FFA07A';
      ctx.beginPath();
      ctx.arc(0, -20, 10, 0, Math.PI*2);
      ctx.fill();

      // Hair with subtle movement
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      if (this.direction === 'left') {
        // Hair swept to the left when facing left
        ctx.arc(0, -24, 12, Math.PI * 1.8, Math.PI * 2.2);
        ctx.lineTo(0, -24);
        ctx.closePath();
        ctx.fill();
      } else if (this.direction === 'right') {
        // Hair swept to the left when facing right
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
      if (this.direction === 'right') {
        // Move mouth to the right side when facing right
        ctx.moveTo(4, -18);
        ctx.quadraticCurveTo(7, -16 + (isIdle ? 1 : 0), 10, -18);
      } else if (this.direction === 'left') {
        // Move mouth to the left side when facing left
        ctx.moveTo(-10, -18);
        ctx.quadraticCurveTo(-7, -16 + (isIdle ? 1 : 0), -4, -18);
      } else {
        // Center mouth for other directions
        ctx.moveTo(-3, -18);
        ctx.quadraticCurveTo(0, -16 + (isIdle ? 1 : 0), 3, -18);
      }
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