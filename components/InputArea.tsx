import React, { useState } from 'react';
import { Send, ChevronRight } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="p-4 border-t border-slate-800 bg-slate-900/50">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="absolute left-3 text-amber-700 animate-pulse">
          <ChevronRight className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? "The Keeper is weaving fate..." : "What is thy bidding?"}
          className="w-full bg-slate-950 border border-slate-700 text-stone-200 pl-10 pr-12 py-3 rounded focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700/50 transition-all font-crimson text-lg placeholder:text-slate-600 disabled:opacity-50"
          autoFocus
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || disabled}
          className="absolute right-2 p-1.5 rounded hover:bg-slate-800 text-amber-700 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default InputArea;