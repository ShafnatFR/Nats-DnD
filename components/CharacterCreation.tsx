import React, { useState } from 'react';
import { Character, CharacterClassDef, Stats } from '../types';
import { CLASSES, STARTING_ITEMS, XP_FORMULA } from '../constants';
import { Shield, Scroll, Sword, Flame, Skull, ChevronRight, Ghost, X, HelpCircle, ArrowRight, Sun, Eye } from 'lucide-react';

interface CharacterCreationProps {
  onCreate: (character: Character) => void;
}

const TOTAL_POINTS = 10;
const BASE_STAT = 10;

const TUTORIAL_STEPS = [
  { 
    target: 'intro', 
    title: "The Brand", 
    text: "You are marked by Causality. Struggles await you, but so do moments of respite." 
  },
  { 
    target: 'identity', 
    title: "Identity", 
    text: "Who were you before the darkness fell? Name your Struggler." 
  },
  { 
    target: 'class', 
    title: "Path of Struggle", 
    text: "How do you fight against fate? With a massive blade, precision, or forbidden arts?" 
  },
  { 
    target: 'stats', 
    title: "Forging the Soul", 
    text: "Distribute your potential. Strength to crush, Dexterity to evade, Intellect to understand, Charisma to lead." 
  },
];

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClassDef>(CLASSES[0]);
  const [pointsRemaining, setPointsRemaining] = useState(TOTAL_POINTS);
  
  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  const [allocatedStats, setAllocatedStats] = useState<Stats>({
    STR: 0,
    DEX: 0,
    INT: 0,
    CHA: 0
  });

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

  const getFinalStat = (stat: keyof Stats) => {
    const base = BASE_STAT;
    const allocated = allocatedStats[stat];
    const bonus = selectedClass.bonusStat === stat ? 2 : 0;
    return base + allocated + bonus;
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    const finalStats: Stats = {
      STR: getFinalStat('STR'),
      DEX: getFinalStat('DEX'),
      INT: getFinalStat('INT'),
      CHA: getFinalStat('CHA'),
    };

    const newCharacter: Character = {
      name: name.trim(),
      class: selectedClass.name,
      level: 1,
      hp: selectedClass.baseHp,
      maxHp: selectedClass.baseHp,
      mp: selectedClass.baseMp,
      maxMp: selectedClass.baseMp,
      will: selectedClass.baseWill,
      maxWill: selectedClass.baseWill,
      stats: finalStats,
      survival: {
        hunger: 100,
        thirst: 100,
        fatigue: 100,
        warmth: 100
      },
      progression: {
        currentXp: 0,
        maxXp: XP_FORMULA(1),
        statPoints: 0,
        skillPoints: 0
      },
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

  const currentTutorial = TUTORIAL_STEPS[tutorialStep];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 font-crimson">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row rounded-sm relative">
        
        {/* Tutorial Backdrop & Overlay */}
        {showTutorial && (
          <>
            <div className="absolute inset-0 bg-slate-950/90 z-40 backdrop-blur-[2px] transition-all" />
            
            <div className="absolute bottom-6 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none">
              <div className="bg-slate-900 border border-amber-800 p-5 rounded shadow-2xl max-w-lg w-full pointer-events-auto animate-fade-in">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-amber-600">
                    <HelpCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest font-cinzel">
                      Guidance {tutorialStep + 1}/{TUTORIAL_STEPS.length}
                    </span>
                  </div>
                  <button onClick={() => setShowTutorial(false)} className="text-slate-500 hover:text-stone-200">
                    <X size={16} />
                  </button>
                </div>
                
                <h3 className="text-xl font-bold text-stone-100 mb-1 font-cinzel">{currentTutorial.title}</h3>
                <p className="text-lg text-slate-400 mb-4 italic">{currentTutorial.text}</p>
                
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setShowTutorial(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-stone-300 uppercase tracking-wider font-cinzel"
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={handleNextStep}
                    className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-stone-100 text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1 font-cinzel shadow-lg"
                  >
                    {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Begin' : 'Next'}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Left Column: Visuals & Class Selection */}
        <div className={`md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/50 ${showTutorial && tutorialStep === 0 ? 'relative z-50' : ''}`}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-600 mb-2 flex items-center gap-3 font-cinzel">
              <Flame className="w-6 h-6" /> 
              Begin the Struggle
            </h1>
            <p className="text-stone-400 text-lg italic">Even if you are forced to crawl, you must move forward.</p>
          </div>

          <div className={`mb-6 ${getHighlightClass('identity')}`}>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-cinzel">Identity</label>
            <div className="relative">
              <Skull className="absolute left-3 top-3.5 w-5 h-5 text-slate-600" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name..."
                className="w-full bg-slate-900 border border-slate-700 text-stone-200 pl-10 pr-4 py-3 rounded focus:border-amber-700 focus:ring-1 focus:ring-amber-700/50 focus:outline-none transition-all placeholder:text-slate-700 font-cinzel text-lg"
                disabled={showTutorial} 
              />
            </div>
          </div>

          <div className={getHighlightClass('class')}>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-3 font-cinzel">Select Path</label>
            <div className="grid grid-cols-1 gap-3">
              {CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
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
        </div>

        {/* Right Column: Stats & Confirmation */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-cinzel">Fate Weaving</label>
              <span className={`text-sm font-bold font-cinzel ${pointsRemaining === 0 ? 'text-emerald-500' : 'text-amber-600'}`}>
                {pointsRemaining} Shards Remaining
              </span>
            </div>

            <div className={`space-y-4 ${getHighlightClass('stats')}`}>
              {(Object.keys(allocatedStats) as Array<keyof Stats>).map((stat) => {
                const finalVal = getFinalStat(stat);
                const isBonus = selectedClass.bonusStat === stat;
                
                return (
                  <div key={stat} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800">
                    <div className="flex items-center gap-3 w-28">
                       <span className={`font-bold font-cinzel ${isBonus ? 'text-amber-500' : 'text-slate-400'}`}>{stat}</span>
                       {isBonus && <span className="text-[10px] bg-amber-900/50 text-amber-500 px-1 rounded border border-amber-800 font-sans">+2</span>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleStatChange(stat, false)}
                        disabled={allocatedStats[stat] <= 0 || showTutorial}
                        className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-stone-300 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-xl font-cinzel">{finalVal}</span>
                      <button 
                        onClick={() => handleStatChange(stat, true)}
                        disabled={pointsRemaining <= 0 || showTutorial}
                        className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-stone-300 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-auto">
            <div className="bg-slate-900 p-4 rounded border border-slate-800 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500 font-cinzel">Health</span>
                <span className="text-lg font-bold text-red-400 font-cinzel">{selectedClass.baseHp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 font-cinzel">Mana</span>
                <span className="text-lg font-bold text-blue-400 font-cinzel">{selectedClass.baseMp}</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-slate-800">
                <span className="text-sm text-slate-500 font-cinzel">Willpower</span>
                <span className="text-lg font-bold text-amber-400 font-cinzel">{selectedClass.baseWill}</span>
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