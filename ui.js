

export class UI {
  constructor() {
    this.createUI();
  }

  createUI() {
    // Distance display
    this.distanceDiv = document.createElement('div');
    this.distanceDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      color: white;
      font-size: 24px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 100;
    `;
    this.distanceDiv.textContent = 'Distance: 0m';
    document.body.appendChild(this.distanceDiv);
    
    // Speed display
    this.speedDiv = document.createElement('div');
    this.speedDiv.style.cssText = `
      position: fixed;
      top: 60px;
      left: 20px;
      color: white;
      font-size: 20px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 100;
    `;
    this.speedDiv.textContent = 'Speed: 100%';
    document.body.appendChild(this.speedDiv);
    
    // Controls hint
    this.controlsDiv = document.createElement('div');
    this.controlsDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      font-size: 16px;
      text-align: center;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 100;
    `;
    this.controlsDiv.innerHTML = '← → : Change Lane | ↑ ↓ : Speed Up/Down';
    document.body.appendChild(this.controlsDiv);
    
    // Game over screen
    this.gameOverDiv = document.createElement('div');
    this.gameOverDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 48px;
      font-weight: bold;
      text-align: center;
      text-shadow: 3px 3px 6px rgba(0,0,0,0.9);
      z-index: 200;
      display: none;
    `;
    document.body.appendChild(this.gameOverDiv);
  }

  updateDistance(distance) {
    this.distanceDiv.textContent = `Distance: ${distance}m`;
  }

  updateSpeed(speed) {
    this.speedDiv.textContent = `Speed: ${speed}%`;
  }

  showGameOver(finalDistance) {
    this.gameOverDiv.innerHTML = `
      GAME OVER<br>
      <div style="font-size: 32px; margin-top: 20px;">Distance: ${finalDistance}m</div>
      <div style="font-size: 20px; margin-top: 20px;">Click or press SPACE to restart</div>
    `;
    this.gameOverDiv.style.display = 'block';
  }

  hideGameOver() {
    this.gameOverDiv.style.display = 'none';
  }
}

