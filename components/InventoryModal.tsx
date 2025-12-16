
import React, { useState } from 'react';
import { Item, EquipSlot, Language } from '../types';
import { Sword, Shield, Bandage, Beef, Anvil, Gem, Ghost, Trash2, Hand, Droplets, User, Shirt, Crown, X } from 'lucide-react';
import { UI_TRANSLATIONS } from '../constants';

interface InventoryModalProps {
  inventory: Item[];
  equipment: Record<EquipSlot, Item | null>;
  gold: number;
  onUse: (item: Item) => void;
  onDrop: (item: Item) => void;
  onEquip: (item: Item) => void;
  onUnequip: (slot: EquipSlot) => void;
  language?: Language;
}

// Helper to render dynamic icons based on string name
const getIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case 'sword': return <Sword className={className} />;
    case 'shield': return <Shield className={className} />;
    case 'bandage': return <Bandage className={className} />;
    case 'beef': return <Beef className={className} />;
    case 'droplets': return <Droplets className={className} />;
    case 'anvil': return <Anvil className={className} />;
    case 'gem': return <Gem className={className} />;
    default: return <Ghost className={className} />;
  }
};

const InventoryModal: React.FC<InventoryModalProps> = ({ inventory, equipment, gold, onUse, onDrop, onEquip, onUnequip, language = 'EN' }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const t = UI_TRANSLATIONS[language];

  const slots = [...inventory];
  while (slots.length < 20) {
    slots.push(null as any);
  }

  const renderEquipSlot = (slot: EquipSlot, label: string, icon: React.ReactNode) => {
    const item = equipment[slot];
    return (
      <div className="relative group">
         <div 
            onClick={() => item && setSelectedItem(item)}
            className={`w-16 h-16 rounded border flex items-center justify-center cursor-pointer transition-all duration-300 relative ${
               item 
                 ? 'bg-amber-900/20 border-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                 : 'bg-slate-900 border-slate-700 border-dashed hover:border-slate-500'
            }`}
         >
            {item ? (
               getIcon(item.icon, "w-8 h-8 text-stone-200")
            ) : (
               <div className="text-slate-700 opacity-50">{icon}</div>
            )}
            
            {/* Unequip Button */}
            {item && (
               <button 
                  onClick={(e) => { e.stopPropagation(); onUnequip(slot); }}
                  className="absolute -top-2 -right-2 bg-slate-950 border border-slate-600 rounded-full p-1 text-slate-400 hover:text-red-500 hover:border-red-500 transition-colors z-10"
                  title="Unequip"
               >
                  <X size={10} />
               </button>
            )}
         </div>
         <div className="text-center text-[10px] uppercase tracking-wider text-slate-500 mt-1 font-bold">{label}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-[600px] gap-6">
      
      {/* LEFT: Equipment Paper Doll */}
      <div className="w-full lg:w-1/3 flex flex-col items-center bg-slate-950/50 p-4 rounded border border-slate-800">
         <h3 className="text-xs uppercase tracking-widest text-slate-500 font-cinzel mb-6 flex items-center gap-2">
            <User size={14} /> Equipment
         </h3>
         
         <div className="relative flex flex-col items-center gap-4 w-full max-w-[200px]">
            {/* Head */}
            {renderEquipSlot('HEAD', 'Head', <Crown size={24} />)}

            <div className="flex justify-between w-full gap-4">
               {/* Main Hand */}
               {renderEquipSlot('MAIN_HAND', 'Main Hand', <Sword size={24} />)}
               
               {/* Body (Center) */}
               {renderEquipSlot('BODY', 'Torso', <Shirt size={24} />)}

               {/* Off Hand */}
               {renderEquipSlot('OFF_HAND', 'Off Hand', <Shield size={24} />)}
            </div>

            {/* Accessory */}
            {renderEquipSlot('ACCESSORY', 'Relic', <Gem size={24} />)}
         </div>
      </div>

      {/* MIDDLE: Inventory Grid */}
      <div className="flex-1 flex flex-col">
        <div className="mb-2 flex justify-between items-end px-1">
           <h3 className="text-xs uppercase tracking-widest text-slate-500 font-cinzel">{t.stats_bag}</h3>
           <span className="text-amber-500 font-mono text-sm">{gold} Gold</span>
        </div>
        
        <div className="flex-1 bg-slate-950 p-4 rounded border border-slate-800 grid grid-cols-4 sm:grid-cols-5 gap-3 overflow-y-auto custom-scrollbar content-start">
          {slots.map((item, index) => (
            <div 
              key={index}
              onClick={() => item && setSelectedItem(item)}
              className={`aspect-square rounded border relative flex items-center justify-center cursor-pointer transition-all duration-200 group ${
                item 
                  ? selectedItem?.id === item.id 
                    ? 'bg-amber-900/20 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                    : 'bg-slate-900 border-slate-700 hover:border-amber-700 hover:bg-slate-800'
                  : 'bg-slate-900/30 border-slate-800/50 border-dashed pointer-events-none'
              }`}
            >
              {item && (
                <>
                  <div className="text-stone-300 opacity-90 group-hover:scale-110 transition-transform">
                    {getIcon(item.icon, "w-8 h-8")}
                  </div>
                  {item.quantity > 1 && (
                    <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-slate-950 text-stone-300 px-1 rounded border border-slate-700">
                      x{item.quantity}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Detail Panel */}
      <div className="lg:w-72 bg-slate-900 border border-amber-900/30 rounded p-5 flex flex-col relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(120,53,15,0.15),transparent_70%)] pointer-events-none"></div>

        {selectedItem ? (
          <>
            <div className="flex justify-center mb-6 mt-2 relative">
               <div className="w-20 h-20 bg-slate-950 rounded-full border border-amber-800 flex items-center justify-center shadow-inner">
                  {getIcon(selectedItem.icon, "w-10 h-10 text-amber-600")}
               </div>
               <div className="absolute -bottom-3 bg-slate-950 px-3 py-1 rounded border border-slate-800 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                 {selectedItem.type}
               </div>
            </div>

            <h2 className="text-xl font-cinzel text-center font-bold text-stone-200 mb-2 leading-tight">
              {selectedItem.name}
            </h2>
            
            <div className="h-px w-1/2 bg-gradient-to-r from-transparent via-amber-900/50 to-transparent mx-auto mb-4"></div>

            <p className="text-sm font-crimson text-stone-400 italic mb-6 text-center leading-relaxed">
              "{selectedItem.description}"
            </p>

            {/* Stat Modifiers Display */}
            {selectedItem.equipProps?.modifiers && (
               <div className="mb-4 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Effects</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                     {Object.entries(selectedItem.equipProps.modifiers).map(([stat, val]) => (
                        <span key={stat} className={`px-2 py-0.5 rounded text-xs font-bold border ${
                           ((val as number) || 0) > 0 ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' : 'bg-red-900/30 text-red-400 border-red-900'
                        }`}>
                           {stat} {((val as number) || 0) > 0 ? '+' : ''}{val as number}
                        </span>
                     ))}
                  </div>
               </div>
            )}

            <div className="mt-auto space-y-3 relative z-10">
              {/* Context Action Button */}
              {selectedItem.equipProps ? (
                 <button
                   onClick={() => onEquip(selectedItem)}
                   className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-stone-100 rounded transition-all uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                 >
                   <Sword size={14} /> {t.btn_equip}
                 </button>
              ) : selectedItem.type === 'CONSUMABLE' ? (
                 <button
                   onClick={() => onUse(selectedItem)}
                   className="w-full py-2 bg-amber-900/40 border border-amber-700/50 text-amber-500 rounded hover:bg-amber-900/60 transition-all uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2"
                 >
                   <Hand size={14} /> {t.btn_use}
                 </button>
              ) : null}

              <button
                onClick={() => onDrop(selectedItem)}
                className="w-full py-2 bg-slate-950 border border-slate-800 text-slate-500 rounded hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 transition-all uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> {t.btn_discard}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-50">
             <div className="mb-4 p-4 border border-slate-700 rounded-full bg-slate-950">
                <Hand size={24} />
             </div>
             <p className="font-cinzel text-sm">Select an item</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryModal;
