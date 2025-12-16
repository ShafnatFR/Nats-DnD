
import React from 'react';
import { ModalType, Character, Item, Companion, SurvivalStats, EquipSlot, Enemy, CombatPhase, Language } from '../types';
import { UI_TRANSLATIONS } from '../constants';
import { X } from 'lucide-react';
import InventoryModal from './InventoryModal';
import SkillModal from './SkillModal';
import MapModal from './MapModal';
import PartyModal from './PartyModal';
import SmithingModal from './SmithingModal';
import CombatModal from './CombatModal';
import ShopModal from './ShopModal';

interface ModalManagerProps {
  activeModal: ModalType;
  onClose: () => void;
  character: Character;
  language?: Language;
  onUseItem: (item: Item) => void;
  onDropItem: (item: Item) => void;
  onLearnSkill: (skillId: string) => void;
  onTravel: (nodeId: string) => void;
  onTalkNpc: (companion: Companion) => void;
  onDismissNpc: (companion: Companion) => void;
  // Dynamic props that might be passed from App
  onEquip?: (item: Item) => void;
  onUnequip?: (slot: EquipSlot) => void;
  onUpgrade?: (item: Item, materialId: string) => void;
  // Combat Props
  combatState?: {
     enemy: Enemy | null;
     log: string[];
     phase: CombatPhase;
  };
  onCombatAction?: {
     attack: () => void;
     skill: (name: string) => void;
     flee: () => void;
     victory: () => void;
     defeat: () => void;
  };
  // Shop Props
  shopProps?: {
     inventory: Item[];
     onBuy: (item: Item) => void;
     onSell: (item: Item) => void;
  };
}

const ModalManager: React.FC<ModalManagerProps> = ({ 
  activeModal, 
  onClose, 
  character, 
  language = 'EN',
  onUseItem, 
  onDropItem, 
  onLearnSkill,
  onTravel,
  onTalkNpc,
  onDismissNpc,
  onEquip,
  onUnequip,
  onUpgrade,
  combatState,
  onCombatAction,
  shopProps
}) => {
  const t = UI_TRANSLATIONS[language];
  if (activeModal === 'NONE') return null;

  // Combat Modal handles its own container style to be centered and focused
  if (activeModal === 'COMBAT' && combatState && combatState.enemy && onCombatAction) {
     return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
           <CombatModal 
              enemy={combatState.enemy}
              character={character}
              combatLog={combatState.log}
              phase={combatState.phase}
              onAttack={onCombatAction.attack}
              onSkill={onCombatAction.skill}
              onUseItem={onUseItem} // Re-use item logic for potions
              onFlee={onCombatAction.flee}
              onVictory={onCombatAction.victory}
              onDefeat={onCombatAction.defeat}
           />
        </div>
     );
  }

  const renderContent = () => {
    switch (activeModal) {
      case 'INVENTORY':
        return (
          <InventoryModal 
            inventory={character.inventory} 
            equipment={character.equipment}
            gold={character.gold}
            onUse={onUseItem}
            onDrop={onDropItem}
            onEquip={onEquip!}
            onUnequip={onUnequip!}
            language={language}
          />
        );
      
      case 'SKILLS':
        return (
          <SkillModal 
            character={character}
            onLearnSkill={onLearnSkill}
          />
        );

      case 'MAP':
         return (
           <MapModal 
             currentLocationId={character.currentLocationId}
             onTravel={onTravel}
             survival={character.survival}
           />
         );

      case 'PARTY':
         return (
           <PartyModal 
             party={character.party}
             onTalk={onTalkNpc}
             onDismiss={onDismissNpc}
           />
         );

      case 'SMITHING':
        return (
          <SmithingModal 
            character={character}
            onUpgrade={onUpgrade!}
          />
        );

      case 'SHOP':
         if (!shopProps) return null;
         return (
            <ShopModal 
               playerGold={character.gold}
               inventory={character.inventory}
               shopItems={shopProps.inventory}
               onBuy={shopProps.onBuy}
               onSell={shopProps.onSell}
               language={language}
            />
         );

      case 'CAMP':
         return (
            <div className="text-center py-8">
               <div className="mx-auto text-orange-600/50 mb-4 w-16 h-16 flex items-center justify-center animate-pulse">
                 🔥
               </div>
               <h3 className="text-2xl font-cinzel text-stone-300 mb-2">Respite</h3>
               <p className="text-slate-400 max-w-md mx-auto mb-6">
                  {language === 'EN' 
                    ? <span>Use the command <span className="text-amber-500 font-mono">"Rest"</span> or <span className="text-amber-500 font-mono">"Camp"</span> in the chat.</span>
                    : <span>Ketik perintah <span className="text-amber-500 font-mono">"Istirahat"</span> atau <span className="text-amber-500 font-mono">"Kemah"</span> di chat.</span>
                  }
               </p>
               <div className="text-xs text-slate-600 bg-slate-950 p-3 rounded border border-slate-800 mx-auto max-w-sm">
                  {language === 'EN' ? "Tip: Resting restores HP and Willpower, but allows time for enemies to move." : "Tips: Istirahat memulihkan HP dan Tekad, namun musuh dapat bergerak saat kamu tidur."}
               </div>
            </div>
         );

      default:
        return null;
    }
  };

  const getTitle = () => {
     switch(activeModal) {
        case 'INVENTORY': return t.modal_inventory;
        case 'SKILLS': return t.modal_skills;
        case 'MAP': return t.modal_map;
        case 'PARTY': return t.modal_party;
        case 'CAMP': return t.modal_camp;
        case 'SMITHING': return t.modal_forge;
        case 'SHOP': return t.modal_shop;
        default: return '';
     }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-amber-900/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-sm flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rotate-45 bg-amber-700"></div>
              <h2 className="text-2xl font-cinzel text-amber-600 tracking-wider uppercase font-bold">
                 {getTitle()}
              </h2>
           </div>
           <button 
              onClick={onClose}
              className="text-slate-500 hover:text-stone-200 transition-colors p-1 hover:bg-slate-800 rounded"
           >
              <X size={24} />
           </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
           {renderContent()}
        </div>

        {/* Footer Decoration */}
        <div className="h-2 bg-gradient-to-r from-slate-900 via-amber-900/20 to-slate-900 border-t border-slate-800"></div>
      </div>
    </div>
  );
};

export default ModalManager;
