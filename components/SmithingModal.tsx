
import React, { useState } from 'react';
import { Item, Character, Stats } from '../types';
import { GET_UPGRADE_COST } from '../constants';
import { Hammer, Flame, ArrowRight, Anvil, AlertTriangle, CheckCircle, Shield, Sword } from 'lucide-react';

interface SmithingModalProps {
  character: Character;
  onUpgrade: (item: Item, materialId: string) => void;
}

const SmithingModal: React.FC<SmithingModalProps> = ({ character, onUpgrade }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isForging, setIsForging] = useState(false);

  // Filter items that can be upgraded (must have equipProps and maxUpgradeLevel)
  const upgradeableItems = [
    ...Object.values(character.equipment).filter(i => i !== null),
    ...character.inventory.filter(i => i.equipProps && i.maxUpgradeLevel)
  ] as Item[];

  const currentLevel = selectedItem?.upgradeLevel || 0;
  const maxLevel = selectedItem?.maxUpgradeLevel || 5;
  const cost = selectedItem ? GET_UPGRADE_COST(selectedItem.type, currentLevel) : null;

  // Check if player has materials
  const playerMaterial = character.inventory.find(i => i.id === cost?.materialId);
  const playerMaterialCount = playerMaterial ? playerMaterial.quantity : 0;
  const hasEnoughMaterials = cost ? playerMaterialCount >= cost.count : false;
  const hasEnoughGold = cost ? character.gold >= cost.goldCost : false;
  const isMaxLevel = currentLevel >= maxLevel;

  const handleForge = () => {
    if (selectedItem && hasEnoughMaterials && hasEnoughGold && !isMaxLevel) {
      setIsForging(true);
      setTimeout(() => {
        onUpgrade(selectedItem, cost!.materialId);
        setIsForging(false);
      }, 1500); // Animation delay
    }
  };

  const getStatDiff = (stat: keyof Stats) => {
    const current = selectedItem?.equipProps?.modifiers?.[stat] || 0;
    const growth = cost?.statGrowth?.[stat] || 0;
    return (
      <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
        <span className="text-slate-500 uppercase">{stat}</span>
        <div className="flex items-center gap-2">
          <span className="text-stone-300 font-mono">{current}</span>
          {growth > 0 && (
             <>
               <ArrowRight size={10} className="text-slate-600" />
               <span className="text-emerald-400 font-bold font-mono">{current + growth}</span>
             </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-[550px] gap-6">
      
      {/* Left: Item List */}
      <div className="w-full lg:w-1/3 bg-slate-950/50 rounded border border-slate-800 flex flex-col overflow-hidden">
         <div className="p-3 bg-slate-900 border-b border-slate-800 font-cinzel text-xs text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Anvil size={14} /> Forgeable Items
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {upgradeableItems.length === 0 && (
               <div className="text-center text-slate-600 italic p-4 text-sm">No items to upgrade.</div>
            )}
            {upgradeableItems.map((item, idx) => (
               <button 
                  key={`${item.id}-${idx}`}
                  onClick={() => !isForging && setSelectedItem(item)}
                  className={`w-full text-left p-3 rounded border transition-all flex items-center gap-3 ${
                     selectedItem?.id === item.id 
                       ? 'bg-amber-900/20 border-amber-600' 
                       : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                  } ${isForging ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                  <div className={`p-2 rounded ${selectedItem?.id === item.id ? 'bg-amber-900/40 text-amber-500' : 'bg-slate-950 text-slate-500'}`}>
                     {item.type === 'WEAPON' ? <Sword size={16} /> : <Shield size={16} />}
                  </div>
                  <div className="flex-1">
                     <div className={`font-cinzel text-sm font-bold ${selectedItem?.id === item.id ? 'text-stone-200' : 'text-stone-400'}`}>
                        {item.name}
                     </div>
                     <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">{item.type}</span>
                        <span className="text-[10px] text-amber-600 font-mono">+{item.upgradeLevel || 0}</span>
                     </div>
                  </div>
               </button>
            ))}
         </div>
      </div>

      {/* Center: The Anvil */}
      <div className="flex-1 bg-slate-900 border border-amber-900/30 rounded flex flex-col relative overflow-hidden">
         {/* Background Effects */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(124,45,18,0.15),transparent_70%)] pointer-events-none"></div>
         
         {selectedItem ? (
            <div className="flex flex-col h-full p-6 items-center z-10">
               
               {/* Item Header */}
               <div className="text-center mb-8">
                  <h2 className="text-2xl font-cinzel font-bold text-stone-200 mb-1">{selectedItem.name}</h2>
                  <div className="flex items-center justify-center gap-2 text-sm text-amber-600 font-mono">
                     <span>Current: +{currentLevel}</span>
                     {!isMaxLevel && <ArrowRight size={14} />}
                     {!isMaxLevel && <span className="font-bold">Next: +{currentLevel + 1}</span>}
                  </div>
               </div>

               {/* Central Animation Area */}
               <div className="relative mb-8">
                  <div className={`w-32 h-32 bg-slate-950 rounded-full border-2 border-amber-900/50 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-500 ${isForging ? 'scale-110 border-amber-500 shadow-[0_0_50px_rgba(234,88,12,0.6)]' : ''}`}>
                      <Hammer size={48} className={`text-stone-500 ${isForging ? 'animate-bounce text-amber-200' : ''}`} />
                  </div>
                  {isForging && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Flame size={64} className="text-orange-500 animate-pulse opacity-80" />
                     </div>
                  )}
               </div>

               {/* Requirements / Stats */}
               {!isMaxLevel && cost ? (
                  <div className="w-full max-w-sm space-y-4">
                     
                     {/* Cost Row */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className={`p-2 rounded border flex flex-col items-center ${hasEnoughMaterials ? 'bg-slate-950 border-slate-700' : 'bg-red-950/20 border-red-900'}`}>
                           <span className="text-[10px] text-slate-500 uppercase">Material</span>
                           <div className="font-bold text-stone-300 text-sm mt-1">{playerMaterial?.name || "Unknown Material"}</div>
                           <div className={`text-xs font-mono mt-1 ${hasEnoughMaterials ? 'text-emerald-500' : 'text-red-500'}`}>
                              {playerMaterialCount} / {cost.count}
                           </div>
                        </div>
                        <div className={`p-2 rounded border flex flex-col items-center ${hasEnoughGold ? 'bg-slate-950 border-slate-700' : 'bg-red-950/20 border-red-900'}`}>
                           <span className="text-[10px] text-slate-500 uppercase">Cost</span>
                           <div className="font-bold text-amber-500 text-sm mt-1">{cost.goldCost} Gold</div>
                           <div className={`text-xs font-mono mt-1 ${hasEnoughGold ? 'text-emerald-500' : 'text-red-500'}`}>
                              {character.gold >= cost.goldCost ? 'Affordable' : 'Too Expensive'}
                           </div>
                        </div>
                     </div>

                     {/* Stats Preview */}
                     <div className="bg-slate-950/50 p-3 rounded border border-slate-800 space-y-2">
                        {selectedItem.equipProps?.modifiers && Object.keys(selectedItem.equipProps.modifiers).map((stat) => (
                           getStatDiff(stat as keyof Stats)
                        ))}
                     </div>

                     {/* Success Rate */}
                     <div className="flex items-center justify-center gap-2 text-xs font-mono">
                        <span className="text-slate-500">Success Rate:</span>
                        <span className={`${cost.successRate > 0.7 ? 'text-emerald-500' : cost.successRate > 0.4 ? 'text-amber-500' : 'text-red-500'}`}>
                           {Math.floor(cost.successRate * 100)}%
                        </span>
                     </div>

                     <button
                        onClick={handleForge}
                        disabled={!hasEnoughMaterials || !hasEnoughGold || isForging}
                        className="w-full py-4 bg-orange-800 hover:bg-orange-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-cinzel font-bold text-lg rounded shadow-lg uppercase tracking-widest transition-all relative overflow-hidden group"
                     >
                        {isForging ? (
                           <span className="animate-pulse">Forging...</span>
                        ) : (
                           <span className="flex items-center justify-center gap-2">
                              <Flame size={18} className="group-hover:animate-pulse" /> Forge
                           </span>
                        )}
                     </button>
                  </div>
               ) : (
                  <div className="text-center p-8 border border-amber-500/30 bg-amber-900/10 rounded">
                     <CheckCircle size={32} className="mx-auto text-amber-500 mb-2" />
                     <h3 className="text-amber-500 font-cinzel font-bold">Max Level Reached</h3>
                     <p className="text-slate-400 text-sm mt-2">This item has been honed to perfection.</p>
                  </div>
               )}

            </div>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-50">
               <Anvil size={64} className="mb-4" />
               <p className="font-cinzel">Select an item to place on the anvil</p>
            </div>
         )}
      </div>

    </div>
  );
};

export default SmithingModal;
