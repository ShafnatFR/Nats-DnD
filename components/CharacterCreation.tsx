import React, { useState, useMemo } from 'react';
import { Character, CharacterClassDef, Stats, Trait } from '../types';
import { CLASSES, STARTING_ITEMS, XP_FORMULA, TRAITS, CALCULATE_DERIVED } from '../constants';
import { Shield, Sword, Flame, Skull, ChevronRight, X, HelpCircle, ArrowRight, Sun, Eye, Zap, Heart, Brain, Crown, Clover } from 'lucide-react';

interface CharacterCreationProps {
  onCreate: (character: Character) => void;
}

const TOTAL_POINTS = 5; // Reduced points because base stats are higher now

const TUTORIAL_STEPS = [
  { target: 'intro', title: "The Brand", text: "You are marked by Causality. Struggles await you, but so do moments of respite." },
  { target: 'identity', title: "Identity", text: "Who were you before the darkness fell? Name your Struggler." },
  { target: 'class', title: "Path of Struggle", text: "How do you fight against fate? Strength, Precision, or Forbidden Knowledge?" },
  { target: 'curse', title: "The Curse", text: "Every soul carries a burden. What is yours?" },
  { target: 'stats', title: "Forging the Soul", text: "Refine your potential. You have limited points to distribute." },
];

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClassDef>(CLASSES[0]);
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
  const [pointsRemaining, setPointsRemaining] = useState(TOTAL_POINTS);
  
  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  // Allocation State (Starts at 0, adds to base)
  const [allocatedStats, setAllocatedStats] = useState<Stats>({
    STR: 0, DEX: 0, CON: 0, INT: 0, CHA: 0, FATE: 0
  });

  // Helper to calculate total value for display
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
      STR: getFinalStat('STR'),
      DEX: getFinalStat('DEX'),
      CON: getFinalStat('CON'),
      INT: getFinalStat('INT'),
      CHA: getFinalStat('CHA'),
      FATE: getFinalStat('FATE'),
    };

    let hp = selectedClass.baseHp;
    if (selectedTrait?.modifiers.maxHp) hp += selectedTrait.modifiers.maxHp;
    
    let mp = selectedClass.baseMp;
    if (selectedTrait?.modifiers.maxMp) mp += selectedTrait.modifiers.maxMp;

    const derived = CALCULATE_DERIVED(finalStats);

    const newCharacter: Character = {
      name: name.trim(),
      class: selectedClass.name,
      level: 1,
      hp: hp,
      maxHp: hp,
      mp: mp,
      maxMp: mp,
      will: selectedClass.baseWill,
      maxWill: selectedClass.baseWill,
      stats: finalStats,
      derivedStats: derived,
      equipment: {
        HEAD: null,
        BODY: null,
        MAIN_HAND: null,
        OFF_HAND: null,
        ACCESSORY: null
      },
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

  const handleNextStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const getHighlightClass = (target: string) => {
    if (!showTutorial) return '';
    return TUTORIAL_STEPS[tutorialStep].target === target 
      ? 'relative z-50 bg-slate-900 ring-2 ring-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] rounded-lg p-2 -m-2 transition-all duration-300' 
      : 'opacity-40 transition-opacity duration-300';
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
        
        {/* Tutorial Overlay */}
        {showTutorial && (
          <div className="absolute bottom-6 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none">
             <div className="bg-slate-900 border border-amber-800 p-5 rounded shadow-2xl max-w-lg w-full pointer-events-auto animate-fade-in">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-amber-600">
                    <HelpCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest font-cinzel">
                      Guidance {tutorialStep + 1}/{TUTORIAL_STEPS.length}
                    </span>
                  </div>
                  <button onClick={() => setShowTutorial(false)}><X size={16} className="text-slate-500 hover:text-white" /></button>
                </div>
                <h3 className="text-xl font-bold text-stone-100 mb-1 font-cinzel">{TUTORIAL_STEPS[tutorialStep].title}</h3>
                <p className="text-lg text-slate-400 mb-4 italic">{TUTORIAL_STEPS[tutorialStep].text}</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowTutorial(false)} className="px-3 py-1.5 text-xs text-slate-500 uppercase">Dismiss</button>
                  <button onClick={handleNextStep} className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-stone-100 font-bold uppercase rounded flex items-center gap-1">Next <ArrowRight size={14} /></button>
                </div>
             </div>
          </div>
        )}

        {/* --- LEFT COLUMN: Setup --- */}
        <div className="lg:w-1/2 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/50 flex flex-col gap-6 overflow-y-auto max-h-screen custom-scrollbar">
           
           {/* Header */}
           <div>
            <h1 className="text-3xl font-bold text-amber-600 mb-2 flex items-center gap-3 font-cinzel">
              <Flame className="w-6 h-6" /> Begin the Struggle
            </h1>
            <p className="text-stone-400 italic">"The Brand pulsates... awakening."</p>
           </div>

           {/* Name */}
           <div className={getHighlightClass('identity')}>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-cinzel">Identity</label>
              <div className="relative">
                <Skull className="absolute left-3 top-3.5 w-5 h-5 text-slate-600" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name..."
                  className="w-full bg-slate-900 border border-slate-700 text-stone-200 pl-10 pr-4 py-3 rounded focus:border-amber-700 focus:outline-none font-cinzel text-lg"
                  disabled={showTutorial} 
                />
              </div>
           </div>

           {/* Class */}
           <div className={getHighlightClass('class')}>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-3 font-cinzel">Select Path</label>
              <div className="grid grid-cols-1 gap-3">
                {CLASSES.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => { setSelectedClass(cls); setAllocatedStats({STR:0,DEX:0,CON:0,INT:0,CHA:0,FATE:0}); }}
                    disabled={showTutorial}
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
                        {cls.name}
                      </div>
                      <div className="text-sm text-slate-400 line-clamp-1 italic">{cls.description}</div>
                    </div>
                  </button>
                ))}
              </div>
           </div>

           {/* Curse/Trait */}
           <div className={getHighlightClass('curse')}>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-3 font-cinzel">Select Curse (Trait)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                 <button
                    onClick={() => setSelectedTrait(null)}
                    className={`p-3 rounded border text-left transition-all ${!selectedTrait ? 'bg-amber-900/20 border-amber-600' : 'bg-slate-900 border-slate-800'}`}
                 >
                    <div className="font-bold font-cinzel text-stone-200">None</div>
                    <div className="text-xs text-slate-500">No special fate.</div>
                 </button>
                 {TRAITS.map(trait => (
                    <button
                       key={trait.id}
                       onClick={() => setSelectedTrait(trait)}
                       className={`p-3 rounded border text-left transition-all relative overflow-hidden group ${
                          selectedTrait?.id === trait.id ? 'bg-amber-900/20 border-amber-600' : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                       }`}
                    >
                       <div className="font-bold font-cinzel text-stone-200 group-hover:text-amber-500 transition-colors">{trait.name}</div>
                       <div className="text-xs text-slate-400 mt-1">{trait.effectDescription}</div>
                       <div className="text-[10px] text-slate-600 mt-2 italic border-t border-slate-800 pt-1">"{trait.description}"</div>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* --- RIGHT COLUMN: Stats --- */}
        <div className="lg:w-1/2 p-6 md:p-8 flex flex-col bg-slate-900">
          
          <div className="flex justify-between items-end mb-6">
             <div className="text-xs uppercase tracking-widest text-slate-500 font-cinzel">Stat Distribution</div>
             <span className={`text-sm font-bold font-cinzel ${pointsRemaining === 0 ? 'text-emerald-500' : 'text-amber-600'}`}>
               {pointsRemaining} Points Available
             </span>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 ${getHighlightClass('stats')}`}>
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
                         
                         {/* Visual Breakdown of Stat */}
                         <div className="flex gap-1 h-1.5 w-full mx-2 rounded-full overflow-hidden bg-slate-800">
                             {/* Base */}
                             <div className="bg-slate-600" style={{flex: baseVal}}></div>
                             {/* Allocated */}
                             {allocatedStats[stat] > 0 && <div className="bg-amber-600" style={{flex: allocatedStats[stat]}}></div>}
                             {/* Trait Positive */}
                             {traitMod > 0 && <div className="bg-emerald-500" style={{flex: traitMod}}></div>}
                             {/* Trait Negative (Visual Hack: we can't show negative width, so we color the bar differently if heavily penalized) */}
                         </div>

                         <button 
                            onClick={() => handleStatChange(stat, true)}
                            disabled={pointsRemaining <= 0}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30"
                         > + </button>
                      </div>

                      {traitMod !== 0 && (
                         <div className={`absolute top-2 right-10 text-[10px] font-bold ${traitMod > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {traitMod > 0 ? '+' : ''}{traitMod} (Curse)
                         </div>
                      )}
                   </div>
                );
             })}
          </div>

          {/* Calculated Vitals Preview */}
          <div className="mt-auto">
            <div className="bg-slate-950 p-4 rounded border border-slate-800 mb-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="block text-xs text-slate-500 mb-1 font-cinzel">Health</span>
                <span className="text-xl font-bold text-red-400 font-cinzel">
                  {selectedClass.baseHp + (selectedTrait?.modifiers.maxHp || 0)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500 mb-1 font-cinzel">Mana</span>
                <span className="text-xl font-bold text-blue-400 font-cinzel">
                  {selectedClass.baseMp + (selectedTrait?.modifiers.maxMp || 0)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500 mb-1 font-cinzel">Willpower</span>
                <span className="text-xl font-bold text-amber-400 font-cinzel">{selectedClass.baseWill}</span>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={!name.trim() || pointsRemaining > 0 || showTutorial}
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