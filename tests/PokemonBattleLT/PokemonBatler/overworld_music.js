// Overworld Music Management
class OverworldMusicManager {
    constructor() {
        this.currentAudio = null;
        this.musicAreas = {
            forest: 'successtheobsession.wav',
            cave: 'https://www.youtube.com/embed/Fl2ovlHmoTg?autoplay=1&mute=0',
            town: 'https://example.com/town_music.mp3',
            // Add more areas and their music URLs
        };
    }

    playAreaMusic(area) {
        // Stop current music if playing
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        // Check if music exists for the area
        const musicUrl = this.musicAreas[area];
        if (musicUrl) {
            // Check if it's a YouTube link
            if (musicUrl.includes('youtube.com')) {
                // Create an iframe for YouTube video
                const existingIframe = document.getElementById('background-music');
                if (existingIframe) {
                    existingIframe.remove();
                }

                const iframe = document.createElement('iframe');
                iframe.id = 'background-music';
                iframe.src = musicUrl;
                iframe.style.display = 'none';
                iframe.allow = 'autoplay';
                document.body.appendChild(iframe);
            } else {
                // For local or direct audio files
                this.currentAudio = new Audio(musicUrl);
                this.currentAudio.loop = true;
                this.currentAudio.play()
                    .catch(error => console.error('Error playing music:', error));
            }
        }
    }

    stopMusic() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        // Remove YouTube iframe if exists
        const iframe = document.getElementById('background-music');
        if (iframe) {
            iframe.remove();
        }
    }
}

// Create global instance
window.overworldMusicManager = new OverworldMusicManager();

// Example usage function (you'll call this when entering different areas)
function changeAreaMusic(area) {
    window.overworldMusicManager.playAreaMusic(area);
}
