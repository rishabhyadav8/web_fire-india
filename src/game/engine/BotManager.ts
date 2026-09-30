import * as THREE from 'three';
import { BotEntity, WeaponDef } from '../../types/game';
import { BOT_NAMES, WEAPONS } from '../../config/weapons';
import { BOT_CONFIG, PLAYER_CONFIG } from '../../config/constants';
import { SafeZoneSystem } from './SafeZoneSystem';
import { Collider } from './MapBuilder';

export class BotManager {
  public group: THREE.Group;
  public bots: BotEntity[] = [];
  public botMeshes: Map<string, THREE.Group> = new Map();

  constructor() {
    this.group = new THREE.Group();
  }

  public spawnBots(spawnPoints: { x: number; z: number }[]) {
    this.clear();

    const weaponList = Object.values(WEAPONS);
    const botColors = [
      0xef4444, 0xf97316, 0xeab308, 0x10b981, 0x06b6d4, 0x3b82f6, 
      0x8b5cf6, 0xec4899, 0xf43f5e, 0x14b8a6, 0x84cc16, 0x6366f1, 0xd946ef, 0x64748b
    ];

    const count = Math.min(BOT_CONFIG.count, spawnPoints.length);

    for (let i = 0; i < count; i++) {
      const pt = spawnPoints[i];
      const botWeapon = weaponList[Math.floor(Math.random() * weaponList.length)];
      const botColor = botColors[i % botColors.length];
      const name = BOT_NAMES[i % BOT_NAMES.length];

      const bot: BotEntity = {
        id: `bot_${i}`,
        name,
        x: pt.x,
        y: 1.0,
        z: pt.z,
        rotation: Math.random() * Math.PI * 2,
        health: 100,
        maxHealth: 100,
        armor: Math.random() > 0.3 ? 50 : 0,
        maxArmor: 100,
        weapon: botWeapon,
        currentMag: botWeapon.magSize,
        isReloading: false,
        state: 'PATROL',
        targetId: null,
        targetPos: null,
        stateTimer: 2 + Math.random() * 3,
        fireCooldown: 0.5 + Math.random() * 0.8,
        reloadTimer: 0,
        kills: 0,
        color: botColor,
      };

      this.bots.push(bot);
      this.createBotMesh(bot);
    }
  }

