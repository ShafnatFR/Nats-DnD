export type Sender = 'DM' | 'Player' | 'System';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
}

export interface Stats {
  STR: number;
  DEX: number;
  INT: number;
  CHA: number;
}

export interface Character {
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: Stats;
}

export interface CharacterClassDef {
  id: string;
  name: string;
  description: string;
  baseHp: number;
  baseMp: number;
  bonusStat: keyof Stats; // The stat that gets a +2 bonus
}