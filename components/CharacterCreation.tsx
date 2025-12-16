import React, { useState } from 'react';
import { Character, CharacterClassDef, Stats, Trait, Language } from '../types';
import { CLASSES, STARTING_ITEMS, XP_FORMULA, TRAITS, CALCULATE_DERIVED } from '../constants';
import { Shield, Sword, Flame, Skull, ChevronRight, X, HelpCircle, ArrowRight, Sun, Eye, Zap, Brain, Crown, Clover } from 'lucide-react';
import { getLocName, getLocDesc } from '../utils/textUtils';

interface CharacterCreationProps {
  onCreate: (character: Character) => void;
  language?: Language;
}

const TOTAL_POINTS = 5;

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCreate, language = 'EN' }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClassDef>(CLASSES[0]);
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
  const [pointsRemaining, setPointsRemaining] = useState(TOTAL_POINTS);
  
  const [showTutorial, setShowTutorial] = useState(true);
  
  const [allocatedStats, setAllocatedStats] = useState<Stats>({
    STR: 0, DEX: 0, CON: 0, INT: 0, CHA: 0, FATE: 0
  });

  const getFinalStat = (key: keyof Stats) => {
    let val = selectedClass.baseStats[key] + allocatedStats[key];
    if (selectedTrait?.modifiers.stats?.[key]) {
      val += selectedTrait.modifiers.stats[key]!;
    }
    return Math.max(1, val);
  };

  const handleStatChange = (stat: keyof Stats, increment: boolean) => {
    if (increment) {
      if (pointsRemaining > 0) {
        setAllocatedStats(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
        setPointsRemaining(prev => prev - 1);
      }
    } else {
      if (allocatedStats[stat] > 0) {
        setAllocatedStats(prev => ({ ...prev, [stat]: prev[stat] - 1 }));
        setPointsRemaining(prev => prev + 1);
      }
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    const finalStats: Stats = {
      STR: getFinalStat('STR'), DEX: getFinalStat('DEX'), CON: getFinalStat('CON'),
      INT: getFinalStat('INT'), CHA: getFinalStat('CHA'), FATE: getFinalStat('FATE'),
    };

    let hp = selectedClass.baseHp;
    if (selectedTrait?.modifiers.maxHp) hp += selectedTrait.modifiers.maxHp;
    
    let mp = selectedClass.baseMp;
    if (selectedTrait?.modifiers.maxMp) mp += selectedTrait.modifiers.maxMp;

    const derived = CALCULATE_DERIVED(finalStats);

    const newCharacter: Character = {
      name: name.trim(),
      class: selectedClass.name, // Storing localized name object
      level: 1,
      hp: hp, maxHp: hp, mp: mp, maxMp: mp,
      will: selectedClass.baseWill, maxWill: selectedClass.baseWill,
      stats: finalStats,
      derivedStats: derived,
      equipment: { HEAD: null, BODY: null, MAIN_HAND: null, OFF_HAND: null, ACCESSORY: null },
      trait: selectedTrait,
      survival: { hunger: 100, thirst: 100, fatigue: 100, warmth: 100 },
      progression: { currentXp: 0, maxXp: XP_FORMULA(1), statPoints: 0, skillPoints: 0 },
      unlockedSkills: [],
      currentLocationId: 'loc_start',
      party: [],
      inventory: STARTING_ITEMS,
      gold: 10
    };

    onCreate(newCharacter);
  };

  const getStatIcon = (stat: keyof Stats) => {
    switch(stat) {
      case 'STR': return <Sword size={16} />;
      case 'DEX': return <Zap size={16} />;
      case 'CON': return <Shield size={16} />;
      case 'INT': return <Brain size={16} />;
      case 'CHA': return <Crown size={16} />;
      case 'FATE': return <Clover size={16} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 font-crimson">
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col lg:flex-row rounded-sm relative">
        
        {showTutorial && (
          <div className="absolute bottom-6 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none">
             <div className="bg-slate-900 border border-amber-800 p-5 rounded shadow-2xl max-w-lg w-full pointer-events-auto animate-fade-in">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-amber-600">
                    <HelpCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest font-cinzel">Tutorial</span>
                  </div>
                  <button onClick={() => setShowTutorial(false)}><X size={16} className="text-slate-500 hover:text-white" /></button>
                </div>
                <p className="text-lg text-slate-400 mb-4 italic">
                   {language === 'EN' ? "Welcome, Struggler. Forge your destiny." : "Selamat datang, Pejuang. Tempa takdirmu."}
                </p>
             </div>
          </div>
        )}

        <div className="lg:w-1/2 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/50 flex flex-col gap-6 overflow-y-auto max-h-screen custom-scrollbar">
           <div>
            <h1 className="text-3xl font-bold text-amber-600 mb-2 flex items-center gap-3 font-cinzel">
              <Flame className="w-6 h-6" /> Begin
            </h1>
           </div>

           <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-cinzel">Name</label>
              <div className="relative">
                <Skull className="absolute left-3 top-3.5 w-5 h-5 text-slate-600" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="..."
                  className="w-full bg-slate-900 border border-slate-700 text-stone-200 pl-10 pr-4 py-3 rounded focus:border-amber-700 focus:outline-none font-cinzel text-lg"
                />
              </div>
           </div>

           <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-3 font-cinzel">Class</label>
              <div className="grid grid-cols-1 gap-3">
                {CLASSES.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => { setSelectedClass(cls); setAllocatedStats({STR:0,DEX:0,CON:0,INT:0,CHA:0,FATE:0}); }}
                    className={`flex items-center text-left p-3 rounded border transition-all ${
                      selectedClass.id === cls.id 
                        ? 'bg-amber-900/20 border-amber-600/60 ring-1 ring-amber-600/20' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded mr-4 ${selectedClass.id === cls.id ? 'bg-amber-700 text-stone-100' : 'bg-slate-800 text-slate-500'}`}>
                      {cls.id === 'struggler' && <Sword size={20} />}
                      {cls.id === 'hawk' && <Sun size={20} />}
                      {cls.id === 'brand' && <Eye size={20} />}
                    </div>
                    <div>
                      <div className={`font-bold font-cinzel text-lg ${selectedClass.id === cls.id ? 'text-amber-500' : 'text-stone-300'}`}>
                        {getLocName(cls, language as Language)}
                      </div>
                      <div className="text-sm text-slate-400 line-clamp-1 italic">{getLocDesc(cls, language as Language)}</div>
                    </div>
                  </button>
                ))}
              </div>
           </div>

           <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-3 font-cinzel">Trait</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                 <button
                    onClick={() => setSelectedTrait(null)}
                    className={`p-3 rounded border text-left transition-all ${!selectedTrait ? 'bg-amber-900/20 border-amber-600' : 'bg-slate-900 border-slate-800'}`}
                 >
                    <div className="font-bold font-cinzel text-stone-200">None</div>
                 </button>
                 {TRAITS.map(trait => (
                    <button
                       key={trait.id}
                       onClick={() => setSelectedTrait(trait)}
                       className={`p-3 rounded border text-left transition-all relative overflow-hidden group ${
                          selectedTrait?.id === trait.id ? 'bg-amber-900/20 border-amber-600' : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                       }`}
                    >
                       <div className="font-bold font-cinzel text-stone-200 group-hover:text-amber-500 transition-colors">{getLocName(trait, language as Language)}</div>
                       <div className="text-xs text-slate-400 mt-1">{trait.effectDescription}</div>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:w-1/2 p-6 md:p-8 flex flex-col bg-slate-900">
          <div className="flex justify-between items-end mb-6">
             <div className="text-xs uppercase tracking-widest text-slate-500 font-cinzel">Stats</div>
             <span className={`text-sm font-bold font-cinzel ${pointsRemaining === 0 ? 'text-emerald-500' : 'text-amber-600'}`}>
               {pointsRemaining} PTS
             </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
             {(Object.keys(allocatedStats) as Array<keyof Stats>).map((stat) => {
                const finalVal = getFinalStat(stat);
                const baseVal = selectedClass.baseStats[stat];
                const traitMod = selectedTrait?.modifiers.stats?.[stat] || 0;
                
                return (
                   <div key={stat} className="bg-slate-950 p-3 rounded border border-slate-800 flex flex-col relative group hover:border-slate-600 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2 text-stone-400">
                            {getStatIcon(stat)}
                            <span className="font-bold font-cinzel">{stat}</span>
                         </div>
                         <div className="text-2xl font-cinzel font-bold text-stone-200">
                            {finalVal}
                         </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-900 rounded p-1">
                         <button 
                            onClick={() => handleStatChange(stat, false)}
                            disabled={allocatedStats[stat] <= 0}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30"
                         > - </button>
                         <div className="flex gap-1 h-1.5 w-full mx-2 rounded-full overflow-hidden bg-slate-800">
                             <div className="bg-slate-600" style={{flex: baseVal}}></div>
                             {allocatedStats[stat] > 0 && <div className="bg-amber-600" style={{flex: allocatedStats[stat]}}></div>}
                             {traitMod > 0 && <div className="bg-emerald-500" style={{flex: traitMod}}></div>}
                         </div>
                         <button 
                            onClick={() => handleStatChange(stat, true)}
                            disabled={pointsRemaining <= 0}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30"
                         > + </button>
                      </div>
                   </div>
                );
             })}
          </div>

          <div className="mt-auto">
            <button
              onClick={handleCreate}
              disabled={!name.trim() || pointsRemaining > 0}
              className="w-full py-4 bg-amber-700 hover:bg-amber-600 text-stone-100 font-bold font-cinzel text-lg rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-700 shadow-lg"
            >
              <span>DEFY FATE</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;