export class TimeSystem {
  constructor() {
    this.minutes = 1260; // Start at 9:00 PM (9 PM = 21 * 60 = 1260 minutes)
    this.timeSpeed = 1; // Adjusts how fast time progresses
    this.timeElement = document.getElementById('time-value');
    this.updateTimeDisplay();
  }

  /**
   * Updates the current time based on the elapsed deltaTime.
   * @param {number} deltaTime - The time elapsed since the last update (in seconds).
   */
  update(deltaTime) {
    this.minutes += deltaTime * 6 * this.timeSpeed; // 6 minutes per second at timeSpeed = 1
    if (this.minutes >= 1440) this.minutes -= 1440; // Reset after a full day
    this.updateTimeDisplay();
  }

  /**
   * Updates the time display element with the current time in HH:MM AM/PM format.
   */
  updateTimeDisplay() {
    const hours = Math.floor(this.minutes / 60);
    const mins = Math.floor(this.minutes % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert to 12-hour format
    this.timeElement.textContent = 
      `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Calculates the current lighting settings based on the time of day.
   * Returns an object containing lightness, alpha, darkness, and radius properties.
   * These can be used to adjust scene lighting for day/night cycles.
   * @returns {Object} Lighting settings.
   */
  getDayNightTint() {
    const hour = this.minutes / 60; // Current hour in 24-hour format
    const normalizedHour = (hour + 6) % 24; // Shift to make midnight at 0 for better phase calculation
    const phase = (normalizedHour / 24) * Math.PI * 2; // Convert to radians for sine calculations

    // Smooth transition for night intensity using a cosine function shifted by PI/2
    const nightIntensity = Math.max(0, Math.cos(phase)) * 0.8;

    // Lightness transitions from bright during the day to dim at night
    const lightness = 50 + Math.cos(phase) * 40; // Varies between 10 and 90

    // Alpha controls the transparency of the lighting overlay
    const alpha = 0.6 - Math.abs(Math.cos(phase)) * 0.5; // Varies between 0.1 and 0.6

    // Darkness can be used to adjust ambient occlusion or shadow intensity
    const darkness = nightIntensity;

    // Radius could control the spread of a lighting effect or shader parameter
    const radius = 300 + (1 - nightIntensity) * 500; // Varies between 300 and 800

    return {
      lightness: lightness,
      alpha: alpha,
      darkness: darkness,
      radius: radius
    };
  }

  /**
   * Toggles between day and night
   */
  toggleDayNight() {
    const currentHour = this.minutes / 60;
    // If it's currently day (6 AM to 6 PM), set to night (9 PM)
    if (currentHour >= 6 && currentHour < 18) {
      this.minutes = 21 * 60; // 9 PM
    } else {
      // If it's night, set to day (9 AM)
      this.minutes = 9 * 60; // 9 AM
    }
    this.updateTimeDisplay();
  }
}