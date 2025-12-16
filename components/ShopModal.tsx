
import React from 'react';
import { Item, Language } from '../types';
import { Coins, ShoppingBag, ArrowLeft, ArrowRight, Wallet } from 'lucide-react';
import { UI_TRANSLATIONS } from '../constants';

interface ShopModalProps {
  playerGold: number;
  inventory: Item[];
  shopItems: Item[];
  onBuy: (item: Item) => void;
  onSell: (item: Item) => void;
  language?: Language;
}

const ShopModal: React.FC<ShopModalProps> = ({ playerGold, inventory, shopItems, onBuy, onSell, language = 'EN' }) => {
  const t = UI_TRANSLATIONS[language];
  
  return (
    <div className="flex flex-col lg:flex-row h-[600px] gap-6 bg-slate-950 p-2">
      
      {/* LEFT: Merchant */}
      <div className="flex-1 bg-amber-950/20 border border-amber-900/50 rounded flex flex-col overflow-hidden">
         <div className="p-4 bg-amber-950/40 border-b border-amber-900/50 flex justify-between items-center">
            <h3 className="text-amber-500 font-cinzel font-bold flex items-center gap-2">
               <ShoppingBag size={18} /> Merchant's Wares
            </h3>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            {shopItems.map((item, idx) => (
               <div key={`${item.id}-${idx}`} className="bg-slate-900/80 border border-slate-800 p-3 rounded flex justify-between items-center group hover:border-amber-700 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-950 rounded flex items-center justify-center text-stone-400">
                        {/* Simple placeholder icon if logic not passed, but we can assume generic shape */}
                        <div className="w-6 h-6 bg-stone-700/50 rounded-full" />
                     </div>
                     <div>
                        <div className="font-cinzel text-stone-200 font-bold text-sm">{item.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{item.type}</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-amber-500 font-mono font-bold text-sm mb-1">{item.price} G</div>
                     <button 
                        onClick={() => onBuy(item)}
                        disabled={playerGold < item.price}
                        className="px-3 py-1 bg-amber-800 hover:bg-amber-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-stone-100 text-xs uppercase font-bold rounded flex items-center gap-1 transition-colors"
                     >
                        {t.btn_buy} <ArrowLeft size={10} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* MIDDLE: Wallet Visual */}
      <div className="flex flex-col items-center justify-center gap-2 text-amber-500">
         <div className="w-px h-full bg-slate-800 hidden lg:block"></div>
         <div className="bg-slate-900 p-4 rounded-full border border-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.2)] z-10 flex flex-col items-center justify-center w-24 h-24 shrink-0">
            <Coins size={24} className="mb-1" />
            <span className="font-mono font-bold text-lg text-white">{playerGold}</span>
            <span className="text-[10px] uppercase tracking-widest text-amber-600">Gold</span>
         </div>
         <div className="w-px h-full bg-slate-800 hidden lg:block"></div>
      </div>

      {/* RIGHT: Player */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded flex flex-col overflow-hidden">
         <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-stone-400 font-cinzel font-bold flex items-center gap-2">
               <Wallet size={18} /> Your Satchel
            </h3>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            {inventory.length === 0 && (
               <div className="text-center text-slate-600 italic mt-10">{t.msg_empty_bag}</div>
            )}
            {inventory.map((item, idx) => (
               <div key={`${item.id}-${idx}-sell`} className="bg-slate-950 border border-slate-800 p-3 rounded flex justify-between items-center hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-stone-500">
                        <div className="w-6 h-6 bg-stone-800/50 rounded-full" />
                     </div>
                     <div>
                        <div className="font-cinzel text-stone-300 font-bold text-sm">{item.name}</div>
                        <div className="text-[10px] text-slate-500">x{item.quantity}</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-stone-400 font-mono font-bold text-sm mb-1">{Math.floor(item.price / 2)} G</div>
                     <button 
                        onClick={() => onSell(item)}
                        className="px-3 py-1 bg-slate-800 hover:bg-emerald-900/50 hover:text-emerald-400 border border-slate-700 hover:border-emerald-800 text-stone-400 text-xs uppercase font-bold rounded flex items-center gap-1 transition-colors ml-auto"
                     >
                        <ArrowRight size={10} /> {t.btn_sell}
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default ShopModal;
