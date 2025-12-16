import React from 'react';
import { Companion, Language } from '../types';
import { User, MessageSquare, UserMinus, Heart, Shield } from 'lucide-react';
import { getLocName, getLocDesc } from '../utils/textUtils';

interface PartyModalProps {
  party: Companion[];
  onTalk: (companion: Companion) => void;
  onDismiss: (companion: Companion) => void;
  language?: Language;
}

const PartyModal: React.FC<PartyModalProps> = ({ party, onTalk, onDismiss, language = 'EN' }) => {
  if (party.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 mb-4">
          <User size={32} className="opacity-50" />
        </div>
        <h3 className="text-xl font-cinzel text-stone-400 mb-2">You Walk Alone</h3>
        <p className="text-sm italic max-w-xs text-center font-crimson">
          "The path of the struggler is solitary... for now."
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
       <div className="mb-4 text-xs text-slate-500 uppercase tracking-widest font-cinzel text-center border-b border-slate-800 pb-2">
         Companions ({party.length}/4)
       </div>

       <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar p-1">
          {party.map(companion => (
            <div key={companion.id} className="bg-slate-900/50 border border-slate-800 rounded p-4 flex gap-4 transition-colors hover:border-slate-700">
               <div className={`w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-slate-700 shadow-lg ${companion.avatarColor || 'bg-slate-700'}`}>
                  <span className="font-cinzel font-bold text-2xl text-white drop-shadow-md">
                    {companion.name.charAt(0)}
                  </span>
               </div>

               <div className="flex-1">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="font-bold text-lg text-stone-200 font-cinzel leading-none">{companion.name}</h4>
                        <span className="text-xs text-amber-600 uppercase tracking-wider">{companion.class}</span>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => onTalk(companion)} className="p-2 bg-slate-800 rounded hover:bg-amber-900/40 text-stone-400 hover:text-amber-500 transition-colors">
                           <MessageSquare size={16} />
                        </button>
                        <button onClick={() => onDismiss(companion)} className="p-2 bg-slate-800 rounded hover:bg-red-900/40 text-stone-400 hover:text-red-500 transition-colors">
                           <UserMinus size={16} />
                        </button>
                     </div>
                  </div>

                  <div className="mt-3 space-y-2">
                     <div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-0.5 uppercase">
                           <span className="flex items-center gap-1"><Heart size={10} /> HP</span>
                           <span>{companion.hp}/{companion.maxHp}</span>
                        </div>
                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                           <div className="h-full bg-red-800" style={{ width: `${(companion.hp / companion.maxHp) * 100}%` }}></div>
                        </div>
                     </div>
                  </div>
                  
                  <p className="mt-3 text-xs text-stone-500 italic font-crimson border-t border-slate-800/50 pt-2">
                     "{getLocDesc(companion, language as Language)}"
                  </p>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

export default PartyModal;