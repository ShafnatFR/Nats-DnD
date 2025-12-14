import React from 'react';
import { Character, WorldState } from '../types';
import StatsGrid from './StatsGrid';
import DiceTray from './DiceTray';
import { Shield, Zap, Skull, Sun, Backpack, Beef, Droplets, Eye, Flame, Thermometer } from 'lucide-react';
import { SURVIVAL_CONSTANTS } from '../constants';

interface CharacterSheetProps {
  character: Character;
  diceResult: number | null;
  onDiceRoll: () => void;
  worldState: WorldState;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, diceResult, onDiceRoll, worldState }) => {
  const hpPercent = (character.hp / character.maxHp) * 100;
  const mpPercent = (character.mp / character.maxMp) * 100;
  const willPercent = (character.will / character.maxWill) * 100;

  // Helper for survival warnings
  const getSurvivalColor = (val: number) => {
    if (val <= 0) return 'text-red-600 animate-pulse font-bold';
    if (val <= SURVIVAL_CONSTANTS.CRITICAL_THRESHOLD) return 'text-red-400 animate-pulse';
    return 'text-stone-300';
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-950/80 backdrop-blur-sm border-l border-slate-800 shadow-xl overflow-y-auto transition-colors duration-1000">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-800">
        <h2 className="text-3xl font-bold text-stone-100 font-cinzel tracking-tight mb-1">
          {character.name}
        </h2>
        <div className="flex items-center justify-between text-sm text-slate-500 font-crimson">
          <span className="uppercase tracking-widest">{character.class}</span>
          <span className="bg-slate-900 px-3 py-0.5 rounded border border-slate-700 font-cinzel text-xs">Lvl {character.level}</span>
        </div>
      </div>

      {/* Vitals */}
      <div className="space-y-4 mb-6 font-cinzel">
        {/* HP */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-red-400 flex items-center gap-1"><Skull size={12}/> VITALITY</span>
            <span className="text-slate-400">{character.hp} / {character.maxHp}</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
            <div 
              className="h-full bg-red-900/80 bg-gradient-to-r from-red-900 to-red-600 transition-all duration-500" 
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* MP */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-blue-400 flex items-center gap-1"><Zap size={12}/> OD / MANA</span>
            <span className="text-slate-400">{character.mp} / {character.maxMp}</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
            <div 
              className="h-full bg-blue-900/80 bg-gradient-to-r from-blue-900 to-blue-600 transition-all duration-500" 
              style={{ width: `${mpPercent}%` }}
            />
          </div>
        </div>

        {/* Willpower */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-amber-400 flex items-center gap-1"><Sun size={12}/> WILLPOWER</span>
            <span className="text-slate-400">{character.will} / {character.maxWill}</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
            <div 
              className="h-full bg-amber-900/80 bg-gradient-to-r from-amber-900 to-amber-500 transition-all duration-500" 
              style={{ width: `${willPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Survival Grid */}
      <div className="mb-6 p-3 bg-slate-900/40 rounded border border-slate-800">
         <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-cinzel">
            <Thermometer size={12} /> Biological Needs
         </h3>
         <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {/* Hunger */}
            <div className="flex items-center gap-3">
               <div className="bg-slate-950 p-1.5 rounded text-amber-700 border border-slate-800">
                  <Beef size={16} />
               </div>
               <div className="flex flex-col w-full">
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                     <span>Hunger</span>
                     <span className={getSurvivalColor(character.survival.hunger)}>{character.survival.hunger}%</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full mt-1">
                     <div className="h-full bg-amber-700 rounded-full" style={{width: `${character.survival.hunger}%`}}></div>
                  </div>
               </div>
            </div>

            {/* Thirst */}
            <div className="flex items-center gap-3">
               <div className="bg-slate-950 p-1.5 rounded text-cyan-700 border border-slate-800">
                  <Droplets size={16} />
               </div>
               <div className="flex flex-col w-full">
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                     <span>Thirst</span>
                     <span className={getSurvivalColor(character.survival.thirst)}>{character.survival.thirst}%</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full mt-1">
                     <div className="h-full bg-cyan-700 rounded-full" style={{width: `${character.survival.thirst}%`}}></div>
                  </div>
               </div>
            </div>

            {/* Fatigue */}
            <div className="flex items-center gap-3">
               <div className="bg-slate-950 p-1.5 rounded text-violet-700 border border-slate-800">
                  <Eye size={16} />
               </div>
               <div className="flex flex-col w-full">
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                     <span>Energy</span>
                     <span className={getSurvivalColor(character.survival.fatigue)}>{character.survival.fatigue}%</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full mt-1">
                     <div className="h-full bg-violet-700 rounded-full" style={{width: `${character.survival.fatigue}%`}}></div>
                  </div>
               </div>
            </div>

            {/* Warmth */}
            <div className="flex items-center gap-3">
               <div className="bg-slate-950 p-1.5 rounded text-red-700 border border-slate-800">
                  <Flame size={16} />
               </div>
               <div className="flex flex-col w-full">
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                     <span>Warmth</span>
                     <span className={getSurvivalColor(character.survival.warmth)}>{character.survival.warmth}%</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full mt-1">
                     <div className="h-full bg-red-700 rounded-full" style={{width: `${character.survival.warmth}%`}}></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-cinzel">
            <Shield size={12} /> Attributes
         </h3>
         <StatsGrid stats={character.stats} />
      </div>

       {/* Inventory Preview */}
       <div className="mb-2 flex-1">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-cinzel">
            <Backpack size={12} /> Quick Bag
         </h3>
         <div className="bg-slate-900/50 rounded border border-slate-800 p-2 min-h-[100px] max-h-[150px] overflow-y-auto">
            {character.inventory.length > 0 ? (
              <ul className="space-y-1">
                {character.inventory.slice(0, 5).map((item, index) => (
                  <li key={index} className="flex justify-between text-sm text-stone-300 font-crimson border-b border-slate-800/50 last:border-0 pb-1 last:pb-0">
                    <span>- {item.name}</span>
                    <span className="text-xs text-slate-600">x{item.quantity}</span>
                  </li>
                ))}
                {character.inventory.length > 5 && (
                  <li className="text-xs text-amber-700 italic pt-1">
                    ...and {character.inventory.length - 5} more
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-slate-600 italic text-sm">Your pack is empty...</p>
            )}
         </div>
      </div>

      {/* Dice Section */}
      <DiceTray onRoll={onDiceRoll} lastResult={diceResult} worldState={worldState} />
    </div>
  );
};

export default CharacterSheet;