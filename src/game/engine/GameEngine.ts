import * as THREE from 'three';
import { PlayerStats, WeaponSlot, LootItem, KillFeedItem, GameSettings } from '../../types/game';
import { WEAPONS } from '../../config/weapons';
import { PLAYER_CONFIG } from '../../config/constants';
import { MapBuilder } from './MapBuilder';
import { ParticleSystem } from './ParticleSystem';
import { SafeZoneSystem } from './SafeZoneSystem';
import { LootSystem } from './LootSystem';
import { BotManager } from './BotManager';
import { InputManager } from './InputManager';
import { AudioManager } from '../audio/AudioManager';

export interface EngineCallbacks {
  onStatsUpdate: (stats: PlayerStats) => void;
  onZoneUpdate: (data: {
    phase: number;
    timer: number;
    isShrinking: boolean;
    isOutside: boolean;
    currentRadius: number;
    targetRadius: number;
    currentX: number;
    currentZ: number;
    targetX: number;
    targetZ: number;
  }) => void;
  onNearestLoot: (item: LootItem | null) => void;
  onHitMarker: (isKill: boolean) => void;
  onPlayerHurt: () => void;
  onKillFeed: (item: KillFeedItem) => void;
  onGameOver: (isVictory: boolean, stats: { kills: number; timeSurvived: number; placement: number }) => void;
}

