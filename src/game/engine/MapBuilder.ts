import * as THREE from 'three';
import { MAP_SIZE, MAP_HALF } from '../../config/constants';

export interface Collider {
  type: 'box' | 'cylinder';
  x: number;
  z: number;
  width: number;
  depth: number;
  radius?: number;
  height: number;
}

export class MapBuilder {
  public colliders: Collider[] = [];
  public mapGroup: THREE.Group;
  public lootSpawnPoints: { x: number; y: number; z: number; type: 'weapon' | 'ammo' | 'consumable' }[] = [];
  public botSpawnPoints: { x: number; z: number }[] = [];

  constructor() {
    this.mapGroup = new THREE.Group();
  }

  public buildMap(quality: 'low' | 'medium' | 'high' = 'high'): THREE.Group {
    this.colliders = [];
    this.lootSpawnPoints = [];
    this.botSpawnPoints = [];

    // 1. Terrain Ground
    this.createTerrain();

    // 2. Ocean Water Border
    this.createOcean();

    // 3. Dirt Roads
    this.createRoads();

    // 4. River and Bridge
    this.createRiver();

    // 5. Buildings & Structures
    this.createAbandonedVillage();
    this.createSupplyWarehouse();
    this.createWatchtower();
    this.createForestCamp();
    this.createRadarComplex();

    // 6. Instanced Trees, Rocks, Crates & Barriers for high performance
    this.createScatteredCover(quality);

    // 7. Generate Bot Spawns across different sectors
    this.generateSpawnPoints();

    return this.mapGroup;
  }

  private createTerrain() {
    // Island terrain mesh
    const groundGeo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);

    // Subtle gentle hill variation
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Falloff near edges so island slopes into water
      const distFromCenter = Math.sqrt(x * x + z * z);
      let y = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 1.5;
      if (distFromCenter > MAP_HALF - 25) {
        const falloff = (distFromCenter - (MAP_HALF - 25)) / 25;
        y -= falloff * 5;
      }
      pos.setY(i, y);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshLambertMaterial({
      color: 0x3d7032, // rich lush olive-green
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    this.mapGroup.add(ground);
  }

  private createOcean() {
    const waterGeo = new THREE.PlaneGeometry(MAP_SIZE * 2, MAP_SIZE * 2);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a5f,
      transparent: true,
      opacity: 0.85,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = -1.2;
    this.mapGroup.add(water);
  }

  private createRoads() {
    // Dirt crossroads
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x7c694a }); // dusty dirt path
    
