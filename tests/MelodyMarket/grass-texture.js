// Grass Texture Generator for Three.js
function generateGrassTexture(width = 256, height = 256) {
    // Create a canvas to draw the texture
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Base green color
    ctx.fillStyle = 'rgb(34, 139, 34)';  // Forest Green
    ctx.fillRect(0, 0, width, height);

    // Function to draw a single grass blade
    function drawGrassBlade(x, y, length, angle) {
        ctx.beginPath();
        
        // Random green shade
        const greenIntensity = 100 + Math.floor(Math.random() * 155);
        ctx.strokeStyle = `rgb(0, ${greenIntensity}, 0)`;
        
        ctx.lineWidth = 1;  // Reduced line width for better tiling
        ctx.moveTo(x, y);
        
        // Calculate end point based on angle and length
        const endX = x + Math.cos(angle * Math.PI / 180) * length;
        const endY = y + Math.sin(angle * Math.PI / 180) * length;
        
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    // Draw multiple grass blades
    for (let i = 0; i < 1000; i++) {  // Reduced number of blades for performance
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        const length = 5 + Math.floor(Math.random() * 10);  // Shorter blades
        const angle = Math.floor(Math.random() * 360);
        
        drawGrassBlade(x, y, length, angle);
    }

    // Convert canvas to texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1000, 1000);  // Tile the texture 1000x1000 times
    
    return texture;
}
