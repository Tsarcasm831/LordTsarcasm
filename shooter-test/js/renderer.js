// js/renderer.js
const Renderer = (() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    const muzzleFlash = {
        canvas: document.getElementById('muzzleFlashCanvas'),
        frame: 0,
        totalFrames: 4,
        animationSpeed: 50,
        lastFrameTime: 0,
        isAnimating: false
    };
    const muzzleFlashCtx = muzzleFlash.canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function resizeMuzzleFlashCanvas() {
        muzzleFlash.canvas.width = window.innerWidth;
        muzzleFlash.canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeMuzzleFlashCanvas);
    resizeMuzzleFlashCanvas();

    function drawMuzzleFlash() {
        if (!muzzleFlash.isAnimating) return;

        const currentTime = Date.now();
        if (currentTime - muzzleFlash.lastFrameTime > muzzleFlash.animationSpeed) {
            muzzleFlash.frame++;
            if (muzzleFlash.frame >= muzzleFlash.totalFrames) {
                muzzleFlash.isAnimating = false;
                muzzleFlash.frame = 0;
                muzzleFlashCtx.clearRect(0, 0, muzzleFlash.canvas.width, muzzleFlash.canvas.height);
                return;
            }
            muzzleFlash.lastFrameTime = currentTime;
        }

        muzzleFlashCtx.clearRect(0, 0, muzzleFlash.canvas.width, muzzleFlash.canvas.height);

        const frameWidth = Assets.muzzleFlashSprite.width / muzzleFlash.totalFrames;
        const frameHeight = Assets.muzzleFlashSprite.height;

        const scale = (muzzleFlash.canvas.height / frameHeight) * Game.muzzleFlashSize;
        const scaledWidth = frameWidth * scale;
        const scaledHeight = frameHeight * scale;

        const xPosition = (muzzleFlash.canvas.width - scaledWidth) / 2 + Game.muzzleFlashXOffset;
        const yPosition = muzzleFlash.canvas.height - scaledHeight + Game.muzzleFlashYOffset;

        muzzleFlashCtx.drawImage(
            Assets.muzzleFlashSprite,
            muzzleFlash.frame * frameWidth, 0,
            frameWidth, frameHeight,
            xPosition,
            yPosition,
            scaledWidth,
            scaledHeight
        );
    }

    function renderFloor(wallBottoms) {
        // Floor rendering logic (similar to your existing function)
    }

    function renderCeiling(wallTops) {
        // Ceiling rendering logic (similar to your existing function)
    }

    function draw() {
        const bobOffset = Game.player.bobAmount;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw skybox
        const skyWidth = Assets.skyboxImages[Game.currentSkyboxName].width;
        const skyHeight = Assets.skyboxImages[Game.currentSkyboxName].height;
        const skyAspectRatio = skyWidth / skyHeight;
        const skyImageWidth = skyAspectRatio * canvas.height;

        let skyOffsetX = (Game.player.angle / (2 * Math.PI)) * skyImageWidth;
        skyOffsetX = skyOffsetX % skyImageWidth;
        if (skyOffsetX < 0) skyOffsetX += skyImageWidth;

        for (let x = -skyOffsetX; x < canvas.width; x += skyImageWidth) {
            ctx.drawImage(Assets.skyboxImages[Game.currentSkyboxName], x, 0, skyImageWidth, canvas.height);
        }

        ctx.fillStyle = '#666';
        ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

        const FOV = Math.PI / 3;
        const rayCount = canvas.width;
        const rayStep = FOV / rayCount;

        const wallBottoms = [];
        const wallTops = [];
        ctx.imageSmoothingEnabled = false;

        for (let i = 0; i < rayCount; i++) {
            const rayAngle = Game.player.angle - FOV / 2 + rayStep * i;
            const { distance, hitX, wallType, doorProgress, isGoop, goopDistance, isPool, poolDistance } = CastRay.cast(rayAngle);

            let wallHeight = canvas.height / distance;
            const textureX = Math.floor(hitX * Assets.wallTexture.width);

            const brightness = Math.min(1, 1 / (distance * 0.2));
            ctx.globalAlpha = brightness;

            if (isGoop) {
                const floorHeight = canvas.height / goopDistance;
                ctx.drawImage(
                    Assets.goopTexture,
                    textureX, 0,
                    1, Assets.goopTexture.height,
                    i,
                    (canvas.height + floorHeight) / 2,
                    1,
                    canvas.height - ((canvas.height + floorHeight) / 2)
                );
            }

            if (isPool) {
                const floorHeight = canvas.height / poolDistance;

                const poolAnimationSpeed = 200;
                const poolFrame = Math.floor(Date.now() / poolAnimationSpeed) % Assets.poolTextures.length;
                const textureToUse = Assets.poolTextures[poolFrame];

                ctx.drawImage(
                    textureToUse,
                    textureX, 0,
                    1, textureToUse.height,
                    i,
                    (canvas.height + floorHeight) / 2,
                    1,
                    canvas.height - ((canvas.height + floorHeight) / 2)
                );
            }

            const texture = wallType === 'door' ? Assets.doorTexture :
                wallType === 2 ? Assets.poolWallTexture :
                    Assets.wallTexture;

            let wallTopY = (canvas.height - wallHeight) / 2;
            let wallBottomY = (canvas.height + wallHeight) / 2;

            if (wallType === 'door' && doorProgress !== undefined) {
                let shift = doorProgress * wallHeight;
                wallTopY += shift;
                wallBottomY += shift;

                if (doorProgress >= 1) {
                    wallTopY += wallHeight * 0.1;
                    wallBottomY += wallHeight * 0.1;
                }

                wallHeight = wallBottomY - wallTopY;
            }

            ctx.drawImage(
                texture,
                textureX, 0,
                1, texture.height,
                i,
                wallTopY,
                1,
                wallHeight
            );

            wallBottoms[i] = wallBottomY;
            wallTops[i] = wallTopY;

            ctx.globalAlpha = 1;
        }

        renderCeiling(wallTops);
        renderFloor(wallBottoms);

        // Draw enemies, projectiles, ammo crates, minimap, HUD, weapon, muzzle flash, etc.
        // You can further modularize these rendering steps into separate functions or modules.

        drawMuzzleFlash();
    }

    return {
        draw
    };
})();