  private createBotMesh(bot: BotEntity) {
    const group = new THREE.Group();
    group.position.set(bot.x, bot.y, bot.z);

    const bodyMat = new THREE.MeshLambertMaterial({ color: bot.color });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), bodyMat);
    torso.position.y = 0.45;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), darkMat);
    head.position.y = 1.1;
    head.castShadow = true;
    group.add(head);

    // Helmet visor
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.12, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    visor.position.set(0, 1.1, 0.2);
    group.add(visor);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.45, 0.35, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.45, 0.35, 0.2);
    rightArm.rotation.x = -Math.PI / 4;
    group.add(rightArm);

    // Weapon model in hand
    const weaponMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.7), weaponMat);
    gun.position.set(0.35, 0.3, 0.5);
    group.add(gun);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.25, 0.9, 0.25);
    const leftLeg = new THREE.Mesh(legGeo, darkMat);
    leftLeg.position.set(-0.2, -0.45, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, darkMat);
    rightLeg.position.set(0.2, -0.45, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    this.group.add(group);
    this.botMeshes.set(bot.id, group);
  }

  public update(
    delta: number,
    playerPos: { x: number; y: number; z: number },
    safeZone: SafeZoneSystem,
    colliders: Collider[],
    onBotShoot: (bot: BotEntity, targetPos: THREE.Vector3) => void,
    onBotEliminated: (bot: BotEntity, killerName: string) => void
  ) {
    for (let i = this.bots.length - 1; i >= 0; i--) {
      const bot = this.bots[i];
      if (bot.state === 'DEAD') continue;

      // 1. Check Zone damage
      if (!safeZone.isPositionInsideZone(bot.x, bot.z)) {
        bot.health -= safeZone.currentPhaseDef.damagePerSec * delta;
        if (bot.health <= 0) {
          bot.state = 'DEAD';
          onBotEliminated(bot, 'The Safe Zone');
          this.removeBotMesh(bot.id);
          continue;
        }
      }

      // 2. Timers
      bot.stateTimer -= delta;
      bot.fireCooldown -= delta;
      if (bot.isReloading) {
        bot.reloadTimer -= delta;
        if (bot.reloadTimer <= 0) {
          bot.isReloading = false;
          bot.currentMag = bot.weapon.magSize;
        }
      }

      // 3. Target decision: Check distance to player
      const dxP = playerPos.x - bot.x;
      const dzP = playerPos.z - bot.z;
      const distToPlayer = Math.sqrt(dxP * dxP + dzP * dzP);

      // Check zone emergency flee
      const isOutsideZone = !safeZone.isPositionInsideZone(bot.x, bot.z);

      if (isOutsideZone) {
        // Must flee to safe zone center!
        bot.state = 'CHASE';
        bot.targetPos = { x: safeZone.targetX, z: safeZone.targetZ };
      } else if (distToPlayer < BOT_CONFIG.detectionRange) {
        // Player detected
        if (distToPlayer < BOT_CONFIG.shootRange) {
          bot.state = 'ATTACK';
          bot.targetPos = { x: playerPos.x, z: playerPos.z };
        } else {
          bot.state = 'CHASE';
          bot.targetPos = { x: playerPos.x, z: playerPos.z };
        }
      } else {
        // Find other nearby bots to fight or patrol
        let closestOtherBot: BotEntity | null = null;
        let minDist = BOT_CONFIG.detectionRange * 0.7;

        for (const other of this.bots) {
          if (other.id === bot.id || other.state === 'DEAD') continue;
          const odx = other.x - bot.x;
          const odz = other.z - bot.z;
          const odist = Math.sqrt(odx * odx + odz * odz);
          if (odist < minDist) {
            minDist = odist;
            closestOtherBot = other;
          }
        }

        if (closestOtherBot) {
          bot.state = 'ATTACK';
          bot.targetPos = { x: closestOtherBot.x, z: closestOtherBot.z };
          bot.targetId = closestOtherBot.id;
        } else if (bot.stateTimer <= 0 || !bot.targetPos) {
          // Patrol wander
          bot.state = 'PATROL';
          bot.stateTimer = 4 + Math.random() * 4;
          const roamAngle = Math.random() * Math.PI * 2;
          const roamDist = 15 + Math.random() * 25;
          bot.targetPos = {
            x: Math.max(-130, Math.min(130, bot.x + Math.cos(roamAngle) * roamDist)),
            z: Math.max(-130, Math.min(130, bot.z + Math.sin(roamAngle) * roamDist)),
          };
        }
      }

      // 4. Movement execution
      if (bot.targetPos) {
        const toX = bot.targetPos.x - bot.x;
        const toZ = bot.targetPos.z - bot.z;
        const distToTarget = Math.sqrt(toX * toX + toZ * toZ);

        if (distToTarget > 2.0) {
          const moveSpeed = (bot.state === 'ATTACK' ? BOT_CONFIG.walkSpeed : BOT_CONFIG.runSpeed) * delta;
          const dirX = toX / distToTarget;
          const dirZ = toZ / distToTarget;

          let nextX = bot.x + dirX * moveSpeed;
          let nextZ = bot.z + dirZ * moveSpeed;

          // Basic obstacle collision avoidance for bots
          let hitObstacle = false;
          for (const col of colliders) {
            if (col.type === 'box') {
              const hw = col.width / 2 + 0.6;
              const hd = col.depth / 2 + 0.6;
              if (Math.abs(nextX - col.x) < hw && Math.abs(nextZ - col.z) < hd) {
                hitObstacle = true;
                break;
              }
            } else if (col.type === 'cylinder') {
              const r = (col.radius || 1) + 0.6;
              const cdx = nextX - col.x;
              const cdz = nextZ - col.z;
              if (cdx * cdx + cdz * cdz < r * r) {
                hitObstacle = true;
                break;
              }
            }
          }

          if (hitObstacle) {
            // Slide or pick a new direction
            bot.targetPos = {
              x: bot.x - dirZ * 10,
              z: bot.z + dirX * 10,
            };
          } else {
            bot.x = nextX;
            bot.z = nextZ;
          }

          // Face movement or target
          bot.rotation = Math.atan2(dirX, dirZ);
        }
      }

      // 5. Combat behavior: Shoot when in ATTACK state
      if (bot.state === 'ATTACK' && bot.fireCooldown <= 0) {
        if (bot.currentMag <= 0) {
          bot.isReloading = true;
          bot.reloadTimer = bot.weapon.reloadTime;
        } else if (!bot.isReloading) {
          // Aim at player or target bot
          let aimTarget: THREE.Vector3 | null = null;
          if (distToPlayer < BOT_CONFIG.shootRange) {
            aimTarget = new THREE.Vector3(playerPos.x, playerPos.y + 0.5, playerPos.z);
          } else if (bot.targetId) {
            const targetOther = this.bots.find((b) => b.id === bot.targetId);
            if (targetOther && targetOther.state !== 'DEAD') {
              aimTarget = new THREE.Vector3(targetOther.x, targetOther.y + 0.5, targetOther.z);
            }
          }

          if (aimTarget) {
            // Apply slight spread so bot is believable and player can dodge
            const spread = (1 - BOT_CONFIG.aimAccuracy) * 1.5;
            aimTarget.x += (Math.random() - 0.5) * spread;
            aimTarget.z += (Math.random() - 0.5) * spread;

            bot.currentMag--;
            bot.fireCooldown = bot.weapon.fireRate + Math.random() * 0.15;
            onBotShoot(bot, aimTarget);
          }
        }
      }

      // 6. Update 3D mesh position and rotation
      const mesh = this.botMeshes.get(bot.id);
      if (mesh) {
        mesh.position.set(bot.x, 1.0, bot.z);
        mesh.rotation.y = bot.rotation;

        // Subtle leg stride animation when moving
        const time = Date.now() * 0.012;
        const leftLeg = mesh.children[6] as THREE.Mesh;
        const rightLeg = mesh.children[7] as THREE.Mesh;
        if (leftLeg && rightLeg) {
          leftLeg.rotation.x = Math.sin(time) * 0.4;
          rightLeg.rotation.x = -Math.sin(time) * 0.4;
        }
      }
    }
  }

  public damageBot(
    botId: string,
    damage: number,
    dealerName: string
  ): { isDead: boolean; isArmorHit: boolean; currentHp: number } | null {
    const bot = this.bots.find((b) => b.id === botId);
    if (!bot || bot.state === 'DEAD') return null;

    let isArmorHit = false;
    let actualDamage = damage;

    if (bot.armor > 0) {
      isArmorHit = true;
      const armorAbsorb = actualDamage * PLAYER_CONFIG.armorAbsorptionRate;
      const leftover = actualDamage - armorAbsorb;

      bot.armor -= armorAbsorb;
      if (bot.armor < 0) {
        actualDamage = leftover + Math.abs(bot.armor);
        bot.armor = 0;
      } else {
        actualDamage = leftover;
      }
    }

    bot.health -= actualDamage;

    // React: Bot targets whoever attacked them!
    bot.state = 'ATTACK';
    bot.fireCooldown = Math.min(bot.fireCooldown, 0.2);

    if (bot.health <= 0) {
      bot.health = 0;
      bot.state = 'DEAD';
      this.removeBotMesh(botId);
      return { isDead: true, isArmorHit, currentHp: 0 };
    }

    return { isDead: false, isArmorHit, currentHp: bot.health };
  }

  public getAliveCount(): number {
    return this.bots.filter((b) => b.state !== 'DEAD').length;
  }

  private removeBotMesh(botId: string) {
    const mesh = this.botMeshes.get(botId);
    if (mesh) {
      this.group.remove(mesh);
      this.botMeshes.delete(botId);
    }
  }

  public clear() {
    for (const [, mesh] of this.botMeshes.entries()) {
      this.group.remove(mesh);
    }
    this.botMeshes.clear();
    this.bots = [];
  }
}
