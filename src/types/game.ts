export type GameState = 
  | 'MAIN_MENU'
  | 'PRE_GAME'
  | 'PLAYING'
  | 'PAUSED'
  | 'ELIMINATED'
  | 'VICTORY';

export type AmmoType = 'light' | 'heavy' | 'shells';

export interface WeaponDef {
  id: string;
  name: string;
  type: 'rifle' | 'smg' | 'shotgun' | 'dmr' | 'pistol';
  damage: number;
  fireRate: number; // seconds between shots
  magSize: number;
  reloadTime: number; // seconds
  range: number;
  spread: number;
  pellets?: number;
  ammoType: AmmoType;
  color: string;
  description: string;
}

export interface WeaponSlot {
  weapon: WeaponDef;
  currentMag: number;
  isReloading: boolean;
  reloadProgress: number;
}

export interface LootItem {
  id: string;
  type: 'weapon' | 'ammo' | 'health' | 'armor';
  subType: string;
  count: number;
  x: number;
  y: number;
  z: number;
  meshIndex?: number;
}

export interface BotEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  weapon: WeaponDef;
  currentMag: number;
  isReloading: boolean;
  state: 'PATROL' | 'SEARCH' | 'CHASE' | 'ATTACK' | 'RETREAT' | 'DEAD';
  targetId: string | null;
  targetPos: { x: number; z: number } | null;
  stateTimer: number;
  fireCooldown: number;
  reloadTimer: number;
  kills: number;
  color: number;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  kills: number;
  aliveCount: number;
  primaryWeapon: WeaponSlot | null;
  secondaryWeapon: WeaponSlot | null;
  sidearmWeapon: WeaponSlot;
  activeSlot: 'primary' | 'secondary' | 'sidearm';
  ammo: {
    light: number;
    heavy: number;
    shells: number;
  };
  inventory: {
    medkits: number;
    quickHeals: number;
    armorPacks: number;
  };
  isHealing: boolean;
  healProgress: number;
  healItemName: string;
}

export interface ZonePhase {
  phase: number;
  radius: number;
  targetRadius: number;
  shrinkDuration: number;
  waitDuration: number;
  damagePerSec: number;
}

export interface KillFeedItem {
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  isPlayerKill: boolean;
  isPlayerVictim: boolean;
  timestamp: number;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  mouseSensitivity: number;
  graphicsQuality: 'low' | 'medium' | 'high';
}
