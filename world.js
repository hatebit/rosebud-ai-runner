

import * as THREE from 'three';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.roadSegments = [];
    this.buildingColors = [
      0xf4d03f, // Yellow
      0xe67e22, // Orange
      0xd35400, // Dark orange
      0xe74c3c, // Red
      0x95a5a6, // Gray
      0xecf0f1, // Light gray
    ];
    
    this.segmentLength = 20;
    this.buildingSpacing = 15;
    this.lastBuildingZ = 0;
    
    this.createGround();
    this.generateInitialWorld();
  }

  createGround() {
    // Road
    const roadGeometry = new THREE.PlaneGeometry(10, 500);
    const roadMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2c2c2c,
      roughness: 0.8
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = -0.01;
    road.receiveShadow = true;
    this.scene.add(road);
    
    // Lane markings
    this.createLaneMarkings();
  }

  createLaneMarkings() {
    const markingGroup = new THREE.Group();
    
    for (let z = 0; z < 100; z += 4) {
      // Center lane markings
      const marking1 = this.createMarking(-1.5, -z);
      const marking2 = this.createMarking(1.5, -z);
      markingGroup.add(marking1, marking2);
    }
    
    this.scene.add(markingGroup);
    this.markingGroup = markingGroup;
  }

  createMarking(x, z) {
    const geometry = new THREE.BoxGeometry(0.15, 0.05, 2);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const marking = new THREE.Mesh(geometry, material);
    marking.position.set(x, 0, z);
    return marking;
  }

  generateInitialWorld() {
    for (let i = 0; i < 10; i++) {
      this.createBuildingPair(this.lastBuildingZ);
      this.lastBuildingZ -= this.buildingSpacing;
    }
  }

  createBuildingPair(z) {
    // Left building
    const leftBuilding = this.createBuilding();
    leftBuilding.position.set(-12, 0, z);
    this.scene.add(leftBuilding);
    this.buildings.push(leftBuilding);
    
    // Right building
    const rightBuilding = this.createBuilding();
    rightBuilding.position.set(12, 0, z);
    this.scene.add(rightBuilding);
    this.buildings.push(rightBuilding);
  }

  createBuilding() {
    const height = 10 + Math.random() * 20;
    const width = 5 + Math.random() * 3;
    const depth = 8 + Math.random() * 8;
    
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const color = this.buildingColors[Math.floor(Math.random() * this.buildingColors.length)];
    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.7
    });
    
    const building = new THREE.Mesh(geometry, material);
    building.position.y = height / 2;
    building.castShadow = true;
    building.receiveShadow = true;
    
    // Add windows
    this.addWindows(building, width, height, depth);
    
    return building;
  }

  addWindows(building, width, height, depth) {
    const windowSize = 0.6;
    const windowSpacing = 1.5;
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a4a4a,
      emissive: 0x444444,
      emissiveIntensity: 0.3
    });
    
    // Front face windows
    for (let y = 2; y < height - 1; y += windowSpacing) {
      for (let x = -width/2 + 1; x < width/2; x += windowSpacing) {
        const windowGeometry = new THREE.BoxGeometry(windowSize, windowSize, 0.1);
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(x, y - height/2, depth/2 + 0.05);
        building.add(window);
      }
    }
  }

  update(delta, speed) {
    // Move road markings
    if (this.markingGroup) {
      this.markingGroup.position.z += speed * delta * 50;
      if (this.markingGroup.position.z > 50) {
        this.markingGroup.position.z = 0;
      }
    }
    
    // Move and recycle buildings
    for (let i = this.buildings.length - 1; i >= 0; i--) {
      const building = this.buildings[i];
      building.position.z += speed * delta * 50;
      
      if (building.position.z > 30) {
        this.scene.remove(building);
        this.buildings.splice(i, 1);
      }
    }
    
    // Generate new buildings
    if (this.lastBuildingZ > -150) {
      this.createBuildingPair(this.lastBuildingZ);
      this.lastBuildingZ -= this.buildingSpacing;
    } else {
      this.lastBuildingZ = -150;
    }
  }

  reset() {
    // Remove all buildings
    this.buildings.forEach(b => this.scene.remove(b));
    this.buildings = [];
    this.lastBuildingZ = 0;
    this.generateInitialWorld();
    
    if (this.markingGroup) {
      this.markingGroup.position.z = 0;
    }
  }
}

