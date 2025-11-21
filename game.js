

import * as THREE from 'three';
import { Player } from './player.js';
import { World } from './world.js';
import { ObstacleManager } from './obstacles.js';
import { UI } from './ui.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    
    this.clock = new THREE.Clock();
    this.gameState = 'playing'; // 'playing' or 'gameover'
    this.distance = 0;
    this.gameSpeed = 1;
  }

  init() {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Scene setup - warm peachy atmosphere
    this.scene.background = new THREE.Color(0xb8c5d6);
    this.scene.fog = new THREE.Fog(0xd4a574, 20, 150);
    
    // Lighting - warm ambient + directional
    const ambientLight = new THREE.AmbientLight(0xffd4a3, 0.7);
    this.scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 20, 5);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);
    
    // Initialize game components
    this.world = new World(this.scene);
    this.player = new Player(this.scene);
    this.obstacleManager = new ObstacleManager(this.scene);
    this.ui = new UI();
    
    // Camera setup - behind and above player
    this.camera.position.set(0, 6, 12);
    this.camera.lookAt(0, 2, 0);
    
    // Handle window resize
    window.addEventListener('resize', () => this.onResize());
  }

  update() {
    if (this.gameState !== 'playing') return;
    
    const delta = this.clock.getDelta();
    
    // Update game speed based on player input
    this.gameSpeed = this.player.currentSpeed;
    
    // Update distance
    this.distance += this.gameSpeed * delta * 10;
    
    // Update components
    this.player.update(delta);
    this.world.update(delta, this.gameSpeed);
    this.obstacleManager.update(delta, this.gameSpeed, this.player.getCurrentLane());
    
    // Check collisions (only if player mesh is loaded)
    if (this.player.mesh && this.obstacleManager.checkCollision(this.player.mesh.position, this.player.getCurrentLane())) {
      this.gameOver();
    }
    
    // Update UI
    this.ui.updateDistance(Math.floor(this.distance));
    this.ui.updateSpeed(Math.floor(this.gameSpeed * 100));
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }

  gameOver() {
    this.gameState = 'gameover';
    this.ui.showGameOver(Math.floor(this.distance));
    
    // Restart on click
    setTimeout(() => {
      window.addEventListener('click', () => this.restart(), { once: true });
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') this.restart();
      }, { once: true });
    }, 500);
  }

  restart() {
    this.gameState = 'playing';
    this.distance = 0;
    this.gameSpeed = 1;
    this.player.reset();
    this.world.reset();
    this.obstacleManager.reset();
    this.ui.hideGameOver();
    this.clock.start();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

