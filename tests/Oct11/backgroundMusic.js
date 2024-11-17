// backgroundMusic.js

class BackgroundMusicPlayer {
    constructor() {
        this.currentTrack = 1;
        this.isPlaying = false;
        this.volume = 0.3; // Set volume to 30%
        this.tracks = [
            './music/background/bg1.mp3',
            './music/background/bg2.mp3',
            './music/background/bg3.mp3',
            './music/background/bg4.mp3',
            './music/background/bg5.mp3',
            './music/background/bg6.mp3',
        ];
        
        this.init();
    }

    init() {
        const container = document.getElementById('backgroundMusic');
        if (!container) {
            console.error('Background music container not found');
            return;
        }
        
        container.innerHTML = `
            <div class="music-player-container">
                <audio id="bgAudio" controlsList="nodownload nofullscreen noremoteplayback" preload="none">
                    <source src="${this.tracks[0]}" type="audio/mpeg">
                </audio>
                <button id="toggleMusic" class="music-toggle" aria-label="Toggle music playback">
                    ►
                </button>
                <div class="track-info">Click to play music</div>
                <input type="range" id="volumeSlider" min="0" max="100" value="30" class="volume-slider" aria-label="Volume control">
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .music-player-container {
                position: fixed;
                bottom: 100px;
                left: 140px;
                display: flex;
                align-items: center;
                background: rgba(0, 0, 0, 0.7);
                padding: 8px 16px;
                border-radius: 8px;
                color: #fff;
                z-index: 5;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            }

            .music-toggle {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                margin-right: 12px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                color: white;
                font-size: 20px;
            }

            .music-bars {
                display: flex;
                gap: 2px;
                height: 20px;
            }

            .bar {
                width: 3px;
                background-color: #fff;
                animation: soundBars 1s ease-in-out infinite;
            }

            .bar:nth-child(2) {
                animation-delay: 0.2s;
            }

            .bar:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes soundBars {
                0% { height: 5px; }
                50% { height: 20px; }
                100% { height: 5px; }
            }

            .track-info {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.9);
                margin-right: 12px;
            }

            .volume-slider {
                width: 60px;
                height: 4px;
                -webkit-appearance: none;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                outline: none;
            }

            .volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #fff;
                cursor: pointer;
            }

            .volume-slider::-moz-range-thumb {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #fff;
                cursor: pointer;
                border: none;
            }
        `;
        document.head.appendChild(style);

        // Setup audio element
        this.audio = document.getElementById('bgAudio');
        this.toggleBtn = document.getElementById('toggleMusic');
        this.volumeSlider = document.getElementById('volumeSlider');
        
        if (this.audio && this.toggleBtn && this.volumeSlider) {
            // Set initial volume
            this.audio.volume = this.volume;
            
            // Prevent right-click on audio element
            this.audio.oncontextmenu = (e) => {
                e.preventDefault();
                return false;
            };

            // Add event listeners
            this.toggleBtn.addEventListener('click', () => this.togglePlayPause());
            this.audio.addEventListener('ended', () => this.playNextTrack());
            this.volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value / 100;
                this.audio.volume = this.volume;
            });

            // Prevent keyboard shortcuts for media download
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
                    e.preventDefault();
                }
            });
        }
    }

    loadTrack() {
        this.audio.innerHTML = `
            <source src="${this.tracks[this.currentTrack - 1]}" type="audio/mpeg">
        `;
        this.audio.load();
        this.audio.volume = this.volume;
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.toggleBtn.innerHTML = '►';
            document.querySelector('.track-info').textContent = 'Paused';
        } else {
            this.loadTrack();
            this.audio.play().then(() => {
                this.toggleBtn.innerHTML = `
                    <div class="music-bars">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                    </div>
                `;
                document.querySelector('.track-info').textContent = `Now Playing: Track ${this.currentTrack}`;
            }).catch(error => {
                console.error('Playback failed:', error);
                this.isPlaying = false;
            });
        }
        this.isPlaying = !this.isPlaying;
    }

    playNextTrack() {
        this.currentTrack = (this.currentTrack % 5) + 1;
        this.loadTrack();
        document.querySelector('.track-info').textContent = `Now Playing: Track ${this.currentTrack}`;
        if (this.isPlaying) {
            this.audio.play();
        }
    }
}

// Initialize the music player when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new BackgroundMusicPlayer();
});