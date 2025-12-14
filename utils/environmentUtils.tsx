import React from 'react';
import { TimeOfDay, WeatherType } from '../types';
import { Sun, Moon, Sunrise, Sunset, CloudRain, CloudLightning, Snowflake, Wind, CloudFog, Cloud } from 'lucide-react';

export const getTimeIcon = (time: TimeOfDay, className: string = "w-5 h-5") => {
  switch (time) {
    case 'DAWN': return <Sunrise className={`${className} text-orange-300`} />;
    case 'DAY': return <Sun className={`${className} text-amber-500`} />;
    case 'DUSK': return <Sunset className={`${className} text-purple-400`} />;
    case 'NIGHT': return <Moon className={`${className} text-slate-400`} />;
    default: return <Sun className={className} />;
  }
};

export const getWeatherIcon = (weather: WeatherType, className: string = "w-5 h-5") => {
  switch (weather) {
    case 'CLEAR': return <Sun className={`${className} text-amber-200`} />;
    case 'RAIN': return <CloudRain className={`${className} text-blue-400`} />;
    case 'STORM': return <CloudLightning className={`${className} text-yellow-400 animate-pulse`} />;
    case 'SNOW': return <Snowflake className={`${className} text-white`} />;
    case 'ASHFALL': return <Wind className={`${className} text-stone-500`} />;
    case 'FOG': return <CloudFog className={`${className} text-slate-400`} />;
    default: return <Cloud className={className} />;
  }
};

export const getTimeLabel = (time: TimeOfDay): string => {
  switch (time) {
    case 'DAWN': return 'Breaking Dawn';
    case 'DAY': return 'High Noon';
    case 'DUSK': return 'Twilit Hour';
    case 'NIGHT': return 'Deep Night';
    default: return time;
  }
};

export const getWeatherLabel = (weather: WeatherType): string => {
  switch (weather) {
    case 'ASHFALL': return 'Ashen Winds';
    case 'CLEAR': return 'Clear Skies';
    case 'FOG': return 'Thick Fog';
    case 'RAIN': return 'Heavy Rain';
    case 'SNOW': return 'Frozen Air';
    case 'STORM': return 'Thunderstorm';
    default: return weather;
  }
};