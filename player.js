

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.mixer = null;
    this.currentLane = 1; // 0=left, 1=center, 2=right
    this.targetLane = 1;
    this.laneWidth = 3;
    this.lanePositions = [-3, 0, 3];
    this.currentSpeed = 1;
    this.targetSpeed = 1;
    this.minSpeed = 0.5;
    this.maxSpeed = 2;
    this.keys = {};
    
    this.load();
    this.setupInput();
  }

  load() {
    const loader = new GLTFLoader();
    loader.load('https://play.rosebud.ai/assets/Cube Guy Character.glb?rVKD', (gltf) => {
      this.mesh = gltf.scene;
      this.mesh.scale.set(1.2, 1.2, 1.2);
      this.mesh.position.set(0, 0, 0);
      this.mesh.rotation.y = Math.PI;
      
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      this.scene.add(this.mesh);
      
      // Setup animation
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.mesh);
        const runAnim = gltf.animations.find(a => a.name.includes('Run'));
        if (runAnim) {
          this.runAction = this.mixer.clipAction(runAnim);
          this.runAction.play();
        }
      }
    });
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.moveLane(-1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.moveLane(1);
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  moveLane(direction) {
    this.targetLane = Math.max(0, Math.min(2, this.currentLane + direction));
  }

  getCurrentLane() {
    return this.currentLane;
  }

  update(delta) {
    if (!this.mesh) return;
    
    // Update speed based on input
    if (this.keys['ArrowUp'] || this.keys['KeyW']) {
      this.targetSpeed = Math.min(this.maxSpeed, this.targetSpeed + delta * 2);
    } else if (this.keys['ArrowDown'] || this.keys['KeyS']) {
      this.targetSpeed = Math.max(this.minSpeed, this.targetSpeed - delta * 2);
    }
    
    // Smooth speed transition
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * delta * 5;
    
    // Smooth lane transition
    const targetX = this.lanePositions[this.targetLane];
    this.mesh.position.x += (targetX - this.mesh.position.x) * delta * 10;
    
    // Update current lane when close enough
    if (Math.abs(this.mesh.position.x - targetX) < 0.1) {
      this.currentLane = this.targetLane;
    }
    
    // Update animation speed
    if (this.mixer) {
      this.mixer.timeScale = this.currentSpeed;
      this.mixer.update(delta);
    }
  }

  reset() {
    if (!this.mesh) return;
    this.mesh.position.set(0, 0, 0);
    this.currentLane = 1;
    this.targetLane = 1;
    this.currentSpeed = 1;
    this.targetSpeed = 1;
  }
}

