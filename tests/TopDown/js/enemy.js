export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 60;
    this.health = 3;
    this.interactable = true;
    this.alive = true;
    this.animationPhase = 0;
    this.deathAngle = 0;
  }

  update(deltaTime) {
    if (this.alive) {
      // Basic idle animation
      this.animationPhase += deltaTime * 5;
    }
  }

  checkClick(worldX, worldY) {
    return this.alive && 
      worldX > this.x - this.width/2 && 
      worldX < this.x + this.width/2 &&
      worldY > this.y - this.height/2 && 
      worldY < this.y + this.height/2;
  }

  takeDamage(amount) {
    if (!this.alive) return;
    
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;
      this.deathAngle = Math.random() * Math.PI/4 - Math.PI/8;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    if (!this.alive) {
      ctx.rotate(this.deathAngle);
      // Blood pool
      ctx.fillStyle = '#8a0303';
      ctx.beginPath();
      ctx.ellipse(0, this.height/2 + 10, 30, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(0, this.height/2 + 10, 25, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.alive) {
      // Body
      ctx.fillStyle = '#4a4a4a';
      ctx.beginPath();
      ctx.roundRect(-15, -30, 30, 60, 10);
      ctx.fill();

      // Eye glow
      ctx.fillStyle = `rgba(255,50,50,${0.5 + Math.sin(this.animationPhase)*0.3})`;
      ctx.beginPath();
      ctx.arc(-8, -15, 4, 0, Math.PI * 2);
      ctx.arc(8, -15, 4, 0, Math.PI * 2);
      ctx.fill();

      // Arms
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-20, -10);
      ctx.lineTo(-30 + Math.sin(this.animationPhase)*5, 0);
      ctx.moveTo(20, -10);
      ctx.lineTo(30 + Math.cos(this.animationPhase)*5, 0);
      ctx.stroke();
    } else {
      // Dead body
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.roundRect(-15, -30, 30, 40, 10);
      ctx.fill();
    }

    ctx.restore();
  }
}