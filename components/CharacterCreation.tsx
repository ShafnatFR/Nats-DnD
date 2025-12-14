import React, { useState } from 'react';
import { Character, CharacterClassDef, Stats } from '../types';
import { CLASSES } from '../constants';
import { Shield, Zap, Sword, Brain, Activity, User, ChevronRight, CheckCircle2, X, HelpCircle, ArrowRight } from 'lucide-react';

interface CharacterCreationProps {
  onCreate: (character: Character) => void;
}

const TOTAL_POINTS = 10;
const BASE_STAT = 10;

const TUTORIAL_STEPS = [
  { 
    target: 'intro', 
    title: "System Initialization", 
    text: "Welcome to the AI Realm. You must configure your avatar before entering the simulation." 
  },
  { 
    target: 'identity', 
    title: "Subject Identity", 
    text: "Enter a unique identifier. This alias will be used in all simulation logs and interactions." 
  },
  { 
    target: 'class', 
    title: "Class Protocol", 
    text: "Select an archetype. Your choice determines starting HP, MP, and grants a unique attribute bonus." 
  },
  { 
    target: 'stats', 
    title: "Attribute Allocation", 
    text: "Distribute 10 Power Points across STR, DEX, INT, and CHA. Balance your build carefully." 
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
      stats: finalStats
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 font-['Courier_Prime']">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row rounded-sm relative">
        
        {/* Tutorial Backdrop & Overlay */}
        {showTutorial && (
          <>
            <div className="absolute inset-0 bg-slate-950/80 z-40 backdrop-blur-[2px] transition-all" />
            
            <div className="absolute bottom-6 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none">
              <div className="bg-slate-900 border border-amber-600 p-5 rounded shadow-2xl max-w-lg w-full pointer-events-auto animate-fade-in">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <HelpCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Tutorial {tutorialStep + 1}/{TUTORIAL_STEPS.length}
                    </span>
                  </div>
                  <button onClick={() => setShowTutorial(false)} className="text-slate-500 hover:text-stone-200">
                    <X size={16} />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-stone-100 mb-1">{currentTutorial.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{currentTutorial.text}</p>
                
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setShowTutorial(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-stone-300 uppercase tracking-wider"
                  >
                    Skip
                  </button>
                  <button 
                    onClick={handleNextStep}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1"
                  >
                    {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
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
            <h1 className="text-2xl font-bold text-amber-600 mb-2 flex items-center gap-2">
              <Activity className="w-6 h-6" /> 
              INITIALIZE_AVATAR
            </h1>
            <p className="text-stone-400 text-sm">Configure your digital vessel for entry into the Realm.</p>
          </div>

          <div className={`mb-6 ${getHighlightClass('identity')}`}>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Subject Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name..."
                className="w-full bg-slate-900 border border-slate-700 text-stone-200 pl-10 pr-4 py-3 rounded focus:border-amber-600 focus:ring-1 focus:ring-amber-600/50 focus:outline-none transition-all placeholder:text-slate-700"
                disabled={showTutorial} 
              />
            </div>
          </div>

          <div className={getHighlightClass('class')}>
            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-3">Select Class Protocol</label>
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
                  <div className={`p-2 rounded mr-4 ${selectedClass.id === cls.id ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                    {cls.id === 'warrior' && <Sword size={18} />}
                    {cls.id === 'mage' && <Zap size={18} />}
                    {cls.id === 'rogue' && <CheckCircle2 size={18} />}
                    {cls.id === 'diplomat' && <Brain size={18} />}
                  </div>
                  <div>
                    <div className={`font-bold ${selectedClass.id === cls.id ? 'text-amber-500' : 'text-stone-300'}`}>
                      {cls.name}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1">{cls.description}</div>
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
              <label className="text-xs uppercase tracking-widest text-slate-500">Attribute Allocation</label>
              <span className={`text-sm font-bold ${pointsRemaining === 0 ? 'text-emerald-500' : 'text-amber-600'}`}>
                {pointsRemaining} PTS REMAINING
              </span>
            </div>

            <div className={`space-y-4 ${getHighlightClass('stats')}`}>
              {(Object.keys(allocatedStats) as Array<keyof Stats>).map((stat) => {
                const finalVal = getFinalStat(stat);
                const isBonus = selectedClass.bonusStat === stat;
                
                return (
                  <div key={stat} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800">
                    <div className="flex items-center gap-3 w-24">
                       <span className={`font-bold ${isBonus ? 'text-amber-500' : 'text-slate-400'}`}>{stat}</span>
                       {isBonus && <span className="text-[10px] bg-amber-900/50 text-amber-500 px-1 rounded border border-amber-800">+2</span>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleStatChange(stat, false)}
                        disabled={allocatedStats[stat] <= 0 || showTutorial}
                        className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-stone-300 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-xl">{finalVal}</span>
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
                <span className="text-sm text-slate-500">Est. HP</span>
                <span className="text-sm font-bold text-red-400">{selectedClass.baseHp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Est. MP</span>
                <span className="text-sm font-bold text-blue-400">{selectedClass.baseMp}</span>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={!name.trim() || pointsRemaining > 0 || showTutorial}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-600"
            >
              <span>ENTER REALM</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;