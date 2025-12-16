import React, { useState, useCallback, useEffect } from 'react';
import { Message, Character, AIResponse, WorldState, ModalType, Item, EnvironmentState, TimeOfDay, Companion, EquipSlot, Stats, Enemy, CombatPhase, Language } from './types';
import { INITIAL_CHARACTER, SURVIVAL_CONSTANTS, XP_FORMULA, SKILL_TREE, WORLD_MAP, AVAILABLE_COMPANIONS, GET_UPGRADE_COST, ENEMIES, MATERIALS, STARTING_ITEMS, SHOP_INVENTORY } from './constants';
import { rollDie, generateId, calculateTotalStats } from './utils/gameUtils';
import { generateDMResponse, generateIntro } from './utils/gemini';
import { getLogText, getLocName } from './utils/textUtils';
import GameLog from './components/GameLog';
import InputArea from './components/InputArea';
import CharacterSheet from './components/CharacterSheet';
import CharacterCreation from './components/CharacterCreation';
import GameDock from './components/GameDock';
import ModalManager from './components/ModalManager';
import EnvironmentWidget from './components/EnvironmentWidget';
import { Sword } from 'lucide-react';

const STORAGE_KEY = 'ai_realm_save_v2'; // Changed key due to breaking schema changes

const App: React.FC = () => {
  // --- STATE INITIALIZATION WITH PERSISTENCE ---
  const [gameStarted, setGameStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');
  const [diceResult, setDiceResult] = useState<number | null>(null);
  
  // Default to ID (Indonesian)
  const [language, setLanguage] = useState<Language>('ID');

  // Persistent Data States
  const [character, setCharacter] = useState<Character>(INITIAL_CHARACTER);
  const [messages, setMessages] = useState<Message[]>([]);
  const [worldState, setWorldState] = useState<WorldState>('PHYSICAL');
  const [env, setEnv] = useState<EnvironmentState>({
    time: 'DAWN',
    weather: 'FOG',
    locationName: 'Campfire of Beginnings', // Will be updated by useEffect
    turnCount: 0
  });

  // Combat State
  const [activeEnemy, setActiveEnemy] = useState<Enemy | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [combatPhase, setCombatPhase] = useState<CombatPhase>('PLAYER_TURN');

  // Initial location name sync
  useEffect(() => {
     if(character.currentLocationId) {
        const loc = WORLD_MAP.find(n => n.id === character.currentLocationId);
        if(loc) setEnv(prev => ({...prev, locationName: getLocName(loc, language)}));
     }
  }, [language, character.currentLocationId]);

  // Load from Storage on Mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.character && parsed.messages) {
          setCharacter(parsed.character);
          setMessages(parsed.messages.map((m: any) => ({...m, timestamp: new Date(m.timestamp)}))); 
          setWorldState(parsed.worldState);
          setEnv(parsed.env);
          if (parsed.language) setLanguage(parsed.language);
          setGameStarted(true);
        }
      } catch (e) {
        console.error("Save file corrupted", e);
      }
    }
  }, []);

  // Save to Storage on Change (Auto-Save)
  useEffect(() => {
    if (gameStarted) {
      const saveData = {
        character,
        messages: messages.slice(-50), // Limit storage usage
        worldState,
        env,
        language
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    }
  }, [character, messages, worldState, env, gameStarted, language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'EN' ? 'ID' : 'EN');
  };

  // --- SHOP LOGIC ---
  const isShopAvailable = () => {
     const loc = WORLD_MAP.find(n => n.id === character.currentLocationId);
     return loc ? (loc.type === 'TOWN' || loc.type === 'SAFE') : false;
  };

  const handleBuyItem = (item: Item) => {
     if (character.gold < item.price) return;

     setCharacter(prev => {
        const newGold = prev.gold - item.price;
        const newInventory = [...prev.inventory];
        const existingItem = newInventory.find(i => i.id === item.id);
        
        if (existingItem) {
           existingItem.quantity += 1;
        } else {
           newInventory.push({ ...item, quantity: 1 });
        }

        return { ...prev, gold: newGold, inventory: newInventory };
     });

     const log = getLogText(language, 'buy_item', { item: getLocName(item, language), price: item.price });
     setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `💰 ${log}`, timestamp: new Date() }]);
  };

  const handleSellItem = (item: Item) => {
     const sellPrice = Math.floor(item.price / 2);
     
     setCharacter(prev => {
        const newGold = prev.gold + sellPrice;
        let newInventory = [...prev.inventory];
        const index = newInventory.findIndex(i => i.id === item.id);
        
        if (index > -1) {
           if (newInventory[index].quantity > 1) {
              newInventory[index].quantity -= 1;
           } else {
              newInventory.splice(index, 1);
           }
        }

        return { ...prev, gold: newGold, inventory: newInventory };
     });

     const log = getLogText(language, 'sell_item', { item: getLocName(item, language), price: sellPrice });
     setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `🪙 ${log}`, timestamp: new Date() }]);
  };

  // --- COMBAT LOGIC ---

  const startCombat = (enemyTemplate: Enemy) => {
     setActiveEnemy({ ...enemyTemplate });
     setCombatLog([`${getLocName(enemyTemplate, language)} appeared!`]);
     setCombatPhase('PLAYER_TURN');
     setActiveModal('COMBAT');
  };

  const handlePlayerAttack = () => {
     if (!activeEnemy) return;
     const totalStats = calculateTotalStats(character);
     
     const hitChance = Math.min(95, Math.max(30, 70 + ((totalStats.DEX - activeEnemy.stats.DEX) * 2)));
     const roll = Math.random() * 100;

     if (roll <= hitChance) {
        let baseDmg = totalStats.STR;
        const weapon = character.equipment.MAIN_HAND;
        if (weapon && weapon.upgradeLevel) {
           baseDmg += (weapon.upgradeLevel * 2);
        }
        const damage = Math.floor(baseDmg + (Math.random() * 4));
        
        setActiveEnemy(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - damage) } : null);
        const log = getLogText(language, 'attack_hit', { target: getLocName(activeEnemy, language), dmg: damage });
        setCombatLog(prev => [...prev, log]);

        if ((activeEnemy.hp - damage) <= 0) {
           setCombatPhase('VICTORY');
           const winLog = getLogText(language, 'victory', { target: getLocName(activeEnemy, language), xp: activeEnemy.xpReward });
           setCombatLog(prev => [...prev, winLog]);
        } else {
           setCombatPhase('ENEMY_TURN');
           setTimeout(handleEnemyTurn, 1000);
        }
     } else {
        const log = getLogText(language, 'attack_miss', { target: getLocName(activeEnemy, language) });
        setCombatLog(prev => [...prev, log]);
        setCombatPhase('ENEMY_TURN');
        setTimeout(handleEnemyTurn, 1000);
     }
  };

  const handleEnemyTurn = () => {
     if (!activeEnemy || activeEnemy.hp <= 0) return;

     const attack = activeEnemy.attacks[Math.floor(Math.random() * activeEnemy.attacks.length)];
     const totalStats = calculateTotalStats(character);
     const defense = Math.floor(totalStats.CON / 2) + (character.equipment.BODY?.equipProps?.modifiers?.CON || 0); 
     
     const rawDamage = attack.damage;
     const finalDamage = Math.max(1, rawDamage - Math.floor(defense / 2));

     setCharacter(prev => ({ ...prev, hp: Math.max(0, prev.hp - finalDamage) }));
     const log = getLogText(language, 'enemy_hit', { enemy: getLocName(activeEnemy, language), dmg: finalDamage });
     const flavor = language === 'EN' ? attack.text.EN : attack.text.ID;
     
     setCombatLog(prev => [...prev, `${getLocName(activeEnemy, language)} ${flavor}`, log]);

     if ((character.hp - finalDamage) <= 0) {
        setCombatPhase('DEFEAT');
        setCombatLog(prev => [...prev, getLogText(language, 'defeat')]);
     } else {
        setCombatPhase('PLAYER_TURN');
     }
  };

  const handlePlayerSkill = (skillName: string) => {
     setCombatLog(prev => [...prev, `Skill ${skillName} used... (WIP)`]);
     setCombatPhase('ENEMY_TURN');
     setTimeout(handleEnemyTurn, 1000);
  };

  const handleFlee = () => {
     if (!activeEnemy) return;
     const totalStats = calculateTotalStats(character);
     const chance = 50 + ((totalStats.DEX - activeEnemy.stats.DEX) * 5);
     
     if (Math.random() * 100 < chance) {
        setCombatLog(prev => [...prev, getLogText(language, 'flee_success')]);
        setTimeout(() => {
           setActiveModal('NONE');
           setActiveEnemy(null);
        }, 1000);
     } else {
        setCombatLog(prev => [...prev, getLogText(language, 'flee_fail')]);
        setCombatPhase('ENEMY_TURN');
        setTimeout(handleEnemyTurn, 1000);
     }
  };

  const handleVictory = async () => {
     if (!activeEnemy) return;
     const xp = activeEnemy.xpReward;
     const loot = activeEnemy.lootTable.length > 0 
        ? activeEnemy.lootTable[Math.floor(Math.random() * activeEnemy.lootTable.length)] 
        : null;

     const { updatedChar, sysMessages } = handleGainXp(xp, character);
     
     let newInventory = [...updatedChar.inventory];
     let lootName = '';
     if (loot) {
        let itemDef = Object.values(MATERIALS).find(m => m.id === loot) as unknown as Item;
        if (!itemDef) itemDef = STARTING_ITEMS.find(i => i.id === loot);

        if (itemDef) {
           lootName = getLocName(itemDef, language);
           const existingItem = newInventory.find(i => i.id === loot);
           if (existingItem) {
              existingItem.quantity += 1;
           } else {
              newInventory.push({ ...itemDef, quantity: 1, type: itemDef.type || 'MATERIAL' });
           }
        }
     }

     setCharacter({ ...updatedChar, inventory: newInventory });
     setActiveModal('NONE');
     setActiveEnemy(null);

     const victoryLog = getLogText(language, 'victory', { target: getLocName(activeEnemy, language), xp: xp });
     const lootMsg = lootName ? ` (Loot: ${lootName})` : '';
     setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `⚔️ ${victoryLog}${lootMsg}`, timestamp: new Date() }, ...sysMessages]);

     await handleSendMessage(`[SYSTEM]: Victory against ${getLocName(activeEnemy, language)}. Describe the final blow.`);
  };

  const handleDefeat = () => {
     setCharacter(prev => ({
        ...prev,
        hp: prev.maxHp,
        currentLocationId: 'loc_start',
        gold: Math.floor(prev.gold / 2),
        survival: { hunger: 50, thirst: 50, fatigue: 50, warmth: 50 }
     }));
     
     setActiveModal('NONE');
     setActiveEnemy(null);
     setMessages(prev => [...prev, { 
        id: generateId(), 
        sender: 'System', 
        text: `💀 ${getLogText(language, 'respawn')}`, 
        timestamp: new Date() 
     }]);
  };


  // --- GAME LOGIC ---

  const handleResetGame = () => {
    if (window.confirm("Are you sure? This will reset your progress.")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const getWorldStyles = () => {
    switch(worldState) {
      case 'BONFIRE': return 'bg-gradient-to-t from-orange-950 via-slate-900 to-slate-950'; 
      case 'ASTRAL': return 'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-black'; 
      case 'ECLIPSE': return 'bg-red-950 animate-pulse-slow';
      case 'PHYSICAL':
      default: return 'bg-slate-950';
    }
  };

  // --- PROGRESSION ---
  const handleGainXp = (amount: number, currentCharacter: Character): { updatedChar: Character, sysMessages: Message[] } => {
     let char = { ...currentCharacter };
     const sysMessages: Message[] = [];
     
     if (amount <= 0) return { updatedChar: char, sysMessages };

     char.progression.currentXp += amount;
     sysMessages.push({
        id: generateId(), sender: 'System', text: `✨ ${getLogText(language, 'gain_xp', {xp: amount})}`, timestamp: new Date()
     });

     while (char.progression.currentXp >= char.progression.maxXp) {
        char.progression.currentXp -= char.progression.maxXp;
        char.level += 1;
        char.progression.maxXp = XP_FORMULA(char.level);
        char.progression.statPoints += 2;
        char.progression.skillPoints += 1;
        char.maxHp += 10;
        char.hp = char.maxHp; 
        char.maxWill += 5;
        char.will = char.maxWill;

        sysMessages.push({
           id: generateId(), sender: 'System', text: `🔥 ${getLogText(language, 'level_up', {lvl: char.level})}`, timestamp: new Date()
        });
     }

     return { updatedChar: char, sysMessages };
  };

  const handleLearnSkill = (skillId: string) => {
     const skill = SKILL_TREE.find(s => s.id === skillId);
     if (!skill) return;

     setCharacter(prev => {
        if (prev.progression.skillPoints < skill.cost) return prev;
        const newStats = { ...prev.stats };
        if (skill.effect?.bonusStat) {
           // Simplified stat update
           Object.entries(skill.effect.bonusStat).forEach(([key, val]) => {
              if (val) newStats[key as keyof Stats] += val;
           });
        }
        return {
           ...prev,
           stats: newStats,
           unlockedSkills: [...prev.unlockedSkills, skill.id],
           progression: { ...prev.progression, skillPoints: prev.progression.skillPoints - skill.cost }
        };
     });

     setMessages(prev => [...prev, {
        id: generateId(), sender: 'System', text: `🧠 ${getLogText(language, 'learn_skill', {skill: getLocName(skill, language)})}`, timestamp: new Date()
     }]);
  };

  // --- SURVIVAL ---
  const advanceTime = (currentEnv: EnvironmentState): EnvironmentState => {
    const timeCycle: TimeOfDay[] = ['DAWN', 'DAY', 'DUSK', 'NIGHT'];
    const currentIndex = timeCycle.indexOf(currentEnv.time);
    const nextIndex = (currentIndex + 1) % timeCycle.length;
    return { ...currentEnv, time: timeCycle[nextIndex] };
  };

  const processSurvivalTurn = (
    currentChar: Character, 
    currentEnv: EnvironmentState, 
    currentWorldState: WorldState
  ): { updatedChar: Character, sysMessages: Message[] } => {
    
    if (currentWorldState === 'BONFIRE') {
      return { updatedChar: currentChar, sysMessages: [] };
    }

    const survival = { ...currentChar.survival };
    const sysMessages: Message[] = [];
    let hpDamage = 0;

    const hasIronStomach = currentChar.unlockedSkills.includes('iron_stomach');
    const hungerDecay = hasIronStomach ? Math.max(1, SURVIVAL_CONSTANTS.BASE_HUNGER_DECAY - 1) : SURVIVAL_CONSTANTS.BASE_HUNGER_DECAY;

    survival.hunger = Math.max(0, survival.hunger - hungerDecay);
    survival.thirst = Math.max(0, survival.thirst - SURVIVAL_CONSTANTS.BASE_THIRST_DECAY);
    survival.fatigue = Math.max(0, survival.fatigue - SURVIVAL_CONSTANTS.BASE_FATIGUE_DECAY);
    
    if (currentEnv.weather === 'CLEAR' && currentEnv.time === 'DAY') {
      survival.warmth = Math.min(100, survival.warmth + 2);
    } else {
       let warmthDecay = 0;
       if (currentEnv.time === 'NIGHT') warmthDecay += 1;
       if (currentEnv.weather === 'SNOW' || currentEnv.weather === 'STORM') warmthDecay += 3;
       if (currentEnv.weather === 'RAIN' || currentEnv.weather === 'ASHFALL') warmthDecay += 1;
       survival.warmth = Math.max(0, survival.warmth - warmthDecay);
    }

    if (survival.hunger <= 0) {
       hpDamage += SURVIVAL_CONSTANTS.HP_PENALTY;
       if (Math.random() > 0.7) sysMessages.push({ id: generateId(), sender: 'System', text: `🍖 ${getLogText(language, 'starving')}`, timestamp: new Date() });
    }
    if (survival.thirst <= 0) {
       hpDamage += SURVIVAL_CONSTANTS.HP_PENALTY;
       if (Math.random() > 0.7) sysMessages.push({ id: generateId(), sender: 'System', text: `💧 ${getLogText(language, 'dehydrated')}`, timestamp: new Date() });
    }
    if (survival.warmth <= 0) {
       hpDamage += SURVIVAL_CONSTANTS.WARMTH_PENALTY;
       sysMessages.push({ id: generateId(), sender: 'System', text: `❄️ ${getLogText(language, 'freezing')}`, timestamp: new Date() });
    }

    const updatedChar = { ...currentChar, survival, hp: Math.max(0, currentChar.hp - hpDamage) };
    return { updatedChar, sysMessages };
  };

  // --- ITEM LOGIC ---
  const handleUseItem = (item: Item) => {
    if (item.type !== 'CONSUMABLE') return;
    let hpHealed = item.effect?.hpRestore || 0;
    let willHealed = item.effect?.willRestore || 0;
    let hungerHealed = item.effect?.hungerRestore || 0;
    let thirstHealed = item.effect?.thirstRestore || 0;
    let warmthHealed = item.effect?.warmthRestore || 0;

    const itemName = getLocName(item, language);

    if (activeModal === 'COMBAT') {
       setCharacter(prev => {
          const updatedInventory = prev.inventory.map(i => {
             if (i.id === item.id) return { ...i, quantity: i.quantity - 1 };
             return i;
          }).filter(i => i.quantity > 0);
          return { ...prev, hp: Math.min(prev.maxHp, prev.hp + hpHealed), inventory: updatedInventory };
       });
       setCombatLog(prev => [...prev, getLogText(language, 'use_item', { item: itemName })]);
       setCombatPhase('ENEMY_TURN');
       setTimeout(handleEnemyTurn, 1000);
       return;
    }

    setCharacter(prev => {
       const updatedInventory = prev.inventory.map(i => {
          if (i.id === item.id) return { ...i, quantity: i.quantity - 1 };
          return i;
       }).filter(i => i.quantity > 0);

       return {
          ...prev,
          hp: Math.min(prev.maxHp, prev.hp + hpHealed),
          will: Math.min(prev.maxWill, prev.will + willHealed),
          survival: {
             hunger: Math.min(100, prev.survival.hunger + hungerHealed),
             thirst: Math.min(100, prev.survival.thirst + thirstHealed),
             warmth: Math.min(100, prev.survival.warmth + warmthHealed),
             fatigue: prev.survival.fatigue
          },
          inventory: updatedInventory
       };
    });

    setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: getLogText(language, 'use_item', { item: itemName }), timestamp: new Date() }]);
  };

  const handleEquipItem = (item: Item) => {
    if (!item.equipProps) return;
    const slot = item.equipProps.slot;
    setCharacter(prev => {
      const newEquipment = { ...prev.equipment };
      let newInventory = prev.inventory.filter(i => i.id !== item.id);
      if (newEquipment[slot]) newInventory.push(newEquipment[slot]!);
      newEquipment[slot] = item;
      return { ...prev, equipment: newEquipment, inventory: newInventory };
    });
    setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `⚔️ ${getLogText(language, 'equip_item', {item: getLocName(item, language)})}`, timestamp: new Date() }]);
  };

  const handleUnequipItem = (slot: EquipSlot) => {
    setCharacter(prev => {
      const itemToUnequip = prev.equipment[slot];
      if (!itemToUnequip) return prev;
      const newEquipment = { ...prev.equipment };
      newEquipment[slot] = null;
      return { ...prev, equipment: newEquipment, inventory: [...prev.inventory, itemToUnequip] };
    });
    setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `🛡️ ${getLogText(language, 'unequip_item', {item: slot})}`, timestamp: new Date() }]);
  };

  const handleDropItem = (item: Item) => {
     if (window.confirm(`Discard ${getLocName(item, language)}?`)) {
        setCharacter(prev => ({ ...prev, inventory: prev.inventory.filter(i => i.id !== item.id) }));
        setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `🗑️ ${getLogText(language, 'drop_item', {item: getLocName(item, language)})}`, timestamp: new Date() }]);
     }
  };

  const handleUpgradeItem = (item: Item, materialId: string) => {
    const cost = GET_UPGRADE_COST(item.type, item.upgradeLevel || 0);
    if (!cost) return;
    const roll = Math.random();
    const success = roll <= cost.successRate;
    const itemName = getLocName(item, language);

    setCharacter(prev => {
       const char = { ...prev };
       const matIndex = char.inventory.findIndex(i => i.id === materialId);
       if (matIndex > -1) {
          char.inventory[matIndex].quantity -= cost.count;
          if (char.inventory[matIndex].quantity <= 0) char.inventory.splice(matIndex, 1);
       }
       char.gold -= cost.goldCost;

       if (success) {
          let targetItem: Item | null = null;
          let slot: EquipSlot | null = null;
          if (item.equipProps) {
             slot = item.equipProps.slot;
             if (char.equipment[slot]?.id === item.id) {
                targetItem = char.equipment[slot];
             }
          }
          if (!targetItem) targetItem = char.inventory.find(i => i.id === item.id) || null;

          if (targetItem && targetItem.equipProps) {
             targetItem.upgradeLevel = (targetItem.upgradeLevel || 0) + 1;
             if (cost.statGrowth && targetItem.equipProps.modifiers) {
                Object.entries(cost.statGrowth).forEach(([k, v]) => {
                   targetItem!.equipProps!.modifiers![k as keyof Stats] = (targetItem!.equipProps!.modifiers![k as keyof Stats] || 0) + (v || 0);
                });
             }
             if (targetItem === char.equipment[slot!]) char.equipment[slot!] = { ...targetItem };
             else {
               const idx = char.inventory.findIndex(i => i.id === targetItem!.id);
               if(idx > -1) char.inventory[idx] = { ...targetItem };
             }
          }
          setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `🔥 ${getLogText(language, 'craft_success', {item: itemName})}`, timestamp: new Date() }]);
       } else {
          setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `💥 ${getLogText(language, 'craft_fail')}`, timestamp: new Date() }]);
       }
       return char;
    });
  };

  // --- TRAVEL & PARTY ---
  const handleTravel = async (nodeId: string) => {
    const targetNode = WORLD_MAP.find(n => n.id === nodeId);
    if (!targetNode) return;
    setActiveModal('NONE');
    const locName = getLocName(targetNode, language);

    setCharacter(prev => ({
       ...prev,
       currentLocationId: targetNode.id,
       survival: {
          ...prev.survival,
          hunger: Math.max(0, prev.survival.hunger - 10),
          thirst: Math.max(0, prev.survival.thirst - 15),
          fatigue: Math.max(0, prev.survival.fatigue - 10)
       }
    }));

    setEnv(prev => ({
       ...prev,
       locationName: locName,
       time: prev.time === 'DAWN' ? 'DAY' : prev.time === 'DAY' ? 'DUSK' : prev.time === 'DUSK' ? 'NIGHT' : 'DAWN',
       turnCount: prev.turnCount + 10
    }));

    setMessages(prev => [...prev, {
       id: generateId(), sender: 'System', 
       text: `🚶 ${getLogText(language, 'travel', {loc: locName, h: 10, t: 15})}`, 
       timestamp: new Date()
    }]);

    if (targetNode.type === 'DANGER' || targetNode.type === 'DUNGEON') {
       if (Math.random() < 0.3) {
          const enemyKeys = Object.keys(ENEMIES);
          const randomEnemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
          setTimeout(() => startCombat(ENEMIES[randomEnemyKey]), 500);
          return;
       }
    }

    await handleSendMessage(language === 'EN' ? `I have arrived at ${locName}. What do I see?` : `Aku telah sampai di ${locName}. Apa yang kulihat?`);
  };

  const handleNpcInteraction = async (companion: Companion) => {
     setActiveModal('NONE');
     await handleSendMessage(`(Talk to ${companion.name}): "What are your thoughts on this place?"`);
  };

  const handleDismissNpc = (companion: Companion) => {
     if (window.confirm(`Part ways with ${companion.name}?`)) {
        setCharacter(prev => ({ ...prev, party: prev.party.filter(c => c.id !== companion.id) }));
        setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `👋 ${getLogText(language, 'npc_left', {name: companion.name})}`, timestamp: new Date() }]);
     }
  };

  const applyAIUpdates = (data: AIResponse) => {
     if (data.world_state) setWorldState(data.world_state);

     setCharacter(prev => {
        let next = { ...prev };
        let msgs: Message[] = [];

        if (data.hp_change) next.hp = Math.min(next.maxHp, Math.max(0, next.hp + data.hp_change));
        if (data.will_change) next.will = Math.min(next.maxWill, Math.max(0, next.will + data.will_change));
        
        if (data.xp_reward) {
           const { updatedChar, sysMessages } = handleGainXp(data.xp_reward, next);
           next = updatedChar;
           msgs = sysMessages;
        }

        if (data.new_inventory) {
           const target = data.new_inventory;
           let item = Object.values(MATERIALS).find(m => m.id === target) as unknown as Item | undefined;
           if (!item) item = STARTING_ITEMS.find(i => i.id === target);
           if (!item) item = SHOP_INVENTORY.find(i => i.id === target);
           
           if (item) {
              const idx = next.inventory.findIndex(i => i.id === item!.id);
              if (idx >= 0) next.inventory[idx].quantity++;
              else next.inventory.push({ ...item!, quantity: 1 });
              
              msgs.push({
                 id: generateId(), sender: 'System', 
                 text: `🎒 Received: ${getLocName(item, language)}`, 
                 timestamp: new Date()
              });
           }
        }
        
        if (data.new_companion) {
           const comp = AVAILABLE_COMPANIONS[data.new_companion];
           if (comp && !next.party.some(c => c.id === comp.id)) {
              next.party.push(comp);
              msgs.push({
                 id: generateId(), sender: 'System', 
                 text: `👥 ${comp.name} joined.`, 
                 timestamp: new Date()
              });
           }
        }

        if (msgs.length > 0) {
           setMessages(m => [...m, ...msgs]);
        }
        return next;
     });

     if (data.dice_request) {
        setMessages(prev => [...prev, {
            id: generateId(), sender: 'System', 
            text: `🎲 ${data.dice_request}`, 
            timestamp: new Date()
        }]);
     }
  };

  const handleCharacterCreate = async (newCharacter: Character) => {
    setCharacter(newCharacter);
    setGameStarted(true);
    setIsProcessing(true); 
    try {
      const data = await generateIntro(newCharacter, language);
      const dmMsg: Message = { id: generateId(), sender: 'DM', text: data.narrative, timestamp: new Date(), mood: data.world_state || 'BONFIRE' };
      setMessages([dmMsg]);
      applyAIUpdates(data);
    } catch (error) {
       console.error("Init Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const playerMsg: Message = { id: generateId(), sender: 'Player', text: text, timestamp: new Date(), mood: worldState };
    let updatedMessages = [...messages, playerMsg];
    setMessages(updatedMessages);
    setIsProcessing(true);

    let currentTurnEnv = { ...env, turnCount: env.turnCount + 1 };
    if (currentTurnEnv.turnCount % 5 === 0) {
      currentTurnEnv = advanceTime(currentTurnEnv);
      updatedMessages.push({ id: generateId(), sender: 'System', text: `⏳ Time: ${currentTurnEnv.time}.`, timestamp: new Date() });
    }
    setEnv(currentTurnEnv);

    const { updatedChar, sysMessages } = processSurvivalTurn(character, currentTurnEnv, worldState);
    setCharacter(updatedChar);
    if (sysMessages.length > 0) {
       updatedMessages = [...updatedMessages, ...sysMessages];
       setMessages(updatedMessages);
    }

    try {
      const data = await generateDMResponse(text, updatedMessages, updatedChar, worldState, language);
      applyAIUpdates(data);
      setMessages(prev => [...prev, { id: generateId(), sender: 'DM', text: data.narrative, timestamp: new Date(), mood: data.world_state || worldState }]);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDiceRoll = useCallback(() => {
    const result = rollDie(20);
    setDiceResult(result);
    setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `🎲 Rolled ${result}.`, timestamp: new Date() }]);
  }, [character.name]);

  if (!gameStarted) {
    return <CharacterCreation onCreate={handleCharacterCreate} language={language} />;
  }

  return (
    <div className={`flex flex-col h-screen max-h-screen text-stone-200 transition-colors duration-1000 ease-in-out ${getWorldStyles()}`}>
      
      <ModalManager 
        activeModal={activeModal} 
        onClose={() => setActiveModal('NONE')} 
        character={character}
        language={language}
        onUseItem={handleUseItem}
        onDropItem={handleDropItem}
        onLearnSkill={handleLearnSkill}
        onTravel={handleTravel}
        onTalkNpc={handleNpcInteraction}
        onDismissNpc={handleDismissNpc}
        {...{onEquip: handleEquipItem, onUnequip: handleUnequipItem, onUpgrade: handleUpgradeItem}}
        
        combatState={{ enemy: activeEnemy, log: combatLog, phase: combatPhase }}
        onCombatAction={{
           attack: handlePlayerAttack,
           skill: handlePlayerSkill,
           flee: handleFlee,
           victory: handleVictory,
           defeat: handleDefeat
        }}

        shopProps={{
           inventory: SHOP_INVENTORY,
           onBuy: handleBuyItem,
           onSell: handleSellItem
        }}
      />

      {/* Overlays */}
      {worldState === 'ECLIPSE' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(100,0,0,0.2)_100%)] pointer-events-none z-0"></div>}
      {worldState === 'BONFIRE' && <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-orange-600/10 to-transparent pointer-events-none z-0 animate-pulse"></div>}

      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur border-b border-slate-800 z-10">
         <div className="flex items-center gap-2 text-amber-600">
            <Sword className="w-5 h-5" />
            <h1 className="font-bold font-cinzel text-lg">Brand of Sacrifice</h1>
         </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden z-10">
        <section className="flex-1 flex flex-col md:w-[70%] border-r border-slate-800 relative">
           <EnvironmentWidget env={env} />
          <GameLog messages={messages} />
          <GameDock 
            activeModal={activeModal} 
            setActiveModal={setActiveModal} 
            language={language}
            onResetGame={handleResetGame}
            isShopAvailable={isShopAvailable()}
            onToggleLanguage={toggleLanguage}
          />
          <InputArea onSendMessage={handleSendMessage} disabled={isProcessing} language={language} />
        </section>
        <aside className="hidden md:flex flex-col h-full md:w-[30%] border-slate-800 z-20">
          <CharacterSheet character={character} diceResult={diceResult} onDiceRoll={handleDiceRoll} worldState={worldState} language={language} />
        </aside>
      </main>
    </div>
  );
};

export default App;