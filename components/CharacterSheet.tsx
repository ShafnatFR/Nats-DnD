import React from 'react';
import { Character } from '../types';
import StatsGrid from './StatsGrid';
import DiceTray from './DiceTray';
import { Shield, Zap, Skull } from 'lucide-react';

interface CharacterSheetProps {
  character: Character;
  diceResult: number | null;
  onDiceRoll: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, diceResult, onDiceRoll }) => {
  const hpPercent = (character.hp / character.maxHp) * 100;
  const mpPercent = (character.mp / character.maxMp) * 100;

  return (
    <div className="h-full flex flex-col p-6 bg-slate-950 border-l border-slate-800 shadow-xl overflow-y-auto">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-stone-100 font-['Courier_Prime'] tracking-tight mb-1">
          {character.name}
        </h2>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="uppercase">{character.class}</span>
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700">Lvl {character.level}</span>
        </div>
      </div>

      {/* Vitals */}
      <div className="space-y-4 mb-8">
        {/* HP */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-red-400 flex items-center gap-1"><Skull size={12}/> HP</span>
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
            <span className="text-blue-400 flex items-center gap-1"><Zap size={12}/> MP</span>
            <span className="text-slate-400">{character.mp} / {character.maxMp}</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
            <div 
              className="h-full bg-blue-900/80 bg-gradient-to-r from-blue-900 to-blue-600 transition-all duration-500" 
              style={{ width: `${mpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-2">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Shield size={12} /> Attributes
         </h3>
         <StatsGrid stats={character.stats} />
      </div>

      {/* Dice Section */}
      <DiceTray onRoll={onDiceRoll} lastResult={diceResult} />
    </div>
  );
};

export default CharacterSheet;