"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { finishMatchesDrawAnimation } from "@/app/actions/tournamentActions";
import { Swords } from "lucide-react";

export default function MatchesDrawCeremony({ tournament }: { tournament: any }) {
  const round1Matches = tournament.matches || [];
  const router = useRouter();
  
  const [revealedCount, setRevealedCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [flash, setFlash] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  // NEW: State for the 5-second popup
  const [showPopup, setShowPopup] = useState(false);
  const currentMatch = round1Matches[revealedCount];
  
  const dummyTeams = [
    { team: "I Pinguini Tattici", players: "Marco & Luca" },
    { team: "Le Tigri Bianche", players: "Sofia & Giulia" },
    { team: "I Leoni Indomabili", players: "Andrea & Matteo" },
    { team: "Gli Squaletti", players: "Giovanni & Paolo" },
    { team: "I Draghi Rossi", players: "Alessia & Martina" },
    { team: "Le Pantere Nere", players: "Lorenzo & Simone" },
    { team: "I Lupi Solitari", players: "Chiara & Sara" },
    { team: "Gli Orsi Bruni", players: "Federico & Davide" }
  ];

  const [spinTeamA, setSpinTeamA] = useState({ team: "???", players: "???" });
  const [spinTeamB, setSpinTeamB] = useState({ team: "???", players: "???" });

  const getTeamInfo = (teamId: string) => {
    let teamName = "IN ATTESA";
    let players = "IN ATTESA";
    
    if (tournament.teamNames && tournament.teamNames[teamId]) {
      teamName = tournament.teamNames[teamId];
    }
    
    const match = round1Matches.find((m: any) => m.teamAId === teamId || m.teamBId === teamId);
    if (match) {
      if (match.teamAId === teamId && match.teamA) {
        players = `${match.teamA.player1.name} & ${match.teamA.player2.name}`;
      } else if (match.teamBId === teamId && match.teamB) {
        players = `${match.teamB.player1.name} & ${match.teamB.player2.name}`;
      }
    }
    return { team: teamName, players };
  };

  useEffect(() => {
    if (round1Matches.length === 0) {
      finishMatchesDrawAnimation(tournament.id).then(() => {
         window.location.reload();
         
      });
      return;
    }

    if (revealedCount >= round1Matches.length) {
      setTimeout(() => {
        setIsFinished(true);
        // Wait 10 seconds on the final screen before moving to in_progress
        setTimeout(() => {
          finishMatchesDrawAnimation(tournament.id).then(() => {
             window.location.reload();
          });
        }, 10000);
      }, 1000);
      return;
    }

    // Start a draw cycle
    const cycleTimer = setTimeout(() => {
      setIsSpinning(true);
      
      let spinInterval = setInterval(() => {
        setSpinTeamA(dummyTeams[Math.floor(Math.random() * dummyTeams.length)]);
        setSpinTeamB(dummyTeams[Math.floor(Math.random() * dummyTeams.length)]);
      }, 60); // Fast slot machine

      // Spin for 4 seconds
      setTimeout(() => {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setFlash(true);
        
        const cMatch = round1Matches[revealedCount];
        setSpinTeamA(getTeamInfo(cMatch.teamAId));
        setSpinTeamB(getTeamInfo(cMatch.teamBId));
        
        // Remove flash quickly
        setTimeout(() => setFlash(false), 800);

        // Wait 1.5s to let them read the final text, then SHOW POPUP
        setTimeout(() => {
          setShowPopup(true);
          
          // Hold popup for 5 seconds
          setTimeout(() => {
            setShowPopup(false);
            
            // Wait 1s for popup to animate out, then move to grid (revealedCount++)
            setTimeout(() => {
              setRevealedCount(prev => prev + 1);
            }, 1000);
            
          }, 5000);
          
        }, 1500);

      }, 4000);

    }, 1000); // 1s pause between draws

    return () => clearTimeout(cycleTimer);
  }, [revealedCount, round1Matches]);


  return (
    <div className="w-full h-screen bg-slate-950 flex overflow-hidden relative font-sans">
      
      {/* THE HUGE PINK/GOLD POPUP (Fades in over everything) */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md pointer-events-none transition-all duration-700 ease-in-out ${showPopup ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`transform transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${showPopup ? 'scale-100' : 'scale-50'} w-full max-w-[1200px]`}>
              <div className="p-10 rounded-3xl border-4 flex flex-col justify-center items-center gap-4 relative shadow-[0_0_80px_rgba(236,72,153,0.6)] bg-slate-900 border-pink-500 mx-8">
                  <div className="flex justify-between items-start w-full">
                    
                    {/* TEAM A */}
                    <div className="flex-1 flex flex-col min-w-0 px-2 items-center">
                      <span className="text-lg text-purple-400 font-black uppercase tracking-widest mb-6 text-center">
                        "{spinTeamA.team}"
                      </span>
                      {currentMatch?.teamA ? (
                        <div className="flex items-start justify-center gap-6 w-full">
                          {[currentMatch.teamA.player1, currentMatch.teamA.player2].map((player, i) => (
                              player && (
                                <div key={i} className="flex flex-col items-center gap-4 flex-1">
                                  {player.avatarUrl ? (
                                    <img src={`/players/${player.avatarUrl}`} alt={player.name} className="w-32 h-32 min-w-[128px] min-h-[128px] shrink-0 aspect-square rounded-full object-cover border-4 border-slate-500 shadow-2xl" />
                                  ) : (
                                    <div className="w-32 h-32 min-w-[128px] min-h-[128px] shrink-0 aspect-square bg-slate-800 rounded-full border-4 border-slate-600 flex items-center justify-center shadow-2xl">
                                      <span className="text-4xl font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                                    </div>
                                  )}
                                  <span className="text-2xl font-bold leading-tight text-white text-center break-words w-full">
                                    {player.name}
                                  </span>
                                </div>
                              )
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {/* VS BADGE */}
                    <div className="shrink-0 flex flex-col items-center justify-center self-center mx-4 gap-6 mt-2">
                      <div className="text-xl font-black text-white bg-pink-500 px-8 py-3 rounded-2xl shadow-lg border-2 border-pink-400 uppercase tracking-widest">
                        MATCH {revealedCount + 1}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-950 px-8 py-5 mx-2 rounded-3xl text-5xl font-black text-white shadow-inner flex flex-col items-center border-2 border-slate-800">
                          <span>VS</span>
                        </div>
                      </div>
                    </div>

                    {/* TEAM B */}
                    <div className="flex-1 flex flex-col min-w-0 px-2 items-center">
                      <span className="text-lg text-purple-400 font-black uppercase tracking-widest mb-6 text-center">
                        "{spinTeamB.team}"
                      </span>
                      {currentMatch?.teamB ? (
                        <div className="flex items-start justify-center gap-6 w-full">
                          {[currentMatch.teamB.player1, currentMatch.teamB.player2].map((player, i) => (
                              player && (
                                <div key={i} className="flex flex-col items-center gap-4 flex-1">
                                  {player.avatarUrl ? (
                                    <img src={`/players/${player.avatarUrl}`} alt={player.name} className="w-32 h-32 min-w-[128px] min-h-[128px] shrink-0 aspect-square rounded-full object-cover border-4 border-slate-500 shadow-2xl" />
                                  ) : (
                                    <div className="w-32 h-32 min-w-[128px] min-h-[128px] shrink-0 aspect-square bg-slate-800 rounded-full border-4 border-slate-600 flex items-center justify-center shadow-2xl">
                                      <span className="text-4xl font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                                    </div>
                                  )}
                                  <span className="text-2xl font-bold leading-tight text-white text-center break-words w-full">
                                    {player.name}
                                  </span>
                                </div>
                              )
                          ))}
                        </div>
                      ) : null}
                    </div>

                  </div>
              </div>
          </div>
      </div>

      
      {/* BACKGROUND EFFECTS (STADIUM SPOTLIGHTS) */}
      <div className="absolute top-0 left-1/4 w-1/2 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/15 via-slate-950/0 to-slate-950/0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-1/2 h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-600/15 via-slate-950/0 to-slate-950/0 pointer-events-none"></div>

      {/* FLASH EFFECT */}
      <div className={`absolute inset-0 bg-white z-[90] pointer-events-none transition-opacity duration-1000 ${flash ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* LEFT COLUMN: THE BOWL / DRAWING AREA */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 border-r border-slate-800/50">
        
        <h2 className="text-yellow-500 font-black tracking-[0.3em] uppercase text-xl mb-12">
          {isFinished ? "Sorteggio Concluso" : "Sorteggio Ufficiale"}
        </h2>

        {revealedCount < round1Matches.length ? (
          <div className="relative w-full max-w-3xl px-12">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-yellow-400/5 to-transparent blur-3xl -z-10"></div>
            
            <div className="bg-slate-900 border-2 border-yellow-500/30 rounded-3xl p-12 shadow-[0_0_50px_rgba(234,179,8,0.15)] flex flex-col items-center gap-8 relative overflow-hidden">
              
              <div className="w-full text-center h-28 flex flex-col items-center justify-center relative">
                <span className={`text-xl font-bold text-yellow-500/80 uppercase tracking-widest mb-2 ${isSpinning ? 'opacity-50 blur-sm' : 'opacity-100'} transition-all duration-75`}>
                  "{spinTeamA.team}"
                </span>
                <span className={`text-4xl font-black text-white uppercase tracking-wider ${isSpinning ? 'blur-sm opacity-50 scale-105' : 'blur-0 opacity-100 scale-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]'} transition-all duration-75`}>
                  {spinTeamA.players}
                </span>
              </div>

              <div className="flex items-center gap-6 text-yellow-500">
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-yellow-500/50"></div>
                <span className="text-4xl font-black italic">VS</span>
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-yellow-500/50"></div>
              </div>

              <div className="w-full text-center h-28 flex flex-col items-center justify-center relative">
                <span className={`text-xl font-bold text-yellow-500/80 uppercase tracking-widest mb-2 ${isSpinning ? 'opacity-50 blur-sm' : 'opacity-100'} transition-all duration-75`}>
                  "{spinTeamB.team}"
                </span>
                <span className={`text-4xl font-black text-white uppercase tracking-wider ${isSpinning ? 'blur-sm opacity-50 scale-105' : 'blur-0 opacity-100 scale-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]'} transition-all duration-75`}>
                  {spinTeamB.players}
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
                <div className="flex-1 flex flex-col font-bold text-lg text-white uppercase truncate pr-4">
                   <span className="text-xs text-purple-400 mb-1">"{getTeamInfo(m.teamAId).team}"</span>
                   <span className="truncate">{getTeamInfo(m.teamAId).players}</span>
                </div>
                <div className="text-yellow-500 font-black text-xl italic px-4">VS</div>
                <div className="flex-1 flex flex-col font-bold text-lg text-white uppercase truncate text-right pl-4">
                   <span className="text-xs text-purple-400 mb-1">"{getTeamInfo(m.teamBId).team}"</span>
                   <span className="truncate">{getTeamInfo(m.teamBId).players}</span>
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
