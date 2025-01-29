// player.js

export class Player {
  constructor(x, y, playAreaWidth, playAreaHeight) {
    // Original dimensions
    const originalWidth = 32;
    const originalHeight = 48;
    const scaleFactor = 1.3; // 30% larger

    // Scale dimensions
    this.width = originalWidth * scaleFactor; // 41.6 -> 42
    this.height = originalHeight * scaleFactor; // 62.4 -> 62

    this.x = x;
    this.y = y;
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
    
    // Add house interior state
    this.isInHouse = false;
    this.houseInteriorBounds = null;

    // Sprite images
    this.sprites = {
      down: new Image(),
      up: new Image(),
      left: new Image(),
      right: new Image()
    };

    // Load sprite images
    this.sprites.down.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/player_down.png';
    this.sprites.up.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/player_up.png';
    this.sprites.left.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/player_left.png';
    this.sprites.right.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/player_right.png';

    // Ensure all images are loaded before rendering
    this.imagesLoaded = false;
    this.loadImages();

    // Adjusted shadow dimensions
    this.shadowWidth = (this.width / originalWidth) * 16; // Original shadow width was 16
    this.shadowHeight = 8 * scaleFactor; // Original shadow height was 8
  }

  loadImages() {
    const promises = Object.values(this.sprites).map(img => {
      return new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });
    });

    Promise.all(promises)
      .then(() => {
        this.imagesLoaded = true;
        console.log('All player sprites loaded successfully.');
      })
      .catch(err => {
        console.error('Error loading player sprites:', err);
      });
  }

  handleKeyDown(e) {
    switch(e.code) {
      case 'KeyW': this.moveUp = true; break;
      case 'KeyS': this.moveDown = true; break;
      case 'KeyA': this.moveLeft = true; break;
      case 'KeyD': this.moveRight = true; break;
      case 'Space': this.jump(); break;
    }
    this.updateDirection();
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

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpPhase = 0;
    }
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

    // Keep player within bounds based on current environment
    if (this.isInHouse && this.houseInteriorBounds) {
      this.x = Math.max(0, Math.min(this.houseInteriorBounds.width - this.width, this.x));
      this.y = Math.max(0, Math.min(this.houseInteriorBounds.height - this.height, this.y));
    } else {
      this.x = Math.max(0, Math.min(this.playAreaWidth - this.width, this.x));
      this.y = Math.max(0, Math.min(this.playAreaHeight - this.height, this.y));
    }
    
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

    // Handle jumping logic
    if (this.isJumping) {
      this.jumpPhase += deltaTime;
      if (this.jumpPhase >= 1) { // Example jump duration
        this.isJumping = false;
        this.jumpPhase = 0;
      }
      // Implement jump mechanics (e.g., vertical displacement) here if needed
    }
  }

  render(ctx) {
    if (!this.imagesLoaded) return; // Do not render until images are loaded

    const isMoving = this.moving;
    const idleTime = (performance.now() - this.lastMovement) / 1000;
    const isIdle = idleTime > 3;
    
    ctx.save();
    ctx.translate(this.x, this.y);

    // Render shadow
    this.renderShadow(ctx);

    // Render sprite
    this.renderSprite(ctx, isIdle);

    // Breathing animation
    if (isIdle) {
      this.renderBreathing(ctx, idleTime);
    }

    ctx.restore();
  }

  renderShadow(ctx) {
    ctx.save();
    // Position shadow at the bottom center of the player
    ctx.translate(this.width / 2, this.height);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.shadowWidth, this.shadowHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderSprite(ctx, isIdle) {
    // Determine sprite position (top-left corner)
    const spriteX = 0;
    const spriteY = 0;

    // Draw the appropriate sprite based on direction
    const sprite = this.sprites[this.direction];
    if (sprite) {
      ctx.drawImage(sprite, spriteX, spriteY, this.width, this.height);
    }
  }

  renderBreathing(ctx, idleTime) {
    // Example breathing effect: slight up and down movement
    const breatheOffset = Math.sin(idleTime * 2) * 3;
    ctx.translate(0, breatheOffset);
  }
}