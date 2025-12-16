
import React from 'react';
import { Backpack, Scroll, Map, Users, Tent, Trash2, Hammer, Store, Globe } from 'lucide-react';
import { ModalType, Language } from '../types';
import { UI_TRANSLATIONS } from '../constants';

interface GameDockProps {
  activeModal: ModalType;
  setActiveModal: (type: ModalType) => void;
  language: Language;
  onResetGame: () => void;
  isShopAvailable: boolean;
  onToggleLanguage: () => void;
}

const GameDock: React.FC<GameDockProps> = ({ activeModal, setActiveModal, language, onResetGame, isShopAvailable, onToggleLanguage }) => {
  const t = UI_TRANSLATIONS[language];

  const DOCK_ITEMS: { id: ModalType; icon: React.ReactNode; label: string; hidden?: boolean }[] = [
    { id: 'INVENTORY', icon: <Backpack size={20} />, label: t.dock_bag },
    { id: 'SKILLS', icon: <Scroll size={20} />, label: t.dock_skills },
    { id: 'SMITHING', icon: <Hammer size={20} />, label: t.dock_forge },
    { id: 'SHOP', icon: <Store size={20} />, label: t.dock_shop },
    { id: 'MAP', icon: <Map size={20} />, label: t.dock_world },
    { id: 'PARTY', icon: <Users size={20} />, label: t.dock_party },
    { id: 'CAMP', icon: <Tent size={20} />, label: t.dock_rest },
  ];

  const handleToggle = (id: ModalType) => {
    if (activeModal === id) {
      setActiveModal('NONE');
    } else {
      setActiveModal(id);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-t border-b border-slate-800 flex items-center justify-center px-4 py-2 z-30">
      <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar w-full max-w-2xl justify-between md:justify-center">
        
        {DOCK_ITEMS.map((item) => {
          if (item.id === 'SHOP' && !isShopAvailable) return null;

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

        {/* Separator */}
        <div className="h-8 w-px bg-slate-800 mx-2"></div>

        {/* Language Switcher */}
        <button
          onClick={onToggleLanguage}
          className="flex flex-col items-center justify-center min-w-[50px] p-2 rounded text-slate-500 hover:text-stone-300 hover:bg-slate-800/50 transition-all"
        >
          <div className="mb-1">
            <Globe size={18} />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-cinzel font-bold text-slate-600">
            {language}
          </span>
        </button>

        {/* Reset */}
        <button
          onClick={onResetGame}
          className="flex flex-col items-center justify-center min-w-[50px] p-2 rounded text-red-900/60 hover:text-red-500 hover:bg-red-950/30 transition-all"
        >
          <div className="mb-1">
            <Trash2 size={18} />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-cinzel font-bold text-red-900/60 hover:text-red-500">
            {t.dock_reset}
          </span>
        </button>

      </div>
    </div>
  );
};

export default GameDock;
