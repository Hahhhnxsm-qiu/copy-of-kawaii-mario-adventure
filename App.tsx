
import React, { useState, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameStatus } from './types';
import { getEncouragement } from './geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const startGame = () => {
    setStatus(GameStatus.PLAYING);
    setScore(0);
    setAiMessage('');
  };

  const handleGameOver = useCallback(async (finalScore: number) => {
    setStatus(GameStatus.GAMEOVER);
    setScore(finalScore);
    setLoadingAi(true);
    const msg = await getEncouragement('lost', finalScore);
    setAiMessage(msg);
    setLoadingAi(false);
  }, []);

  const handleWin = useCallback(async (finalScore: number) => {
    setStatus(GameStatus.WON);
    setScore(finalScore);
    setLoadingAi(true);
    const msg = await getEncouragement('won', finalScore);
    setAiMessage(msg);
    setLoadingAi(false);
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0f071a] select-none">
      {/* Visual background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#ff007f]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative border-[12px] border-[#2d1b4e] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden bg-black">
        <GameCanvas 
          status={status} 
          onGameOver={handleGameOver} 
          onWin={handleWin}
          onScoreChange={setScore}
        />
        
        <UIOverlay 
          status={status}
          score={score}
          aiMessage={aiMessage}
          loadingAi={loadingAi}
          onStart={startGame}
        />
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="flex gap-4 text-purple-400 font-black text-sm tracking-widest uppercase bg-[#2d1b4e] px-6 py-2 rounded-full border border-purple-500/20">
          <span>WASD / ARROWS : MOVE</span>
          <span className="opacity-30">|</span>
          <span>SPACE : JUMP</span>
        </div>
        <p className="text-[#ff007f] font-bold animate-pulse">DON'T TOUCH THE BUNNIES 🐰💢</p>
      </div>
    </div>
  );
};

export default App;
