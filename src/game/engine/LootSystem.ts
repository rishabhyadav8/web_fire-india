import * as THREE from 'three';
import { LootItem, WeaponDef } from '../../types/game';
import { WEAPONS } from '../../config/weapons';

export class LootSystem {
  public group: THREE.Group;
  public items: LootItem[] = [];
  private itemMeshes: Map<string, THREE.Group> = new Map();

  constructor() {
    this.group = new THREE.Group();
  }

  public spawnInitialLoot(spawnPoints: { x: number; y: number; z: number; type: 'weapon' | 'ammo' | 'consumable' }[]) {
    this.clear();

    const weaponKeys = Object.keys(WEAPONS);

    spawnPoints.forEach((pt, index) => {
      let type: 'weapon' | 'ammo' | 'health' | 'armor' = 'ammo';
      let subType = 'heavy';
      let count = 30;

      if (pt.type === 'weapon') {
        type = 'weapon';
        subType = weaponKeys[Math.floor(Math.random() * weaponKeys.length)];
        count = 1;
      } else if (pt.type === 'ammo') {
        type = 'ammo';
        const ammoTypes = ['light', 'heavy', 'shells'];
        subType = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
        count = subType === 'shells' ? 12 : 45;
      } else {
        // consumable
        const r = Math.random();
        if (r < 0.35) {
          type = 'health';
          subType = 'medkit';
          count = 1;
        } else if (r < 0.7) {
          type = 'armor';
          subType = 'armor_pack';
          count = 1;
        } else {
          type = 'health';
          subType = 'quick_heal';
          count = 2;
        }
      }

      this.createLootItem({
        id: `loot_${index}_${Date.now()}`,
        type,
        subType,
        count,
        x: pt.x,
        y: pt.y,
        z: pt.z,
      });
    });
  }

  public spawnDrop(x: number, z: number, weapon?: WeaponDef) {
    const y = 0.5;
    // Always drop ammo and some health/armor upon elimination
    if (weapon) {
      this.createLootItem({
        id: `drop_w_${Math.random()}`,
        type: 'weapon',
        subType: weapon.id,
        count: 1,
        x: x + (Math.random() - 0.5) * 2,
        y,
        z: z + (Math.random() - 0.5) * 2,
      });
    }

    this.createLootItem({
      id: `drop_a_${Math.random()}`,
      type: 'ammo',
      subType: weapon ? weapon.ammoType : 'heavy',
      count: 40,
      x: x + (Math.random() - 0.5) * 2,
      y,
      z: z + (Math.random() - 0.5) * 2,
    });

    this.createLootItem({
      id: `drop_h_${Math.random()}`,
      type: 'health',
      subType: 'medkit',
      count: 1,
      x: x + (Math.random() - 0.5) * 2,
      y,
      z: z + (Math.random() - 0.5) * 2,
    });
  }

  public createLootItem(item: LootItem) {
    const itemGroup = new THREE.Group();
    itemGroup.position.set(item.x, item.y, item.z);

    let mainColor = 0xffffff;

    if (item.type === 'weapon') {
      const w = WEAPONS[item.subType];
      mainColor = w ? parseInt(w.color.replace('#', '0x')) : 0x38bdf8;
      // Gun proxy mesh: barrel and grip
      const gunMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.3, 0.9),
        new THREE.MeshLambertMaterial({ color: mainColor })
      );
      gunMesh.rotation.y = Math.PI / 4;
      itemGroup.add(gunMesh);
    } else if (item.type === 'ammo') {
      mainColor = item.subType === 'light' ? 0xa855f7 : item.subType === 'heavy' ? 0x38bdf8 : 0xf97316;
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.3, 0.5),
        new THREE.MeshLambertMaterial({ color: mainColor })
      );
      itemGroup.add(box);
    } else if (item.type === 'health') {
      mainColor = item.subType === 'medkit' ? 0x10b981 : 0x34d399;
      const medbox = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.45, 0.45),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      // Red cross on top
      const cross = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.47, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      medbox.add(cross);
      itemGroup.add(medbox);
    } else if (item.type === 'armor') {
      mainColor = 0x06b6d4; // bright cyan
      const armorPlate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.3, 0.4, 6),
        new THREE.MeshLambertMaterial({ color: mainColor })
      );
      itemGroup.add(armorPlate);
    }

    // Glowing pillar/beacon light beam
    const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 3, 6);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: mainColor,
      transparent: true,
      opacity: 0.4,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 1.5;
    itemGroup.add(beacon);

    this.group.add(itemGroup);
    this.itemMeshes.set(item.id, itemGroup);
    this.items.push(item);
  }

  public update(delta: number) {
    // Hover and rotate loot
    const time = Date.now() * 0.002;
    for (const [id, mesh] of this.itemMeshes.entries()) {
      const item = this.items.find((i) => i.id === id);
      if (!item) continue;
      mesh.rotation.y += 1.5 * delta;
      mesh.position.y = item.y + Math.sin(time + item.x) * 0.15;
    }
  }

  public getNearestItem(x: number, y: number, z: number, maxDist: number = 3.2): LootItem | null {
    let nearest: LootItem | null = null;
    let minDist = maxDist;

    for (const item of this.items) {
      const dx = item.x - x;
      const dz = item.z - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        nearest = item;
      }
    }

    return nearest;
  }

  public removeItem(itemId: string) {
    const mesh = this.itemMeshes.get(itemId);
    if (mesh) {
      this.group.remove(mesh);
      this.itemMeshes.delete(itemId);
    }
    const idx = this.items.findIndex((i) => i.id === itemId);
    if (idx !== -1) {
      this.items.splice(idx, 1);
    }
  }

  public clear() {
    for (const [, mesh] of this.itemMeshes.entries()) {
      this.group.remove(mesh);
    }
    this.itemMeshes.clear();
    this.items = [];
  }
}
