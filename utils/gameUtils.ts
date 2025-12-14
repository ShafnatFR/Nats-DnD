export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
