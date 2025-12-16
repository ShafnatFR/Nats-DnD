import React from 'react';
import { Skill, Character, Language } from '../types';
import { SKILL_TREE } from '../constants';
import { Lock, Zap, CheckCircle, Shield, Brain, Heart, Eye } from 'lucide-react';
import { getLocName, getLocDesc } from '../utils/textUtils';

interface SkillModalProps {
  character: Character;
  onLearnSkill: (skillId: string) => void;
  language?: Language;
}

const SkillModal: React.FC<SkillModalProps> = ({ character, onLearnSkill, language = 'EN' }) => {
  const { progression, unlockedSkills, level } = character;

  const getSkillState = (skill: Skill) => {
    const isUnlocked = unlockedSkills.includes(skill.id);
    const isPrereqMet = !skill.prerequisiteId || unlockedSkills.includes(skill.prerequisiteId);
    const isLevelMet = level >= skill.requiredLevel;
    const canAfford = progression.skillPoints >= skill.cost;

    if (isUnlocked) return 'LEARNED';
    if (isPrereqMet && isLevelMet) return canAfford ? 'AVAILABLE' : 'AFFORDABLE_LOCKED';
    return 'LOCKED';
  };

  const getSkillIcon = (id: string) => {
     if (id.includes('stomach')) return <Heart size={20} />;
     if (id.includes('eyes')) return <Eye size={20} />;
     if (id.includes('grip')) return <Shield size={20} />;
     if (id.includes('meditation')) return <Brain size={20} />;
     return <Zap size={20} />;
  };

  return (
    <div className="flex flex-col h-[500px]">
       <div className="flex justify-between items-center mb-6 bg-slate-950 p-4 rounded border border-slate-800">
          <div>
             <span className="text-xs text-slate-500 uppercase tracking-widest font-cinzel">Level</span>
             <div className="text-2xl text-stone-200 font-cinzel font-bold">{level}</div>
          </div>
          <div className="text-right">
             <span className="text-xs text-slate-500 uppercase tracking-widest font-cinzel">SP</span>
             <div className="text-2xl text-amber-500 font-cinzel font-bold">{progression.skillPoints}</div>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {SKILL_TREE.map(skill => {
                const state = getSkillState(skill);
                const skillName = getLocName(skill, language as Language);
                const skillDesc = getLocDesc(skill, language as Language);
                
                let containerClass = "p-4 rounded border flex flex-col gap-2 transition-all duration-300 relative overflow-hidden group";
                let iconClass = "p-2 rounded-full mb-2 w-fit ";
                
                switch(state) {
                   case 'LEARNED':
                      containerClass += " bg-amber-900/10 border-amber-600/50";
                      iconClass += " bg-amber-900/30 text-amber-500 border border-amber-700/50";
                      break;
                   case 'AVAILABLE':
                      containerClass += " bg-slate-900 border-stone-400 hover:border-amber-400 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]";
                      iconClass += " bg-slate-800 text-stone-200 border border-slate-600 group-hover:bg-amber-900/20 group-hover:text-amber-400";
                      break;
                   case 'AFFORDABLE_LOCKED':
                       containerClass += " bg-slate-900 border-slate-700 opacity-80";
                       iconClass += " bg-slate-800 text-slate-500 border border-slate-700";
                       break;
                   case 'LOCKED':
                      containerClass += " bg-slate-950 border-slate-800 opacity-50 grayscale";
                      iconClass += " bg-slate-900 text-slate-700 border border-slate-800";
                      break;
                }

                return (
                   <div key={skill.id} className={containerClass}>
                      <div className="flex justify-between items-start">
                         <div className={iconClass}>
                            {state === 'LOCKED' ? <Lock size={20} /> : getSkillIcon(skill.id)}
                         </div>
                         {state === 'LEARNED' && <CheckCircle size={16} className="text-amber-500" />}
                      </div>

                      <div>
                         <h4 className={`font-cinzel font-bold ${state === 'LEARNED' ? 'text-amber-500' : 'text-stone-300'}`}>
                            {skillName}
                         </h4>
                         <p className="text-xs text-slate-500 italic mt-1 font-crimson">
                            {skillDesc}
                         </p>
                      </div>

                      <div className="mt-auto pt-3 flex justify-between items-center border-t border-slate-800/50">
                         <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                            {state === 'LOCKED' && skill.prerequisiteId ? (
                               <span className="text-red-900">Req: {getLocName(SKILL_TREE.find(s=>s.id === skill.prerequisiteId), language as Language)}</span>
                            ) : (
                               <span>Lvl {skill.requiredLevel}</span>
                            )}
                         </div>
                         
                         {state === 'AVAILABLE' && (
                            <button 
                               onClick={() => onLearnSkill(skill.id)}
                               className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-stone-100 text-xs font-bold rounded flex items-center gap-1 transition-colors font-cinzel"
                            >
                               Learn <span className="bg-black/20 px-1 rounded text-amber-200">{skill.cost} SP</span>
                            </button>
                         )}
                         {state === 'AFFORDABLE_LOCKED' && (
                             <span className="text-xs text-red-700 font-bold">{skill.cost} SP</span>
                         )}
                      </div>
                   </div>
                );
             })}
          </div>
       </div>
    </div>
  );
};

export default SkillModal;