import React, { useState, useCallback } from 'react';
import { Message, Character } from './types';
import { INITIAL_CHARACTER, DM_RESPONSES } from './constants';
import { rollDie, generateId } from './utils/gameUtils';
import GameLog from './components/GameLog';
import InputArea from './components/InputArea';
import CharacterSheet from './components/CharacterSheet';
import CharacterCreation from './components/CharacterCreation';
import { Sword } from 'lucide-react';

const App: React.FC = () => {
  // Game Flow State
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game Data State
  const [messages, setMessages] = useState<Message[]>([]);
  const [character, setCharacter] = useState<Character>(INITIAL_CHARACTER);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Character Creation Handler
  const handleCharacterCreate = (newCharacter: Character) => {
    setCharacter(newCharacter);
    setGameStarted(true);
    
    // Add initial DM message personalized to class
    const introText = `Welcome, ${newCharacter.name} the ${newCharacter.class}. You stand before the obsidian gates of the Citadel. The air smells of ozone and ancient dust. What do you do?`;
    
    setMessages([
      {
        id: 'init-1',
        sender: 'DM',
        text: introText,
        timestamp: new Date()
      }
    ]);
  };

  // Main Game Handlers
  const handleSendMessage = (text: string) => {
    // 1. Add Player Message
    const playerMsg: Message = {
      id: generateId(),
      sender: 'Player',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, playerMsg]);
    setIsProcessing(true);

    // 2. Simulate DM "Thinking" delay
    setTimeout(() => {
      const responseText = DM_RESPONSES[Math.floor(Math.random() * DM_RESPONSES.length)];
      
      const dmMsg: Message = {
        id: generateId(),
        sender: 'DM',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, dmMsg]);
      setIsProcessing(false);
    }, 1200);
  };

  const handleDiceRoll = useCallback(() => {
    const result = rollDie(20);
    setDiceResult(result);

    const systemMsg: Message = {
      id: generateId(),
      sender: 'System',
      text: `🎲 ${character.name} rolled a ${result} on a D20 check.`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, systemMsg]);
  }, [character.name]);

  // Render Character Creation if game hasn't started
  if (!gameStarted) {
    return <CharacterCreation onCreate={handleCharacterCreate} />;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-950 text-stone-200">
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
         <div className="flex items-center gap-2 text-amber-600">
            <Sword className="w-5 h-5" />
            <h1 className="font-bold font-['Courier_Prime']">Legends of AI</h1>
         </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Column: Narrative (70%) */}
        <section className="flex-1 flex flex-col md:w-[70%] border-r border-slate-800 relative">
          <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none z-10"></div>
          
          <GameLog messages={messages} />
          
          <InputArea 
            onSendMessage={handleSendMessage} 
            disabled={isProcessing} 
          />
        </section>

        {/* Right Column: Character Sheet (30%) */}
        <aside className="h-[300px] md:h-auto md:w-[30%] border-t md:border-t-0 border-slate-800 bg-slate-950 z-20">
          <CharacterSheet 
            character={character}
            diceResult={diceResult}
            onDiceRoll={handleDiceRoll}
          />
        </aside>

      </main>
    </div>
  );
};

export default App;