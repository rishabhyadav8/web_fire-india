import { ZonePhase } from '../types/game';

export const MAP_SIZE = 300; // 300x300 units island
export const MAP_HALF = MAP_SIZE / 2;

export const PLAYER_CONFIG = {
  walkSpeed: 10,
  sprintSpeed: 16,
  jumpForce: 12,
  gravity: 30,
  height: 2.0,
  radius: 0.6,
  baseHealth: 100,
  baseArmor: 0,
  maxArmor: 100,
  armorAbsorptionRate: 0.65, // 65% absorbed by armor, remainder to health
};

export const BOT_CONFIG = {
  count: 14,
  walkSpeed: 7,
  runSpeed: 12,
  detectionRange: 60,
  shootRange: 45,
  aimAccuracy: 0.85, // slight spread so player can dodge
  attackCooldownVariance: 0.4,
};

export const ZONE_PHASES: ZonePhase[] = [
  {
    phase: 1,
    radius: 140,
    targetRadius: 100,
    waitDuration: 40,
    shrinkDuration: 25,
    damagePerSec: 2.5,
  },
  {
    phase: 2,
    radius: 100,
    targetRadius: 60,
    waitDuration: 35,
    shrinkDuration: 20,
    damagePerSec: 5.0,
  },
  {
    phase: 3,
    radius: 60,
    targetRadius: 25,
    waitDuration: 30,
    shrinkDuration: 18,
    damagePerSec: 9.0,
  },
  {
    phase: 4,
    radius: 25,
    targetRadius: 4,
    waitDuration: 20,
    shrinkDuration: 15,
    damagePerSec: 15.0,
  },
];

export const MAP_LOCATIONS = [
  { name: 'Abandoned Outpost', x: -80, z: -80, desc: 'Decaying military barracks with heavy weapon crates' },
  { name: 'Supply Warehouse', x: 75, z: -70, desc: 'Large industrial storage facility packed with gear' },
  { name: 'Central Field', x: 0, z: 0, desc: 'Open crossroads with watchtower and scattered cover' },
  { name: 'Riverside Camp', x: -65, z: 65, desc: 'River crossing with tents, dock, and medical caches' },
  { name: 'Radar Complex', x: 80, z: 75, desc: 'High ground radio dish with long-range marksman loot' },
];
