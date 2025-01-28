export class TimeSystem {
  constructor() {
    this.minutes = 360; // 6:00 AM
    this.timeSpeed = 0.3;
    this.timeElement = document.getElementById('time-value');
    this.updateTimeDisplay();
  }

  update(deltaTime) {
    this.minutes += deltaTime * 6 * this.timeSpeed;
    if (this.minutes >= 1440) this.minutes = 360;
    this.updateTimeDisplay();
  }

  updateTimeDisplay() {
    const hours = Math.floor(this.minutes / 60);
    const mins = Math.floor(this.minutes % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    this.timeElement.textContent = 
      `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  }

  getDayNightTint() {
    const hour = this.minutes / 60;
    const phase = ((hour + 6) % 24) / 24 * Math.PI * 2;
    const nightIntensity = Math.max(0, Math.sin(phase * 1.2)) * 0.8;
    
    return {
      lightness: 50 + Math.sin(phase) * 40,
      alpha: 0.6 - Math.abs(Math.sin(phase)) * 0.5,
      darkness: nightIntensity,
      radius: 300 + (1 - nightIntensity) * 500
    };
  }
}