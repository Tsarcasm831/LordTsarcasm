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
            // YouTube links can now be added like this:
            'https://www.youtube.com/watch?v=lGQ4Z40c7lI&list=OLAK5uy_mzlMn0mxaln4cwviS-SnLYXmhKfIVnHBM'
        ];
        
        this.youtubeTrackIndexes = []; // Track indexes of YouTube links
        this.youtubePlayer = null;
        
        this.init();
    }

    init() {
        // Load YouTube IFrame API script
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // Wait for YouTube API to load
        window.onYouTubeIframeAPIReady = () => {
            this.initializeYouTubePlayers();
        };

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
                <div id="youtubePlayerContainer" style="display:none;"></div>
                <button id="prevTrack" class="track-navigation" aria-label="Previous track">
                    ◀
                </button>
                <button id="toggleMusic" class="music-toggle" aria-label="Toggle music playback">
                    ►
                </button>
                <button id="nextTrack" class="track-navigation" aria-label="Next track">
                    ▶
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

            .track-navigation {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                margin: 0 8px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
                opacity: 0.7;
                transition: opacity 0.2s ease;
            }

            .track-navigation:hover {
                opacity: 1;
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
        this.prevTrackBtn = document.getElementById('prevTrack');
        this.nextTrackBtn = document.getElementById('nextTrack');
        this.trackInfo = document.querySelector('.track-info');
        this.youtubePlayerContainer = document.getElementById('youtubePlayerContainer');
        
        if (this.audio && this.toggleBtn && this.volumeSlider && this.prevTrackBtn && this.nextTrackBtn) {
            // Set initial volume
            this.audio.volume = this.volume;
            
            // Prevent right-click on audio element
            this.audio.oncontextmenu = (e) => {
                e.preventDefault();
                return false;
            };

            // Add event listeners
            this.toggleBtn.addEventListener('click', () => this.togglePlayPause());
            this.prevTrackBtn.addEventListener('click', () => this.playPreviousTrack());
            this.nextTrackBtn.addEventListener('click', () => this.playNextTrack());
            this.audio.addEventListener('ended', () => this.playNextTrack());
            this.volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value / 100;
                this.updateVolume();
            });

            // Prevent keyboard shortcuts for media download
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
                    e.preventDefault();
                }
            });
        }
    }

    initializeYouTubePlayers() {
        // Find YouTube track indexes
        this.youtubeTrackIndexes = this.tracks.reduce((indexes, track, index) => {
            if (this.isYouTubeLink(track)) {
                indexes.push(index);
            }
            return indexes;
        }, []);

        // If there are YouTube tracks, create the YouTube player
        if (this.youtubeTrackIndexes.length > 0) {
            this.youtubePlayer = new YT.Player('youtubePlayerContainer', {
                height: '0',
                width: '0',
                playerVars: {
                    'autoplay': 0,
                    'controls': 0,
                    'disablekb': 1,
                    'modestbranding': 1,
                    'showinfo': 0
                },
                events: {
                    'onReady': () => {
                        // Player is ready, but not playing yet
                    },
                    'onStateChange': (event) => {
                        if (event.data === YT.PlayerState.ENDED) {
                            this.playNextTrack();
                        }
                    }
                }
            });
        }
    }

    isYouTubeLink(track) {
        return track.includes('youtube.com/watch?v=') || track.includes('youtu.be/');
    }

    extractYouTubeVideoId(url) {
        const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
        return match ? match[1] : null;
    }

    loadTrack() {
        const currentTrackPath = this.tracks[this.currentTrack - 1];

        // Hide both audio and YouTube player
        this.audio.style.display = 'none';
        if (this.youtubePlayerContainer) {
            this.youtubePlayerContainer.style.display = 'none';
        }

        if (this.isYouTubeLink(currentTrackPath)) {
            // YouTube track
            if (this.youtubePlayer) {
                const videoId = this.extractYouTubeVideoId(currentTrackPath);
                this.youtubePlayer.loadVideoById(videoId);
                this.youtubePlayerContainer.style.display = 'block';
            }
        } else {
            // Regular audio track
            this.audio.innerHTML = `
                <source src="${currentTrackPath}" type="audio/mpeg">
            `;
            this.audio.load();
            this.audio.style.display = 'block';
        }
    }

    updateVolume() {
        if (this.isYouTubeLink(this.tracks[this.currentTrack - 1])) {
            // Update YouTube player volume
            if (this.youtubePlayer) {
                this.youtubePlayer.setVolume(this.volume * 100);
            }
        } else {
            // Update audio element volume
            this.audio.volume = this.volume;
        }
    }

    togglePlayPause() {
        const currentTrackPath = this.tracks[this.currentTrack - 1];

        if (this.isPlaying) {
            // Pause
            if (this.isYouTubeLink(currentTrackPath)) {
                if (this.youtubePlayer) {
                    this.youtubePlayer.pauseVideo();
                }
            } else {
                this.audio.pause();
            }
            this.toggleBtn.innerHTML = '►';
            this.trackInfo.textContent = 'Paused';
        } else {
            // Play
            this.loadTrack();
            
            if (this.isYouTubeLink(currentTrackPath)) {
                if (this.youtubePlayer) {
                    this.youtubePlayer.playVideo();
                }
            } else {
                this.audio.play().catch(error => {
                    console.error('Playback failed:', error);
                    this.isPlaying = false;
                });
            }

            this.toggleBtn.innerHTML = `
                <div class="music-bars">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
            `;
            this.trackInfo.textContent = `Now Playing: Track ${this.currentTrack}`;
        }
        this.isPlaying = !this.isPlaying;
    }

    playPreviousTrack() {
        // Decrement current track, wrapping around to the end if needed
        this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
        this.playTrack(this.currentTrack);
    }

    playNextTrack() {
        // Increment current track, wrapping around to the start if needed
        this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
        this.playTrack(this.currentTrack);
    }

    playTrack(trackIndex) {
        // Check if the track is a YouTube link
        if (this.isYouTubeLink(this.tracks[trackIndex])) {
            // Handle YouTube track
            if (this.youtubePlayer) {
                const videoId = this.extractYouTubeVideoId(this.tracks[trackIndex]);
                this.youtubePlayer.loadVideoById(videoId);
                this.youtubePlayer.playVideo();
                this.audio.pause();
                this.isPlaying = true;
                this.toggleBtn.textContent = '❚❚'; // Pause symbol
                this.trackInfo.textContent = `YouTube Track: ${trackIndex + 1}`;
            }
        } else {
            // Handle audio track
            this.audio.src = this.tracks[trackIndex];
            this.audio.play();
            this.isPlaying = true;
            this.toggleBtn.textContent = '❚❚'; // Pause symbol
            this.trackInfo.textContent = `Track: ${trackIndex + 1}`;
        }
    }

    // Initialize the music player when the page loads
    static init() {
        new BackgroundMusicPlayer();
    }
}

window.addEventListener('DOMContentLoaded', BackgroundMusicPlayer.init);