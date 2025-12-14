export type Sender = 'DM' | 'Player' | 'System';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
  mood?: WorldState; // The atmosphere when this message was generated
}

export interface Stats {
  STR: number;
  DEX: number;
  INT: number;
  CHA: number;
}

export type WorldState = 'PHYSICAL' | 'ASTRAL' | 'BONFIRE' | 'ECLIPSE';

export type ModalType = 'NONE' | 'INVENTORY' | 'SKILLS' | 'MAP' | 'PARTY' | 'CAMP';

export type ItemType = 'WEAPON' | 'ARMOR' | 'CONSUMABLE' | 'KEY' | 'MATERIAL';

export type TimeOfDay = 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';
export type WeatherType = 'CLEAR' | 'RAIN' | 'STORM' | 'SNOW' | 'ASHFALL' | 'FOG';

export type NodeType = 'SAFE' | 'DANGER' | 'TOWN' | 'DUNGEON';

export interface LocationNode {
  id: string;
  name: string;
  description: string;
  type: NodeType;
  x: number; // 0-100 percentage for map placement
  y: number; // 0-100 percentage
  connections: string[]; // IDs of connected nodes
}

export interface Companion {
  id: string;
  name: string;
  class: string;
  description: string;
  hp: number;
  maxHp: number;
  loyalty: number; // 0-100
  status: 'ACTIVE' | 'WOUNDED' | 'DEAD';
  avatarColor: string; // Hex or tailwind class hint
}

export interface EnvironmentState {
  time: TimeOfDay;
  weather: WeatherType;
  locationName: string;
  turnCount: number;
}

export interface SurvivalStats {
  hunger: number;       // 0-100 (100 = Sated)
  thirst: number;       // 0-100 (100 = Hydrated)
  fatigue: number;      // 0-100 (100 = Rested)
  warmth: number;       // 0-100 (100 = Warm, 0 = Freezing)
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  icon: string; // Lucide icon name string
  quantity: number;
  effect?: {
    hpRestore?: number;
    willRestore?: number;
    hungerRestore?: number;
    thirstRestore?: number;
    warmthRestore?: number;
  };
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number;        // Skill Points
  requiredLevel: number;
  prerequisiteId?: string;
  effect?: {
    bonusStat?: Partial<Stats>;
    passive?: string; // e.g., "hunger_decay_reduced"
  };
}

export interface Character {
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  will: number; // Replaces Sanity
  maxWill: number;
  stats: Stats;
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
  name: string;
  description: string;
  baseHp: number;
  baseMp: number;
  baseWill: number; // Replaces baseSanity
  bonusStat: keyof Stats;
}

export interface AIResponse {
  narrative: string;
  hp_change: number;
  will_change: number; // Replaces sanity_change
  xp_reward?: number; // New field for progression
  world_state: WorldState | null; // New field for visual atmosphere
  new_inventory: string | null;
  new_companion?: string | null; // ID of a companion to add
  dice_request: string | null;
  suggested_actions?: string[];
}