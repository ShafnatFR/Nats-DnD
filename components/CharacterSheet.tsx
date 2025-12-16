import React from 'react';
import { Character, WorldState, Language } from '../types';
import { CALCULATE_DERIVED, UI_TRANSLATIONS } from '../constants';
import { calculateTotalStats } from '../utils/gameUtils';
import StatsGrid from './StatsGrid';
import { Shield, Zap, Skull, Sun, Backpack, Beef, Droplets, Eye, Flame, Thermometer, Activity, Hexagon } from 'lucide-react';
import { SURVIVAL_CONSTANTS } from '../constants';
import { getLocName } from '../utils/textUtils';

interface CharacterSheetProps {
  character: Character;
  diceResult: number | null;
  onDiceRoll: () => void;
  worldState: WorldState;
  language?: Language;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, diceResult, onDiceRoll, worldState, language = 'EN' }) => {
  const t = UI_TRANSLATIONS[language];
  const hpPercent = (character.hp / character.maxHp) * 100;
  const mpPercent = (character.mp / character.maxMp) * 100;
  const willPercent = (character.will / character.maxWill) * 100;

  const totalStats = calculateTotalStats(character);
  const derivedStats = CALCULATE_DERIVED(totalStats);

  const getSurvivalColor = (val: number) => {
    if (val <= 0) return 'text-red-600 animate-pulse font-bold';
    if (val <= SURVIVAL_CONSTANTS.CRITICAL_THRESHOLD) return 'text-red-400 animate-pulse';
    return 'text-stone-300';
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-950/80 backdrop-blur-sm border-l border-slate-800 shadow-xl overflow-y-auto transition-colors duration-1000">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <h2 className="text-3xl font-bold text-stone-100 font-cinzel tracking-tight mb-1">
          {character.name}
        </h2>
        <div className="flex items-center justify-between text-sm text-slate-500 font-crimson mb-2">
          {/* Handling localized class name */}
          <span className="uppercase tracking-widest">
             {typeof character.class === 'string' ? character.class : (character.class[language] || character.class['EN'])}
          </span>
          <span className="bg-slate-900 px-3 py-0.5 rounded border border-slate-700 font-cinzel text-xs">Lvl {character.level}</span>
        </div>
        
        {character.trait && (
           <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-950/30 border border-red-900/50 rounded text-[10px] text-red-400 font-bold uppercase tracking-wider font-cinzel">
              <Hexagon size={10} className="fill-red-900/50" />
              {getLocName(character.trait, language as Language)}
           </div>
        )}
      </div>

      <div className="space-y-4 mb-6 font-cinzel">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-red-400 flex items-center gap-1"><Skull size={12}/> {t.stats_vitality}</span>
            <span className="text-slate-400">{character.hp} / {character.maxHp}</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
            <div className="h-full bg-red-900/80 bg-gradient-to-r from-red-900 to-red-600 transition-all duration-500" style={{ width: `${hpPercent}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-blue-400 flex items-center gap-1"><Zap size={12}/> {t.stats_mana}</span>
            <span className="text-slate-400">{character.mp} / {character.maxMp}</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
            <div className="h-full bg-blue-900/80 bg-gradient-to-r from-blue-900 to-blue-600 transition-all duration-500" style={{ width: `${mpPercent}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-amber-400 flex items-center gap-1"><Sun size={12}/> {t.stats_willpower}</span>
            <span className="text-slate-400">{character.will} / {character.maxWill}</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
            <div className="h-full bg-amber-900/80 bg-gradient-to-r from-amber-900 to-amber-500 transition-all duration-500" style={{ width: `${willPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="mb-6">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-cinzel">
            <Shield size={12} /> {t.stats_attributes}
         </h3>
         <StatsGrid stats={totalStats} />
      </div>

      <div className="mb-6">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-cinzel">
            <Activity size={12} /> {t.stats_combat}
         </h3>
         <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/50 p-3 rounded border border-slate-800">
            <div className="flex justify-between border-b border-slate-800/50 pb-1">
               <span className="text-slate-500">{t.stats_melee}</span>
               <span className="text-stone-300 font-bold">+{derivedStats.meleeDamageMod}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/50 pb-1">
               <span className="text-slate-500">{t.stats_crit}</span>
               <span className="text-amber-500 font-bold">{derivedStats.critChance}%</span>
            </div>
            <div className="flex justify-between pt-1">
               <span className="text-slate-500">{t.stats_evasion}</span>
               <span className="text-stone-300 font-bold">{derivedStats.evasion}%</span>
            </div>
            <div className="flex justify-between pt-1">
               <span className="text-slate-500">{t.stats_carry}</span>
               <span className="text-stone-300 font-bold">{character.inventory.length} / {derivedStats.carryWeight}</span>
            </div>
         </div>
      </div>

      <div className="mb-6 p-3 bg-slate-900/40 rounded border border-slate-800">
         <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-cinzel">
            <Thermometer size={12} /> {t.stats_bio}
         </h3>
         <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="flex items-center gap-3">
               <div className="bg-slate-950 p-1.5 rounded text-amber-700 border border-slate-800"><Beef size={16} /></div>
               <div className="flex flex-col w-full">
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                     <span>{t.stats_hunger}</span>
                     <span className={getSurvivalColor(character.survival.hunger)}>{character.survival.hunger}%</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full mt-1">
                     <div className="h-full bg-amber-700 rounded-full" style={{width: `${character.survival.hunger}%`}}></div>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="bg-slate-950 p-1.5 rounded text-cyan-700 border border-slate-800"><Droplets size={16} /></div>
               <div className="flex flex-col w-full">
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                     <span>{t.stats_thirst}</span>
                     <span className={getSurvivalColor(character.survival.thirst)}>{character.survival.thirst}%</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full mt-1">
                     <div className="h-full bg-cyan-700 rounded-full" style={{width: `${character.survival.thirst}%`}}></div>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="bg-slate-950 p-1.5 rounded text-violet-700 border border-slate-800"><Eye size={16} /></div>
               <div className="flex flex-col w-full">
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                     <span>{t.stats_energy}</span>
                     <span className={getSurvivalColor(character.survival.fatigue)}>{character.survival.fatigue}%</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full mt-1">
                     <div className="h-full bg-violet-700 rounded-full" style={{width: `${character.survival.fatigue}%`}}></div>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="bg-slate-950 p-1.5 rounded text-red-700 border border-slate-800"><Flame size={16} /></div>
               <div className="flex flex-col w-full">
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                     <span>{t.stats_warmth}</span>
                     <span className={getSurvivalColor(character.survival.warmth)}>{character.survival.warmth}%</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full mt-1">
                     <div className="h-full bg-red-700 rounded-full" style={{width: `${character.survival.warmth}%`}}></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

       <div className="mb-2 flex-1">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-cinzel">
            <Backpack size={12} /> {t.stats_bag}
         </h3>
         <div className="bg-slate-900/50 rounded border border-slate-800 p-2 min-h-[100px] max-h-[150px] overflow-y-auto">
            {character.inventory.length > 0 ? (
              <ul className="space-y-1">
                {character.inventory.slice(0, 5).map((item, index) => (
                  <li key={index} className="flex justify-between text-sm text-stone-300 font-crimson border-b border-slate-800/50 last:border-0 pb-1 last:pb-0">
                    <span>- {getLocName(item, language as Language)}</span>
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
              <p className="text-slate-600 italic text-sm">{t.msg_empty_bag}</p>
            )}
         </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{t.fate_title}</h3>
         
         <div className="flex items-center justify-between">
            <button
               onClick={onDiceRoll}
               className="group relative flex items-center justify-center w-20 h-20 transition-transform active:scale-95 focus:outline-none"
            >
               {worldState === 'ECLIPSE' ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                     <Skull className="w-full h-full text-red-900 fill-red-950 stroke-[1.5] group-hover:text-red-800 transition-colors drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                  </div>
               ) : (
                  <Hexagon className="w-full h-full text-slate-800 fill-slate-900 stroke-[1.5] group-hover:text-slate-700 transition-colors" />
               )}
               <span className={`absolute inset-0 flex items-center justify-center font-bold text-sm text-center select-none leading-none ${
                   worldState === 'ECLIPSE' ? 'text-red-500 font-cinzel' : 'text-amber-600 group-hover:text-amber-500'
               }`}>
                  {worldState === 'ECLIPSE' ? t.fate_sacrifice : t.fate_dice}
               </span>
            </button>

            <div className="flex-1 pl-6">
               <div className="text-right">
                  <span className="block text-xs text-slate-500 mb-1">Result</span>
                  {diceResult ? (
                     <span className={`text-4xl font-bold font-mono animate-bounce ${
                        worldState === 'ECLIPSE' ? 'text-red-600 text-shadow-glow' :
                        diceResult === 20 ? 'text-amber-500 text-shadow-glow' : 
                        diceResult === 1 ? 'text-red-500' : 'text-stone-200'
                     }`}>
                        {diceResult}
                     </span>
                  ) : <span className="text-slate-700 text-xl font-mono">--</span>}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CharacterSheet;