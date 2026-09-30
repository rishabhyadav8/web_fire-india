import * as THREE from 'three';
import { ZONE_PHASES } from '../../config/constants';
import { ZonePhase } from '../../types/game';

export class SafeZoneSystem {
  public group: THREE.Group;
  public currentX: number = 0;
  public currentZ: number = 0;
  public currentRadius: number = 140;

  public targetX: number = 0;
  public targetZ: number = 0;
  public targetRadius: number = 100;

  public phaseIndex: number = 0;
  public isShrinking: boolean = false;
  public timer: number = 0; // countdown seconds
  public currentPhaseDef: ZonePhase;

  private cylinderMesh: THREE.Mesh;
  private wallMaterial: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.currentPhaseDef = ZONE_PHASES[0];
    this.currentRadius = this.currentPhaseDef.radius;
    this.targetRadius = this.currentPhaseDef.targetRadius;
    this.timer = this.currentPhaseDef.waitDuration;

    // Pick initial target safe zone center (slightly offset from center)
    this.pickNextZoneCenter();

    // Safe zone 3D boundary cylinder
    const geo = new THREE.CylinderGeometry(this.currentRadius, this.currentRadius, 30, 48, 1, true);
    this.wallMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6, // electric blue
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      wireframe: false,
    });
    this.cylinderMesh = new THREE.Mesh(geo, this.wallMaterial);
    this.cylinderMesh.position.set(this.currentX, 15, this.currentZ);
    this.group.add(this.cylinderMesh);

    // Glowing rim rings on top and bottom
    const ringGeo = new THREE.RingGeometry(this.currentRadius - 0.5, this.currentRadius + 0.5, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.2;
    this.group.add(ring);
  }

  private pickNextZoneCenter() {
    // Next zone center stays inside current zone
    const maxOffset = (this.currentRadius - this.targetRadius) * 0.7;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * maxOffset;
    this.targetX = this.currentX + Math.cos(angle) * dist;
    this.targetZ = this.currentZ + Math.sin(angle) * dist;
  }

  public update(delta: number, onWarningSound?: () => void): { damageTick: number; isOutside: boolean } {
    this.timer -= delta;

    if (!this.isShrinking) {
      // Waiting phase
      if (this.timer <= 5 && this.timer > 0 && Math.floor(this.timer) !== Math.floor(this.timer + delta)) {
        onWarningSound?.();
      }

      if (this.timer <= 0) {
        // Start shrinking!
        this.isShrinking = true;
        this.timer = this.currentPhaseDef.shrinkDuration;
        onWarningSound?.();
      }
    } else {
      // Shrinking phase
      const shrinkProgress = 1 - Math.max(0, this.timer) / this.currentPhaseDef.shrinkDuration;
      
      const startRadius = this.currentPhaseDef.radius;
      const targetRadius = this.currentPhaseDef.targetRadius;
      this.currentRadius = startRadius + (targetRadius - startRadius) * shrinkProgress;

      // Shrink boundary mesh
      this.cylinderMesh.scale.set(
        this.currentRadius / this.currentPhaseDef.radius,
        1,
        this.currentRadius / this.currentPhaseDef.radius
      );

      if (this.timer <= 0) {
        // Shrink complete, advance phase
        this.isShrinking = false;
        if (this.phaseIndex < ZONE_PHASES.length - 1) {
          this.phaseIndex++;
          this.currentPhaseDef = ZONE_PHASES[this.phaseIndex];
          this.timer = this.currentPhaseDef.waitDuration;
          this.targetRadius = this.currentPhaseDef.targetRadius;
          this.pickNextZoneCenter();
        } else {
          // Final circle stay small
          this.timer = 999;
        }
      }
    }

    // Pulse opacity subtly
    const pulse = 0.24 + Math.sin(Date.now() * 0.003) * 0.06;
    this.wallMaterial.opacity = pulse;

    return {
      damageTick: this.currentPhaseDef.damagePerSec * delta,
      isOutside: false,
    };
  }

  public isPositionInsideZone(x: number, z: number): boolean {
    const dx = x - this.currentX;
    const dz = z - this.currentZ;
    return dx * dx + dz * dz <= this.currentRadius * this.currentRadius;
  }

  public getDistanceToSafeZone(x: number, z: number): number {
    const dx = x - this.currentX;
    const dz = z - this.currentZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    return Math.max(0, dist - this.currentRadius);
  }

  public reset() {
    this.phaseIndex = 0;
    this.currentPhaseDef = ZONE_PHASES[0];
    this.currentRadius = this.currentPhaseDef.radius;
    this.targetRadius = this.currentPhaseDef.targetRadius;
    this.currentX = 0;
    this.currentZ = 0;
    this.isShrinking = false;
    this.timer = this.currentPhaseDef.waitDuration;
    this.pickNextZoneCenter();
    this.cylinderMesh.scale.set(1, 1, 1);
  }
}
