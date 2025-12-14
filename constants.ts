import { Character, CharacterClassDef } from './types';

export const CLASSES: CharacterClassDef[] = [
  {
    id: 'warrior',
    name: 'Cyber-Knight',
    description: 'A heavy-hitter augmented with plasteel plating. Domines close-quarters combat.',
    baseHp: 45,
    baseMp: 10,
    bonusStat: 'STR'
  },
  {
    id: 'mage',
    name: 'Techno-Mage',
    description: 'Wields unstable code algorithms to bend reality. High utility, low durability.',
    baseHp: 25,
    baseMp: 50,
    bonusStat: 'INT'
  },
  {
    id: 'rogue',
    name: 'Data-Rogue',
    description: 'Stealth operative utilizing active camouflage and critical strikes.',
    baseHp: 35,
    baseMp: 25,
    bonusStat: 'DEX'
  },
  {
    id: 'diplomat',
    name: 'Net-Weaver',
    description: 'Charismatic leader who manipulates the social protocol layers.',
    baseHp: 30,
    baseMp: 30,
    bonusStat: 'CHA'
  }
];

export const INITIAL_CHARACTER: Character = {
  name: "Kaelthas",
  class: "Cyber-Mage",
  level: 1,
  hp: 28,
  maxHp: 35,
  mp: 40,
  maxMp: 40,
  stats: {
    STR: 10,
    DEX: 14,
    INT: 18,
    CHA: 12,
  },
};

export const DM_RESPONSES = [
  "The wind howls through the cracks in the ancient stone walls...",
  "You hear the distant sound of metal scraping against stone.",
  "Roll for Initiative!",
  "A shadowy figure watches you from the darkness, eyes glowing faintly.",
  "The chest is locked. It appears to be trapped.",
  "Your spell fizzles out, leaving a scent of ozone.",
  "The goblin snarls and draws a rusted dagger.",
  "You feel a sudden drop in temperature.",
  "Make a Perception check.",
  "The ancient terminal flickers to life, displaying cryptic runes.",
];