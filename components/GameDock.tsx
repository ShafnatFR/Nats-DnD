import React from 'react';
import { Backpack, Scroll, Map, Users, Tent, Sparkles } from 'lucide-react';
import { ModalType } from '../types';

interface GameDockProps {
  activeModal: ModalType;
  setActiveModal: (type: ModalType) => void;
}

const DOCK_ITEMS: { id: ModalType; icon: React.ReactNode; label: string }[] = [
  { id: 'INVENTORY', icon: <Backpack size={20} />, label: 'Bag' },
  { id: 'SKILLS', icon: <Scroll size={20} />, label: 'Skills' },
  { id: 'MAP', icon: <Map size={20} />, label: 'World' },
  { id: 'PARTY', icon: <Users size={20} />, label: 'Party' },
  { id: 'CAMP', icon: <Tent size={20} />, label: 'Rest' },
];

const GameDock: React.FC<GameDockProps> = ({ activeModal, setActiveModal }) => {
  const handleToggle = (id: ModalType) => {
    if (activeModal === id) {
      setActiveModal('NONE');
    } else {
      setActiveModal(id);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-t border-b border-slate-800 flex items-center justify-center px-4 py-2 z-30">
      <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar w-full max-w-lg justify-between md:justify-center">
        {DOCK_ITEMS.map((item) => {
          const isActive = activeModal === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded transition-all duration-300 group ${
                isActive 
                  ? 'bg-amber-900/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'text-slate-500 hover:text-stone-300 hover:bg-slate-800/50'
              }`}
            >
              <div className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-cinzel font-bold ${
                isActive ? 'text-amber-600' : 'text-slate-600 group-hover:text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GameDock;