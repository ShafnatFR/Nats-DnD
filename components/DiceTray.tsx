import React, { useState } from 'react';
import { Hexagon } from 'lucide-react';

interface DiceTrayProps {
  onRoll: () => void;
  lastResult: number | null;
}

const DiceTray: React.FC<DiceTrayProps> = ({ onRoll, lastResult }) => {
  const [isRolling, setIsRolling] = useState(false);

  const handleClick = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    
    // Animation duration
    setTimeout(() => {
      onRoll();
      setIsRolling(false);
    }, 600);
  };

  return (
    <div className="mt-auto pt-6 border-t border-slate-800">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Dice Tray</h3>
      
      <div className="flex items-center justify-between">
        <button
          onClick={handleClick}
          disabled={isRolling}
          className="group relative flex items-center justify-center w-20 h-20 transition-transform active:scale-95 focus:outline-none"
        >
          <Hexagon 
            className={`w-full h-full text-slate-800 fill-slate-900 stroke-[1.5] group-hover:text-slate-700 transition-colors ${isRolling ? 'animate-spin' : ''}`} 
          />
          <span className="absolute inset-0 flex items-center justify-center text-amber-600 font-bold text-lg select-none group-hover:text-amber-500">
            D20
          </span>
        </button>

        <div className="flex-1 pl-6">
          <div className="text-right">
            <span className="block text-xs text-slate-500 mb-1">Last Roll</span>
            {lastResult ? (
              <span className={`text-4xl font-bold font-mono animate-bounce ${
                lastResult === 20 ? 'text-amber-500 text-shadow-glow' : 
                lastResult === 1 ? 'text-red-500' : 'text-stone-200'
              }`}>
                {lastResult}
              </span>
            ) : (
              <span className="text-slate-700 text-xl font-mono">--</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceTray;