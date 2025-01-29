export class TextureCache {
    static #instance = null;
    #cache = new Map();

    static getInstance() {
        if (!TextureCache.#instance) {
            TextureCache.#instance = new TextureCache();
        }
        return TextureCache.#instance;
    }

    async loadTexture(url) {
        if (this.#cache.has(url)) {
            return this.#cache.get(url);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            
            img.onload = () => {
                this.#cache.set(url, img);
                resolve(img);
            };
            
            img.onerror = (err) => {
                console.error(`Failed to load texture: ${url}`, err);
                reject(err);
            };

            img.src = url;
        });
    }

    getTexture(url) {
        return this.#cache.get(url);
    }

    hasTexture(url) {
        return this.#cache.has(url);
    }
}
