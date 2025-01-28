export class HealthSystem {
  constructor() {
    this.maxHealth = 100;
    this.currentHealth = this.maxHealth;
    this.deathEvent = new EventTarget();
    this.healthUpdateEvent = new Event('healthupdate');
  }

  damage(amount) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    document.getElementById('health-value').textContent = this.currentHealth;
    this.deathEvent.dispatchEvent(this.healthUpdateEvent);
    if (this.currentHealth <= 0) {
      this.deathEvent.dispatchEvent(new Event('death'));
    }
  }

  heal(amount) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    document.getElementById('health-value').textContent = this.currentHealth;
    this.deathEvent.dispatchEvent(this.healthUpdateEvent);
  }

  reset() {
    this.currentHealth = this.maxHealth;
    document.getElementById('health-value').textContent = this.maxHealth;
  }
}