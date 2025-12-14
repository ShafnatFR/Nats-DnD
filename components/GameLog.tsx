import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { Scroll, User, Sparkles } from 'lucide-react';

interface GameLogProps {
  messages: Message[];
}

const GameLog: React.FC<GameLogProps> = ({ messages }) => {
  const endOfLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 font-crimson bg-slate-950/50">
      {messages.map((msg) => {
        const isDM = msg.sender === 'DM';
        const isSystem = msg.sender === 'System';
        
        return (
          <div 
            key={msg.id} 
            className={`flex gap-4 animate-fade-in ${
              isSystem ? 'opacity-80 py-1' : 'py-2'
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {isDM && <Scroll className="w-6 h-6 text-amber-700" />}
              {msg.sender === 'Player' && <User className="w-6 h-6 text-stone-500" />}
              {isSystem && <Sparkles className="w-5 h-5 text-emerald-600" />}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-xs uppercase tracking-widest font-bold font-cinzel ${
                  isDM ? 'text-amber-600' : isSystem ? 'text-emerald-600' : 'text-stone-500'
                }`}>
                  {isDM ? "The Keeper" : msg.sender}
                </span>
                <span className="text-[10px] text-slate-600 font-sans">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={`leading-relaxed whitespace-pre-wrap text-lg ${
                isDM ? 'text-stone-300' : isSystem ? 'text-emerald-500 italic text-base' : 'text-stone-400'
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