export class House {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 200;
    this.height = 240;
    this.interactable = true;
    this.collidable = true;
    this.smokePhase = Math.random() * Math.PI * 2;
    this.lightOn = false;
    this.doorOpenPhase = 0;
    this.gardenGrowth = Math.random() * Math.PI * 2;
  }

  update(deltaTime) {
    this.smokePhase += deltaTime * 0.3;
    this.gardenGrowth += deltaTime * 0.5;
    this.lightOn = Math.sin(Date.now() * 0.002) > 0.5;
    this.doorOpenPhase = Math.min(1, this.doorOpenPhase + deltaTime * 0.5);
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Main structure with wooden planks
    ctx.fillStyle = '#deb887';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(-this.width/2, -this.height/2, this.width, this.height, 10);
    ctx.fill();
    
    // Wood plank details
    for(let i = -this.width/2 + 10; i < this.width/2 -10; i += 15) {
      ctx.fillStyle = `hsl(30, ${30 + Math.sin(i)*10}%, ${50 + Math.cos(i)*5}%)`;
      ctx.fillRect(i, -this.height/2 + 20, 12, this.height - 40);
    }

    // Stone foundation
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.roundRect(-this.width/2 - 10, this.height/2 - 20, this.width + 20, 40, 20);
    ctx.fill();
    
    // Stone texture
    ctx.strokeStyle = '#707070';
    ctx.lineWidth = 2;
    for(let i = 0; i < 20; i++) {
      const x = -this.width/2 -5 + Math.random() * (this.width + 10);
      const y = this.height/2 - 15 + Math.random() * 25;
      ctx.beginPath();
      ctx.arc(x, y, 3 + Math.random()*5, 0, Math.PI*2);
      ctx.stroke();
    }

    // Roof with shingles
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(-this.width/2 - 20, -this.height/2);
    ctx.lineTo(0, -this.height/2 - 60);
    ctx.lineTo(this.width/2 + 20, -this.height/2);
    ctx.closePath();
    ctx.fill();
    
    // Shingle details
    const shingleHeight = 12;
    for(let y = -this.height/2; y < -this.height/2 + 60; y += shingleHeight) {
      const offset = (y + this.height/2) * 0.3;
      for(let x = -this.width/2 - 20 + offset; x < this.width/2 + 20 - offset; x += 20) {
        ctx.fillStyle = `hsl(30, 50%, ${30 + Math.sin(x/10 + this.smokePhase)*10}%)`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 18, y);
        ctx.lineTo(x + 9, y + shingleHeight);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Chimney with brick texture
    ctx.fillStyle = '#b22222';
    ctx.fillRect(80, -this.height/2 - 40, 40, 60);
    ctx.strokeStyle = '#9c1a1a';
    ctx.lineWidth = 2;
    for(let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(80 + (i%2)*20, -this.height/2 - 40 + i*10);
      ctx.lineTo(120, -this.height/2 - 40 + i*10);
      ctx.stroke();
    }

    // Animated smoke
    const smokeBaseY = -this.height/2 - 60;
    for(let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(245,245,245,${0.4 - i*0.1})`;
      ctx.beginPath();
      ctx.ellipse(
        100, 
        smokeBaseY + Math.sin(this.smokePhase*0.5 + i) * 30 - i*40, 
        30 + Math.abs(Math.sin(this.smokePhase + i)) * 20, 
        25 + Math.abs(Math.cos(this.smokePhase + i)) * 15, 
        0, 0, Math.PI*2
      );
      ctx.fill();
    }

    // Door with window
    ctx.fillStyle = '#5C4033';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(-40, -50, 80, 140, 8);
    ctx.fill();
    
    // Door panel details
    ctx.strokeStyle = '#6B4226';
    ctx.lineWidth = 4;
    ctx.strokeRect(-35, -45, 70, 130);
    ctx.beginPath();
    ctx.moveTo(-35, -45 + 130/2);
    ctx.lineTo(35, -45 + 130/2);
    ctx.stroke();

    // Door window with animated light
    ctx.fillStyle = this.lightOn ? 
      `hsl(60, 80%, ${70 + Math.sin(Date.now()*0.005)*20}%)` : 
      '#87CEEB';
    ctx.beginPath();
    ctx.arc(0, -10, 15, 0, Math.PI*2);
    ctx.fill();

    // Door handle
    ctx.fillStyle = '#CD7F32';
    ctx.beginPath();
    ctx.arc(25, 30, 5 + Math.sin(Date.now()*0.01)*1, 0, Math.PI*2);
    ctx.fill();

    // Flower boxes under windows
    [-100, 80].forEach(xPos => {
      ctx.fillStyle = '#6B4226';
      ctx.fillRect(xPos - 30, 30, 60, 15);
      ctx.fillStyle = '#228B22';
      for(let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(xPos - 20 + i*10 + Math.sin(this.gardenGrowth + i)*3, 
               45, 
               6 + Math.sin(this.gardenGrowth*2 + i)*3, 
               0, Math.PI*2);
        ctx.fill();
      }
    });

    // Hanging lantern
    ctx.fillStyle = '#CD7F32';
    ctx.fillRect(-this.width/2 + 20, -this.height/2 + 40, 10, 30);
    ctx.beginPath();
    ctx.arc(-this.width/2 + 25, -this.height/2 + 70, 15, 0, Math.PI*2);
    ctx.fill();
    if(this.lightOn) {
      ctx.fillStyle = `rgba(255,223,0,0.3)`;
      ctx.beginPath();
      ctx.arc(-this.width/2 + 25, -this.height/2 + 70, 30, 0, Math.PI*2);
      ctx.fill();
    }

    // Garden plants
    ctx.fillStyle = '#2E8B57';
    [-this.width/2 + 50, this.width/2 - 50].forEach(xPos => {
      ctx.beginPath();
      ctx.arc(xPos, 70, 30 + Math.sin(this.gardenGrowth)*10, 0, Math.PI*2);
      ctx.fill();

      ctx.fillStyle = '#FFD700';
      for(let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(xPos + Math.cos(i*1.2 + this.gardenGrowth)*25, 
               70 + Math.sin(i*1.2 + this.gardenGrowth)*25, 
               3 + Math.sin(this.gardenGrowth + i)*2, 
               0, Math.PI*2);
        ctx.fill();
      }
    });

    ctx.restore();
  }

  checkClick(worldX, worldY) {
    const doorArea = {
      left: this.x - 50,
      right: this.x + 50,
      top: this.y - 80,
      bottom: this.y + 60
    };
    
    return worldX >= doorArea.left && worldX <= doorArea.right && 
           worldY >= doorArea.top && worldY <= doorArea.bottom;
  }

  checkCollision(px, py, pWidth, pHeight) {
    return px < this.x + this.width/2 &&
           px + pWidth > this.x - this.width/2 &&
           py < this.y + this.height/2 &&
           py + pHeight > this.y - this.height/2;
  }
}