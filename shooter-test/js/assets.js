// js/assets.js
const Assets = (() => {
    const skyboxImages = {
        sunny: new Image(),
        city: new Image(),
        sunset: new Image()
    };

    skyboxImages.sunny.src = 'https://file.garden/ZqkDHrmuZGkZD3Ia/doom%20shit/SunnySky.png';
    skyboxImages.city.src = 'https://file.garden/ZqkDHrmuZGkZD3Ia/doom%20shit/CitySky.png';
    skyboxImages.sunset.src = 'https://file.garden/ZqkDHrmuZGkZD3Ia/doom%20shit/SunsetSky.png';

    const ceilingTexture = new Image();
    ceilingTexture.src = 'https://bghq.com/textures/doom/264.png';

    const ammoCrateSprite = new Image();
    ammoCrateSprite.src = 'https://file.garden/ZqkDHrmuZGkZD3Ia/doom%20shit/ammunition_crate.png';

    const enemySpriteSheet = new Image();
    enemySpriteSheet.src = 'https://file.garden/ZqkDHrmuZGkZD3Ia/doom%20shit/CacodemonSpritesheet.png';

    const doorTexture = new Image();
    doorTexture.src = 'https://bghq.com/textures/doom/069.png';

    const muzzleFlashSprite = new Image();
    muzzleFlashSprite.src = 'https://file.garden/ZqkDHrmuZGkZD3Ia/MuzzleFlash.png';

    const floorTexture = new Image();
    floorTexture.src = 'https://bghq.com/textures/doom/085.png';

    const goopTexture = new Image();
    goopTexture.src = 'https://bghq.com/textures/doom/164.png';

    const poolTextures = [];
    for (let i = 125; i <= 128; i++) {
        const img = new Image();
        img.src = `https://bghq.com/textures/doom/${i}.png`;
        poolTextures.push(img);
    }

    const grassTextures = [];
    grassTextures[0] = new Image();
    grassTextures[0].src = 'https://bghq.com/textures/doom/136.png';
    grassTextures[1] = new Image();
    grassTextures[1].src = 'https://bghq.com/textures/doom/137.png';

    const wallTexture = new Image();
    wallTexture.src = 'https://bghq.com/textures/doom/317.png';
    const waterTexture = new Image();
    waterTexture.src = 'https://bghq.com/textures/doom/166.png';
    const poolWallTexture = new Image();
    poolWallTexture.src = 'https://bghq.com/textures/doom/167.png';

    const weapons = {
        pistol: {
            name: 'pistol',
            sprite: new Image(),
            frame: 0,
            isAnimating: false,
            animationSpeed: 50,
            lastFrameTime: 0,
            reversing: false,
            totalFrames: 5,
            damage: 20,
            ammo: 20,
            canShoot: true,
            spriteSrc: 'https://file.garden/ZqkDHrmuZGkZD3Ia/PistolSpritesheet.png'
        },
        shotgun: {
            name: 'shotgun',
            sprite: new Image(),
            frame: 0,
            isAnimating: false,
            animationSpeed: 100,
            lastFrameTime: 0,
            reversing: false,
            totalFrames: 4,
            damage: 50,
            ammo: 10,
            canShoot: true,
            spriteSrc: 'https://file.garden/ZqkDHrmuZGkZD3Ia/GunSpritesheet.png'
        }
    };

    // Load weapon sprites
    weapons.pistol.sprite.src = weapons.pistol.spriteSrc;
    weapons.shotgun.sprite.src = weapons.shotgun.spriteSrc;

    const doorOpenSound = new Audio('https://file.garden/ZqkDHrmuZGkZD3Ia/doom%20shit/dooropen.wav');
    const shootingSound = new Audio('https://file.garden/ZqkDHrmuZGkZD3Ia/8d82b5_doom_shotgun_firing_sound_effect.mp3');
    const backgroundMusic = new Audio('https://file.garden/ZqkDHrmuZGkZD3Ia/doom%20shit/Doom%20II%20OST%20-%20Map%200115%20-%20Running%20from%20Evil%20%5BTubeRipper.cc%5D.mp3');
    const ammoPickupSound = new Audio('https://file.garden/ZqkDHrmuZGkZD3Ia/doom%20shit/dsitemup.wav');

    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;

    return {
        skyboxImages,
        ceilingTexture,
        ammoCrateSprite,
        enemySpriteSheet,
        doorTexture,
        muzzleFlashSprite,
        floorTexture,
        goopTexture,
        poolTextures,
        grassTextures,
        wallTexture,
        waterTexture,
        poolWallTexture,
        weapons,
        doorOpenSound,
        shootingSound,
        backgroundMusic,
        ammoPickupSound
    };
})();
