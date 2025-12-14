import React, { useState, useCallback } from 'react';
import { Message, Character, AIResponse, WorldState, ModalType, Item, EnvironmentState, TimeOfDay, Companion } from './types';
import { INITIAL_CHARACTER, SURVIVAL_CONSTANTS, XP_FORMULA, SKILL_TREE, WORLD_MAP, AVAILABLE_COMPANIONS } from './constants';
import { rollDie, generateId } from './utils/gameUtils';
import { generateDMResponse, generateIntro } from './utils/gemini';
import GameLog from './components/GameLog';
import InputArea from './components/InputArea';
import CharacterSheet from './components/CharacterSheet';
import CharacterCreation from './components/CharacterCreation';
import GameDock from './components/GameDock';
import ModalManager from './components/ModalManager';
import EnvironmentWidget from './components/EnvironmentWidget';
import { Sword } from 'lucide-react';

const App: React.FC = () => {
  // Game Flow State
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game Data State
  const [messages, setMessages] = useState<Message[]>([]);
  const [character, setCharacter] = useState<Character>(INITIAL_CHARACTER);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [worldState, setWorldState] = useState<WorldState>('PHYSICAL');
  
  // Environment State
  const [env, setEnv] = useState<EnvironmentState>({
    time: 'DAWN',
    weather: 'FOG',
    locationName: 'Campfire of Beginnings',
    turnCount: 0
  });

  // UI State
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');

  // Helper to determine background styles based on world state
  const getWorldStyles = () => {
    switch(worldState) {
      case 'BONFIRE':
        return 'bg-gradient-to-t from-orange-950 via-slate-900 to-slate-950'; // Warm Twilight
      case 'ASTRAL':
        return 'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-black'; // Magic/Spirits
      case 'ECLIPSE':
        return 'bg-red-950 animate-pulse-slow'; // Hell on earth
      case 'PHYSICAL':
      default:
        return 'bg-slate-950'; // Standard dark grit
    }
  };

  // --- PROGRESSION LOGIC ---
  const handleGainXp = (amount: number, currentCharacter: Character): { updatedChar: Character, sysMessages: Message[] } => {
     let char = { ...currentCharacter };
     const sysMessages: Message[] = [];
     
     if (amount <= 0) return { updatedChar: char, sysMessages };

     char.progression.currentXp += amount;
     sysMessages.push({
        id: generateId(), sender: 'System', text: `✨ Gained ${amount} XP.`, timestamp: new Date()
     });

     // Check for Level Up
     while (char.progression.currentXp >= char.progression.maxXp) {
        char.progression.currentXp -= char.progression.maxXp;
        char.level += 1;
        char.progression.maxXp = XP_FORMULA(char.level);
        char.progression.statPoints += 2;
        char.progression.skillPoints += 1;
        
        // Stat scaling
        char.maxHp += 10;
        char.hp = char.maxHp; // Full heal on level up
        char.maxWill += 5;
        char.will = char.maxWill;

        sysMessages.push({
           id: generateId(), sender: 'System', text: `🔥 LEVEL UP! You are now Level ${char.level}. (+1 SP, +2 Stats, Full Heal)`, timestamp: new Date()
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
        id: generateId(), sender: 'System', text: `🧠 Learned Skill: ${skill.name}`, timestamp: new Date()
     }]);
  };


  // --- ENVIRONMENT LOGIC ---
  const advanceTime = (currentEnv: EnvironmentState): EnvironmentState => {
    const timeCycle: TimeOfDay[] = ['DAWN', 'DAY', 'DUSK', 'NIGHT'];
    const currentIndex = timeCycle.indexOf(currentEnv.time);
    const nextIndex = (currentIndex + 1) % timeCycle.length;
    
    return {
      ...currentEnv,
      time: timeCycle[nextIndex]
    };
  };

  // --- SURVIVAL LOGIC ---
  const processSurvivalTurn = (
    currentChar: Character, 
    currentEnv: EnvironmentState, 
    currentWorldState: WorldState
  ): { updatedChar: Character, sysMessages: Message[] } => {
    
    // Skip survival decay if resting at bonfire
    if (currentWorldState === 'BONFIRE') {
      return { updatedChar: currentChar, sysMessages: [] };
    }

    const survival = { ...currentChar.survival };
    const sysMessages: Message[] = [];
    let hpDamage = 0;

    // 0. Check Passive Skills
    const hasIronStomach = currentChar.unlockedSkills.includes('iron_stomach');

    // 1. Decay Rates
    const hungerDecay = hasIronStomach 
        ? Math.max(1, SURVIVAL_CONSTANTS.BASE_HUNGER_DECAY - 1) 
        : SURVIVAL_CONSTANTS.BASE_HUNGER_DECAY;

    survival.hunger = Math.max(0, survival.hunger - hungerDecay);
    survival.thirst = Math.max(0, survival.thirst - SURVIVAL_CONSTANTS.BASE_THIRST_DECAY);
    survival.fatigue = Math.max(0, survival.fatigue - SURVIVAL_CONSTANTS.BASE_FATIGUE_DECAY);
    
    // Warmth recovery in CLEAR day, decay otherwise
    if (currentEnv.weather === 'CLEAR' && currentEnv.time === 'DAY') {
      survival.warmth = Math.min(100, survival.warmth + 2);
    } else {
       // Nighttime or Bad Weather penalties
       let warmthDecay = 0;
       if (currentEnv.time === 'NIGHT') warmthDecay += 1;
       if (currentEnv.weather === 'SNOW' || currentEnv.weather === 'STORM') warmthDecay += 3;
       if (currentEnv.weather === 'RAIN' || currentEnv.weather === 'ASHFALL') warmthDecay += 1;
       
       survival.warmth = Math.max(0, survival.warmth - warmthDecay);
    }

    // 2. Consequences
    if (survival.hunger <= 0) {
       hpDamage += SURVIVAL_CONSTANTS.HP_PENALTY;
       if (Math.random() > 0.7) sysMessages.push({
          id: generateId(), sender: 'System', text: "🍖 You are starving. Your body consumes itself.", timestamp: new Date()
       });
    }

    if (survival.thirst <= 0) {
       hpDamage += SURVIVAL_CONSTANTS.HP_PENALTY;
       if (Math.random() > 0.7) sysMessages.push({
          id: generateId(), sender: 'System', text: "💧 Thirst claws at your throat.", timestamp: new Date()
       });
    }

    if (survival.warmth <= 0) {
       hpDamage += SURVIVAL_CONSTANTS.WARMTH_PENALTY;
       sysMessages.push({
          id: generateId(), sender: 'System', text: "❄️ You are freezing to death. The cold numbs your soul.", timestamp: new Date()
       });
    }

    if (survival.fatigue <= 0 && Math.random() > 0.9) {
       sysMessages.push({
          id: generateId(), sender: 'System', text: "💤 Exhaustion clouds your vision. You stumble.", timestamp: new Date()
       });
    }

    const updatedChar = {
       ...currentChar,
       survival,
       hp: Math.max(0, currentChar.hp - hpDamage)
    };

    return { updatedChar, sysMessages };
  };

  // --- ITEM MANAGEMENT LOGIC ---

  const handleUseItem = (item: Item) => {
    if (item.type !== 'CONSUMABLE') return;

    // 1. Apply Effects
    let hpHealed = 0;
    let willHealed = 0;
    let hungerHealed = 0;
    let thirstHealed = 0;
    let warmthHealed = 0;

    if (item.effect) {
      if (item.effect.hpRestore) hpHealed = item.effect.hpRestore;
      if (item.effect.willRestore) willHealed = item.effect.willRestore;
      if (item.effect.hungerRestore) hungerHealed = item.effect.hungerRestore;
      if (item.effect.thirstRestore) thirstHealed = item.effect.thirstRestore;
      if (item.effect.warmthRestore) warmthHealed = item.effect.warmthRestore;
    }

    // 2. Update Character State
    setCharacter(prev => {
       // Reduce Quantity
       const updatedInventory = prev.inventory.map(i => {
          if (i.id === item.id) {
             return { ...i, quantity: i.quantity - 1 };
          }
          return i;
       }).filter(i => i.quantity > 0); // Remove if 0

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

    // 3. Log System Message
    const effects = [];
    if(hpHealed) effects.push(`HP +${hpHealed}`);
    if(hungerHealed) effects.push(`Hunger -${hungerHealed}`);
    if(thirstHealed) effects.push(`Thirst -${thirstHealed}`);

    const sysMsg: Message = {
       id: generateId(),
       sender: 'System',
       text: `Used ${item.name}. (${effects.join(', ')})`,
       timestamp: new Date()
    };
    setMessages(prev => [...prev, sysMsg]);
  };

  const handleDropItem = (item: Item) => {
     if (window.confirm(`Discard ${item.name}? It will be lost forever.`)) {
        setCharacter(prev => ({
           ...prev,
           inventory: prev.inventory.filter(i => i.id !== item.id)
        }));
        
        const sysMsg: Message = {
           id: generateId(),
           sender: 'System',
           text: `🗑️ You discarded ${item.name}.`,
           timestamp: new Date()
        };
        setMessages(prev => [...prev, sysMsg]);
     }
  };

  // --- TRAVEL & PARTY LOGIC ---

  const handleTravel = async (nodeId: string) => {
    const targetNode = WORLD_MAP.find(n => n.id === nodeId);
    if (!targetNode) return;

    setActiveModal('NONE'); // Close map

    // 1. Pay Costs
    const hungerCost = 10;
    const thirstCost = 15;
    const fatigueCost = 10;
    
    // 2. Update Character
    setCharacter(prev => ({
       ...prev,
       currentLocationId: targetNode.id,
       survival: {
          ...prev.survival,
          hunger: Math.max(0, prev.survival.hunger - hungerCost),
          thirst: Math.max(0, prev.survival.thirst - thirstCost),
          fatigue: Math.max(0, prev.survival.fatigue - fatigueCost)
       }
    }));

    // 3. Update Env (Time passes)
    setEnv(prev => ({
       ...prev,
       locationName: targetNode.name,
       time: prev.time === 'DAWN' ? 'DAY' : prev.time === 'DAY' ? 'DUSK' : prev.time === 'DUSK' ? 'NIGHT' : 'DAWN', // Advance 1 slot approx
       turnCount: prev.turnCount + 10 // Big jump
    }));

    // 4. Log Movement
    const moveMsg: Message = {
       id: generateId(), sender: 'System', 
       text: `🚶 Traveled to ${targetNode.name}. (-${hungerCost} Hunger, -${thirstCost} Thirst, +4 Hours)`, 
       timestamp: new Date()
    };
    setMessages(prev => [...prev, moveMsg]);

    // 5. Trigger AI
    await handleSendMessage(`I have arrived at ${targetNode.name}. What do I see?`);
  };

  const handleNpcInteraction = async (companion: Companion) => {
     setActiveModal('NONE');
     await handleSendMessage(`(Talking to ${companion.name}): "What are your thoughts on this place?"`);
  };

  const handleDismissNpc = (companion: Companion) => {
     if (window.confirm(`Part ways with ${companion.name}?`)) {
        setCharacter(prev => ({
           ...prev,
           party: prev.party.filter(c => c.id !== companion.id)
        }));
        setMessages(prev => [...prev, {
           id: generateId(), sender: 'System', text: `👋 ${companion.name} has left the party.`, timestamp: new Date()
        }]);
     }
  };

  // Helper to handle state updates from AI Response
  const applyAIUpdates = (data: AIResponse) => {
      // 1. Update World State (Atmosphere)
      if (data.world_state) {
        setWorldState(data.world_state);
      }

      // 2. XP Logic check first to potentially trigger Level Up before visual updates
      let currentChar = character;
      if (data.xp_reward && data.xp_reward > 0) {
          const { updatedChar, sysMessages } = handleGainXp(data.xp_reward, character);
          currentChar = updatedChar;
          setCharacter(currentChar); // Immediate update for XP
          setMessages(prev => [...prev, ...sysMessages]);
      }

      // 3. Update Character Stats (HP & Will) based on AI
      if (data.hp_change !== 0 || data.will_change !== 0 || data.new_inventory || data.new_companion) {
        setCharacter(prev => {
          let newHp = prev.hp + data.hp_change;
          if (newHp > prev.maxHp) newHp = prev.maxHp;
          if (newHp < 0) newHp = 0;

          let newWill = prev.will + data.will_change;
          if (newWill > prev.maxWill) newWill = prev.maxWill;
          if (newWill < 0) newWill = 0;

          const newInventory = [...prev.inventory];
          if (data.new_inventory) {
             const newItem: Item = {
                id: generateId(),
                name: data.new_inventory,
                type: 'MATERIAL', 
                description: 'An item found during your travels.',
                icon: 'gem',
                quantity: 1
             };
             newInventory.push(newItem);
          }

          const newParty = [...prev.party];
          if (data.new_companion && AVAILABLE_COMPANIONS[data.new_companion]) {
             // Only add if not already in party
             if (!newParty.find(c => c.id === data.new_companion)) {
                newParty.push(AVAILABLE_COMPANIONS[data.new_companion]);
             }
          }

          return {
            ...prev,
            hp: newHp,
            will: newWill,
            inventory: newInventory,
            party: newParty
          };
        });
      }

      // 4. Handle System Event for Stat Changes (Logs)
      if (data.hp_change !== 0 || data.will_change !== 0) {
         const changes = [];
         if (data.hp_change < 0) changes.push(`Taking ${Math.abs(data.hp_change)} Damage`);
         if (data.hp_change > 0) changes.push(`Recovering ${data.hp_change} HP`);
         if (data.will_change < 0) changes.push(`Willpower fading by ${Math.abs(data.will_change)}`);
         if (data.will_change > 0) changes.push(`Willpower restored by ${data.will_change}`);

         const sysMsg: Message = {
            id: generateId(),
            sender: 'System',
            text: `⚠️ STATUS UPDATE: ${changes.join(', ')}`,
            timestamp: new Date()
         };
         setMessages(prev => [...prev, sysMsg]);
      }

      // 5. Handle Companion Recruit Log
      if (data.new_companion && AVAILABLE_COMPANIONS[data.new_companion]) {
         const comp = AVAILABLE_COMPANIONS[data.new_companion];
         const sysMsg: Message = {
            id: generateId(),
            sender: 'System',
            text: `👥 COMPANION JOINED: ${comp.name} the ${comp.class}`,
            timestamp: new Date()
         };
         setMessages(prev => [...prev, sysMsg]);
      }

      // 6. Handle Dice Request
      if (data.dice_request) {
        const sysMsg: Message = {
          id: generateId(),
          sender: 'System',
          text: `🎲 Fate demands a roll for: ${data.dice_request}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, sysMsg]);
      }

      // 7. Handle Inventory Notification
      if (data.new_inventory) {
         const sysMsg: Message = {
            id: generateId(),
            sender: 'System',
            text: `🎒 ACQUIRED: ${data.new_inventory}`,
            timestamp: new Date()
         };
         setMessages(prev => [...prev, sysMsg]);
      }
  };

  // Character Creation Handler
  const handleCharacterCreate = async (newCharacter: Character) => {
    setCharacter(newCharacter);
    setGameStarted(true);
    setIsProcessing(true); 
    
    try {
      const data = await generateIntro(newCharacter);
      
      const dmMsg: Message = {
        id: generateId(),
        sender: 'DM',
        text: data.narrative,
        timestamp: new Date(),
        mood: data.world_state || 'BONFIRE'
      };
      setMessages([dmMsg]);
      applyAIUpdates(data);

    } catch (error) {
       console.error("Init Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Main Game Handlers
  const handleSendMessage = async (text: string) => {
    // A. Add Player Message
    const playerMsg: Message = {
      id: generateId(),
      sender: 'Player',
      text: text,
      timestamp: new Date(),
      mood: worldState
    };

    let updatedMessages = [...messages, playerMsg];
    setMessages(updatedMessages);
    setIsProcessing(true);

    // B. Environment Simulation (Time Passing)
    let currentTurnEnv = { ...env, turnCount: env.turnCount + 1 };
    
    // Simulate time passing every 5 turns
    if (currentTurnEnv.turnCount % 5 === 0) {
      currentTurnEnv = advanceTime(currentTurnEnv);
      const timeMsg: Message = {
        id: generateId(), sender: 'System', text: `⏳ Time passes... It is now ${currentTurnEnv.time}.`, timestamp: new Date()
      };
      updatedMessages.push(timeMsg);
    }
    setEnv(currentTurnEnv);

    // C. Survival Mechanics
    const { updatedChar, sysMessages } = processSurvivalTurn(character, currentTurnEnv, worldState);
    setCharacter(updatedChar);
    if (sysMessages.length > 0) {
       updatedMessages = [...updatedMessages, ...sysMessages];
       setMessages(updatedMessages);
    }

    try {
      // D. Call Gemini Brain
      // Pass the updated character (with potential survival decay) to the AI
      const data = await generateDMResponse(text, updatedMessages, updatedChar, worldState);

      // E. Apply Logic (XP, Stats, etc.)
      applyAIUpdates(data);

      // F. Add Narrator Response
      const dmMsg: Message = {
        id: generateId(),
        sender: 'DM',
        text: data.narrative,
        timestamp: new Date(),
        mood: data.world_state || worldState
      };
      setMessages(prev => [...prev, dmMsg]);

    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: generateId(),
        sender: 'System',
        text: "⚠️ Fate is silent (Network Error).",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDiceRoll = useCallback(() => {
    const result = rollDie(20);
    setDiceResult(result);

    const systemMsg: Message = {
      id: generateId(),
      sender: 'System',
      text: `🎲 ${character.name} rolled a ${result} on a D20 check.`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, systemMsg]);
  }, [character.name]);

  if (!gameStarted) {
    return <CharacterCreation onCreate={handleCharacterCreate} />;
  }

  return (
    <div className={`flex flex-col h-screen max-h-screen text-stone-200 transition-colors duration-1000 ease-in-out ${getWorldStyles()}`}>
      
      {/* Modal Overlay */}
      <ModalManager 
        activeModal={activeModal} 
        onClose={() => setActiveModal('NONE')} 
        character={character}
        onUseItem={handleUseItem}
        onDropItem={handleDropItem}
        onLearnSkill={handleLearnSkill}
        onTravel={handleTravel}
        onTalkNpc={handleNpcInteraction}
        onDismissNpc={handleDismissNpc}
      />

      {/* Visual Overlays */}
      {worldState === 'ECLIPSE' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(100,0,0,0.2)_100%)] pointer-events-none z-0"></div>
      )}
      {worldState === 'BONFIRE' && (
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-orange-600/10 to-transparent pointer-events-none z-0 animate-pulse"></div>
      )}

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur border-b border-slate-800 z-10">
         <div className="flex items-center gap-2 text-amber-600">
            <Sword className="w-5 h-5" />
            <h1 className="font-bold font-cinzel text-lg">Brand of Sacrifice</h1>
         </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden z-10">
        
        {/* Left Column: Narrative (70%) */}
        <section className="flex-1 flex flex-col md:w-[70%] border-r border-slate-800 relative">
           {/* Environment Widget sits at the top of the narrative column */}
           <EnvironmentWidget env={env} />
          
          <GameLog messages={messages} />
          
          {/* Navigation Dock is integrated here to sit above input */}
          <GameDock activeModal={activeModal} setActiveModal={setActiveModal} />
          
          <InputArea 
            onSendMessage={handleSendMessage} 
            disabled={isProcessing} 
          />
        </section>

        {/* Right Column: Character Sheet (30%) */}
        <aside className="hidden md:flex flex-col h-full md:w-[30%] border-slate-800 z-20">
          <CharacterSheet 
            character={character}
            diceResult={diceResult}
            onDiceRoll={handleDiceRoll}
            worldState={worldState}
          />
        </aside>

      </main>
    </div>
  );
};

export default App;