export class GameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public input: InputManager;

  // Subsystems
  public mapBuilder: MapBuilder;
  public particles: ParticleSystem;
  public safeZone: SafeZoneSystem;
  public loot: LootSystem;
  public botManager: BotManager;

  // Player state
  public playerMesh: THREE.Group;
  public playerPos: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  public playerVel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public isGrounded: boolean = true;
  public yaw: number = 0; // horizontal camera angle
  public pitch: number = 0.2; // vertical camera angle
  public recoilOffset: number = 0;
  public screenShake: number = 0;

  public stats: PlayerStats;
  private callbacks: EngineCallbacks;

  // Match meta
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public matchStartTime: number = 0;
  private footstepTimer: number = 0;
  private fireCooldownTimer: number = 0;
  private outOfZoneDamageTimer: number = 0;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks, settings: GameSettings) {
    this.callbacks = callbacks;
    this.input = new InputManager();
    this.input.attachCanvas(canvas);
    this.input.mouseSensitivity = settings.mouseSensitivity;

    // 1. Three.js Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x73a6c9); // clear daylight sky blue
    this.scene.fog = new THREE.FogExp2(0x73a6c9, 0.007);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 400);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: settings.graphicsQuality !== 'low',
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.graphicsQuality === 'high' ? 2 : 1.5));
    if (settings.graphicsQuality !== 'low') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // 4. Lighting
    this.setupLighting();

    // 5. Systems
    this.mapBuilder = new MapBuilder();
    this.particles = new ParticleSystem();
    this.safeZone = new SafeZoneSystem();
    this.loot = new LootSystem();
    this.botManager = new BotManager();

    this.scene.add(this.particles.group);
    this.scene.add(this.safeZone.group);
    this.scene.add(this.loot.group);
    this.scene.add(this.botManager.group);

    // 6. Player Mesh & Initial Stats
    this.playerMesh = this.createPlayerMesh();
    this.scene.add(this.playerMesh);

    this.stats = this.createInitialStats();

    // Resize handling
    window.addEventListener('resize', this.onWindowResize);
  }

  private setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xddeeff, 0x3d5a28, 0.45);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff6dd, 1.2);
    sun.position.set(100, 150, 80);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 300;
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    this.scene.add(sun);
  }

  private createPlayerMesh(): THREE.Group {
    const group = new THREE.Group();

    // Stylized tactical hero (navy & cyan)
    const suitMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
    const armorMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), suitMat);
    torso.position.y = 0.45;
    torso.castShadow = true;
    group.add(torso);

    // Tactical chest plate
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.5, 0.45), armorMat);
    chestPlate.position.set(0, 0.5, 0);
    group.add(chestPlate);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), skinMat);
    head.position.y = 1.1;
    head.castShadow = true;
    group.add(head);

    // Helmet & visor
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.14, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    visor.position.set(0, 1.1, 0.2);
    group.add(visor);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
    const leftArm = new THREE.Mesh(armGeo, suitMat);
    leftArm.position.set(-0.45, 0.4, 0.1);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, suitMat);
    rightArm.position.set(0.45, 0.4, 0.2);
    rightArm.rotation.x = -Math.PI / 4;
    group.add(rightArm);

    // Gun in hands
    const gun = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.18, 0.8),
      new THREE.MeshLambertMaterial({ color: 0x0f172a })
    );
    gun.position.set(0.35, 0.35, 0.55);
    group.add(gun);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.25, 0.9, 0.25);
    const leftLeg = new THREE.Mesh(legGeo, suitMat);
    leftLeg.position.set(-0.2, -0.45, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, suitMat);
    rightLeg.position.set(0.2, -0.45, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    return group;
  }

  private createInitialStats(): PlayerStats {
    const starterWeapon = WEAPONS.pulse_rifle;
    return {
      health: 100,
      maxHealth: 100,
      armor: 100,
      maxArmor: 100,
      kills: 0,
      aliveCount: 15,
      primaryWeapon: {
        weapon: starterWeapon,
        currentMag: starterWeapon.magSize,
        isReloading: false,
        reloadProgress: 0,
      },
      secondaryWeapon: {
        weapon: WEAPONS.falcon_dmr,
        currentMag: WEAPONS.falcon_dmr.magSize,
        isReloading: false,
        reloadProgress: 0,
      },
      sidearmWeapon: {
        weapon: WEAPONS.sidekick_pistol,
        currentMag: WEAPONS.sidekick_pistol.magSize,
        isReloading: false,
        reloadProgress: 0,
      },
      activeSlot: 'primary',
      ammo: {
        light: 999,
        heavy: 999,
        shells: 999,
      },
      inventory: {
        medkits: 5,
        quickHeals: 5,
        armorPacks: 5,
      },
      isHealing: false,
      healProgress: 0,
      healItemName: '',
    };
  }

  public startMatch(quality: 'low' | 'medium' | 'high' = 'high') {
    // 1. Build 3D Map
    const mapGroup = this.mapBuilder.buildMap(quality);
    this.scene.add(mapGroup);

    // 2. Spawn Loot
    this.loot.spawnInitialLoot(this.mapBuilder.lootSpawnPoints);

    // 3. Reset Safe Zone
    this.safeZone.reset();

    // 4. Random player spawn near outer region
    const playerSpawn = this.mapBuilder.botSpawnPoints[0] || { x: 0, z: 80 };
    this.playerPos.set(playerSpawn.x, 1.2, playerSpawn.z);
    this.playerVel.set(0, 0, 0);
    this.yaw = Math.PI; // look towards center

    // 5. Spawn AI Bots on remaining spawn points
    const botSpawns = this.mapBuilder.botSpawnPoints.slice(1);
    this.botManager.spawnBots(botSpawns);

    // 6. Reset Stats & meta
    this.stats = this.createInitialStats();
    this.stats.aliveCount = this.botManager.getAliveCount() + 1;
    this.callbacks.onStatsUpdate(this.stats);

    this.isRunning = true;
    this.isPaused = false;
    this.matchStartTime = Date.now();
    this.lastTime = performance.now();

    // Start loop
    if (!this.animFrameId) {
      this.loop(performance.now());
    }
  }

  private loop = (time: number) => {
    this.animFrameId = requestAnimationFrame(this.loop);
    const delta = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    if (!this.isRunning || this.isPaused) return;

    this.update(delta);
    this.renderer.render(this.scene, this.camera);
  };

  private update(delta: number) {
    // 1. Process Input
    this.input.update();

    if (this.input.state.pausePressed) {
      this.togglePause();
      this.input.postUpdate();
      return;
    }

    // 2. Camera Rotation via Look Deltas
    this.yaw -= this.input.state.lookDeltaX;
    this.pitch = Math.max(-0.6, Math.min(0.8, this.pitch + this.input.state.lookDeltaY));
    this.recoilOffset = Math.max(0, this.recoilOffset - delta * 3.0);

    // 3. Player Movement & Physics
    this.updatePlayerMovement(delta);

    // 4. Player Weapon Management & Shooting
    this.updateWeaponSystem(delta);

    // 5. Healing Actions
    this.updateHealing(delta);

    // 6. Safe Zone Tick
    this.updateSafeZone(delta);

    // 7. Update Subsystems
    this.particles.update(delta);
    this.loot.update(delta);

    // 8. Nearest Loot Check
    const nearest = this.loot.getNearestItem(this.playerPos.x, this.playerPos.y, this.playerPos.z, 3.2);
    this.callbacks.onNearestLoot(nearest);

    // Interact to pickup
    if (this.input.state.interactPressed && nearest) {
      this.pickupLoot(nearest);
    }

    // 9. AI Bots Update
    this.botManager.update(
      delta,
      { x: this.playerPos.x, y: this.playerPos.y, z: this.playerPos.z },
      this.safeZone,
      this.mapBuilder.colliders,
      (bot, targetPos) => {
        // Bot fired shot
        AudioManager.playShoot(bot.weapon.id, false);
        const muzzlePos = new THREE.Vector3(bot.x, 1.3, bot.z);
        this.particles.addMuzzleFlash(muzzlePos, 0xffaa00);
        this.particles.addTracer(muzzlePos, targetPos, 0xff8844);

        // Check if bot shot hit player
        const distToPlayer = targetPos.distanceTo(this.playerPos);
        if (distToPlayer < 1.6) {
          this.damagePlayer(bot.weapon.damage * 0.7, bot.name);
        }
      },
      (bot, killerName) => {
        // Bot eliminated
        this.particles.addEliminationBurst(new THREE.Vector3(bot.x, 1.2, bot.z));
        this.loot.spawnDrop(bot.x, bot.z, bot.weapon);

        const isPlayerKill = killerName === 'You';
        this.callbacks.onKillFeed({
          id: `kf_${Date.now()}_${Math.random()}`,
          killer: killerName,
          victim: bot.name,
          weapon: isPlayerKill ? this.getActiveWeaponSlot()?.weapon.name || 'Weapon' : 'Combat',
          isPlayerKill,
          isPlayerVictim: false,
          timestamp: Date.now(),
        });

        this.checkMatchConditions();
      }
    );

    // 10. Update Camera & Player 3D mesh
    this.updateCameraAndMesh();

    // 11. Consume one-shot triggers
    this.input.postUpdate();
  }

  private updatePlayerMovement(delta: number) {
    const isSprinting = this.input.state.isSprinting && (this.input.state.moveX !== 0 || this.input.state.moveZ !== 0);
    const speed = isSprinting ? PLAYER_CONFIG.sprintSpeed : PLAYER_CONFIG.walkSpeed;

    // Movement relative to camera yaw
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const moveDir = new THREE.Vector3()
      .addScaledVector(forward, -this.input.state.moveZ)
      .addScaledVector(right, this.input.state.moveX);

    if (moveDir.lengthSq() > 0.001) {
      moveDir.normalize();
      this.playerVel.x = moveDir.x * speed;
      this.playerVel.z = moveDir.z * speed;

      // Footsteps sound
      this.footstepTimer -= delta;
      if (this.footstepTimer <= 0 && this.isGrounded) {
        AudioManager.playFootstep();
        this.footstepTimer = isSprinting ? 0.28 : 0.42;
      }
    } else {
      this.playerVel.x *= 0.6;
      this.playerVel.z *= 0.6;
    }

    // Jump
    if (this.input.state.isJumping && this.isGrounded) {
      this.playerVel.y = PLAYER_CONFIG.jumpForce;
      this.isGrounded = false;
    }

    // Gravity
    if (!this.isGrounded) {
      this.playerVel.y -= PLAYER_CONFIG.gravity * delta;
    }

    // Potential next position
    const nextX = this.playerPos.x + this.playerVel.x * delta;
    const nextY = this.playerPos.y + this.playerVel.y * delta;
    const nextZ = this.playerPos.z + this.playerVel.z * delta;

    // Collision with ground
    if (nextY <= 1.0) {
      this.playerPos.y = 1.0;
      this.playerVel.y = 0;
      this.isGrounded = true;
    } else {
      this.playerPos.y = nextY;
      this.isGrounded = false;
    }

    // Collision with map colliders (sliding box/cylinder collision)
    let finalX = nextX;
    let finalZ = nextZ;

    for (const col of this.mapBuilder.colliders) {
      if (col.type === 'box') {
        const hw = col.width / 2 + PLAYER_CONFIG.radius;
        const hd = col.depth / 2 + PLAYER_CONFIG.radius;
        if (Math.abs(finalX - col.x) < hw && Math.abs(finalZ - col.z) < hd) {
          // Push out along closest axis
          const ox = hw - Math.abs(finalX - col.x);
          const oz = hd - Math.abs(finalZ - col.z);
          if (ox < oz) {
            finalX += (finalX > col.x ? 1 : -1) * ox;
          } else {
            finalZ += (finalZ > col.z ? 1 : -1) * oz;
          }
        }
      } else if (col.type === 'cylinder') {
        const r = (col.radius || 1) + PLAYER_CONFIG.radius;
        const dx = finalX - col.x;
        const dz = finalZ - col.z;
        const distSq = dx * dx + dz * dz;
        if (distSq < r * r && distSq > 0.0001) {
          const d = Math.sqrt(distSq);
          finalX = col.x + (dx / d) * r;
          finalZ = col.z + (dz / d) * r;
        }
      }
    }

    // Keep on island bounds
    const maxBound = 140;
    this.playerPos.x = Math.max(-maxBound, Math.min(maxBound, finalX));
    this.playerPos.z = Math.max(-maxBound, Math.min(maxBound, finalZ));
  }

  private updateWeaponSystem(delta: number) {
    const slot = this.getActiveWeaponSlot();
    if (!slot) return;

    this.fireCooldownTimer -= delta;

    // Weapon switching (1, 2, 3)
    if (this.input.state.switchWeaponSlot) {
      const targetSlot: 'primary' | 'secondary' | 'sidearm' =
        this.input.state.switchWeaponSlot === 1
          ? 'primary'
          : this.input.state.switchWeaponSlot === 2
          ? 'secondary'
          : 'sidearm';

      if (targetSlot !== this.stats.activeSlot) {
        if (targetSlot === 'secondary' && !this.stats.secondaryWeapon) {
          // no secondary equipped
        } else {
          this.stats.activeSlot = targetSlot;
          AudioManager.playPickup();
          this.callbacks.onStatsUpdate(this.stats);
        }
      }
    }

    // Reload handling
    if (slot.isReloading) {
      slot.reloadProgress += delta / slot.weapon.reloadTime;
      if (slot.reloadProgress >= 1.0) {
        // Complete reload
        slot.isReloading = false;
        slot.reloadProgress = 0;
        const needed = slot.weapon.magSize - slot.currentMag;
        const ammoType = slot.weapon.ammoType;
        const available = this.stats.ammo[ammoType];
        const toLoad = Math.min(needed, available);
        slot.currentMag += toLoad;
        this.stats.ammo[ammoType] -= toLoad;
        this.callbacks.onStatsUpdate(this.stats);
      }
    } else if (this.input.state.reloadPressed && slot.currentMag < slot.weapon.magSize) {
      if (this.stats.ammo[slot.weapon.ammoType] > 0) {
        slot.isReloading = true;
        slot.reloadProgress = 0;
        AudioManager.playReload();
        this.callbacks.onStatsUpdate(this.stats);
      }
    }

    // Shooting
    if (this.input.state.isShooting && this.fireCooldownTimer <= 0) {
      if (slot.isReloading) return;

      if (slot.currentMag <= 0) {
        // Dry click
        AudioManager.playEmptyClick();
        this.fireCooldownTimer = 0.3;
        // Auto reload if ammo available
        if (this.stats.ammo[slot.weapon.ammoType] > 0) {
          slot.isReloading = true;
          slot.reloadProgress = 0;
          AudioManager.playReload();
          this.callbacks.onStatsUpdate(this.stats);
        }
        return;
      }

      // Fire weapon!
      this.fireWeapon(slot);
      this.fireCooldownTimer = slot.weapon.fireRate;
    }
  }

  private fireWeapon(slot: WeaponSlot) {
    slot.currentMag--;
    this.recoilOffset += 0.035; // camera recoil kick
    this.screenShake = 0.45; // punchy screen shake feedback
    this.callbacks.onStatsUpdate(this.stats);

    AudioManager.playShoot(slot.weapon.id, true);

    // Muzzle position in front of player
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const muzzlePos = new THREE.Vector3()
      .copy(this.playerPos)
      .addScaledVector(forward, 0.8)
      .addScaledVector(right, 0.3)
      .add(new THREE.Vector3(0, 0.3, 0));

    this.particles.addMuzzleFlash(muzzlePos, parseInt(slot.weapon.color.replace('#', '0x')));

    // Calculate aim direction
    const aimDir = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch + this.recoilOffset),
      Math.sin(this.pitch + this.recoilOffset),
      -Math.cos(this.yaw) * Math.cos(this.pitch + this.recoilOffset)
    ).normalize();

    this.raycaster.set(this.camera.position, aimDir);

    // Check hit against bot meshes and obstacles
    const botMeshes = Array.from(this.botManager.botMeshes.values());
    const botIntersects = this.raycaster.intersectObjects(botMeshes, true);
    const mapIntersects = this.raycaster.intersectObjects(this.mapBuilder.mapGroup.children, true);

    let hitPoint = new THREE.Vector3().copy(this.camera.position).addScaledVector(aimDir, slot.weapon.range);
    const firstBotHit = botIntersects[0];
    const firstMapHit = mapIntersects[0];

    if (firstBotHit && (!firstMapHit || firstBotHit.distance < firstMapHit.distance)) {
      hitPoint = firstBotHit.point;
    } else if (firstMapHit) {
      hitPoint = firstMapHit.point;
      this.particles.addImpact(hitPoint, firstMapHit.face?.normal || new THREE.Vector3(0, 1, 0), 'dirt');
    }

    // Direct tracer line
    this.particles.addTracer(muzzlePos, hitPoint, parseInt(slot.weapon.color.replace('#', '0x')));

    // "jisko bhi me shoot karu vo kill ho ek bar me sab death ho jaye"
    // ALL living bots are targeted by the mass annihilation shockwave and eliminated in one single shot!
    const livingBots = this.botManager.bots.filter((b) => b.state !== 'DEAD');

    if (livingBots.length > 0) {
      livingBots.forEach((bot, index) => {
        const botPoint = new THREE.Vector3(bot.x, 1.2, bot.z);

        // Electric chain lightning tracer to each bot
        this.particles.addTracer(muzzlePos, botPoint, 0x38bdf8);
        this.particles.addEliminationBurst(botPoint);
        this.particles.addImpact(botPoint, new THREE.Vector3(0, 1, 0), 'flesh');
        this.loot.spawnDrop(bot.x, bot.z, bot.weapon);

        const damageResult = this.botManager.damageBot(bot.id, 999, 'You');
        if (damageResult && damageResult.isDead) {
          this.stats.kills++;
          this.callbacks.onKillFeed({
            id: `kf_${Date.now()}_${index}_${Math.random()}`,
            killer: 'You',
            victim: bot.name,
            weapon: `${slot.weapon.name} [ANNIHILATION]`,
            isPlayerKill: true,
            isPlayerVictim: false,
            timestamp: Date.now(),
          });
        }
      });

      // Hit & Kill confirmation sound and red crosshair marker
      AudioManager.playHit(true, false);
      this.callbacks.onHitMarker(true);
      this.callbacks.onStatsUpdate(this.stats);

      // Check match conditions - all bots eliminated -> triggers instant victory!
      this.checkMatchConditions();
    }
  }

  private updateHealing(delta: number) {
    if (this.input.state.healPressed && !this.stats.isHealing) {
      if (this.stats.health < this.stats.maxHealth && this.stats.inventory.medkits > 0) {
        this.stats.isHealing = true;
        this.stats.healProgress = 0;
        this.stats.healItemName = 'Med Kit (+75 HP)';
        AudioManager.playHeal();
      } else if (this.stats.health < this.stats.maxHealth && this.stats.inventory.quickHeals > 0) {
        this.stats.isHealing = true;
        this.stats.healProgress = 0;
        this.stats.healItemName = 'Quick Heal (+25 HP)';
        AudioManager.playHeal();
      } else if (this.stats.armor < this.stats.maxArmor && this.stats.inventory.armorPacks > 0) {
        this.stats.isHealing = true;
        this.stats.healProgress = 0;
        this.stats.healItemName = 'Armor Pack (+50 Armor)';
        AudioManager.playHeal();
      }
      this.callbacks.onStatsUpdate(this.stats);
    }

    if (this.stats.isHealing) {
      this.stats.healProgress += delta / 2.0; // 2 seconds to apply
      if (this.stats.healProgress >= 1.0) {
        this.stats.isHealing = false;
        this.stats.healProgress = 0;

        if (this.stats.healItemName.includes('Med Kit')) {
          this.stats.inventory.medkits--;
          this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + 75);
        } else if (this.stats.healItemName.includes('Quick Heal')) {
          this.stats.inventory.quickHeals--;
          this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + 25);
        } else if (this.stats.healItemName.includes('Armor Pack')) {
          this.stats.inventory.armorPacks--;
          this.stats.armor = Math.min(this.stats.maxArmor, this.stats.armor + 50);
        }
        this.callbacks.onStatsUpdate(this.stats);
      }
    }
  }

  private updateSafeZone(delta: number) {
    this.safeZone.update(delta, () => {
      AudioManager.playZoneWarning();
    });

    const isOutside = !this.safeZone.isPositionInsideZone(this.playerPos.x, this.playerPos.z);

    if (isOutside) {
      this.outOfZoneDamageTimer -= delta;
      if (this.outOfZoneDamageTimer <= 0) {
        this.damagePlayer(this.safeZone.currentPhaseDef.damagePerSec, 'The Safe Zone');
        this.outOfZoneDamageTimer = 1.0;
      }
    }

    this.callbacks.onZoneUpdate({
      phase: this.safeZone.phaseIndex + 1,
      timer: Math.max(0, Math.ceil(this.safeZone.timer)),
      isShrinking: this.safeZone.isShrinking,
      isOutside,
      currentRadius: this.safeZone.currentRadius,
      targetRadius: this.safeZone.targetRadius,
      currentX: this.safeZone.currentX,
      currentZ: this.safeZone.currentZ,
      targetX: this.safeZone.targetX,
      targetZ: this.safeZone.targetZ,
    });
  }

  public damagePlayer(damage: number, dealerName: string) {
    // Player is completely INVINCIBLE ("never be killed" / God Mode)
    this.stats.health = 100;
    this.stats.armor = 100;
    this.callbacks.onStatsUpdate(this.stats);
    return;
  }

  private handlePlayerElimination(killerName: string) {
    // Disabled in Invincible mode - player cannot be eliminated
    return;
  }

  private checkMatchConditions() {
    const botsAlive = this.botManager.getAliveCount();
    this.stats.aliveCount = botsAlive + 1;
    this.callbacks.onStatsUpdate(this.stats);

    if (botsAlive === 0) {
      // Victory! All enemies killed - player wins the game!
      this.isRunning = false;
      AudioManager.playVictory();
      const timeSurvived = Math.floor((Date.now() - this.matchStartTime) / 1000);

      setTimeout(() => {
        this.callbacks.onGameOver(true, {
          kills: this.stats.kills,
          timeSurvived,
          placement: 1,
        });
      }, 500);
    }
  }

  private pickupLoot(item: LootItem) {
    if (item.type === 'weapon') {
      const weaponDef = WEAPONS[item.subType];
      if (!weaponDef) return;

      const newSlot: WeaponSlot = {
        weapon: weaponDef,
        currentMag: weaponDef.magSize,
        isReloading: false,
        reloadProgress: 0,
      };

      if (!this.stats.primaryWeapon) {
        this.stats.primaryWeapon = newSlot;
        this.stats.activeSlot = 'primary';
      } else if (!this.stats.secondaryWeapon) {
        this.stats.secondaryWeapon = newSlot;
        this.stats.activeSlot = 'secondary';
      } else {
        // Swap currently active slot
        if (this.stats.activeSlot === 'primary') {
          this.stats.primaryWeapon = newSlot;
        } else if (this.stats.activeSlot === 'secondary') {
          this.stats.secondaryWeapon = newSlot;
        }
      }
    } else if (item.type === 'ammo') {
      if (item.subType === 'light') this.stats.ammo.light += item.count;
      else if (item.subType === 'heavy') this.stats.ammo.heavy += item.count;
      else if (item.subType === 'shells') this.stats.ammo.shells += item.count;
    } else if (item.type === 'health') {
      if (item.subType === 'medkit') this.stats.inventory.medkits += item.count;
      else this.stats.inventory.quickHeals += item.count;
    } else if (item.type === 'armor') {
      this.stats.inventory.armorPacks += item.count;
    }

    AudioManager.playPickup();
    this.loot.removeItem(item.id);
    this.callbacks.onStatsUpdate(this.stats);
  }

  private updateCameraAndMesh() {
    // 1. Position and orient player mesh
    this.playerMesh.position.copy(this.playerPos);
    this.playerMesh.rotation.y = this.yaw;

    // Leg stride animation when moving
    const isMoving = this.input.state.moveX !== 0 || this.input.state.moveZ !== 0;
    const leftLeg = this.playerMesh.children[7] as THREE.Mesh;
    const rightLeg = this.playerMesh.children[8] as THREE.Mesh;
    if (leftLeg && rightLeg) {
      if (isMoving) {
        const time = Date.now() * 0.015;
        leftLeg.rotation.x = Math.sin(time) * 0.6;
        rightLeg.rotation.x = -Math.sin(time) * 0.6;
      } else {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
      }
    }

    // 2. Over-the-shoulder third-person camera
    const cameraDist = 4.2;
    const cameraHeight = 1.8;
    const shoulderOffset = 0.7; // slight right-shoulder offset for clear crosshair view

    const camX =
      this.playerPos.x +
      Math.sin(this.yaw) * Math.cos(this.pitch) * cameraDist +
      Math.cos(this.yaw) * shoulderOffset;

    const camY = this.playerPos.y + cameraHeight + Math.sin(this.pitch) * cameraDist;

    const camZ =
      this.playerPos.z +
      Math.cos(this.yaw) * Math.cos(this.pitch) * cameraDist -
      Math.sin(this.yaw) * shoulderOffset;

    this.camera.position.set(camX, camY, camZ);

    // Apply punchy screen shake feedback
    if (this.screenShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.screenShake;
      this.camera.position.y += (Math.random() - 0.5) * this.screenShake;
      this.camera.position.z += (Math.random() - 0.5) * this.screenShake;
      this.screenShake = Math.max(0, this.screenShake - 0.04);
    }

    // Target point to look at
    const targetX =
      this.playerPos.x -
      Math.sin(this.yaw) * 20 +
      Math.cos(this.yaw) * shoulderOffset;
    const targetY = this.playerPos.y + 1.4 - Math.sin(this.pitch + this.recoilOffset) * 20;
    const targetZ =
      this.playerPos.z -
      Math.cos(this.yaw) * 20 -
      Math.sin(this.yaw) * shoulderOffset;

    this.camera.lookAt(targetX, targetY, targetZ);
  }

  public getActiveWeaponSlot(): WeaponSlot | null {
    if (this.stats.activeSlot === 'primary') return this.stats.primaryWeapon;
    if (this.stats.activeSlot === 'secondary') return this.stats.secondaryWeapon;
    return this.stats.sidearmWeapon;
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
  }

  public setSettings(settings: GameSettings) {
    this.input.mouseSensitivity = settings.mouseSensitivity;
    AudioManager.setVolumes(settings.masterVolume, settings.sfxVolume, settings.musicVolume);
  }

  private onWindowResize = () => {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  public destroy() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
  }
}
