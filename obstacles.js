

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.lanePositions = [-3, 0, 3];
    this.spawnTimer = 0;
    this.spawnInterval = 2;
    this.tankModel = null;
    this.loader = new GLTFLoader();
    
    this.loadModels();
  }

  loadModels() {
    this.loader.load('tank.glb', (gltf) => {
      this.tankModel = gltf.scene;
    });
  }

  update(delta, speed, playerLane) {
    // Update spawn timer
    this.spawnTimer += delta * speed;
    
    if (this.spawnTimer > this.spawnInterval) {
      this.spawnObstacle();
      this.spawnTimer = 0;
      // Gradually decrease spawn interval
      this.spawnInterval = Math.max(1.2, this.spawnInterval - 0.01);
    }
    
    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      
      if (obs.type === 'moving') {
        obs.mesh.position.x += obs.direction * delta * 3;
        if (Math.abs(obs.mesh.position.x) > 6) {
          obs.direction *= -1;
        }
      }
      
      obs.mesh.position.z += speed * delta * 50;
      
      // Remove if behind player
      if (obs.mesh.position.z > 15) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }
  }

  spawnObstacle() {
    const type = Math.random() > 0.6 ? 'moving' : 'static';
    const lane = Math.floor(Math.random() * 3);
    
    if (type === 'static') {
      this.createStaticObstacle(lane);
    } else if (this.tankModel) {
      this.createMovingObstacle(lane);
    }
  }

  createStaticObstacle(lane) {
    const geometry = new THREE.BoxGeometry(1.5, 1, 1.5);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xff6b6b,
      emissive: 0xff0000,
      emissiveIntensity: 0.2
    });
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.set(this.lanePositions[lane], 0.5, -80);
    obstacle.castShadow = true;
    
    this.scene.add(obstacle);
    this.obstacles.push({ mesh: obstacle, lane: lane, type: 'static' });
  }

  createMovingObstacle(lane) {
    const tank = this.tankModel.clone();
    tank.scale.set(1.5, 1.5, 1.5);
    tank.position.set(this.lanePositions[lane], 0, -80);
    tank.rotation.y = Math.PI / 2;
    
    tank.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
    
    this.scene.add(tank);
    this.obstacles.push({ 
      mesh: tank, 
      lane: lane, 
      type: 'moving',
      direction: Math.random() > 0.5 ? 1 : -1
    });
  }

  checkCollision(playerPos, playerLane) {
    for (const obs of this.obstacles) {
      const distance = Math.abs(obs.mesh.position.z - playerPos.z);
      const xDistance = Math.abs(obs.mesh.position.x - playerPos.x);
      
      if (distance < 2 && xDistance < 1.5) {
        return true;
      }
    }
    return false;
  }

  reset() {
    this.obstacles.forEach(obs => this.scene.remove(obs.mesh));
    this.obstacles = [];
    this.spawnTimer = 0;
    this.spawnInterval = 2;
  }
}

