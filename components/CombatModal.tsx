
import React, { useEffect, useRef, useState } from 'react';
import { Character, Enemy, CombatPhase, Item } from '../types';
import { Skull, Ghost, Dog, Sword, Zap, Heart, Footprints, ShieldAlert } from 'lucide-react';
import { calculateTotalStats } from '../utils/gameUtils';

interface CombatModalProps {
  enemy: Enemy;
  character: Character;
  combatLog: string[];
  phase: CombatPhase;
  onAttack: () => void;
  onSkill: (skillName: string) => void; // Simplified for now
  onUseItem: (item: Item) => void;
  onFlee: () => void;
  onVictory: () => void;
  onDefeat: () => void;
}

const CombatModal: React.FC<CombatModalProps> = ({ 
  enemy, character, combatLog, phase, onAttack, onSkill, onUseItem, onFlee, onVictory, onDefeat 
}) => {
  const logRef = useRef<HTMLDivElement>(null);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const totalStats = calculateTotalStats(character);

  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLog]);

  const getEnemyIcon = () => {
    switch(enemy.icon) {
      case 'ghost': return <Ghost size={64} className="text-cyan-400 animate-pulse" />;
      case 'wolf': return <Dog size={64} className="text-red-400 animate-bounce" />;
      default: return <Skull size={64} className="text-stone-300 animate-pulse" />;
    }
  };

  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const playerHpPercent = (character.hp / character.maxHp) * 100;
  
  // Quick Consumables
  const consumables = character.inventory.filter(i => i.type === 'CONSUMABLE');

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-slate-950 border border-red-900/50 shadow-2xl rounded-lg overflow-hidden relative">
       
       {/* Background Effect for Combat */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(80,0,0,0.2),transparent_80%)] pointer-events-none"></div>

       {/* HEADER: ENEMY VIZ */}
       <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 border-b border-slate-800 h-[200px] relative">
          <div className="mb-4 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)] transition-transform duration-300 transform scale-110">
             {getEnemyIcon()}
          </div>
          
          <div className="w-full max-w-md">
             <div className="flex justify-between text-xs font-bold font-cinzel text-red-500 mb-1 uppercase tracking-widest">
                <span>{enemy.name} (Lvl {enemy.level})</span>
                <span>{enemy.hp} / {enemy.maxHp} HP</span>
             </div>
             <div className="h-4 bg-slate-950 rounded-full border border-red-900/50 overflow-hidden shadow-inner">
                <div 
                   className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-300 ease-out"
                   style={{ width: `${hpPercent}%` }}
                ></div>
             </div>
          </div>
       </div>

       {/* BODY: COMBAT LOG */}
       <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-black/40 font-mono text-sm space-y-2">
          {combatLog.length === 0 && (
             <div className="text-stone-500 italic text-center mt-10">The battle begins...</div>
          )}
          {combatLog.map((log, idx) => (
             <div key={idx} className={`border-l-2 pl-2 py-1 ${
                log.includes('Enemy') || log.includes(enemy.name) ? 'border-red-600 text-red-200' : 
                log.includes('Victory') ? 'border-amber-500 text-amber-400 font-bold' :
                log.includes('Defeat') ? 'border-stone-500 text-stone-500' :
                'border-emerald-600 text-emerald-100'
             }`}>
                {log}
             </div>
          ))}
          <div ref={logRef} />
       </div>

       {/* FOOTER: PLAYER HUD & ACTIONS */}
       <div className="p-4 bg-slate-900 border-t border-slate-800">
          {/* Player HP Bar */}
          <div className="mb-4">
             <div className="flex justify-between text-xs font-bold font-cinzel text-stone-400 mb-1">
                <span>{character.name}</span>
                <span>{character.hp} / {character.maxHp} HP</span>
             </div>
             <div className="h-2 bg-slate-950 rounded-full border border-slate-700 overflow-hidden">
                <div 
                   className="h-full bg-stone-200 transition-all duration-300"
                   style={{ width: `${playerHpPercent}%` }}
                ></div>
             </div>
          </div>

          {/* Action Grid */}
          {phase === 'PLAYER_TURN' ? (
             !showItemMenu ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                   <button 
                      onClick={onAttack}
                      className="flex flex-col items-center justify-center p-3 bg-red-900/20 border border-red-800 hover:bg-red-900/40 hover:border-red-500 rounded text-red-100 transition-all group"
                   >
                      <Sword size={24} className="mb-1 group-hover:scale-110 transition-transform" />
                      <span className="font-cinzel font-bold text-xs uppercase tracking-widest">Attack</span>
                   </button>
                   
                   <button 
                      onClick={() => onSkill('Focus')} // Placeholder for now
                      disabled={character.unlockedSkills.length === 0}
                      className="flex flex-col items-center justify-center p-3 bg-blue-900/20 border border-blue-800 hover:bg-blue-900/40 hover:border-blue-500 rounded text-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                   >
                      <Zap size={24} className="mb-1 group-hover:scale-110 transition-transform" />
                      <span className="font-cinzel font-bold text-xs uppercase tracking-widest">Skill</span>
                   </button>

                   <button 
                      onClick={() => setShowItemMenu(true)}
                      className="flex flex-col items-center justify-center p-3 bg-emerald-900/20 border border-emerald-800 hover:bg-emerald-900/40 hover:border-emerald-500 rounded text-emerald-100 transition-all group"
                   >
                      <Heart size={24} className="mb-1 group-hover:scale-110 transition-transform" />
                      <span className="font-cinzel font-bold text-xs uppercase tracking-widest">Item</span>
                   </button>

                   <button 
                      onClick={onFlee}
                      className="flex flex-col items-center justify-center p-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-stone-400 rounded text-stone-300 transition-all group"
                   >
                      <Footprints size={24} className="mb-1 group-hover:scale-110 transition-transform" />
                      <span className="font-cinzel font-bold text-xs uppercase tracking-widest">Flee</span>
                   </button>
                </div>
             ) : (
                <div className="bg-slate-950 p-2 rounded border border-slate-700">
                   <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-xs uppercase text-slate-500 font-bold">Select Item</span>
                      <button onClick={() => setShowItemMenu(false)} className="text-xs text-red-500 hover:text-red-400">Cancel</button>
                   </div>
                   <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {consumables.length > 0 ? consumables.map((item, i) => (
                         <button 
                            key={i}
                            onClick={() => { onUseItem(item); setShowItemMenu(false); }}
                            className="text-left text-xs p-2 bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded text-emerald-100"
                         >
                            {item.name} (x{item.quantity})
                         </button>
                      )) : (
                         <div className="col-span-2 text-center text-xs text-slate-600 italic py-2">No consumables</div>
                      )}
                   </div>
                </div>
             )
          ) : (
             <div className="flex items-center justify-center h-16 bg-black/20 rounded border border-slate-800/50">
                {phase === 'ENEMY_TURN' && (
                   <div className="flex items-center gap-2 text-red-500 font-cinzel font-bold animate-pulse">
                      <ShieldAlert size={20} /> Enemy is attacking...
                   </div>
                )}
                {phase === 'VICTORY' && (
                   <button onClick={onVictory} className="w-full h-full bg-amber-700 hover:bg-amber-600 text-white font-cinzel font-bold uppercase tracking-widest transition-all">
                      Claim Victory
                   </button>
                )}
                {phase === 'DEFEAT' && (
                   <button onClick={onDefeat} className="w-full h-full bg-stone-800 hover:bg-stone-700 text-red-500 font-cinzel font-bold uppercase tracking-widest transition-all">
                      Accept Fate
                   </button>
                )}
             </div>
          )}
       </div>
    </div>
  );
};

export default CombatModal;
