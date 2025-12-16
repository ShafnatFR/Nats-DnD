
import { Character, Stats } from '../types';

export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const calculateTotalStats = (character: Character): Stats => {
  const { stats: base, trait, equipment } = character;
  
  // 1. Start with Base Stats
  let total = { ...base };

  // 2. Add Trait Modifiers
  if (trait?.modifiers.stats) {
    Object.entries(trait.modifiers.stats).forEach(([key, val]) => {
      const statKey = key as keyof Stats;
      if (total[statKey] !== undefined) {
        total[statKey] += val || 0;
      }
    });
  }

  // 3. Add Equipment Modifiers
  Object.values(equipment).forEach(item => {
    if (item && item.equipProps?.modifiers) {
      Object.entries(item.equipProps.modifiers).forEach(([key, val]) => {
        const statKey = key as keyof Stats;
        if (total[statKey] !== undefined) {
          total[statKey] += val || 0;
        }
      });
    }
  });

  // Ensure stats don't go below 1 (gameplay balance)
  (Object.keys(total) as Array<keyof Stats>).forEach(key => {
    if (total[key] < 1) total[key] = 1;
  });

  return total;
};