    // Main North-South road
    const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(10, MAP_SIZE * 0.8), roadMat);
    roadNS.rotateX(-Math.PI / 2);
    roadNS.position.y = 0.05;
    this.mapGroup.add(roadNS);

    // East-West road
    const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE * 0.8, 10), roadMat);
    roadEW.rotateX(-Math.PI / 2);
    roadEW.position.y = 0.06;
    this.mapGroup.add(roadEW);
  }

  private createRiver() {
    // River cutting diagonally across south-west
    const riverMat = new THREE.MeshLambertMaterial({ color: 0x2563eb, transparent: true, opacity: 0.8 });
    const river = new THREE.Mesh(new THREE.PlaneGeometry(16, 120), riverMat);
    river.rotateX(-Math.PI / 2);
    river.rotateZ(Math.PI / 4);
    river.position.set(-60, 0.04, 60);
    this.mapGroup.add(river);

    // Wooden Bridge over river
    const bridgeMat = new THREE.MeshLambertMaterial({ color: 0x5c3a21 });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 24), bridgeMat);
    bridge.position.set(-60, 0.4, 60);
    bridge.rotation.y = -Math.PI / 4;
    bridge.receiveShadow = true;
    this.mapGroup.add(bridge);

    // Loot on bridge
    this.lootSpawnPoints.push({ x: -60, y: 1.0, z: 60, type: 'weapon' });
  }

  // Helper for simple houses
  private createBuilding(x: number, z: number, w: number, d: number, h: number, rot: number = 0, wallColor: number = 0x8b7d6b) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rot;

    // Walls
    const wallMat = new THREE.MeshLambertMaterial({ color: wallColor });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    walls.position.y = h / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Roof
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x852e2e }); // terracotta red roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.8, h * 0.5, 4), roofMat);
    roof.position.y = h + h * 0.25;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Add to map
    this.mapGroup.add(group);

    // Add collider
    this.colliders.push({
      type: 'box',
      x,
      z,
      width: w + 0.4,
      depth: d + 0.4,
      height: h,
    });

    // Loot points around building
    this.lootSpawnPoints.push(
      { x: x + w * 0.7, y: 0.5, z: z + d * 0.7, type: 'weapon' },
      { x: x - w * 0.7, y: 0.5, z: z - d * 0.7, type: 'ammo' },
      { x: x, y: 0.5, z: z + d * 0.8, type: 'consumable' }
    );
  }

  private createAbandonedVillage() {
    // Northwest sector: -80, -80
    this.createBuilding(-80, -80, 10, 8, 4.5, 0, 0x6e7884);
    this.createBuilding(-65, -90, 8, 8, 4.2, 0.3, 0x7c7365);
    this.createBuilding(-95, -70, 9, 7, 4.0, -0.4, 0x5a6351);
    this.createBuilding(-75, -60, 11, 9, 5.0, 0.1, 0x807261);

    // Central sandbag and crate covers in village
    this.createCrate(-78, -72, 2.0);
    this.createCrate(-76, -72, 1.8);
    this.createBarrier(-80, -68, 6, 1.2, 0);
  }

  private createSupplyWarehouse() {
    // Northeast sector: 75, -70
    const w = 26;
    const d = 18;
    const h = 7;
    const group = new THREE.Group();
    group.position.set(75, 0, -70);

    const warehouseMat = new THREE.MeshLambertMaterial({ color: 0x475569 }); // industrial steel slate
    const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), warehouseMat);
    mainBuilding.position.y = h / 2;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    group.add(mainBuilding);

    // Corrugated roof
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 0.8, d + 1), roofMat);
    roof.position.y = h + 0.4;
    group.add(roof);

    this.mapGroup.add(group);

    this.colliders.push({
      type: 'box',
      x: 75,
      z: -70,
      width: w + 0.5,
      depth: d + 0.5,
      height: h,
    });

    // High quality loot around warehouse
    this.lootSpawnPoints.push(
      { x: 75 + 15, y: 0.5, z: -70, type: 'weapon' },
      { x: 75 - 15, y: 0.5, z: -70, type: 'weapon' },
      { x: 75, y: 0.5, z: -70 + 11, type: 'ammo' },
      { x: 75, y: 0.5, z: -70 - 11, type: 'consumable' }
    );
  }

  private createWatchtower() {
    // Center-north watchtower
    const group = new THREE.Group();
    group.position.set(0, 0, 0);

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
    // 4 legs
    const legGeo = new THREE.CylinderGeometry(0.3, 0.3, 9);
    const positions = [
      [-3, -3],
      [3, -3],
      [-3, 3],
      [3, 3],
    ];
    positions.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(lx, 4.5, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    // Platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 8), woodMat);
    platform.position.y = 9;
    group.add(platform);

    // Platform railings
    const railMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 0.3), railMat);
    rail.position.set(0, 9.6, 4);
    group.add(rail);

    this.mapGroup.add(group);

    this.colliders.push({
      type: 'box',
      x: 0,
      z: 0,
      width: 6.5,
      depth: 6.5,
      height: 9,
    });

    // Loot under watchtower
    this.lootSpawnPoints.push(
      { x: 0, y: 0.5, z: 0, type: 'weapon' },
      { x: 3, y: 0.5, z: 0, type: 'ammo' },
      { x: -3, y: 0.5, z: 0, type: 'consumable' }
    );
  }

  private createForestCamp() {
    // Southwest camp: -65, 30
    const campX = -65;
    const campZ = 30;

    // Tents
    const tentMat = new THREE.MeshLambertMaterial({ color: 0x22543d });
    for (let i = 0; i < 3; i++) {
      const tent = new THREE.Mesh(new THREE.ConeGeometry(3, 3.5, 4), tentMat);
      const tx = campX + (i - 1) * 8;
      const tz = campZ + ((i % 2) * 5);
      tent.position.set(tx, 1.75, tz);
      tent.rotation.y = Math.PI / 4;
      tent.castShadow = true;
      this.mapGroup.add(tent);

      this.colliders.push({
        type: 'cylinder',
        x: tx,
        z: tz,
        width: 3,
        depth: 3,
        radius: 2.2,
        height: 3.5,
      });

      this.lootSpawnPoints.push({ x: tx + 2, y: 0.5, z: tz + 2, type: 'weapon' });
    }
  }

  private createRadarComplex() {
    // Southeast: 80, 75
    const rx = 80;
    const rz = 75;

    // Dome base
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(8, 9, 4, 16), baseMat);
    base.position.set(rx, 2, rz);
    base.castShadow = true;
    this.mapGroup.add(base);

    // Radar dish
    const dishMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const dish = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 8, 0, Math.PI), dishMat);
    dish.position.set(rx, 6, rz);
    dish.rotation.x = Math.PI * 0.7;
    dish.castShadow = true;
    this.mapGroup.add(dish);

    this.colliders.push({
      type: 'cylinder',
      x: rx,
      z: rz,
      width: 17,
      depth: 17,
      radius: 8.5,
      height: 7,
    });

    this.lootSpawnPoints.push(
      { x: rx + 10, y: 0.5, z: rz, type: 'weapon' },
      { x: rx - 10, y: 0.5, z: rz, type: 'ammo' },
      { x: rx, y: 0.5, z: rz + 10, type: 'consumable' }
    );
  }

  public createCrate(x: number, z: number, size: number = 2) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x92613c });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
    mesh.position.set(x, size / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.mapGroup.add(mesh);

    this.colliders.push({
      type: 'box',
      x,
      z,
      width: size,
      depth: size,
      height: size,
    });
  }

  public createBarrier(x: number, z: number, w: number, h: number, rot: number = 0) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x78716c });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.8), mat);
    mesh.position.set(x, h / 2, z);
    mesh.rotation.y = rot;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.mapGroup.add(mesh);

    this.colliders.push({
      type: 'box',
      x,
      z,
      width: Math.abs(Math.cos(rot) * w) + Math.abs(Math.sin(rot) * 0.8),
      depth: Math.abs(Math.sin(rot) * w) + Math.abs(Math.cos(rot) * 0.8),
      height: h,
    });
  }

  private createScatteredCover(quality: 'low' | 'medium' | 'high') {
    const treeCount = quality === 'low' ? 35 : quality === 'medium' ? 65 : 100;
    const rockCount = quality === 'low' ? 20 : quality === 'medium' ? 40 : 60;
    const crateCount = quality === 'low' ? 15 : quality === 'medium' ? 30 : 45;

    // Low poly Pine Tree geometry
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 3, 6);
    const leavesGeo1 = new THREE.ConeGeometry(3.5, 4, 6);
    const leavesGeo2 = new THREE.ConeGeometry(2.5, 3.5, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2e18 });
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x1b4332 });

    // Seeded pseudo-random placement
    let seed = 12345;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Trees
    for (let i = 0; i < treeCount; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = 25 + rand() * (MAP_HALF - 40);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Don't spawn trees directly on roads
      if (Math.abs(x) < 7 || Math.abs(z) < 7) continue;

      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);

      const leaves1 = new THREE.Mesh(leavesGeo1, foliageMat);
      leaves1.position.y = 4;
      leaves1.castShadow = true;
      tree.add(leaves1);

      const leaves2 = new THREE.Mesh(leavesGeo2, foliageMat);
      leaves2.position.y = 6;
      leaves2.castShadow = true;
      tree.add(leaves2);

      this.mapGroup.add(tree);

      this.colliders.push({
        type: 'cylinder',
        x,
        z,
        width: 1.2,
        depth: 1.2,
        radius: 0.8,
        height: 6,
      });

      // Chance of ammo or medkit loot under tree
      if (rand() > 0.7) {
        this.lootSpawnPoints.push({
          x: x + 1.2,
          y: 0.5,
          z: z + 1.2,
          type: rand() > 0.5 ? 'ammo' : 'consumable',
        });
      }
    }

    // Boulders
    const rockGeo = new THREE.DodecahedronGeometry(1.6, 0);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    for (let i = 0; i < rockCount; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = 20 + rand() * (MAP_HALF - 35);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      if (Math.abs(x) < 6 || Math.abs(z) < 6) continue;

      const rock = new THREE.Mesh(rockGeo, rockMat);
      const s = 0.8 + rand() * 0.8;
      rock.scale.set(s, s * 0.7, s);
      rock.position.set(x, (s * 0.7) / 2, z);
      rock.rotation.set(rand(), rand(), rand());
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.mapGroup.add(rock);

      this.colliders.push({
        type: 'cylinder',
        x,
        z,
        width: s * 2,
        depth: s * 2,
        radius: s * 1.1,
        height: s,
      });
    }

    // Crates & Barrels
    for (let i = 0; i < crateCount; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = 15 + rand() * (MAP_HALF - 45);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      this.createCrate(x, z, 1.8);
      if (rand() > 0.4) {
        this.lootSpawnPoints.push({
          x: x + 1.8,
          y: 0.5,
          z: z,
          type: rand() > 0.5 ? 'weapon' : 'ammo',
        });
      }
    }
  }

  private generateSpawnPoints() {
    // Generate 15 distinct spawn positions for player and 14 bots
    const angles = [0, 0.45, 0.9, 1.35, 1.8, 2.25, 2.7, 3.14, 3.6, 4.05, 4.5, 4.95, 5.4, 5.85, 6.1];
    for (let i = 0; i < angles.length; i++) {
      const dist = 70 + (i % 3) * 20;
      this.botSpawnPoints.push({
        x: Math.cos(angles[i]) * dist,
        z: Math.sin(angles[i]) * dist,
      });
    }
  }
}
