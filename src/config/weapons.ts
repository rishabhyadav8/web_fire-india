import { WeaponDef } from '../types/game';

export const WEAPONS: Record<string, WeaponDef> = {
  pulse_rifle: {
    id: 'pulse_rifle',
    name: 'Pulse Rifle',
    type: 'rifle',
    damage: 26,
    fireRate: 0.12,
    magSize: 30,
    reloadTime: 2.1,
    range: 120,
    spread: 0.025,
    ammoType: 'heavy',
    color: '#38bdf8', // bright cyan
    description: 'Versatile automatic energy-kinetic rifle for mid to long engagements.',
  },
  viper_smg: {
    id: 'viper_smg',
    name: 'Viper SMG',
    type: 'smg',
    damage: 17,
    fireRate: 0.075,
    magSize: 35,
    reloadTime: 1.6,
    range: 65,
    spread: 0.045,
    ammoType: 'light',
    color: '#a855f7', // vibrant purple
    description: 'Extremely high fire rate submachine gun. Shreds opponents at close range.',
  },
  ranger_shotgun: {
    id: 'ranger_shotgun',
    name: 'Ranger Shotgun',
    type: 'shotgun',
    damage: 16, // per pellet
    fireRate: 0.75,
    magSize: 6,
    reloadTime: 2.5,
    range: 40,
    spread: 0.08,
    pellets: 7, // 16 * 7 = 112 potential burst
    ammoType: 'shells',
    color: '#f97316', // bright orange
    description: 'Devastating close-quarters scattergun with 7 deadly tungsten pellets.',
  },
  falcon_dmr: {
    id: 'falcon_dmr',
    name: 'Falcon DMR',
    type: 'dmr',
    damage: 58,
    fireRate: 0.42,
    magSize: 10,
    reloadTime: 2.4,
    range: 160,
    spread: 0.012,
    ammoType: 'heavy',
    color: '#eab308', // amber gold
    description: 'Semi-automatic designated marksman rifle offering pinpoint lethality.',
  },
  sidekick_pistol: {
    id: 'sidekick_pistol',
    name: 'Sidekick Pistol',
    type: 'pistol',
    damage: 22,
    fireRate: 0.22,
    magSize: 15,
    reloadTime: 1.2,
    range: 70,
    spread: 0.03,
    ammoType: 'light',
    color: '#10b981', // emerald green
    description: 'Standard issue tactical sidearm with rapid reload speed.',
  },
};

export const BOT_NAMES = [
  'ApexGhost',
  'ViperNine',
  'ShadowStrike',
  'EchoSeven',
  'TitanZero',
  'FrostByte',
  'CyberWolf',
  'RaptorOne',
  'NovaReaper',
  'StormRider',
  'DreadBlade',
  'Vortex99',
  'BlazeFury',
  'IronClad',
];
