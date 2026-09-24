"use client";

import React, { useState, useEffect, useRef } from "react";
import { finishMatchesDrawAnimation } from "@/app/actions/tournamentActions";
import { Swords } from "lucide-react";

export default function MatchesDrawCeremony({ tournament }: { tournament: any }) {
  const round1Matches = tournament.matches || [];
  
  const [revealedCount, setRevealedCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [flash, setFlash] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  // Dummy names for the spinning effect
  const dummyNames = [
    "I Pinguini Tattici", "Le Tigri Bianche", "I Leoni Indomabili", "Gli Squaletti",
    "I Draghi Rossi", "Le Pantere Nere", "I Lupi Solitari", "Gli Orsi Bruni",
    "I Falchi Pellegrini", "Le Aquile Reali", "I Cobra Veloci", "I Tori Furiosi"
  ];

  const [spinNameA, setSpinNameA] = useState("???");
  const [spinNameB, setSpinNameB] = useState("???");

  const getTeamName = (teamId: string) => {
    if (!teamId) return "TBD";
    if (tournament.teamNames && tournament.teamNames[teamId]) {
      return tournament.teamNames[teamId];
    }
    const match = tournament.matches.find((m: any) => m.teamAId === teamId || m.teamBId === teamId);
    if (match) {
      if (match.teamAId === teamId && match.teamA) return `${match.teamA.player1.name} & ${match.teamA.player2.name}`;
      if (match.teamBId === teamId && match.teamB) return `${match.teamB.player1.name} & ${match.teamB.player2.name}`;
    }
    return "Team";
  };

  useEffect(() => {
    if (round1Matches.length === 0) {
      finishMatchesDrawAnimation(tournament.id);
      return;
    }

    if (revealedCount >= round1Matches.length) {
      setTimeout(() => {
        setIsFinished(true);
        setTimeout(() => {
          finishMatchesDrawAnimation(tournament.id);
        }, 3000);
      }, 4000);
      return;
    }

    // Start a draw cycle
    const cycleTimer = setTimeout(() => {
      setIsSpinning(true);
      
      let spinInterval = setInterval(() => {
        setSpinNameA(dummyNames[Math.floor(Math.random() * dummyNames.length)]);
        setSpinNameB(dummyNames[Math.floor(Math.random() * dummyNames.length)]);
      }, 50);

      // Stop spinning after 2.5 seconds
      setTimeout(() => {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setFlash(true);
        
        const currentMatch = round1Matches[revealedCount];
        setSpinNameA(getTeamName(currentMatch.teamAId));
        setSpinNameB(getTeamName(currentMatch.teamBId));
        
        setTimeout(() => setFlash(false), 500);

        // Wait 2 seconds showing the drawn match, then move to grid
        setTimeout(() => {
          setRevealedCount(prev => prev + 1);
        }, 2000);

      }, 2500);

    }, 1000); // Wait 1 second before starting next spin

    return () => clearTimeout(cycleTimer);
  }, [revealedCount, round1Matches]);


  return (
    <div className="w-full h-screen bg-slate-950 flex overflow-hidden relative font-sans">
      
      {/* BACKGROUND EFFECTS (STADIUM SPOTLIGHTS) */}
      <div className="absolute top-0 left-1/4 w-1/2 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-slate-950/0 to-slate-950/0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-1/2 h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-600/10 via-slate-950/0 to-slate-950/0 pointer-events-none"></div>

      {/* FLASH EFFECT */}
      <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-500 ${flash ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* LEFT COLUMN: THE BOWL / DRAWING AREA */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 border-r border-slate-800/50">
        
        <h2 className="text-yellow-500 font-black tracking-[0.3em] uppercase text-xl mb-12">
          {isFinished ? "Sorteggio Concluso" : "Sorteggio Ufficiale"}
        </h2>

        {revealedCount < round1Matches.length ? (
          <div className="relative w-full max-w-2xl px-12">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-yellow-400/5 to-transparent blur-3xl -z-10"></div>
            
            <div className="bg-slate-900 border-2 border-yellow-500/30 rounded-3xl p-12 shadow-[0_0_50px_rgba(234,179,8,0.15)] flex flex-col items-center gap-8 relative overflow-hidden">
              
              <div className="w-full text-center h-24 flex items-center justify-center relative">
                <span className={`text-4xl md:text-5xl font-black text-white uppercase tracking-wider ${isSpinning ? 'blur-sm opacity-50 scale-110 animate-pulse' : 'blur-0 opacity-100 scale-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]'} transition-all duration-100`}>
                  {spinNameA}
                </span>
              </div>

              <div className="flex items-center gap-6 text-yellow-500">
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-yellow-500/50"></div>
                <span className="text-4xl font-black italic">VS</span>
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-yellow-500/50"></div>
              </div>

              <div className="w-full text-center h-24 flex items-center justify-center relative">
                <span className={`text-4xl md:text-5xl font-black text-white uppercase tracking-wider ${isSpinning ? 'blur-sm opacity-50 scale-110 animate-pulse' : 'blur-0 opacity-100 scale-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]'} transition-all duration-100`}>
                  {spinNameB}
                </span>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center animate-fade-in">
            <Swords className="w-32 h-32 text-yellow-500 mb-8" />
            <h1 className="text-6xl font-black text-white uppercase tracking-tight mb-4">Il Tabellone è Pronto!</h1>
            <p className="text-2xl text-slate-400 font-medium">Che la battaglia abbia inizio.</p>
          </div>
        )}
      </div>


      {/* RIGHT COLUMN: THE GRID */}
      <div className="w-[45%] bg-slate-950/80 p-8 flex flex-col z-10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
        <h3 className="text-slate-500 font-bold tracking-widest uppercase text-sm mb-6 border-b border-slate-800 pb-4">
          Match Generati
        </h3>

        <div className="flex-1 overflow-y-auto no-scrollbar pr-2 flex flex-col gap-4">
          {round1Matches.slice(0, revealedCount).map((m: any, idx: number) => (
            <div key={idx} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-3 animate-slide-in-right">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Match {idx + 1}</div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1 font-bold text-lg text-white uppercase truncate pr-4">
                  {getTeamName(m.teamAId)}
                </div>
                <div className="text-yellow-500 font-black text-xl italic px-4">VS</div>
                <div className="flex-1 font-bold text-lg text-white uppercase truncate text-right pl-4">
                  {getTeamName(m.teamBId)}
                </div>
              </div>
            </div>
          ))}

          {/* Placeholders for unrevealed matches */}
          {Array.from({ length: round1Matches.length - revealedCount }).map((_, idx) => (
            <div key={`empty-${idx}`} className="bg-slate-900/30 border border-slate-800/30 rounded-2xl p-5 flex items-center justify-center h-[98px] opacity-30">
              <div className="w-8 h-8 rounded-full border-2 border-slate-700/50 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
