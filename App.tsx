
import React, { useState, useCallback, useEffect } from 'react';
import { Message, Character, AIResponse, WorldState, ModalType, Item, EnvironmentState, TimeOfDay, Companion, EquipSlot, Stats, Enemy, CombatPhase, Language } from './types';
import { INITIAL_CHARACTER, SURVIVAL_CONSTANTS, XP_FORMULA, SKILL_TREE, WORLD_MAP, AVAILABLE_COMPANIONS, GET_UPGRADE_COST, ENEMIES, MATERIALS, STARTING_ITEMS, SHOP_INVENTORY } from './constants';
import { rollDie, generateId, calculateTotalStats } from './utils/gameUtils';
import { generateDMResponse, generateIntro } from './utils/gemini';
import GameLog from './components/GameLog';
import InputArea from './components/InputArea';
import CharacterSheet from './components/CharacterSheet';
import CharacterCreation from './components/CharacterCreation';
import GameDock from './components/GameDock';
import ModalManager from './components/ModalManager';
import EnvironmentWidget from './components/EnvironmentWidget';
import { Sword } from 'lucide-react';

const STORAGE_KEY = 'ai_realm_save_v1';

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
    locationName: 'Api Unggun Permulaan',
    turnCount: 0
  });

  // Combat State
  const [activeEnemy, setActiveEnemy] = useState<Enemy | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [combatPhase, setCombatPhase] = useState<CombatPhase>('PLAYER_TURN');

  // Load from Storage on Mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.character && parsed.messages) {
          // Backward compatibility check for equipment
          const char = parsed.character;
          if (!char.equipment) {
             char.equipment = INITIAL_CHARACTER.equipment;
          }

          setCharacter(char);
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

     setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `💰 Membeli ${item.name} seharga ${item.price}G.`, timestamp: new Date() }]);
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

     setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `🪙 Menjual ${item.name} seharga ${sellPrice}G.`, timestamp: new Date() }]);
  };

  // --- COMBAT LOGIC ---

  const startCombat = (enemyTemplate: Enemy) => {
     setActiveEnemy({ ...enemyTemplate });
     setCombatLog([`${enemyTemplate.name} liar muncul!`]);
     setCombatPhase('PLAYER_TURN');
     setActiveModal('COMBAT');
  };

  const handlePlayerAttack = () => {
     if (!activeEnemy) return;
     const totalStats = calculateTotalStats(character);
     
     // 1. Hit Chance: (70 + (DEX diff * 2))
     const hitChance = Math.min(95, Math.max(30, 70 + ((totalStats.DEX - activeEnemy.stats.DEX) * 2)));
     const roll = Math.random() * 100;

     if (roll <= hitChance) {
        // 2. Damage Calc: Total STR + Weapon Upgrade Bonus + Random(1-4)
        let baseDmg = totalStats.STR;
        // Check weapon upgrade
        const weapon = character.equipment.MAIN_HAND;
        if (weapon && weapon.upgradeLevel) {
           baseDmg += (weapon.upgradeLevel * 2);
        }
        const damage = Math.floor(baseDmg + (Math.random() * 4));
        
        setActiveEnemy(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - damage) } : null);
        setCombatLog(prev => [...prev, `Kamu menyerang ${activeEnemy.name} sebesar ${damage} damage!`]);

        // Check Victory
        if ((activeEnemy.hp - damage) <= 0) {
           setCombatPhase('VICTORY');
           setCombatLog(prev => [...prev, `KEMENANGAN! ${activeEnemy.name} telah dikalahkan.`]);
        } else {
           setCombatPhase('ENEMY_TURN');
           setTimeout(handleEnemyTurn, 1000);
        }
     } else {
        setCombatLog(prev => [...prev, `Seranganmu meleset!`]);
        setCombatPhase('ENEMY_TURN');
        setTimeout(handleEnemyTurn, 1000);
     }
  };

  const handleEnemyTurn = () => {
     if (!activeEnemy || activeEnemy.hp <= 0) return; // Safety check

     // Pick random attack
     const attack = activeEnemy.attacks[Math.floor(Math.random() * activeEnemy.attacks.length)];
     
     // Calc Damage to Player
     // Player Defense = CON/2 + Armor Modifiers
     const totalStats = calculateTotalStats(character);
     const defense = Math.floor(totalStats.CON / 2) + (character.equipment.BODY?.equipProps?.modifiers?.CON || 0); // Simplified armor calculation
     
     const rawDamage = attack.damage;
     const finalDamage = Math.max(1, rawDamage - Math.floor(defense / 2)); // Defense mitigates half efficiently

     setCharacter(prev => ({ ...prev, hp: Math.max(0, prev.hp - finalDamage) }));
     setCombatLog(prev => [...prev, `${activeEnemy.name} ${attack.text} (${finalDamage} DMG)`]);

     if ((character.hp - finalDamage) <= 0) {
        setCombatPhase('DEFEAT');
        setCombatLog(prev => [...prev, `KEKALAHAN... kegelapan melahapmu.`]);
     } else {
        setCombatPhase('PLAYER_TURN');
     }
  };

  const handlePlayerSkill = (skillName: string) => {
     // Placeholder for future skill logic integration
     setCombatLog(prev => [...prev, `Kamu memusatkan energi... (Skill WIP)`]);
     setCombatPhase('ENEMY_TURN');
     setTimeout(handleEnemyTurn, 1000);
  };

  const handleFlee = () => {
     if (!activeEnemy) return;
     const totalStats = calculateTotalStats(character);
     const chance = 50 + ((totalStats.DEX - activeEnemy.stats.DEX) * 5);
     
     if (Math.random() * 100 < chance) {
        setCombatLog(prev => [...prev, `Kamu berhasil kabur!`]);
        setTimeout(() => {
           setActiveModal('NONE');
           setActiveEnemy(null);
        }, 1000);
     } else {
        setCombatLog(prev => [...prev, `Gagal melarikan diri!`]);
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

     // Gain XP
     const { updatedChar, sysMessages } = handleGainXp(xp, character);
     
     // Gain Loot
     let newInventory = [...updatedChar.inventory];
     let lootName = '';
     if (loot) {
        // Find item definition from STARTING_ITEMS or MATERIALS logic (Simplified: looking up material by ID or fallback generic)
        // In a real app, use a comprehensive ITEM_DATABASE.
        // For now, check MATERIALS then STARTING_ITEMS
        let itemDef = Object.values(MATERIALS).find(m => m.id === loot) as unknown as Item;
        if (!itemDef) itemDef = STARTING_ITEMS.find(i => i.id === loot);

        if (itemDef) {
           lootName = itemDef.name;
           const existingItem = newInventory.find(i => i.id === loot);
           if (existingItem) {
              existingItem.quantity += 1;
           } else {
              newInventory.push({ ...itemDef, quantity: 1, type: itemDef.type || 'MATERIAL' }); // Ensure type exists if pulling from simple material obj
           }
        }
     }

     setCharacter({ ...updatedChar, inventory: newInventory });
     setActiveModal('NONE');
     setActiveEnemy(null);

     // Log to Main Chat
     const victoryMsg = `⚔️ Mengalahkan ${activeEnemy.name}. Mendapatkan ${xp} XP${lootName ? ` dan menemukan ${lootName}` : ''}.`;
     setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: victoryMsg, timestamp: new Date() }, ...sysMessages]);

     // Trigger AI Narration of Victory
     await handleSendMessage(`[SYSTEM]: Aku telah mengalahkan ${activeEnemy.name}. Deskripsikan serangan terakhir yang mematikan.`);
  };

  const handleDefeat = () => {
     // Respawn Penalty
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
        text: `💀 KAMU MATI. Dibangkitkan kembali di Api Unggun. Emas hilang sebagian.`, 
        timestamp: new Date() 
     }]);
  };


  // --- GAME LOGIC ---

  const handleResetGame = () => {
    if (window.confirm("Apakah kamu yakin? Ini akan menghapus karakter dan ceritamu saat ini.")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const getWorldStyles = () => {
    switch(worldState) {
      case 'BONFIRE':
        return 'bg-gradient-to-t from-orange-950 via-slate-900 to-slate-950'; 
      case 'ASTRAL':
        return 'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-black'; 
      case 'ECLIPSE':
        return 'bg-red-950 animate-pulse-slow';
      case 'PHYSICAL':
      default:
        return 'bg-slate-950';
    }
  };

  // --- PROGRESSION ---
  const handleGainXp = (amount: number, currentCharacter: Character): { updatedChar: Character, sysMessages: Message[] } => {
     let char = { ...currentCharacter };
     const sysMessages: Message[] = [];
     
     if (amount <= 0) return { updatedChar: char, sysMessages };

     char.progression.currentXp += amount;
     sysMessages.push({
        id: generateId(), sender: 'System', text: `✨ Mendapatkan ${amount} XP.`, timestamp: new Date()
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
           id: generateId(), sender: 'System', text: `🔥 NAIK LEVEL! Kamu sekarang Level ${char.level}. (+1 SP, +2 Stats, Pulih Total)`, timestamp: new Date()
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
           if (skill.effect.bonusStat.STR) newStats.STR += skill.effect.bonusStat.STR;
           if (skill.effect.bonusStat.DEX) newStats.DEX += skill.effect.bonusStat.DEX;
           if (skill.effect.bonusStat.INT) newStats.INT += skill.effect.bonusStat.INT;
           if (skill.effect.bonusStat.CHA) newStats.CHA += skill.effect.bonusStat.CHA;
        }

        return {
           ...prev,
           stats: newStats,
           unlockedSkills: [...prev.unlockedSkills, skill.id],
           progression: {
              ...prev.progression,
              skillPoints: prev.progression.skillPoints - skill.cost
           }
        };
     });

     setMessages(prev => [...prev, {
        id: generateId(), sender: 'System', text: `🧠 Mempelajari Skill: ${skill.name}`, timestamp: new Date()
     }]);
  };

  // --- SURVIVAL & ENV ---
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
    const hungerDecay = hasIronStomach 
        ? Math.max(1, SURVIVAL_CONSTANTS.BASE_HUNGER_DECAY - 1) 
        : SURVIVAL_CONSTANTS.BASE_HUNGER_DECAY;

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
       if (Math.random() > 0.7) sysMessages.push({ id: generateId(), sender: 'System', text: "🍖 Kelaparan...", timestamp: new Date() });
    }
    if (survival.thirst <= 0) {
       hpDamage += SURVIVAL_CONSTANTS.HP_PENALTY;
       if (Math.random() > 0.7) sysMessages.push({ id: generateId(), sender: 'System', text: "💧 Kehausan...", timestamp: new Date() });
    }
    if (survival.warmth <= 0) {
       hpDamage += SURVIVAL_CONSTANTS.WARMTH_PENALTY;
       sysMessages.push({ id: generateId(), sender: 'System', text: "❄️ Membeku...", timestamp: new Date() });
    }

    const updatedChar = {
       ...currentChar,
       survival,
       hp: Math.max(0, currentChar.hp - hpDamage)
    };

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

    // Combat: Heal during combat
    if (activeModal === 'COMBAT') {
       setCharacter(prev => {
          const updatedInventory = prev.inventory.map(i => {
             if (i.id === item.id) return { ...i, quantity: i.quantity - 1 };
             return i;
          }).filter(i => i.quantity > 0);

          return {
             ...prev,
             hp: Math.min(prev.maxHp, prev.hp + hpHealed),
             inventory: updatedInventory
          };
       });
       setCombatLog(prev => [...prev, `Menggunakan ${item.name}. Memulihkan HP.`]);
       setCombatPhase('ENEMY_TURN');
       setTimeout(handleEnemyTurn, 1000);
       return;
    }

    // Normal Usage
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

    const sysMsg: Message = {
       id: generateId(),
       sender: 'System',
       text: `Menggunakan ${item.name}.`,
       timestamp: new Date()
    };
    setMessages(prev => [...prev, sysMsg]);
  };

  const handleEquipItem = (item: Item) => {
    if (!item.equipProps) return;
    const slot = item.equipProps.slot;

    setCharacter(prev => {
      const newEquipment = { ...prev.equipment };
      let newInventory = prev.inventory.filter(i => i.id !== item.id); // Remove equipped item

      // If slot is occupied, move old item to inventory
      if (newEquipment[slot]) {
        newInventory.push(newEquipment[slot]!);
      }

      newEquipment[slot] = item;

      return {
        ...prev,
        equipment: newEquipment,
        inventory: newInventory
      };
    });

    setMessages(prev => [...prev, { 
      id: generateId(), sender: 'System', text: `⚔️ Memasang ${item.name}.`, timestamp: new Date() 
    }]);
  };

  const handleUnequipItem = (slot: EquipSlot) => {
    setCharacter(prev => {
      const itemToUnequip = prev.equipment[slot];
      if (!itemToUnequip) return prev;

      const newEquipment = { ...prev.equipment };
      newEquipment[slot] = null;
      
      return {
        ...prev,
        equipment: newEquipment,
        inventory: [...prev.inventory, itemToUnequip]
      };
    });

    setMessages(prev => [...prev, { 
       id: generateId(), sender: 'System', text: `🛡️ Melepas item dari ${slot}.`, timestamp: new Date() 
    }]);
  };

  const handleDropItem = (item: Item) => {
     if (window.confirm(`Buang ${item.name}?`)) {
        setCharacter(prev => ({ ...prev, inventory: prev.inventory.filter(i => i.id !== item.id) }));
        setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `🗑️ Membuang ${item.name}.`, timestamp: new Date() }]);
     }
  };

  const handleUpgradeItem = (item: Item, materialId: string) => {
    const cost = GET_UPGRADE_COST(item.type, item.upgradeLevel || 0);
    if (!cost) return;

    // Check Chance
    const roll = Math.random();
    const success = roll <= cost.successRate;

    setCharacter(prev => {
       const char = { ...prev };
       
       // Deduct Material
       const matIndex = char.inventory.findIndex(i => i.id === materialId);
       if (matIndex > -1) {
          char.inventory[matIndex].quantity -= cost.count;
          if (char.inventory[matIndex].quantity <= 0) {
             char.inventory.splice(matIndex, 1);
          }
       }
       
       // Deduct Gold
       char.gold -= cost.goldCost;

       if (success) {
          // Identify where the item is (Inventory or Equipment)
          let targetItem: Item | null = null;
          let isEquipped = false;
          let slot: EquipSlot | null = null;

          // Check Equipment
          if (item.equipProps) {
             slot = item.equipProps.slot;
             if (char.equipment[slot]?.id === item.id) {
                targetItem = char.equipment[slot];
                isEquipped = true;
             }
          }

          // Check Inventory if not found equipped
          if (!targetItem) {
             targetItem = char.inventory.find(i => i.id === item.id) || null;
          }

          if (targetItem && targetItem.equipProps) {
             targetItem.upgradeLevel = (targetItem.upgradeLevel || 0) + 1;
             targetItem.name = `${targetItem.name.replace(/\s\+\d+$/, '')} +${targetItem.upgradeLevel}`; // Update Name (Regex cleans old +X)
             
             // Update Stats
             const growth = cost.statGrowth;
             if (growth && targetItem.equipProps.modifiers) {
                if (growth.STR) targetItem.equipProps.modifiers.STR = (targetItem.equipProps.modifiers.STR || 0) + growth.STR;
                if (growth.DEX) targetItem.equipProps.modifiers.DEX = (targetItem.equipProps.modifiers.DEX || 0) + growth.DEX;
                if (growth.CON) targetItem.equipProps.modifiers.CON = (targetItem.equipProps.modifiers.CON || 0) + growth.CON;
                if (growth.INT) targetItem.equipProps.modifiers.INT = (targetItem.equipProps.modifiers.INT || 0) + growth.INT;
                if (growth.CHA) targetItem.equipProps.modifiers.CHA = (targetItem.equipProps.modifiers.CHA || 0) + growth.CHA;
                if (growth.FATE) targetItem.equipProps.modifiers.FATE = (targetItem.equipProps.modifiers.FATE || 0) + growth.FATE;
             }

             // If equipped, ensure state updates correctly by re-assigning
             if (isEquipped && slot) {
                char.equipment[slot] = { ...targetItem };
             } else {
               // If in inventory, force array update
               const idx = char.inventory.findIndex(i => i.id === targetItem!.id);
               if(idx > -1) char.inventory[idx] = { ...targetItem };
             }
          }

          setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `🔥 SUKSES! Menempa ${targetItem?.name}.`, timestamp: new Date() }]);
       } else {
          setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `💥 GAGAL! Logam hancur. Material hilang.`, timestamp: new Date() }]);
       }

       return char;
    });
  };

  // --- TRAVEL & PARTY ---
  const handleTravel = async (nodeId: string) => {
    const targetNode = WORLD_MAP.find(n => n.id === nodeId);
    if (!targetNode) return;
    setActiveModal('NONE');

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
       locationName: targetNode.name,
       time: prev.time === 'DAWN' ? 'DAY' : prev.time === 'DAY' ? 'DUSK' : prev.time === 'DUSK' ? 'NIGHT' : 'DAWN',
       turnCount: prev.turnCount + 10
    }));

    setMessages(prev => [...prev, {
       id: generateId(), sender: 'System', 
       text: `🚶 Perjalanan ke ${targetNode.name}.`, 
       timestamp: new Date()
    }]);

    // CHECK COMBAT TRIGGER
    if (targetNode.type === 'DANGER' || targetNode.type === 'DUNGEON') {
       if (Math.random() < 0.3) {
          const enemyKeys = Object.keys(ENEMIES);
          const randomEnemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
          // Slight delay to let the travel message appear
          setTimeout(() => {
             startCombat(ENEMIES[randomEnemyKey]);
          }, 500);
          return; // Stop here, combat handles logic
       }
    }

    await handleSendMessage(`Aku telah sampai di ${targetNode.name}. Apa yang kulihat?`);
  };

  const handleNpcInteraction = async (companion: Companion) => {
     setActiveModal('NONE');
     await handleSendMessage(`(Bicara dengan ${companion.name}): "Apa pendapatmu tentang tempat ini?"`);
  };

  const handleDismissNpc = (companion: Companion) => {
     if (window.confirm(`Berpisah dengan ${companion.name}?`)) {
        setCharacter(prev => ({ ...prev, party: prev.party.filter(c => c.id !== companion.id) }));
        setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `👋 ${companion.name} pergi.`, timestamp: new Date() }]);
     }
  };

  // --- AI HANDLER ---
  const applyAIUpdates = (data: AIResponse) => {
      if (data.world_state) setWorldState(data.world_state);

      let currentChar = character;
      if (data.xp_reward && data.xp_reward > 0) {
          const { updatedChar, sysMessages } = handleGainXp(data.xp_reward, character);
          currentChar = updatedChar;
          setCharacter(currentChar);
          setMessages(prev => [...prev, ...sysMessages]);
      }

      if (data.hp_change !== 0 || data.will_change !== 0 || data.new_inventory || data.new_companion) {
        setCharacter(prev => {
          let newHp = Math.max(0, Math.min(prev.maxHp, prev.hp + data.hp_change));
          let newWill = Math.max(0, Math.min(prev.maxWill, prev.will + data.will_change));
          const newInventory = [...prev.inventory];
          if (data.new_inventory) {
             newInventory.push({ id: generateId(), name: data.new_inventory, type: 'MATERIAL', description: 'Menemukan item.', icon: 'gem', quantity: 1, price: 50 });
          }
          const newParty = [...prev.party];
          if (data.new_companion && AVAILABLE_COMPANIONS[data.new_companion] && !newParty.find(c => c.id === data.new_companion)) {
             newParty.push(AVAILABLE_COMPANIONS[data.new_companion]);
          }
          return { ...prev, hp: newHp, will: newWill, inventory: newInventory, party: newParty };
        });
      }

      // Logs
      if (data.hp_change !== 0 || data.will_change !== 0) {
         setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `⚠️ Status Diperbarui.`, timestamp: new Date() }]);
      }
      if (data.new_companion) {
         const comp = AVAILABLE_COMPANIONS[data.new_companion];
         if(comp) setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `👥 Bergabung: ${comp.name}`, timestamp: new Date() }]);
      }
      if (data.dice_request) {
        setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `🎲 Roll untuk: ${data.dice_request}`, timestamp: new Date() }]);
      }
      if (data.new_inventory) {
         setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `🎒 Ditemukan: ${data.new_inventory}`, timestamp: new Date() }]);
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
      updatedMessages.push({ id: generateId(), sender: 'System', text: `⏳ Waktu: ${currentTurnEnv.time}.`, timestamp: new Date() });
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
    setMessages(prev => [...prev, { id: generateId(), sender: 'System', text: `🎲 Menggulung ${result}.`, timestamp: new Date() }]);
  }, [character.name]);

  if (!gameStarted) {
    return <CharacterCreation onCreate={handleCharacterCreate} />;
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
        // New Props for Equipment handled via ModalManager props (casted as any for now or needs updated Interface)
        {...{onEquip: handleEquipItem, onUnequip: handleUnequipItem, onUpgrade: handleUpgradeItem}}
        
        // Combat Props
        combatState={{ enemy: activeEnemy, log: combatLog, phase: combatPhase }}
        onCombatAction={{
           attack: handlePlayerAttack,
           skill: handlePlayerSkill,
           flee: handleFlee,
           victory: handleVictory,
           defeat: handleDefeat
        }}

        // Shop Props
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
