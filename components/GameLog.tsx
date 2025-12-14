import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { Terminal, User, Cpu } from 'lucide-react';

interface GameLogProps {
  messages: Message[];
}

const GameLog: React.FC<GameLogProps> = ({ messages }) => {
  const endOfLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-['Courier_Prime'] bg-slate-950/50">
      {messages.map((msg) => {
        const isDM = msg.sender === 'DM';
        const isSystem = msg.sender === 'System';
        
        return (
          <div 
            key={msg.id} 
            className={`flex gap-3 animate-fade-in ${
              isSystem ? 'opacity-70 py-1' : 'py-2'
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {isDM && <Terminal className="w-5 h-5 text-amber-600" />}
              {msg.sender === 'Player' && <User className="w-5 h-5 text-stone-400" />}
              {isSystem && <Cpu className="w-4 h-4 text-emerald-500" />}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-xs uppercase tracking-wider font-bold ${
                  isDM ? 'text-amber-600' : isSystem ? 'text-emerald-500' : 'text-stone-400'
                }`}>
                  {msg.sender}
                </span>
                <span className="text-[10px] text-slate-600">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={`leading-relaxed whitespace-pre-wrap ${
                isDM ? 'text-stone-200' : isSystem ? 'text-emerald-400 italic text-sm' : 'text-stone-300'
              }`}>
                {msg.text}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={endOfLogRef} />
    </div>
  );
};

export default GameLog;