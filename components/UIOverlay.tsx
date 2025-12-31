
import React from 'react';
import { GameStatus } from '../types';

interface UIOverlayProps {
  status: GameStatus;
  score: number;
  aiMessage: string;
  loadingAi: boolean;
  onStart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ status, score, aiMessage, loadingAi, onStart }) => {
  if (status === GameStatus.PLAYING) {
    return (
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-[#1a0b2e]/80 backdrop-blur-md border-2 border-[#ff007f] rounded-2xl px-6 py-2 shadow-[0_0_15px_rgba(255,0,127,0.3)]">
          <p className="text-[#ff007f] font-black text-2xl flex items-center gap-2">
            <span>Score:</span>
            <span className="text-3xl text-white">{score}</span>
            <span className="animate-pulse">🖤</span>
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Active status indicators can be added here if needed */}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#0f071a]/60 backdrop-blur-lg flex flex-col items-center justify-center p-8 text-center">
      {status === GameStatus.START && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="relative">
            <h1 className="text-7xl font-black text-[#ff007f] drop-shadow-[0_0_20px_rgba(255,0,127,0.8)] italic">
              KUROMI<br />NIGHTS 🦇
            </h1>
          </div>
          <p className="text-purple-300 font-bold text-xl tracking-widest uppercase">
            Platforming with Attitude
          </p>
          <div className="flex flex-col gap-2 items-center text-sm text-purple-400 opacity-80 mb-4">
             <p>✨ HEAD-BUTT ❓ BLOCKS FOR BUFFS</p>
             <p>⚡ SPEED UP (10s) | 🍄 GIGANTIC (30s)</p>
          </div>
          <button 
            onClick={onStart}
            className="group relative bg-[#ff007f] hover:bg-[#ff1a8c] text-white font-black py-5 px-16 rounded-2xl text-3xl shadow-[0_0_30px_rgba(255,0,127,0.5)] transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">START REIGN ✨</span>
            <div className="absolute inset-0 bg-white/20 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300"></div>
          </button>
        </div>
      )}

      {(status === GameStatus.GAMEOVER || status === GameStatus.WON) && (
        <div className="bg-[#1a0b2e] rounded-[3rem] p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-[#ff007f] max-w-lg w-full animate-in zoom-in duration-500">
          <h2 className={`text-5xl font-black mb-4 ${status === GameStatus.WON ? 'text-green-400' : 'text-[#ff007f]'}`}>
            {status === GameStatus.WON ? "REIGNING SUPREME! 👑" : "FAILURE... 💢"}
          </h2>
          
          <div className="relative inline-block py-4">
            <p className="text-8xl font-black text-white">{score}</p>
            <p className="text-[#ff007f] font-black text-xl tracking-widest uppercase mt-2">Points Collected</p>
          </div>
          
          <div className="bg-[#2d1b4e] rounded-3xl p-6 my-8 border-2 border-purple-500/30 shadow-inner">
            {loadingAi ? (
              <div className="flex justify-center gap-3">
                <div className="w-3 h-3 bg-[#ff007f] rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-[#ff007f] rounded-full animate-bounce [animation-delay:-.2s]"></div>
                <div className="w-3 h-3 bg-[#ff007f] rounded-full animate-bounce [animation-delay:-.4s]"></div>
              </div>
            ) : (
              <p className="text-xl text-purple-200 italic font-medium leading-relaxed">
                "{aiMessage}"
              </p>
            )}
          </div>

          <button 
            onClick={onStart}
            className="w-full bg-[#ff007f] hover:bg-[#ff1a8c] text-white font-black py-5 px-8 rounded-2xl text-2xl shadow-lg transition-all active:scale-95"
          >
            REMATCH 😈
          </button>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
