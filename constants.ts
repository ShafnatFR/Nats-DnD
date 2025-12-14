import { Character, CharacterClassDef, Item, Skill, LocationNode, Companion } from './types';

export const SURVIVAL_CONSTANTS = {
  BASE_HUNGER_DECAY: 2,
  BASE_THIRST_DECAY: 3,
  BASE_FATIGUE_DECAY: 1,
  CRITICAL_THRESHOLD: 20, // Percentage where debuffs/warnings start
  HP_PENALTY: 2, // Damage taken when a stat hits 0
  WARMTH_PENALTY: 5 // Damage taken when freezing
};

export const XP_FORMULA = (level: number) => Math.floor(level * 100 * 1.5);

export const WORLD_MAP: LocationNode[] = [
  {
    id: 'loc_start',
    name: 'Campfire of Beginnings',
    description: 'A safe haven amidst the encroaching dark. The fire never truly dies here.',
    type: 'SAFE',
    x: 50,
    y: 85,
    connections: ['loc_forest', 'loc_road']
  },
  {
    id: 'loc_forest',
    name: 'The Weeping Woods',
    description: 'Ancient trees with faces that seem to cry sap. The fog is thick here.',
    type: 'DANGER',
    x: 20,
    y: 60,
    connections: ['loc_start', 'loc_ruins']
  },
  {
    id: 'loc_road',
    name: 'Old King\'s Road',
    description: 'A broken cobblestone path leading to the fallen capital. Bandits lurk.',
    type: 'DANGER',
    x: 80,
    y: 60,
    connections: ['loc_start', 'loc_ruins', 'loc_town']
  },
  {
    id: 'loc_ruins',
    name: 'Ruins of Aethelgard',
    description: 'The skeletal remains of a fortress. Ghosts of the past whisper in the wind.',
    type: 'DUNGEON',
    x: 50,
    y: 40,
    connections: ['loc_forest', 'loc_road', 'loc_citadel']
  },
  {
    id: 'loc_town',
    name: 'Hamlet of Oakhaven',
    description: 'A small settlement barely holding on against the night. Traders might be found here.',
    type: 'TOWN',
    x: 90,
    y: 30,
    connections: ['loc_road']
  },
  {
    id: 'loc_citadel',
    name: 'The Dark Citadel',
    description: 'The source of the Eclipse. A massive structure piercing the sky.',
    type: 'DUNGEON',
    x: 50,
    y: 10,
    connections: ['loc_ruins']
  }
];

export const AVAILABLE_COMPANIONS: Record<string, Companion> = {
  'comp_puck': {
    id: 'comp_puck',
    name: 'Puck',
    class: 'Fairy',
    description: 'A small, annoying, but helpful spirit. Great at healing light wounds.',
    hp: 20,
    maxHp: 20,
    loyalty: 90,
    status: 'ACTIVE',
    avatarColor: 'bg-emerald-500'
  },
  'comp_casca': {
    id: 'comp_casca',
    name: 'Casca',
    class: 'Warrior',
    description: 'A former commander. Skilled with a sword, but haunted by trauma.',
    hp: 45,
    maxHp: 45,
    loyalty: 70,
    status: 'ACTIVE',
    avatarColor: 'bg-stone-500'
  },
  'comp_schierke': {
    id: 'comp_schierke',
    name: 'Isidro',
    class: 'Thief',
    description: 'A young boy wanting to learn swordsmanship. Fast but fragile.',
    hp: 30,
    maxHp: 30,
    loyalty: 50,
    status: 'ACTIVE',
    avatarColor: 'bg-orange-500'
  }
};

export const SKILL_TREE: Skill[] = [
  {
    id: 'iron_stomach',
    name: 'Iron Stomach',
    description: 'Years of scavenging have hardened your gut. Hunger grows slower.',
    cost: 1,
    requiredLevel: 1,
    effect: { passive: 'hunger_decay_reduced' }
  },
  {
    id: 'night_eyes',
    name: 'Night Eyes',
    description: 'The darkness is no longer an enemy. You see clearly in the void.',
    cost: 1,
    requiredLevel: 2,
    effect: { passive: 'night_vision' }
  },
  {
    id: 'titan_grip',
    name: 'Titan Grip',
    description: 'Muscle fibers tear and rebuild stronger. Permanent Strength increase.',
    cost: 2,
    requiredLevel: 3,
    prerequisiteId: 'iron_stomach',
    effect: { bonusStat: { STR: 2 } }
  },
  {
    id: 'meditation',
    name: 'Void Meditation',
    description: 'By staring into the abyss, you calm your mind. Max Willpower increased.',
    cost: 2,
    requiredLevel: 3,
    effect: { passive: 'max_will_boost' }
  },
  {
    id: 'blood_thirst',
    name: 'Blood Thirst',
    description: 'The smell of blood invigorates you. Recover small HP when dealing damage.',
    cost: 3,
    requiredLevel: 5,
    prerequisiteId: 'titan_grip',
    effect: { passive: 'lifesteal' }
  }
];

export const CLASSES: CharacterClassDef[] = [
  {
    id: 'struggler',
    name: 'The Struggler',
    description: 'A survivor who defies fate with a colossal iron blade. Rage is their weapon, endurance their shield.',
    baseHp: 60,
    baseMp: 0,
    baseWill: 50, 
    bonusStat: 'STR'
  },
  {
    id: 'hawk',
    name: 'White Hawk',
    description: 'A charismatic leader wielding a saber with surgical precision. Elegant, ambitious, and deadly.',
    baseHp: 40,
    baseMp: 30,
    baseWill: 40,
    bonusStat: 'CHA'
  },
  {
    id: 'brand',
    name: 'Branded Soul',
    description: 'Cursed by dark entities. Walks between the physical and astral worlds. Sees what others cannot.',
    baseHp: 35,
    baseMp: 50,
    baseWill: 35,
    bonusStat: 'INT'
  }
];

export const STARTING_ITEMS: Item[] = [
  {
    id: 'wep-01',
    name: 'Dragon Slayer (Replica)',
    type: 'WEAPON',
    description: 'Too big to be called a sword. Massive, thick, heavy, and far too rough.',
    icon: 'sword',
    quantity: 1
  },
  {
    id: 'con-01',
    name: 'Old Bandage',
    type: 'CONSUMABLE',
    description: 'Bloodstained cloth. It barely stops the bleeding, but it offers a moment of comfort.',
    icon: 'bandage',
    quantity: 3,
    effect: { hpRestore: 15 }
  },
  {
    id: 'con-02',
    name: 'Dried Meat',
    type: 'CONSUMABLE',
    description: 'Tough jerky. Salty and hard to chew, but it fuels the body.',
    icon: 'beef',
    quantity: 2,
    effect: { hpRestore: 5, hungerRestore: 30 }
  },
  {
    id: 'con-03',
    name: 'Waterskin',
    type: 'CONSUMABLE',
    description: 'A leather skin filled with stale water. Essential for survival.',
    icon: 'droplets', // Note: Need to handle this icon in InventoryModal if not present
    quantity: 1,
    effect: { thirstRestore: 50 }
  },
  {
    id: 'mat-01',
    name: 'Rusted Iron Chunk',
    type: 'MATERIAL',
    description: 'A remnant of a shattered armor. It smells of old blood and rain.',
    icon: 'anvil',
    quantity: 1
  },
  {
    id: 'key-01',
    name: 'Behelit Shard',
    type: 'KEY',
    description: 'A fragment of a red stone. It seems to pulse when you are in danger.',
    icon: 'gem',
    quantity: 1
  }
];

export const INITIAL_CHARACTER: Character = {
  name: "Guts",
  class: "The Struggler",
  level: 1,
  hp: 60,
  maxHp: 60,
  mp: 0,
  maxMp: 0,
  will: 50,
  maxWill: 50,
  stats: {
    STR: 18,
    DEX: 14,
    INT: 8,
    CHA: 8,
  },
  survival: {
    hunger: 100,
    thirst: 100,
    fatigue: 100,
    warmth: 100
  },
  progression: {
    currentXp: 0,
    maxXp: 150, // Based on XP_FORMULA(1)
    statPoints: 0,
    skillPoints: 0
  },
  unlockedSkills: [],
  currentLocationId: 'loc_start',
  party: [],
  inventory: STARTING_ITEMS,
  gold: 10
};

export const SYSTEM_PROMPT = `ROLE:
You are "The Narrator of Fate", telling the story of a "Struggler" in a beautiful yet brutal Dark Fantasy world (Berserk/Eldritch inspired).

ATMOSPHERE RULES:
1. Abstract & Surreal: Describe the environment like a surreal oil painting. "The clouds form weeping faces," "The wind carries the scent of old memories."
2. Philosophical: Touch upon themes of Fate (Causality), Dreams, Sacrifice, and the human struggle against overwhelming odds.
3. Contrast: 
   - If World State is "BONFIRE": Be calm, melancholic, reflective. No enemies.
   - If World State is "ECLIPSE": Be chaotic, terrifying, visceral.
   - If World State is "ASTRAL": Be dreamlike, spirits are visible.

GAMEPLAY RULES:
1. Willpower (WILL): If the player witnesses cosmic horror or hopelessness, reduce their WILL.
2. Healing: Only allow significant HP/WILL recovery during "BONFIRE" moments.
3. Combat: Visceral and heavy. Describe the impact of steel on bone.
4. Survival: Mention hunger, cold, or thirst if relevant to the scene.
5. Rewards: If the player achieves something, grant them XP (xp_reward: 10-50).
6. Party: If the player talks to a party member, Roleplay as that NPC.
7. Recruitment: If the narrative suggests a new companion joins (e.g. saving them), return their ID in "new_companion". (IDs: 'comp_puck', 'comp_casca', 'comp_schierke').

OUTPUT FORMAT (JSON MODE):
You MUST respond in valid JSON format.

JSON Structure:
{
  "narrative": "String (Your poetic & gritty story description)",
  "hp_change": Number (Negative for damage, positive for heal),
  "will_change": Number (Negative for mental damage/despair, positive for determination/hope),
  "xp_reward": Number (0 if no achievement, 10-100 based on difficulty),
  "world_state": "String (One of: 'PHYSICAL', 'ASTRAL', 'BONFIRE', 'ECLIPSE'). Default to current state if no change.", 
  "new_inventory": String | null,
  "new_companion": String | null,
  "dice_request": String | null,
  "suggested_actions": ["String", "String"] (2 short options for what the player might do next)
}`;