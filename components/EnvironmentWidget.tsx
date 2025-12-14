import React from 'react';
import { EnvironmentState } from '../types';
import { getTimeIcon, getWeatherIcon, getTimeLabel, getWeatherLabel } from '../utils/environmentUtils';
import { MapPin } from 'lucide-react';

interface EnvironmentWidgetProps {
  env: EnvironmentState;
}

const EnvironmentWidget: React.FC<EnvironmentWidgetProps> = ({ env }) => {
  const isHazardous = env.weather === 'STORM' || env.weather === 'ASHFALL';

  return (
    <div className="relative w-full z-20 pointer-events-none select-none">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/90 to-transparent h-32"></div>
      
      <div className="relative pt-6 pb-4 px-4 flex flex-col items-center justify-center text-center">
        
        {/* Top Decoration Line */}
        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-amber-900/40 to-transparent mb-2"></div>
        
        {/* Location Name */}
        <h2 className="text-xl md:text-2xl font-cinzel font-bold tracking-[0.15em] text-stone-200 uppercase drop-shadow-md flex items-center gap-2">
          <MapPin size={14} className="text-amber-700 opacity-60" />
          {env.locationName}
          <MapPin size={14} className="text-amber-700 opacity-60" />
        </h2>

        {/* Info Row */}
        <div className="flex items-center gap-6 mt-1 text-sm font-crimson text-stone-400">
          
          {/* Time */}
          <div className="flex items-center gap-2">
            {getTimeIcon(env.time, "w-4 h-4")}
            <span className="tracking-wide uppercase text-xs">{getTimeLabel(env.time)}</span>
          </div>

          <span className="text-amber-900/40">•</span>

          {/* Weather */}
          <div className={`flex items-center gap-2 ${isHazardous ? 'text-amber-500/80' : ''}`}>
            {getWeatherIcon(env.weather, "w-4 h-4")}
            <span className="tracking-wide uppercase text-xs">{getWeatherLabel(env.weather)}</span>
          </div>
        </div>

        {/* Turn Counter (Subtle) */}
        <div className="absolute top-4 right-4 md:right-8 opacity-20 font-mono text-[10px] text-amber-500">
          Turn: {env.turnCount}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentWidget;