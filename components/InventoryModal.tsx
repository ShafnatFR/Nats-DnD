import React, { useState } from 'react';
import { Item, Character } from '../types';
import { Sword, Shield, Bandage, Beef, Anvil, Gem, Ghost, Trash2, Hand, Droplets } from 'lucide-react';

interface InventoryModalProps {
  inventory: Item[];
  gold: number;
  onUse: (item: Item) => void;
  onDrop: (item: Item) => void;
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

const MAX_SLOTS = 20;

const InventoryModal: React.FC<InventoryModalProps> = ({ inventory, gold, onUse, onDrop }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Pad inventory with nulls to fill grid
  const slots = [...inventory];
  while (slots.length < MAX_SLOTS) {
    slots.push(null as any);
  }

  return (
    <div className="flex flex-col md:flex-row h-[500px] gap-6">
      
      {/* LEFT: Grid Container */}
      <div className="flex-1 flex flex-col">
        <div className="mb-2 flex justify-between items-end px-1">
           <h3 className="text-xs uppercase tracking-widest text-slate-500 font-cinzel">Satchel</h3>
           <span className="text-amber-500 font-mono text-sm">{gold} Gold</span>
        </div>
        
        <div className="flex-1 bg-slate-950 p-4 rounded border border-slate-800 grid grid-cols-4 gap-3 overflow-y-auto custom-scrollbar content-start">
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
      <div className="md:w-72 bg-slate-900 border border-amber-900/30 rounded p-5 flex flex-col relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(120,53,15,0.15),transparent_70%)] pointer-events-none"></div>

        {selectedItem ? (
          <>
            <div className="flex justify-center mb-6 mt-2 relative">
               <div className="w-20 h-20 bg-slate-950 rounded-full border border-amber-800 flex items-center justify-center shadow-inner">
                  {getIcon(selectedItem.icon, "w-10 h-10 text-amber-600")}
               </div>
               <div className="absolute -bottom-3 bg-slate-950 px-3 py-1 rounded border border-slate-800 text-[10px] uppercase tracking-widest text-slate-500">
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

            <div className="mt-auto space-y-3 relative z-10">
              {selectedItem.effect && (
                <div className="bg-slate-950/50 p-2 rounded border border-slate-800 text-xs text-center text-emerald-500 mb-2 space-y-1">
                  {selectedItem.effect.hpRestore && <div>Restores {selectedItem.effect.hpRestore} Health</div>}
                  {selectedItem.effect.willRestore && <div>Restores {selectedItem.effect.willRestore} Will</div>}
                  {selectedItem.effect.hungerRestore && <div>Sates {selectedItem.effect.hungerRestore} Hunger</div>}
                  {selectedItem.effect.thirstRestore && <div>Quenches {selectedItem.effect.thirstRestore} Thirst</div>}
                  {selectedItem.effect.warmthRestore && <div>Restores {selectedItem.effect.warmthRestore} Warmth</div>}
                </div>
              )}

              <button
                onClick={() => onUse(selectedItem)}
                disabled={selectedItem.type !== 'CONSUMABLE'}
                className="w-full py-2 bg-amber-900/40 border border-amber-700/50 text-amber-500 rounded hover:bg-amber-900/60 hover:text-amber-200 transition-all uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-amber-900/40 disabled:hover:text-amber-500"
              >
                <Hand size={14} /> Use Item
              </button>

              <button
                onClick={() => onDrop(selectedItem)}
                className="w-full py-2 bg-slate-950 border border-slate-800 text-slate-500 rounded hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 transition-all uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Discard
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-50">
             <div className="mb-4 p-4 border border-slate-700 rounded-full bg-slate-950">
                <Hand size={24} />
             </div>
             <p className="font-cinzel text-sm">Select an item to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryModal;