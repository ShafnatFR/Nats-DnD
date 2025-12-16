import React, { useMemo } from 'react';
import { LocationNode, SurvivalStats, Language } from '../types';
import { WORLD_MAP } from '../constants';
import { Skull, Home, Castle, TreePine } from 'lucide-react';
import { getLocName } from '../utils/textUtils';

interface MapModalProps {
  currentLocationId: string;
  onTravel: (nodeId: string) => void;
  survival: SurvivalStats;
  language?: Language;
}

const MapModal: React.FC<MapModalProps> = ({ currentLocationId, onTravel, survival, language = 'EN' }) => {
  const getNodeIcon = (type: LocationNode['type'], className: string) => {
    switch (type) {
      case 'SAFE': return <Home className={className} />;
      case 'DANGER': return <Skull className={className} />;
      case 'TOWN': return <Castle className={className} />;
      case 'DUNGEON': return <div className={className}>🏰</div>;
      default: return <TreePine className={className} />;
    }
  };

  const currentNode = WORLD_MAP.find(n => n.id === currentLocationId);

  const connections = useMemo(() => {
    const lines: React.ReactElement[] = [];
    const drawnConnections = new Set<string>();

    WORLD_MAP.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = WORLD_MAP.find(n => n.id === targetId);
        if (!targetNode) return;
        const connectionKey = [node.id, targetId].sort().join('-');
        if (drawnConnections.has(connectionKey)) return;
        drawnConnections.add(connectionKey);
        const isConnectedToCurrent = node.id === currentLocationId || targetId === currentLocationId;
        lines.push(
          <line 
            key={connectionKey}
            x1={`${node.x}%`} y1={`${node.y}%`} 
            x2={`${targetNode.x}%`} y2={`${targetNode.y}%`} 
            stroke={isConnectedToCurrent ? "#d97706" : "#475569"} 
            strokeWidth={isConnectedToCurrent ? "2" : "1"}
            strokeDasharray={isConnectedToCurrent ? "none" : "4"}
            className="transition-all duration-500"
          />
        );
      });
    });
    return lines;
  }, [currentLocationId]);

  return (
    <div className="flex flex-col h-[500px]">
       <div className="mb-4 bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
          <div>
             <h3 className="text-amber-600 font-cinzel font-bold text-lg uppercase tracking-wider">
               {getLocName(currentNode, language as Language)}
             </h3>
             <p className="text-xs text-slate-500 italic">Region: The Borderlands</p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
             <div>Travel Cost:</div>
             <div className="text-red-400">-10 Hunger/Fatigue</div>
             <div className="text-blue-400">+4 Hours</div>
          </div>
       </div>

       <div className="flex-1 bg-stone-900 relative rounded-lg border-2 border-slate-800 shadow-inner overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
             {connections}
          </svg>

          {WORLD_MAP.map(node => {
            const isCurrent = node.id === currentLocationId;
            const isConnected = currentNode?.connections.includes(node.id);
            const isClickable = isConnected && !isCurrent;
            const nodeName = getLocName(node, language as Language);

            return (
              <div
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 
                  ${isCurrent ? 'bg-amber-600 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-110 z-20' 
                    : isConnected ? 'bg-stone-800 border-stone-400 hover:bg-stone-700 hover:border-amber-500 hover:scale-110 cursor-pointer' 
                    : 'bg-slate-950 border-slate-800 opacity-60 grayscale'
                  }`}
                onClick={() => isClickable && onTravel(node.id)}
                title={nodeName}
              >
                {getNodeIcon(node.type, isCurrent ? "text-white w-6 h-6" : "text-slate-400 w-5 h-5")}
                <div className={`absolute -bottom-8 w-32 text-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-black/80 text-white pointer-events-none transition-opacity
                   ${isCurrent || isConnected ? 'opacity-100' : 'opacity-0'}
                `}>
                   {nodeName}
                </div>
              </div>
            );
          })}
       </div>
    </div>
  );
};

export default MapModal;