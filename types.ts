
export type Sender = 'DM' | 'Player' | 'System';
export type Language = 'EN' | 'ID';

export interface LocalizedString {
  EN: string;
  ID: string;
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
  mood?: WorldState;
}

export interface Stats {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  CHA: number;
  FATE: number;
}

export interface DerivedStats {
  carryWeight: number;
  evasion: number;
  critChance: number;
  meleeDamageMod: number;
  partyLimit: number;
}

export interface Trait {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  effectDescription: string;
  modifiers: {
    stats?: Partial<Stats>;
    maxHp?: number;
    maxMp?: number;
    maxWill?: number;
  };
}

export type WorldState = 'PHYSICAL' | 'ASTRAL' | 'BONFIRE' | 'ECLIPSE';

export type ModalType = 'NONE' | 'INVENTORY' | 'SKILLS' | 'MAP' | 'PARTY' | 'CAMP' | 'SMITHING' | 'COMBAT' | 'SHOP';

export type ItemType = 'WEAPON' | 'ARMOR' | 'CONSUMABLE' | 'KEY' | 'MATERIAL';

export type EquipSlot = 'HEAD' | 'BODY' | 'MAIN_HAND' | 'OFF_HAND' | 'ACCESSORY';

export type TimeOfDay = 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';
export type WeatherType = 'CLEAR' | 'RAIN' | 'STORM' | 'SNOW' | 'ASHFALL' | 'FOG';

export type NodeType = 'SAFE' | 'DANGER' | 'TOWN' | 'DUNGEON';

export interface LocationNode {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  type: NodeType;
  x: number;
  y: number;
  connections: string[];
}

export interface Companion {
  id: string;
  name: string; // NPC Names are proper nouns
  class: string;
  description: LocalizedString;
  hp: number;
  maxHp: number;
  loyalty: number;
  status: 'ACTIVE' | 'WOUNDED' | 'DEAD';
  avatarColor: string;
}

export interface EnvironmentState {
  time: TimeOfDay;
  weather: WeatherType;
  locationName: string; // Snapshot of current lang name
  turnCount: number;
}

export interface SurvivalStats {
  hunger: number;
  thirst: number;
  fatigue: number;
  warmth: number;
}

export interface Item {
  id: string;
  name: LocalizedString;
  type: ItemType;
  description: LocalizedString;
  icon: string;
  quantity: number;
  price: number;
  // Upgrade Logic
  upgradeLevel?: number; // Current +X
  maxUpgradeLevel?: number; // Max possible
  effect?: {
    hpRestore?: number;
    willRestore?: number;
    hungerRestore?: number;
    thirstRestore?: number;
    warmthRestore?: number;
  };
  equipProps?: {
    slot: EquipSlot;
    modifiers?: Partial<Stats>;
    defense?: number;
  };
}

export interface UpgradeCost {
  materialId: string;
  count: number;
  goldCost: number;
  successRate: number; // 0.0 to 1.0
  statGrowth: Partial<Stats>;
}

export interface Skill {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  cost: number;
  requiredLevel: number;
  prerequisiteId?: string;
  effect?: {
    bonusStat?: Partial<Stats>;
    passive?: string;
  };
}

// --- COMBAT TYPES ---
export interface Enemy {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  level: number;
  hp: number;
  maxHp: number;
  stats: Stats; 
  attacks: { name: string; damage: number; text: LocalizedString }[];
  xpReward: number;
  lootTable: string[]; // ID Item
  icon: string; // 'skull', 'ghost', 'wolf', etc.
}

export type CombatPhase = 'PLAYER_TURN' | 'ENEMY_TURN' | 'VICTORY' | 'DEFEAT';

export interface Character {
  name: string;
  class: LocalizedString;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  will: number;
  maxWill: number;
  stats: Stats; // Base Stats (Allocated)
  equipment: Record<EquipSlot, Item | null>; // Current Gear
  derivedStats: DerivedStats;
  trait: Trait | null;
  survival: SurvivalStats;
  progression: {
    currentXp: number;
    maxXp: number;
    statPoints: number;
    skillPoints: number;
  };
  unlockedSkills: string[];
  currentLocationId: string;
  party: Companion[];
  inventory: Item[];
  gold: number;
}

export interface CharacterClassDef {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  baseHp: number;
  baseMp: number;
  baseWill: number; 
  baseStats: Stats;
}

export interface AIResponse {
  narrative: string;
  hp_change: number;
  will_change: number; 
  xp_reward?: number; 
  world_state: WorldState | null;
  new_inventory: string | null;
  new_companion?: string | null; 
  dice_request: string | null;
  suggested_actions?: string[];
}
