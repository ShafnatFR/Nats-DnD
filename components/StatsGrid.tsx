import React from 'react';
import { Stats } from '../types';

interface StatsGridProps {
  stats: Stats;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {Object.entries(stats).map(([key, value]) => (
        <div 
          key={key} 
          className="bg-slate-900 border border-slate-700 p-2 rounded flex flex-col items-center hover:border-amber-600/50 transition-colors"
        >
          <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">{key}</span>
          <span className="text-xl font-bold text-stone-200 font-mono">{value}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;