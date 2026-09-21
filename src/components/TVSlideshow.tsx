"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Users, Calendar, Banknote, Medal, Crown, Activity, Swords, Clock, MonitorPlay, Shield } from "lucide-react";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import SlotMachineDraw from "@/components/SlotMachineDraw";
import { formatSetScores } from "@/lib/scoreUtils";
import { calculateTournamentProbabilities, calculateMatchProbabilities } from "@/lib/probabilityUtils";

export default function TVSlideshow({ data }: { data: any }) {
  const router = useRouter();
  const { playerStats, teamStats, promoTournaments, inProgressTournaments, completedTournaments } = data;
  
  // Build slides array
  const slides: any[] = [];  // Leaderboard Slide (Auto-scrolling)
  const maxRows = Math.max(playerStats.length, teamStats.length);
  // Calculate dynamic duration based on rows (approx 3.5s per row), minimum 20 seconds
  const leaderboardDuration = Math.max(20000, maxRows * 3500);
  slides.push({ type: "leaderboard", duration: leaderboardDuration });
  slides.push({ type: "leaderboard_roles", duration: leaderboardDuration });

  if (data.freeMatchesStats && data.freeMatchesStats.length > 0) {
    const playersPerPage = 10;
    const pages = Math.ceil(data.freeMatchesStats.length / playersPerPage);
    for (let p = 0; p < pages; p++) {
      slides.push({ type: "leaderboard_free", duration: 25000, page: p });
    }
  } else {
    slides.push({ type: "leaderboard_free", duration: 20000, page: 0 });
  }

  
  if (data.recentFreeMatches && data.recentFreeMatches.length > 0) {
    const matchCount = data.recentFreeMatches.length;
    const scrollNeeded = matchCount > 3;
    // 1.1s per match, min 12s
    const recentMatchesDuration = scrollNeeded ? Math.max(12000, matchCount * 1100) : 12000;
    slides.push({ type: "recent_matches", duration: recentMatchesDuration, scrollNeeded });
  }

  // Slide for Player Advanced Stats (TOP 3 solo con podio finale)
  if (data.advancedPlayerStats && data.advancedPlayerStats.length > 0) {
    const playersOnPage = Math.min(3, data.advancedPlayerStats.length);
    // 6.3 seconds per player spotlight + 10 seconds for podium
    const slideDuration = playersOnPage * 6300 + 10000;
    slides.push({ type: "player_stats", duration: slideDuration, page: 0 });
  }
  
  // Slides for Promo
  promoTournaments.forEach((t: any) => slides.push({ type: "promo", tournament: t, duration: 30000 }));  // Slides for In Progress (Bracket & Agenda)
  inProgressTournaments.forEach((t: any) => {
    if (t.status === "drawing") {
      slides.push({ type: "slot_machine", tournament: t, duration: 1200000 }); // 20 minutes max, the component will manually skip to next
    } else {
      slides.push({ type: "bracket_tree", tournament: t, duration: 30000 });
      
      // Check if there are scheduled matches
      const hasScheduled = t.matches?.some((m: any) => m.scheduledAt && !m.winnerTeamId);
      if (hasScheduled) {
        slides.push({ type: "live_agenda", tournament: t, duration: 30000 });
      }
    }
  });
  
  // Slide for Hall of Fame
  if (completedTournaments.length > 0) {
    slides.push({ type: "hall_of_fame", duration: 30000 });
  }

  
  const drawSlideIndex = slides.findIndex(s => s.type === "slot_machine");
  const [currentIndex, setCurrentIndex] = useState(drawSlideIndex !== -1 ? drawSlideIndex : 0);
  const [spotlightPlayerIdx, setSpotlightPlayerIdx] = useState<number | null>(null);

  // Jump to slot machine immediately if it appears
  useEffect(() => {
    if (drawSlideIndex !== -1 && currentIndex !== drawSlideIndex) {
      setCurrentIndex(drawSlideIndex);
    }
  }, [drawSlideIndex]);
  // Smart polling to catch admin actions instantly without burning DB quota
  useEffect(() => {
    if (drawSlideIndex !== -1) return; // Do not poll while drawing!
    
    let lastFingerprint = "";

    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/ping-db');
        if (!res.ok) return;
        const data = await res.json();
        
        if (lastFingerprint === "") {
          lastFingerprint = data.fingerprint; // First load
        } else if (lastFingerprint !== data.fingerprint) {
          // Database changed! Let's download the heavy data
          lastFingerprint = data.fingerprint;
          router.refresh();
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(poll);
  }, [router, drawSlideIndex]);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    // Get duration of current slide (default 12s if not specified)
    const currentDuration = slides[currentIndex]?.duration || 30000;
    
    const timeout = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      setCurrentIndex(nextIndex);
      setCycleCount((prev) => prev + 1); // Force re-render key to restart CSS animations
      
      if (nextIndex === 0) {
        router.refresh(); // Silently fetch new database updates from the server
      }
    }, currentDuration);
    
    return () => clearTimeout(timeout);
  }, [currentIndex, slides.length, cycleCount, router]);

  // Ensure currentIndex stays within bounds if slides length shrinks (e.g. tournament completes)
  useEffect(() => {
    if (currentIndex >= slides.length && slides.length > 0) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Start spotlight from player 0 whenever we enter a player_stats slide
  useEffect(() => {
    const slide = slides[currentIndex < slides.length ? currentIndex : 0];
    if (slide?.type !== 'player_stats') {
      setSpotlightPlayerIdx(null);
      return;
    }
    setSpotlightPlayerIdx(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, cycleCount]);

  // Advance spotlight to next player every 6 seconds
  useEffect(() => {
    if (spotlightPlayerIdx === null) return;
    const slide = slides[currentIndex < slides.length ? currentIndex : 0];
    if (slide?.type !== 'player_stats') return;
    const playersOnPage = Math.min(3, data.advancedPlayerStats?.length || 0);
    const timer = setTimeout(() => {
      if (spotlightPlayerIdx < playersOnPage) {
        setSpotlightPlayerIdx(prev => prev !== null ? prev + 1 : null);
      }
    }, 6300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlightPlayerIdx]);

  if (slides.length === 0) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white text-3xl">Nessun dato disponibile</div>;

  const safeCurrentIndex = currentIndex < slides.length ? currentIndex : 0;
  const currentSlide = slides[safeCurrentIndex] || slides[0];

  if (currentSlide?.type === "slot_machine") {
      return (
        <div className="w-full h-screen bg-slate-950 text-white">
          <SlotMachineDraw tournament={currentSlide.tournament} advancedPlayerStats={data.advancedPlayerStats} />
        </div>
      );
  }

  const formatName = (fmt: string) => fmt.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="w-full h-screen bg-slate-950 text-white overflow-hidden relative flex flex-col">
      {/* GLOBAL HEADER */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50 bg-gradient-to-b from-slate-950 to-transparent">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-widest uppercase">
            IL CALCETTO DI MARIA
          </h1>
          <img src="/images/red-player-table-football.png" alt="Logo" className="h-10 w-auto object-contain drop-shadow-md" />
        </div>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              onClick={() => {
                setCurrentIndex(i);
                setCycleCount(c => c + 1);
              }}
              className={`h-2 rounded-full transition-all duration-1000 cursor-pointer hover:bg-emerald-300 ${i === safeCurrentIndex ? 'w-12 bg-emerald-400' : 'w-3 bg-slate-700'}`} 
            />
          ))}
        </div>
      </div>

      <div key={cycleCount} className="flex-1 flex items-center justify-center pt-24 pb-8 px-6 sm:px-10 xl:px-16 relative z-10 w-full h-full">
        <div className="w-full h-full flex flex-col justify-center animate-fade-in-up">
          
          {/* LEADERBOARD SLIDE */}
          {currentSlide.type === "leaderboard" && (
            <div className="flex flex-col w-full h-[85vh] gap-6">
              
              {/* HEADER LEGEND */}
              <div className="flex justify-center shrink-0 w-full">
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex items-center justify-between w-full backdrop-blur-md gap-4">
                  <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Cosa si intende per "Sfida"</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Ogni singola partita (Libera o Torneo) è sempre calcolata al meglio delle 3 partite.</span>
                  </div>
                  <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Quali partite contano</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Assolutamente tutte le partite giocate (Sia Tornei che Sfide Libere).</span>
                  </div>
                  <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Come sono calcolate</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Ordinamento per numero di Vittorie Totali. A parità di vittorie, decide il Win Rate %.</span>
                  </div>
                  <div className="flex flex-col flex-1 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Chi entra in classifica</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Qualsiasi giocatore (o coppia) che abbia vinto almeno una volta.</span>
                  </div>
                </div>
              </div>

              {/* TWO COLUMNS */}
              <div className="flex w-full flex-1 min-h-0 gap-8 lg:gap-16">
              
              {/* TOP SINGLES FIXED CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-6 md:p-8 rounded-[3rem] border-2 border-yellow-500/20 shadow-2xl backdrop-blur-sm relative min-h-0">
                
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  {playerStats[0] && (() => {
                    const topPlayers = playerStats.filter((p: any) => 
                      p.winRate === playerStats[0].winRate && 
                      p.wins === playerStats[0].wins && 
                      p.played === playerStats[0].played
                    );
                    return (
                    <div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-yellow-500/50 p-6 rounded-3xl w-full shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Medal className="w-24 h-24 text-yellow-500" />
                      </div>
                      <div className="w-16 flex-shrink-0 text-center font-black text-6xl text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">
                        1
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 z-10 gap-3">
                        {topPlayers.map((tp: any, idx: number) => (
                          <div key={tp.id} className={idx > 0 ? "pt-3 border-t border-slate-700/50" : ""}>
                            <div className="flex items-center gap-3 flex-1 justify-between pr-6">
                                                            <div className="text-3xl font-black text-white truncate leading-tight">{tp.name}</div>
                                                            {tp.preferredRole && (() => {
                              const r = tp.preferredRole.toLowerCase();
                              if (r === 'portiere' || r === 'difensore') return <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Defender</span>;
                              if (r === 'attaccante') return <span className="bg-red-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Striker</span>;
                              if (r === 'entrambi') return <span className="bg-purple-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Jolly</span>;
                              return null;
                            })()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10 justify-center">
                        <div className="text-2xl font-black flex items-baseline gap-1">
                          <span className="text-emerald-400">{playerStats[0].wins} V</span>
                          <span className="text-blue-400">/ {playerStats[0].played} G</span>
                        </div>
                        <div className="text-yellow-500 font-black text-xl">
                          {playerStats[0].winRate}%
                        </div>
                      </div>
                    </div>
                  );
                  })()}
                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                    <Medal className="w-10 h-10 text-yellow-500" /> TOP SINGOLI
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: `${(currentSlide.duration || 12000) / 1000}s` }}>
                    {playerStats.slice(playerStats.filter((p: any) => p.winRate === playerStats[0]?.winRate && p.wins === playerStats[0]?.wins && p.played === playerStats[0]?.played).length).map((p: any, i: number) => {
                      const rank = i + 1 + playerStats.filter((ps: any) => ps.winRate === playerStats[0]?.winRate && ps.wins === playerStats[0]?.wins && ps.played === playerStats[0]?.played).length;
                      return (
                      <div key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 flex-1">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-yellow-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                                                    <div className="flex flex-col min-w-0 justify-center flex-1">
                            <div className="flex items-center gap-3 flex-1 justify-between pr-6">
                              <div className="text-2xl font-bold text-white truncate leading-tight">{p.name}</div>
                              {p.preferredRole && (() => {
                              const r = p.preferredRole.toLowerCase();
                              if (r === 'portiere' || r === 'difensore') return <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Defender</span>;
                              if (r === 'attaccante') return <span className="bg-red-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Striker</span>;
                              if (r === 'entrambi') return <span className="bg-purple-600 text-white font-black px-3 py-1 rounded-md tracking-widest text-[10px] uppercase shadow-sm">Jolly</span>;
                              return null;
                            })()}
                            </div>
                          </div>

                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <div className="text-xl font-black flex items-baseline gap-1">
                            <span className="text-emerald-400">{p.wins} V</span>
                            <span className="text-blue-400">/ {p.played} G</span>
                          </div>
                          <div className="text-yellow-500 font-black text-lg">
                            {p.winRate}%
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>

              {/* TOP TEAMS FIXED CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-8 rounded-[3rem] border-2 border-blue-500/20 shadow-2xl backdrop-blur-sm relative">
                
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  {teamStats[0] && (() => {
                    const topTeams = teamStats.filter((t: any) => 
                      t.winRate === teamStats[0].winRate && 
                      t.wins === teamStats[0].wins && 
                      t.played === teamStats[0].played
                    );
                    return (
                    <div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-yellow-500/50 p-6 rounded-3xl w-full shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Users className="w-24 h-24 text-blue-500" />
                      </div>
                      <div className="w-16 flex-shrink-0 text-center font-black text-6xl text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">
                        1
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 z-10 gap-3">
                        {topTeams.map((tt: any, idx: number) => (
                           <div key={tt.id} className={idx > 0 ? "pt-3 border-t border-slate-700/50" : ""}>
                             <div className="flex items-baseline gap-3 flex-wrap">
                               <span className="text-3xl font-black text-white leading-tight truncate">{tt.player1?.name || "Giocatore 1"}</span>
                               <span className="text-2xl font-black text-yellow-500/70">&</span>
                               <span className="text-3xl font-black text-white leading-tight truncate">{tt.player2?.name || "Giocatore 2"}</span>
                             </div>
                           </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10 justify-center">
                        <div className="text-2xl font-black flex items-baseline gap-1">
                          <span className="text-emerald-400">{teamStats[0].wins} V</span>
                          <span className="text-blue-400">/ {teamStats[0].played} G</span>
                        </div>
                        <div className="text-yellow-500 font-black text-xl">
                          {teamStats[0].winRate}%
                        </div>
                      </div>
                    </div>
                  );
                  })()}
                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <Users className="w-10 h-10 text-blue-400" /> TOP COPPIE
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: `${(currentSlide.duration || 12000) / 1000}s` }}>
                    {teamStats.slice(teamStats.filter((t: any) => t.winRate === teamStats[0]?.winRate && t.wins === teamStats[0]?.wins && t.played === teamStats[0]?.played).length).map((t: any, i: number) => {
                      const rank = i + 1 + teamStats.filter((ts: any) => ts.winRate === teamStats[0]?.winRate && ts.wins === teamStats[0]?.wins && ts.played === teamStats[0]?.played).length;
                      return (
                      <div key={t.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 flex-1">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-yellow-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                          <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                            <span className="text-xl font-bold text-white truncate leading-tight">{t.player1?.name || "Giocatore 1"}</span>
                            <span className="text-base font-black text-yellow-500/70">&</span>
                            <span className="text-xl font-bold text-white truncate leading-tight">{t.player2?.name || "Giocatore 2"}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <div className="text-xl font-black flex items-baseline gap-1">
                            <span className="text-emerald-400">{t.wins} V</span>
                            <span className="text-blue-400">/ {t.played} G</span>
                          </div>
                          <div className="text-yellow-500 font-black text-lg">
                            {t.winRate}%
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>
              
              </div> {/* chiusura flex w-full flex-1 */}

            </div>
          )}

          
          {/* LEADERBOARD FREE MATCHES (SERIE A STYLE) */}
          {currentSlide.type === "leaderboard_roles" && (() => {
            const defenderStats = playerStats.filter((p: any) => p.preferredRole?.toLowerCase() === 'difensore' || p.preferredRole?.toLowerCase() === 'portiere');
            const strikerStats = playerStats.filter((p: any) => p.preferredRole?.toLowerCase() === 'attaccante');
            
            return (
            <div className="flex flex-col w-full h-[85vh] gap-6">
              
              {/* HEADER LEGEND */}
              <div className="flex justify-center shrink-0 w-full">
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex items-center justify-between w-full backdrop-blur-md gap-4">
                  <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Cosa si intende per "Sfida"</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Ogni singola partita (Libera o Torneo) è sempre calcolata al meglio delle 3 partite.</span>
                  </div>
                  <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Quali partite contano</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Assolutamente tutte le partite giocate (Sia Tornei che Sfide Libere).</span>
                  </div>
                  <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Come sono calcolate</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Ordinamento per numero di Vittorie Totali. A parità di vittorie, decide il Win Rate %.</span>
                  </div>
                  <div className="flex flex-col flex-1 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Chi entra in classifica</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Qualsiasi giocatore (o coppia) che abbia vinto almeno una volta.</span>
                  </div>
                </div>
              </div>

              {/* TWO COLUMNS */}
              <div className="flex w-full flex-1 min-h-0 gap-8 lg:gap-16">
              
              {/* TOP DEFENDERS FIXED CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-6 md:p-8 rounded-[3rem] border-2 border-blue-500/20 shadow-2xl backdrop-blur-sm relative min-h-0">
                
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  {defenderStats[0] && (() => {
                    const topPlayers = defenderStats.filter((p: any) => 
                      p.winRate === defenderStats[0].winRate && 
                      p.wins === defenderStats[0].wins && 
                      p.played === defenderStats[0].played
                    );
                    return (
                    <div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-blue-500/50 p-6 rounded-3xl w-full shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Shield className="w-24 h-24 text-blue-500" />
                      </div>
                      <div className="w-16 flex-shrink-0 text-center font-black text-6xl text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                        1
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 z-10 gap-3">
                        {topPlayers.map((tp: any, idx: number) => (
                          <div key={tp.id} className={idx > 0 ? "pt-3 border-t border-slate-700/50" : ""}>
                            <div className="flex items-center gap-3">
                                                            <div className="text-3xl font-black text-white truncate leading-tight">{tp.name}</div>
                              {(() => {
                                const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === tp.id);
                                const rStats = advStats?.roleStats;
                                const tSubiti = rStats?.gkGoalsConceded || 0;
                                const mSubiti = rStats?.gkMatches > 0 ? (tSubiti / rStats.gkMatches).toFixed(2) : '-';
                                return (
                                  <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Tot Subiti</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{tSubiti}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{mSubiti}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10 justify-center">
                        <div className="text-2xl font-black flex items-baseline gap-1">
                          <span className="text-emerald-400">{defenderStats[0].wins} V</span>
                          <span className="text-blue-400">/ {defenderStats[0].played} G</span>
                        </div>
                        <div className="text-blue-500 font-black text-xl">
                          {defenderStats[0].winRate}%
                        </div>
                      </div>
                    </div>
                  );
                  })()}
                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                    <Shield className="w-10 h-10 text-blue-500" /> TOP DEFENDERS
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: `${(currentSlide.duration || 12000) / 1000}s` }}>
                    {defenderStats.slice(defenderStats.filter((p: any) => p.winRate === defenderStats[0]?.winRate && p.wins === defenderStats[0]?.wins && p.played === defenderStats[0]?.played).length).map((p: any, i: number) => {
                      const rank = i + 1 + defenderStats.filter((ps: any) => ps.winRate === defenderStats[0]?.winRate && ps.wins === defenderStats[0]?.wins && ps.played === defenderStats[0]?.played).length;
                      return (
                      <div key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 flex-1">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-blue-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                                                    <div className="flex flex-col min-w-0 justify-center flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold text-white truncate leading-tight">{p.name}</div>
                            </div>
                          </div>
                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === p.id);
                            const rStats = advStats?.roleStats;
                            const tSubiti = rStats?.gkGoalsConceded || 0;
                            const mSubiti = rStats?.gkMatches > 0 ? (tSubiti / rStats.gkMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-2 shrink-0 mx-2">
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-blue-400 font-bold tracking-widest uppercase">Tot Subiti</span>
                                  <span className="text-base font-black text-white leading-none">{tSubiti}</span>
                                </div>
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-blue-400 font-bold tracking-widest uppercase">Media</span>
                                  <span className="text-base font-black text-white leading-none">{mSubiti}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <div className="text-xl font-black flex items-baseline gap-1">
                            <span className="text-emerald-400">{p.wins} V</span>
                            <span className="text-blue-400">/ {p.played} G</span>
                          </div>
                          <div className="text-blue-500 font-black text-lg">
                            {p.winRate}%
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>

              {/* TOP STRIKERS FIXED CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-8 rounded-[3rem] border-2 border-blue-500/20 shadow-2xl backdrop-blur-sm relative">
                
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  {strikerStats[0] && (() => {
                    const topTeams = strikerStats.filter((t: any) => 
                      t.winRate === strikerStats[0].winRate && 
                      t.wins === strikerStats[0].wins && 
                      t.played === strikerStats[0].played
                    );
                    return (
                    <div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-red-500/50 p-6 rounded-3xl w-full shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Users className="w-24 h-24 text-blue-500" />
                      </div>
                      <div className="w-16 flex-shrink-0 text-center font-black text-6xl text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                        1
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 z-10 gap-3">
                        {topTeams.map((tt: any, idx: number) => (
                           <div key={tt.id} className={idx > 0 ? "pt-3 border-t border-slate-700/50" : ""}>
                             <div className="flex items-baseline gap-3 flex-wrap">
                                                             <span className="text-3xl font-black text-white leading-tight truncate flex-1">{tt.name}</span>
                              {(() => {
                                const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === tt.id);
                                const rStats = advStats?.roleStats;
                                const tFatti = rStats?.stGoalsScored || 0;
                                const mFatti = rStats?.stMatches > 0 ? (tFatti / rStats.stMatches).toFixed(2) : '-';
                                return (
                                  <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">Tot Fatti</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{tFatti}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{mFatti}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                             </div>
                           </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10 justify-center">
                        <div className="text-2xl font-black flex items-baseline gap-1">
                          <span className="text-emerald-400">{strikerStats[0].wins} V</span>
                          <span className="text-blue-400">/ {strikerStats[0].played} G</span>
                        </div>
                        <div className="text-red-500 font-black text-xl">
                          {strikerStats[0].winRate}%
                        </div>
                      </div>
                    </div>
                  );
                  })()}
                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <Swords className="w-10 h-10 text-red-500" /> TOP STRIKERS
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: `${(currentSlide.duration || 12000) / 1000}s` }}>
                    {strikerStats.slice(strikerStats.filter((t: any) => t.winRate === strikerStats[0]?.winRate && t.wins === strikerStats[0]?.wins && t.played === strikerStats[0]?.played).length).map((t: any, i: number) => {
                      const rank = i + 1 + strikerStats.filter((ts: any) => ts.winRate === strikerStats[0]?.winRate && ts.wins === strikerStats[0]?.wins && ts.played === strikerStats[0]?.played).length;
                      return (
                      <div key={t.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 flex-1">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-red-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                                                    <div className="flex items-baseline gap-2 min-w-0 flex-wrap flex-1">
                            <span className="text-xl font-bold text-white truncate leading-tight">{t.name}</span>
                          </div>
                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === t.id);
                            const rStats = advStats?.roleStats;
                            const tFatti = rStats?.stGoalsScored || 0;
                            const mFatti = rStats?.stMatches > 0 ? (tFatti / rStats.stMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-2 shrink-0 mx-2">
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-red-400 font-bold tracking-widest uppercase">Tot Fatti</span>
                                  <span className="text-base font-black text-white leading-none">{tFatti}</span>
                                </div>
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-red-400 font-bold tracking-widest uppercase">Media</span>
                                  <span className="text-base font-black text-white leading-none">{mFatti}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <div className="text-xl font-black flex items-baseline gap-1">
                            <span className="text-emerald-400">{t.wins} V</span>
                            <span className="text-blue-400">/ {t.played} G</span>
                          </div>
                          <div className="text-red-500 font-black text-lg">
                            {t.winRate}%
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>
              
              </div> {/* chiusura flex w-full flex-1 */}

            </div>
            );
          })()}

          
          {/* LEADERBOARD FREE MATCHES (SERIE A STYLE) */}

          {currentSlide.type === "leaderboard_free" && (
            <div className="flex flex-col items-center w-full max-w-7xl h-[85vh] justify-start relative z-10 mx-auto px-4">
              <div className="flex flex-col items-center gap-2 mb-4 shrink-0 w-full">
                <div className="flex items-center gap-4 mb-2">
                  <Swords className="w-12 h-12 text-emerald-400 drop-shadow-lg" />
                  <h2 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg">
                    Sfide Libere
                  </h2>
                  <Swords className="w-12 h-12 text-emerald-400 drop-shadow-lg" />
                </div>

                {/* HEADER LEGEND */}
                <div className="flex justify-center shrink-0 w-full mb-2">
                  <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex items-center justify-between w-full backdrop-blur-md gap-4">
                    <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                      <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Cosa si intende per "Sfida"</span>
                      <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Ogni sfida amichevole è sempre calcolata al meglio delle 3 partite.</span>
                    </div>
                    <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                      <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Quali partite contano</span>
                      <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Esclusivamente le Sfide Libere (Le partite dei Tornei non influiscono).</span>
                    </div>
                    <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                      <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Come sono calcolate</span>
                      <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Tramite algoritmo Wilson Score. Premia chi vince con costanza nel tempo.</span>
                    </div>
                    <div className="flex flex-col flex-1 px-4">
                      <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Chi entra in classifica</span>
                      <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Qualsiasi giocatore che abbia giocato almeno una sfida libera.</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-slate-900/95 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1 min-h-0">
                {/* TABLE HEADER */}
                <div className="grid grid-cols-12 gap-2 bg-slate-950/80 p-4 border-b border-slate-700/50 text-slate-400 font-bold uppercase tracking-widest text-xs">
                  <div className="col-span-1 text-center">Pos</div>
                  <div className="col-span-3">Giocatore</div>
                  <div className="col-span-1 text-center" title="Sfide Giocate">SG</div>
                  <div className="col-span-1 text-center text-emerald-400/70" title="Vittorie">V</div>
                  <div className="col-span-1 text-center text-red-400/70" title="Perse">P</div>
                  <div className="col-span-1 text-center" title="Set Vinti">SV</div>
                  <div className="col-span-1 text-center" title="Set Persi">SP</div>
                  <div className="col-span-1 text-center" title="Differenza Set">DS</div>
                  <div className="col-span-1 text-center text-white" title="Win Rate %">WR%</div>
                  <div className="col-span-1 text-center">Ultime 5</div>
                </div>
                

                {/* ROWS */}
                <div className="flex flex-col">
                  {(!data.freeMatchesStats || data.freeMatchesStats.length === 0) ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 py-16">
                      <Swords className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-xl font-bold uppercase tracking-widest">Nessuna Sfida Libera Giocata</p>
                    </div>
                  ) : (
                    data.freeMatchesStats.slice(currentSlide.page * 10, (currentSlide.page + 1) * 10).map((stats: any, index: number) => {

                    const globalRank = (currentSlide.page * 10) + index + 1;
                    const isFirst = globalRank === 1;
                    
                    return (
                      <div 
                        key={stats.id} 
                        className={`grid grid-cols-12 gap-2 p-4 items-center border-b border-slate-800/30 transition-colors ${
                          isFirst ? 'bg-yellow-500/10 border-yellow-500/20' : 'even:bg-slate-800/30 hover:bg-slate-800/50'
                        }`}
                      >
                        {/* Pos */}
                        <div className="col-span-1 text-center">
                          <span className={`text-xl font-black ${isFirst ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-slate-500'}`}>
                            {globalRank}
                          </span>
                        </div>
                        {/* Giocatore */}
                        <div className="col-span-3 flex items-center gap-3">
                          <span className={`text-lg font-bold uppercase tracking-wider truncate ${isFirst ? 'text-yellow-400' : 'text-white'}`}>
                            {stats.name}
                          </span>
                        </div>
                        {/* SG */}
                        <div className="col-span-1 text-center text-slate-300 font-bold">{stats.sg}</div>
                        {/* V */}
                        <div className="col-span-1 text-center text-emerald-400 font-bold">{stats.v}</div>
                        {/* P */}
                        <div className="col-span-1 text-center text-red-400 font-bold">{stats.p}</div>
                        {/* SV */}
                        <div className="col-span-1 text-center text-slate-300 font-medium">{stats.sv}</div>
                        {/* SP */}
                        <div className="col-span-1 text-center text-slate-300 font-medium">{stats.sp}</div>
                        {/* DS */}
                        <div className="col-span-1 text-center font-bold text-slate-300">
                          {stats.ds > 0 ? `+${stats.ds}` : stats.ds}
                        </div>
                        {/* WR% */}
                        <div className="col-span-1 text-center font-black text-xl text-white">
                          {stats.wr.toFixed(0)}%
                        </div>
                        {/* Ultime 5 */}
                        <div className="col-span-1 flex items-center justify-center gap-1">
                          {stats.recentForm.slice().reverse().map((result: string, rIdx: number) => (
                            <div 
                              key={rIdx}
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[15px] font-bold text-white shadow-sm ${
                                result === 'W' ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                            >
                              {result === 'W' ? '✓' : '×'}
                            </div>
                          ))}
                          {Array.from({ length: Math.max(0, 5 - stats.recentForm.length) }).map((_, rIdx) => (
                            <div key={`empty-${rIdx}`} className="w-4 h-4 rounded-full border border-slate-700 bg-slate-800/50"></div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                  )}
                </div>
                
                {/* FOOTER INFO */}
                <div className="bg-slate-950 p-2 text-center text-[15px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-800">
                  SG: Sfide Giocate • V: Vittorie • P: Perse • SV: Set Vinti • SP: Set Persi • DS: Differenza Set • WR%: Win Rate (Vittorie / Sfide)
                </div>
              </div>
            </div>
          )}

          {/* PLAYER STATS SLIDE */}
          {currentSlide.type === "player_stats" && (() => {
            const pageStats = data.advancedPlayerStats?.slice(0, 3) || [];
            
            const formatRole = (role: string) => {
              if (!role) return "";
              const r = role.toLowerCase();
              if (r === 'portiere' || r === 'difensore') return 'Defender';
              if (r === 'attaccante') return 'Striker';
              if (r === 'entrambi') return 'Both';
              return role;
            };
            
            const stage = spotlightPlayerIdx !== null ? spotlightPlayerIdx : 0;
            
            return (
              <div className="flex flex-col items-center justify-center w-full h-[85vh] relative z-10 px-8 animate-fade-in">
                <div className="flex flex-col items-center shrink-0 mb-6 absolute top-0 pt-8 w-full z-10">
                  <Activity className="w-16 h-16 text-blue-400 mb-4 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-pulse" />
                  <h2 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg flex items-center gap-4">
                    Fascicolo Giocatori (TOP 3)
                  </h2>
                </div>
                
                <div className="w-full h-full relative max-w-[1600px] mx-auto pt-[160px]">
                    {pageStats.map((ps: any, cardIdx: number) => {
                      const { player, rank, played, wins, winRate, totalGoalsScored, avgGoalsPerMatch, roleStats } = ps;
                      
                      const mySpotlightStage = 2 - cardIdx;
                      let styles: any = {};
                      
                      if (stage < mySpotlightStage) {
                        styles = {
                          opacity: 0,
                          transform: 'translate(-50%, 50%) scale(0.5)',
                          zIndex: 0,
                        };
                      } else if (stage === mySpotlightStage) {
                        styles = {
                          opacity: 1,
                          transform: 'translate(-50%, -50%) scale(1.4)',
                          zIndex: 50,
                          borderColor: 'rgba(99,102,241,0.9)',
                          boxShadow: '0 0 80px rgba(99,102,241,0.6)'
                        };
                      } else {
                        const podiumOffsets = [
                          { x: '0px', y: '-80px', scale: 1.35, color: 'rgba(234,179,8,0.8)', shadow: '0 0 60px rgba(234,179,8,0.4)' },
                          { x: '-460px', y: '40px', scale: 1.25, color: 'rgba(203,213,225,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                          { x: '460px', y: '60px', scale: 1.25, color: 'rgba(249,115,22,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                        ];
                        const pos = podiumOffsets[cardIdx];
                        styles = {
                          opacity: 1,
                          transform: `translate(calc(-50% + ${pos.x}), calc(-50% + ${pos.y})) scale(${pos.scale})`,
                          zIndex: cardIdx === 0 ? 30 : (cardIdx === 1 ? 20 : 10),
                          borderColor: pos.color,
                          boxShadow: pos.shadow
                        };
                      }
                      
                      return (
                        <div
                          key={player.id}
                          className="absolute left-1/2 top-1/2 bg-slate-900 border-4 p-4 rounded-3xl flex flex-col gap-3 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-[380px]"
                          style={styles}
                        >
                          {rank === 1 && <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none text-8xl">👑</div>}
                          
                          {/* TOP ROW: Profile, Name, Role */}
                          <div className="flex items-center gap-4 z-10">
                            {player.avatarUrl ? (
                              <img src={`/players/${player.avatarUrl}`} alt={player.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-600 shadow-sm flex-shrink-0" />
                            ) : (
                              <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                <span className="text-2xl font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-black text-white truncate">{player.name}</h3>
                                {rank && <span className="text-2xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)] flex-shrink-0">{rank}°</span>}
                              </div>
                              <div className="text-[17px] font-black text-slate-400 uppercase tracking-widest">{formatRole(player.preferredRole)}</div>
                            </div>
                          </div>

                          {/* MIDDLE ROW: Key stats — Gioc / Vinte / WR% */}
                          <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 z-10 mt-2">
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Gioc</span>
                              <span className="text-xl font-black text-white">{played}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Vinte</span>
                              <span className="text-xl font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">{wins}</span>
                            </div>
                            <div className="flex flex-col items-center bg-yellow-500/10 rounded-lg -m-1 p-1 border border-yellow-500/20">
                              <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500 mb-0.5">WR%</span>
                              <span className="text-xl font-black text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{winRate}%</span>
                            </div>
                          </div>

                          {/* ROLE SPECIFIC STATS */}
                          <div className="flex flex-col gap-2 z-10 mt-2">
                            {roleStats.gkMatches > 0 && (
                              <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-2.5">
                                <div className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-2">
                                  <Shield className="w-4 h-4"/> Defender
                                  {roleStats.gkMatches > 0 && <span className="text-slate-500 font-bold normal-case text-[15px]">({roleStats.gkMatches} match)</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[13px] font-black uppercase text-slate-400">Tot Subiti</span><span className="text-lg font-black text-blue-300">{roleStats.gkGoalsConceded > 0 ? roleStats.gkGoalsConceded : <span className="text-slate-600">-</span>}</span></div>
                                  <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[13px] font-black uppercase text-slate-400">Media</span><span className="text-lg font-black text-blue-200">{roleStats.defensiveIndex ?? <span className="text-slate-600">-</span>}</span></div>
                                </div>
                              </div>
                            )}

                            {roleStats.stMatches > 0 && (
                              <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-2.5">
                                <div className="text-[11px] font-black uppercase tracking-widest text-red-400 mb-2 flex items-center gap-2">
                                  <Swords className="w-4 h-4"/> Striker
                                  {roleStats.stMatches > 0 && <span className="text-slate-500 font-bold normal-case text-[15px]">({roleStats.stMatches} match)</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[13px] font-black uppercase text-slate-400">Tot Fatti</span><span className="text-lg font-black text-red-300">{roleStats.stGoalsScored > 0 ? roleStats.stGoalsScored : <span className="text-slate-600">-</span>}</span></div>
                                  <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[13px] font-black uppercase text-slate-400">Media</span><span className="text-lg font-black text-red-200">{roleStats.offensiveIndex ?? <span className="text-slate-600">-</span>}</span></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {/* FOOTER INFO */}
                <div className="bg-slate-950 absolute bottom-0 left-0 w-full p-2 text-center text-[15px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-800 z-20">
                  SG: Sfide Giocate • V: Vittorie • P: Perse • WR%: Win Rate (Vittorie / Sfide)
                </div>
              </div>
            );
          })()}

          {/* LEADERBOARD FREE MATCHES (SERIE A STYLE) */}
          {currentSlide.type === "leaderboard_roles" && (() => {
            const defenderStats = playerStats.filter((p: any) => p.preferredRole?.toLowerCase() === 'difensore' || p.preferredRole?.toLowerCase() === 'portiere');
            const strikerStats = playerStats.filter((p: any) => p.preferredRole?.toLowerCase() === 'attaccante');
            
            return (
            <div className="flex flex-col w-full h-[85vh] gap-6">
              
              {/* HEADER LEGEND */}
              <div className="flex justify-center shrink-0 w-full">
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex items-center justify-between w-full backdrop-blur-md gap-4">
                  <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Cosa si intende per "Sfida"</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Ogni singola partita (Libera o Torneo) è sempre calcolata al meglio delle 3 partite.</span>
                  </div>
                  <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Quali partite contano</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Assolutamente tutte le partite giocate (Sia Tornei che Sfide Libere).</span>
                  </div>
                  <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Come sono calcolate</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Ordinamento per numero di Vittorie Totali. A parità di vittorie, decide il Win Rate %.</span>
                  </div>
                  <div className="flex flex-col flex-1 px-4">
                    <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Chi entra in classifica</span>
                    <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Qualsiasi giocatore (o coppia) che abbia vinto almeno una volta.</span>
                  </div>
                </div>
              </div>

              {/* TWO COLUMNS */}
              <div className="flex w-full flex-1 min-h-0 gap-8 lg:gap-16">
              
              {/* TOP DEFENDERS FIXED CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-6 md:p-8 rounded-[3rem] border-2 border-blue-500/20 shadow-2xl backdrop-blur-sm relative min-h-0">
                
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  {defenderStats[0] && (() => {
                    const topPlayers = defenderStats.filter((p: any) => 
                      p.winRate === defenderStats[0].winRate && 
                      p.wins === defenderStats[0].wins && 
                      p.played === defenderStats[0].played
                    );
                    return (
                    <div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-blue-500/50 p-6 rounded-3xl w-full shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Shield className="w-24 h-24 text-blue-500" />
                      </div>
                      <div className="w-16 flex-shrink-0 text-center font-black text-6xl text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                        1
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 z-10 gap-3">
                        {topPlayers.map((tp: any, idx: number) => (
                          <div key={tp.id} className={idx > 0 ? "pt-3 border-t border-slate-700/50" : ""}>
                            <div className="flex items-center gap-3">
                                                            <div className="text-3xl font-black text-white truncate leading-tight">{tp.name}</div>
                              {(() => {
                                const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === tp.id);
                                const rStats = advStats?.roleStats;
                                const tSubiti = rStats?.gkGoalsConceded || 0;
                                const mSubiti = rStats?.gkMatches > 0 ? (tSubiti / rStats.gkMatches).toFixed(2) : '-';
                                return (
                                  <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Tot Subiti</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{tSubiti}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{mSubiti}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10 justify-center">
                        <div className="text-2xl font-black flex items-baseline gap-1">
                          <span className="text-emerald-400">{defenderStats[0].wins} V</span>
                          <span className="text-blue-400">/ {defenderStats[0].played} G</span>
                        </div>
                        <div className="text-blue-500 font-black text-xl">
                          {defenderStats[0].winRate}%
                        </div>
                      </div>
                    </div>
                  );
                  })()}
                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                    <Shield className="w-10 h-10 text-blue-500" /> TOP DEFENDERS
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: `${(currentSlide.duration || 12000) / 1000}s` }}>
                    {defenderStats.slice(defenderStats.filter((p: any) => p.winRate === defenderStats[0]?.winRate && p.wins === defenderStats[0]?.wins && p.played === defenderStats[0]?.played).length).map((p: any, i: number) => {
                      const rank = i + 1 + defenderStats.filter((ps: any) => ps.winRate === defenderStats[0]?.winRate && ps.wins === defenderStats[0]?.wins && ps.played === defenderStats[0]?.played).length;
                      return (
                      <div key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 flex-1">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-blue-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                                                    <div className="flex flex-col min-w-0 justify-center flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold text-white truncate leading-tight">{p.name}</div>
                            </div>
                          </div>
                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === p.id);
                            const rStats = advStats?.roleStats;
                            const tSubiti = rStats?.gkGoalsConceded || 0;
                            const mSubiti = rStats?.gkMatches > 0 ? (tSubiti / rStats.gkMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-2 shrink-0 mx-2">
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-blue-400 font-bold tracking-widest uppercase">Tot Subiti</span>
                                  <span className="text-base font-black text-white leading-none">{tSubiti}</span>
                                </div>
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-blue-400 font-bold tracking-widest uppercase">Media</span>
                                  <span className="text-base font-black text-white leading-none">{mSubiti}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <div className="text-xl font-black flex items-baseline gap-1">
                            <span className="text-emerald-400">{p.wins} V</span>
                            <span className="text-blue-400">/ {p.played} G</span>
                          </div>
                          <div className="text-blue-500 font-black text-lg">
                            {p.winRate}%
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>

              {/* TOP STRIKERS FIXED CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-8 rounded-[3rem] border-2 border-blue-500/20 shadow-2xl backdrop-blur-sm relative">
                
                <div className="shrink-0 z-20 relative pb-6 border-b border-slate-700/50 mb-6">
                  {strikerStats[0] && (() => {
                    const topTeams = strikerStats.filter((t: any) => 
                      t.winRate === strikerStats[0].winRate && 
                      t.wins === strikerStats[0].wins && 
                      t.played === strikerStats[0].played
                    );
                    return (
                    <div className="mb-6 flex items-center gap-6 bg-slate-900 border-2 border-red-500/50 p-6 rounded-3xl w-full shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Users className="w-24 h-24 text-blue-500" />
                      </div>
                      <div className="w-16 flex-shrink-0 text-center font-black text-6xl text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                        1
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0 z-10 gap-3">
                        {topTeams.map((tt: any, idx: number) => (
                           <div key={tt.id} className={idx > 0 ? "pt-3 border-t border-slate-700/50" : ""}>
                             <div className="flex items-baseline gap-3 flex-wrap">
                                                             <span className="text-3xl font-black text-white leading-tight truncate flex-1">{tt.name}</span>
                              {(() => {
                                const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === tt.id);
                                const rStats = advStats?.roleStats;
                                const tFatti = rStats?.stGoalsScored || 0;
                                const mFatti = rStats?.stMatches > 0 ? (tFatti / rStats.stMatches).toFixed(2) : '-';
                                return (
                                  <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">Tot Fatti</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{tFatti}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{mFatti}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                             </div>
                           </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10 justify-center">
                        <div className="text-2xl font-black flex items-baseline gap-1">
                          <span className="text-emerald-400">{strikerStats[0].wins} V</span>
                          <span className="text-blue-400">/ {strikerStats[0].played} G</span>
                        </div>
                        <div className="text-red-500 font-black text-xl">
                          {strikerStats[0].winRate}%
                        </div>
                      </div>
                    </div>
                  );
                  })()}
                  <h3 className="text-3xl font-bold text-center flex items-center justify-center gap-4 text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <Swords className="w-10 h-10 text-red-500" /> TOP STRIKERS
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: `${(currentSlide.duration || 12000) / 1000}s` }}>
                    {strikerStats.slice(strikerStats.filter((t: any) => t.winRate === strikerStats[0]?.winRate && t.wins === strikerStats[0]?.wins && t.played === strikerStats[0]?.played).length).map((t: any, i: number) => {
                      const rank = i + 1 + strikerStats.filter((ts: any) => ts.winRate === strikerStats[0]?.winRate && ts.wins === strikerStats[0]?.wins && ts.played === strikerStats[0]?.played).length;
                      return (
                      <div key={t.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 flex-1">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-red-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                                                    <div className="flex items-baseline gap-2 min-w-0 flex-wrap flex-1">
                            <span className="text-xl font-bold text-white truncate leading-tight">{t.name}</span>
                          </div>
                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === t.id);
                            const rStats = advStats?.roleStats;
                            const tFatti = rStats?.stGoalsScored || 0;
                            const mFatti = rStats?.stMatches > 0 ? (tFatti / rStats.stMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-2 shrink-0 mx-2">
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-red-400 font-bold tracking-widest uppercase">Tot Fatti</span>
                                  <span className="text-base font-black text-white leading-none">{tFatti}</span>
                                </div>
                                <div className="flex gap-2 items-baseline">
                                  <span className="text-[9px] text-red-400 font-bold tracking-widest uppercase">Media</span>
                                  <span className="text-base font-black text-white leading-none">{mFatti}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <div className="text-xl font-black flex items-baseline gap-1">
                            <span className="text-emerald-400">{t.wins} V</span>
                            <span className="text-blue-400">/ {t.played} G</span>
                          </div>
                          <div className="text-red-500 font-black text-lg">
                            {t.winRate}%
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>
              
              </div> {/* chiusura flex w-full flex-1 */}

            </div>
            );
          })()}

          
          {/* LEADERBOARD FREE MATCHES (SERIE A STYLE) */}

          {currentSlide.type === "leaderboard_free" && (
            <div className="flex flex-col items-center w-full max-w-7xl h-[85vh] justify-start relative z-10 mx-auto px-4">
              <div className="flex flex-col items-center gap-2 mb-4 shrink-0 w-full">
                <div className="flex items-center gap-4 mb-2">
                  <Swords className="w-12 h-12 text-emerald-400 drop-shadow-lg" />
                  <h2 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg">
                    Sfide Libere
                  </h2>
                  <Swords className="w-12 h-12 text-emerald-400 drop-shadow-lg" />
                </div>

                {/* HEADER LEGEND */}
                <div className="flex justify-center shrink-0 w-full mb-2">
                  <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex items-center justify-between w-full backdrop-blur-md gap-4">
                    <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                      <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Cosa si intende per "Sfida"</span>
                      <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Ogni sfida amichevole è sempre calcolata al meglio delle 3 partite.</span>
                    </div>
                    <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                      <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Quali partite contano</span>
                      <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Esclusivamente le Sfide Libere (Le partite dei Tornei non influiscono).</span>
                    </div>
                    <div className="flex flex-col flex-1 border-r border-slate-700 px-4">
                      <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Come sono calcolate</span>
                      <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Tramite algoritmo Wilson Score. Premia chi vince con costanza nel tempo.</span>
                    </div>
                    <div className="flex flex-col flex-1 px-4">
                      <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">Chi entra in classifica</span>
                      <span className="text-slate-300 font-medium text-xs md:text-sm leading-tight">Qualsiasi giocatore che abbia giocato almeno una sfida libera.</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-slate-900/95 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1 min-h-0">
                {/* TABLE HEADER */}
                <div className="grid grid-cols-12 gap-2 bg-slate-950/80 p-4 border-b border-slate-700/50 text-slate-400 font-bold uppercase tracking-widest text-xs">
                  <div className="col-span-1 text-center">Pos</div>
                  <div className="col-span-3">Giocatore</div>
                  <div className="col-span-1 text-center" title="Sfide Giocate">SG</div>
                  <div className="col-span-1 text-center text-emerald-400/70" title="Vittorie">V</div>
                  <div className="col-span-1 text-center text-red-400/70" title="Perse">P</div>
                  <div className="col-span-1 text-center" title="Set Vinti">SV</div>
                  <div className="col-span-1 text-center" title="Set Persi">SP</div>
                  <div className="col-span-1 text-center" title="Differenza Set">DS</div>
                  <div className="col-span-1 text-center text-white" title="Win Rate %">WR%</div>
                  <div className="col-span-1 text-center">Ultime 5</div>
                </div>
                

                {/* ROWS */}
                <div className="flex flex-col">
                  {(!data.freeMatchesStats || data.freeMatchesStats.length === 0) ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 py-16">
                      <Swords className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-xl font-bold uppercase tracking-widest">Nessuna Sfida Libera Giocata</p>
                    </div>
                  ) : (
                    data.freeMatchesStats.slice(currentSlide.page * 10, (currentSlide.page + 1) * 10).map((stats: any, index: number) => {

                    const globalRank = (currentSlide.page * 10) + index + 1;
                    const isFirst = globalRank === 1;
                    
                    return (
                      <div 
                        key={stats.id} 
                        className={`grid grid-cols-12 gap-2 p-4 items-center border-b border-slate-800/30 transition-colors ${
                          isFirst ? 'bg-yellow-500/10 border-yellow-500/20' : 'even:bg-slate-800/30 hover:bg-slate-800/50'
                        }`}
                      >
                        {/* Pos */}
                        <div className="col-span-1 text-center">
                          <span className={`text-xl font-black ${isFirst ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-slate-500'}`}>
                            {globalRank}
                          </span>
                        </div>
                        {/* Giocatore */}
                        <div className="col-span-3 flex items-center gap-3">
                          <span className={`text-lg font-bold uppercase tracking-wider truncate ${isFirst ? 'text-yellow-400' : 'text-white'}`}>
                            {stats.name}
                          </span>
                        </div>
                        {/* SG */}
                        <div className="col-span-1 text-center text-slate-300 font-bold">{stats.sg}</div>
                        {/* V */}
                        <div className="col-span-1 text-center text-emerald-400 font-bold">{stats.v}</div>
                        {/* P */}
                        <div className="col-span-1 text-center text-red-400 font-bold">{stats.p}</div>
                        {/* SV */}
                        <div className="col-span-1 text-center text-slate-300 font-medium">{stats.sv}</div>
                        {/* SP */}
                        <div className="col-span-1 text-center text-slate-300 font-medium">{stats.sp}</div>
                        {/* DS */}
                        <div className="col-span-1 text-center font-bold text-slate-300">
                          {stats.ds > 0 ? `+${stats.ds}` : stats.ds}
                        </div>
                        {/* WR% */}
                        <div className="col-span-1 text-center font-black text-xl text-white">
                          {stats.wr.toFixed(0)}%
                        </div>
                        {/* Ultime 5 */}
                        <div className="col-span-1 flex items-center justify-center gap-1">
                          {stats.recentForm.slice().reverse().map((result: string, rIdx: number) => (
                            <div 
                              key={rIdx}
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[15px] font-bold text-white shadow-sm ${
                                result === 'W' ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                            >
                              {result === 'W' ? '✓' : '×'}
                            </div>
                          ))}
                          {Array.from({ length: Math.max(0, 5 - stats.recentForm.length) }).map((_, rIdx) => (
                            <div key={`empty-${rIdx}`} className="w-4 h-4 rounded-full border border-slate-700 bg-slate-800/50"></div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                  )}
                </div>
                
                {/* FOOTER INFO */}
                <div className="bg-slate-950 p-2 text-center text-[15px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-800">
                  SG: Sfide Giocate • V: Vittorie • P: Perse • SV: Set Vinti • SP: Set Persi • DS: Differenza Set • WR%: Win Rate (Vittorie / Sfide)
                </div>
              </div>
            </div>
          )}

          {/* PLAYER STATS SLIDE */}
          {currentSlide.type === "player_stats" && (() => {
            const pageStats = data.advancedPlayerStats?.slice(0, 3) || [];
            const isPodium = spotlightPlayerIdx !== null && spotlightPlayerIdx >= pageStats.length;
            
            const formatRole = (role: string) => {
              if (!role) return "";
              const r = role.toLowerCase();
              if (r === 'portiere' || r === 'difensore') return 'Defender';
              if (r === 'attaccante') return 'Striker';
              if (r === 'entrambi') return 'Both';
              return role;
            };
            
            return (
              <div className="flex flex-col items-center justify-center w-full h-[85vh] relative z-10 px-8 animate-fade-in">
                <div className="flex flex-col items-center shrink-0 mb-6">
                  <Activity className="w-16 h-16 text-blue-400 mb-4 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-pulse" />
                  <h2 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg flex items-center gap-4">
                    Fascicolo Giocatori (TOP 3)
                  </h2>
                </div>
                
                <div className="w-full flex-1 flex flex-col justify-center min-h-0 relative px-4 max-w-[1600px] mx-auto">
                  <div className={`w-full flex justify-center gap-6 transition-all duration-1000 ${isPodium ? "items-end h-[600px] pb-10" : "items-center"}`}>
                    {pageStats.map((ps: any, cardIdx: number) => {
                      const { player, rank, played, wins, winRate, totalGoalsScored, avgGoalsPerMatch, roleStats } = ps;
                      const isSpotlighted = !isPodium && spotlightPlayerIdx === cardIdx;
                      const isDimmed = !isPodium && spotlightPlayerIdx !== null && !isSpotlighted;
                      
                      const podiumOrder = cardIdx === 0 ? 'order-2' : cardIdx === 1 ? 'order-1' : 'order-3';
                      const podiumTransform = cardIdx === 0 ? 'scale(1.15) translateY(-30px)' : cardIdx === 1 ? 'scale(0.95)' : 'scale(0.9) translateY(30px)';
                      const podiumZIndex = cardIdx === 0 ? 30 : cardIdx === 1 ? 20 : 10;
                      
                      return (
                        <div
                          key={player.id}
                          className={`bg-slate-900 border-2 p-3 rounded-2xl flex flex-col gap-2.5 relative overflow-hidden transition-all duration-1000 ${isPodium ? podiumOrder : ''} w-[380px] max-w-full`}
                          style={{
                            opacity: isDimmed ? 0.2 : 1,
                            transform: isPodium ? podiumTransform : (isSpotlighted ? 'scale(1.04)' : 'scale(1)'),
                            borderColor: isPodium ? (cardIdx === 0 ? 'rgba(234,179,8,0.8)' : cardIdx === 1 ? 'rgba(203,213,225,0.8)' : 'rgba(249,115,22,0.8)') : (isSpotlighted ? 'rgba(99,102,241,0.8)' : 'rgba(51,65,85,0.8)'),
                            boxShadow: isPodium && cardIdx === 0 ? '0 0 40px rgba(234,179,8,0.3)' : (isSpotlighted ? '0 0 30px rgba(99,102,241,0.3)' : '0 10px 15px -3px rgba(0,0,0,0.5)'),
                            zIndex: isPodium ? podiumZIndex : 1,
                          }}
                        >
                          {rank === 1 && <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none text-7xl">👑</div>}
                          
                          {/* TOP ROW: Profile, Name, Role */}
                          <div className="flex items-center gap-3 z-10">
                            {player.avatarUrl ? (
                              <img src={`/players/${player.avatarUrl}`} alt={player.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 shadow-sm flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                <span className="text-xl font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-white truncate">{player.name}</h3>
                                {rank && <span className="text-xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)] flex-shrink-0">{rank}°</span>}
                              </div>
                              <div className="text-[15px] font-black text-slate-400 uppercase tracking-widest">{formatRole(player.preferredRole)}</div>
                            </div>
                          </div>

                          {/* MIDDLE ROW: Key stats — Gioc / Vinte / WR% */}
                          <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 z-10">
                            <div className="flex flex-col items-center">
                              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Gioc</span>
                              <span className="text-sm font-black text-white">{played}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Vinte</span>
                              <span className="text-sm font-black text-emerald-400">{wins}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[7px] font-black uppercase tracking-widest text-yellow-500 mb-0.5">WR%</span>
                              <span className="text-sm font-black text-yellow-400">{winRate}%</span>
                            </div>
                          </div>

                          {/* BOTTOM: 4 cross-role indices */}
                          <div className="flex flex-col gap-1.5 z-10">
                            {/* DEFENDER row */}
                            <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-1.5">
                              <div className="text-[8px] font-black uppercase tracking-widest text-blue-400 mb-1 flex items-center gap-1">
                                <Shield className="w-2.5 h-2.5"/> Defender
                                {roleStats.gkMatches > 0 && <span className="text-slate-500 font-bold normal-case">({roleStats.gkMatches} match)</span>}
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <div className="flex items-center justify-between bg-slate-900/60 rounded-lg px-2 py-1">
                                  <span className="text-[7px] font-black uppercase text-slate-400">Tot Subiti</span>
                                  <span className="text-xs font-black text-blue-300">{roleStats.gkGoalsConceded > 0 ? roleStats.gkGoalsConceded : <span className="text-slate-600">-</span>}</span>
                                </div>
                                <div className="flex items-center justify-between bg-slate-900/60 rounded-lg px-2 py-1">
                                  <span className="text-[7px] font-black uppercase text-slate-400">Media</span>
                                  <span className="text-xs font-black text-blue-200">{roleStats.defensiveIndex ?? <span className="text-slate-600">-</span>}</span>
                                </div>
                              </div>
                            </div>
                            {/* STRIKER row */}
                            <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-1.5">
                              <div className="text-[8px] font-black uppercase tracking-widest text-red-400 mb-1 flex items-center gap-1">
                                <Swords className="w-2.5 h-2.5"/> Striker
                                {roleStats.stMatches > 0 && <span className="text-slate-500 font-bold normal-case">({roleStats.stMatches} match)</span>}
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <div className="flex items-center justify-between bg-slate-900/60 rounded-lg px-2 py-1">
                                  <span className="text-[7px] font-black uppercase text-slate-400">Tot Fatti</span>
                                  <span className="text-xs font-black text-red-300">{roleStats.stGoalsScored > 0 ? roleStats.stGoalsScored : <span className="text-slate-600">-</span>}</span>
                                </div>
                                <div className="flex items-center justify-between bg-slate-900/60 rounded-lg px-2 py-1">
                                  <span className="text-[7px] font-black uppercase text-slate-400">Media</span>
                                  <span className="text-xs font-black text-red-200">{roleStats.offensiveIndex ?? <span className="text-slate-600">-</span>}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* SPOTLIGHT OVERLAY — card ingrandita al centro */}
                  {!isPodium && spotlightPlayerIdx !== null && pageStats[spotlightPlayerIdx] && (() => {
                    const { player, rank, played, wins, winRate, totalGoalsScored, avgGoalsPerMatch, roleStats } = pageStats[spotlightPlayerIdx];
                    return (
                      <div
                        key={`spotlight-${spotlightPlayerIdx}`}
                        className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                        style={{ animation: 'spotlightIn 1s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
                      >
                        <div className="bg-slate-900 border-2 border-indigo-500/80 shadow-[0_0_80px_rgba(99,102,241,0.5)] rounded-3xl p-8 flex flex-col gap-5 w-[520px] max-w-[90vw] relative overflow-hidden">
                          {rank === 1 && <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-9xl">👑</div>}
                          <div className="flex items-center gap-5 z-10">
                            {player.avatarUrl ? (
                              <img src={`/players/${player.avatarUrl}`} alt={player.name} className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/60 shadow-xl flex-shrink-0" />
                            ) : (
                              <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-indigo-500/60 flex items-center justify-center shadow-xl flex-shrink-0">
                                <span className="text-4xl font-black text-slate-400 uppercase">{player.name.substring(0,2)}</span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-4xl font-black text-white truncate">{player.name}</h3>
                                {rank && <span className="text-4xl font-black text-purple-400 drop-shadow-[0_0_12px_rgba(192,132,252,0.5)] flex-shrink-0">{rank}°</span>}
                              </div>
                              <div className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">{formatRole(player.preferredRole)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                            <div className="flex flex-col items-center"><span className="text-[15px] font-black uppercase tracking-widest text-slate-400 mb-1">Gioc</span><span className="text-2xl font-black text-white">{played}</span></div>
                            <div className="flex flex-col items-center"><span className="text-[15px] font-black uppercase tracking-widest text-emerald-500 mb-1">Vinte</span><span className="text-2xl font-black text-emerald-400">{wins}</span></div>
                            <div className="flex flex-col items-center"><span className="text-[15px] font-black uppercase tracking-widest text-yellow-500 mb-1">WR%</span><span className="text-2xl font-black text-yellow-400">{winRate}%</span></div>
                          </div>
                          <div className="flex flex-col gap-3">
                            <div className="bg-blue-950/50 border border-blue-700/50 rounded-2xl p-4">
                              <div className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4"/> Defender
                                {roleStats.gkMatches > 0 && <span className="text-slate-500 font-bold normal-case text-[15px]">({roleStats.gkMatches} match)</span>}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[15px] font-black uppercase text-slate-400">Tot Subiti</span><span className="text-xl font-black text-blue-300">{roleStats.gkGoalsConceded > 0 ? roleStats.gkGoalsConceded : <span className="text-slate-600">-</span>}</span></div>
                                <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[15px] font-black uppercase text-slate-400">Media</span><span className="text-xl font-black text-blue-200">{roleStats.defensiveIndex ?? <span className="text-slate-600">-</span>}</span></div>
                              </div>
                            </div>
                            <div className="bg-red-950/50 border border-red-700/50 rounded-2xl p-4">
                              <div className="text-[11px] font-black uppercase tracking-widest text-red-400 mb-2 flex items-center gap-2">
                                <Swords className="w-4 h-4"/> Striker
                                {roleStats.stMatches > 0 && <span className="text-slate-500 font-bold normal-case text-[15px]">({roleStats.stMatches} match)</span>}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[15px] font-black uppercase text-slate-400">Tot Fatti</span><span className="text-xl font-black text-red-300">{roleStats.stGoalsScored > 0 ? roleStats.stGoalsScored : <span className="text-slate-600">-</span>}</span></div>
                                <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-4 py-2"><span className="text-[15px] font-black uppercase text-slate-400">Media</span><span className="text-xl font-black text-red-200">{roleStats.offensiveIndex ?? <span className="text-slate-600">-</span>}</span></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}

          {/* RECENT MATCHES SLIDE */}
          {currentSlide.type === "recent_matches" && (() => {
            const scrollNeeded = currentSlide.scrollNeeded ?? (data.recentFreeMatches.length > 3);
            const durationSec = (currentSlide.duration || 12000) / 1000;

            return (
              <div className="flex flex-col items-center w-full h-[85vh] relative z-10 px-12">
                <h2 className="text-3xl font-black uppercase tracking-widest text-slate-300 mb-6 shrink-0">
                  Ultime Sfide Libere
                </h2>
                
                <div className="flex-1 w-full max-w-7xl mx-auto overflow-hidden relative mask-edges flex justify-center px-4">
                  <div 
                    className={`w-full grid grid-cols-2 gap-4 content-start pb-12 ${
                      scrollNeeded ? 'animate-scroll-matches' : 'my-auto'
                    }`}
                    style={scrollNeeded ? { animationDuration: `${durationSec}s` } : undefined}
                  >
                    {data.recentFreeMatches.map((m: any) => {
                      const date = m.playedAt ? new Date(m.playedAt) : new Date();
                      const isValidDate = !isNaN(date.getTime());
                      const isToday = isValidDate && new Date().toDateString() === date.toDateString();
                      const timeLabel = isValidDate 
                        ? (isToday 
                            ? `Oggi, ${date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
                            : date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))
                        : "Recente";

                      const teamAWon = m.winnerTeamId === m.teamAId;
                      const winner = teamAWon ? m.teamA : m.teamB;
                      const loser = teamAWon ? m.teamB : m.teamA;
                      const scoreW = teamAWon ? m.scoreTeamA : m.scoreTeamB;
                      const scoreL = teamAWon ? m.scoreTeamB : m.scoreTeamA;

                      return (
                        <div key={m.id} className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col justify-center shrink-0 h-fit">
                          {/* HEADER WITH TIME */}
                          <div className="flex items-center justify-center text-xs text-slate-400 font-bold uppercase tracking-widest border-b border-slate-700/50 pb-2 mb-3">
                            <span className="flex items-center gap-2">
                              {timeLabel}
                              {isToday && <span className="text-emerald-500">Recente</span>}
                            </span>
                          </div>

                          {/* TEAMS & SCORES */}
                          <div className="flex items-center justify-between text-lg overflow-hidden whitespace-nowrap">
                            {/* WINNER */}
                            <div className="font-bold text-white flex items-center gap-2 leading-tight truncate flex-1 min-w-0">
                              <Trophy className="w-5 h-5 text-yellow-500 shrink-0 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                              <span className="truncate">
                                {winner?.player1?.name || "G1"} <span className="text-slate-500 text-sm mx-1">&</span> {winner?.player2?.name || "G2"}
                              </span>
                            </div>
                            
                            {/* SCORE SEPARATOR */}
                            <div className="flex items-center gap-2 mx-3 shrink-0">
                              <div className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg text-lg">{scoreW}</div>
                              <span className="text-slate-600 font-black text-base">-</span>
                              <div className="font-black text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-lg">{scoreL}</div>
                            </div>

                            {/* LOSER */}
                            <div className="font-bold text-slate-500 flex items-center leading-tight truncate flex-1 justify-end min-w-0 text-right">
                              <span className="truncate">
                                {loser?.player1?.name || "G1"} <span className="text-slate-700 text-sm mx-1">&</span> {loser?.player2?.name || "G2"}
                              </span>
                            </div>
                          </div>

                          {/* SET SCORES */}
                          {m.setScores && formatSetScores(m.setScores) && (
                            <div className="flex items-center justify-center gap-3 text-xs font-bold bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 mt-4 mx-auto w-fit">
                              <span className="text-[15px] text-purple-400 uppercase tracking-widest font-black">Punteggi Set:</span>
                              <span className="text-emerald-400 font-black tracking-wider text-sm">{formatSetScores(m.setScores)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* PROMO SLIDE */}
          {currentSlide.type === "promo" && (() => {
            const t = currentSlide.tournament;
            const registrations = t.registrations || [];
            const maxPlayers = (t.maxTeams || 8) * 2;
            const iscritti = registrations.length;
            
            let missingText = "";
            if (t.type === "sorteggio_ruoli") {
              const reqPerRole = maxPlayers / 2;
              let attCount = 0;
              let porCount = 0;
              let entCount = 0;
              
              registrations.forEach((r: any) => {
                if(r.player?.preferredRole === "attaccante") attCount++;
                else if(r.player?.preferredRole === "portiere") porCount++;
                else entCount++;
              });
              
              // Simplistic calculation:
              const missingAtt = reqPerRole - attCount - Math.floor(entCount / 2);
              const missingPor = reqPerRole - porCount - Math.ceil(entCount / 2);
              
              if (iscritti >= maxPlayers) {
                missingText = "Limite Iscritti Raggiunto! (Riserve in attesa)";
              } else {
                missingText = `Mancano: ${Math.max(0, missingAtt)} Attaccanti, ${Math.max(0, missingPor)} Difensori`;
              }
            } else {
              if (iscritti >= maxPlayers) {
                missingText = "Limite Iscritti Raggiunto! (Riserve in attesa)";
              } else {
                missingText = `Mancano: ${maxPlayers - iscritti} Giocatori`;
              }
            }

            const formatTitle = t.format === "eliminazione_diretta" ? "Eliminazione Diretta" : t.format === "doppia_eliminazione" ? "Doppia Eliminazione" : "Gironi + Eliminazione";
            const formatDesc = t.format === "eliminazione_diretta" 
              ? "Tabellone classico a scontro diretto. Nessun appello: chi vince passa al turno successivo, chi perde viene eliminato definitivamente dal torneo." 
              : t.format === "doppia_eliminazione" 
              ? "Ogni squadra ha due vite! Chi perde la prima volta finisce nel 'Losers Bracket' e può ancora sperare di arrivare in finale vincendo tutte le partite di recupero." 
              : "Ogni squadra affronterà tutte le altre del proprio girone. Solo le prime classificate accederanno alle fasi finali a eliminazione diretta.";
            
            const typeTitle = t.type === "sorteggio_ruoli" ? "Sorteggio per Ruoli" : t.type === "sorteggio_integrale" ? "Sorteggio Integrale" : "Coppie Fisse";
            const typeDesc = t.type === "sorteggio_ruoli" 
              ? "L'algoritmo formerà le coppie in modo bilanciato, accoppiando obbligatoriamente un Attaccante con un Difensore. (Chi sceglie 'Entrambi' farà da jolly)." 
              : t.type === "sorteggio_integrale" 
              ? "Sorteggio totalmente cieco. La fortuna decide chi sarà il tuo compagno, indipendentemente dal ruolo preferito." 
              : "Le coppie sono già decise. Ci si iscrive insieme al proprio compagno storico per sfidare le altre coppie.";

            return (
            <div className="flex w-full h-[85vh] gap-12 text-left items-start mt-8">
              
              {/* LEFT COLUMN - INFO */}
              <div className="flex-1 flex flex-col h-full bg-slate-900/80 p-10 rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden">
                {iscritti < maxPlayers ? (
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 mb-6 w-fit animate-pulse">
                    Iscrizioni Aperte
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-500/20 text-red-400 rounded-full font-bold uppercase tracking-widest border border-red-500/30 mb-6 w-fit">
                    Iscrizioni Chiuse (In Attesa)
                  </div>
                )}
                
                <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-6 line-clamp-2">
                  {t.name}
                </h2>
                
                {t.type !== 'coppie_fisse' && (
                  <div className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 rounded-3xl shadow-[0_0_40px_rgba(147,51,234,0.4)] mb-8 border border-purple-400 flex items-center justify-between animate-pulse-slow">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-4 rounded-2xl">
                        <Calendar className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-purple-100 font-bold uppercase tracking-widest text-sm">Evento Dal Vivo</span>
                        <span className="text-3xl font-black text-white uppercase">Cerimonia Sorteggio Coppie e Calendario</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {t.drawDate ? (
                        <>
                          <div className="text-4xl font-black text-white">{new Date(t.drawDate).toLocaleDateString('it-IT')}</div>
                          <div className="text-xl font-bold text-purple-200">alle {new Date(t.drawDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</div>
                        </>
                      ) : (
                        <div className="text-3xl font-black text-white">DA DEFINIRE</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <Calendar className="w-10 h-10 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Inizio Torneo</div>
                      <div className="text-xl font-bold whitespace-nowrap">{t.startDate ? new Date(t.startDate).toLocaleDateString('it-IT') : "Da Def."}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <Banknote className="w-10 h-10 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Costo a persona</div>
                      <div className="text-xl font-bold">{t.pricePerPlayer ? `${t.pricePerPlayer} €` : "Gratis"}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-5 mb-8">
                  <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-8 rounded-3xl border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Trophy className="w-32 h-32 text-yellow-500" />
                    </div>
                    <h3 className="text-yellow-500 font-black uppercase tracking-widest text-sm flex items-center gap-3 mb-3">
                      <Trophy className="w-5 h-5" /> Regolamento del Torneo
                    </h3>
                    <div className="text-white font-black text-3xl mb-2">{formatTitle}</div>
                    <div className="text-slate-300 text-lg leading-relaxed relative z-10">{formatDesc}</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-8 rounded-3xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Users className="w-32 h-32 text-blue-500" />
                    </div>
                    <h3 className="text-blue-400 font-black uppercase tracking-widest text-sm flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5" /> Formazione Squadre
                    </h3>
                    <div className="text-white font-black text-3xl mb-2">{typeTitle}</div>
                    <div className="text-slate-300 text-lg leading-relaxed relative z-10">{typeDesc}</div>
                  </div>
                </div>
                
                <div className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-3xl mt-auto">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-purple-300 font-bold uppercase tracking-wider">Stato Iscrizioni</div>
                    <div className="text-2xl font-black text-white">{iscritti} / {maxPlayers}</div>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden mb-3 border border-slate-800">
                    <div className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full" style={{ width: `${(iscritti/maxPlayers)*100}%` }}></div>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm text-right">{missingText}</div>
                </div>
              </div>

              {/* RIGHT COLUMN - QR AND NAMES */}
              <div className="w-[500px] shrink-0 flex flex-col gap-8 h-full">
                
                {/* QR CODE GIGANTE */}
                {iscritti < maxPlayers && (
                  <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col items-center">
                     <QRCodeDisplay tournamentId={t.id} />
                  </div>
                )}
                
                {/* LISTA NOMI */}
                <div className="flex-1 bg-slate-900/80 p-8 rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-center mb-6">Giocatori Iscritti</h3>
                  <div className="flex flex-wrap gap-3 overflow-hidden content-start justify-center">
                    {registrations.length === 0 ? (
                       <div className="text-slate-500 mt-10 text-center w-full">Nessun iscritto finora. Fai il primo passo!</div>
                    ) : (
                      registrations.slice(0, 48).map((r: any) => (
                        <div key={r.id} className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-white font-bold text-sm flex items-center gap-2 shadow-md">
                          {r.player?.name.split(" ")[0]}
                        </div>
                      ))
                    )}
                    {registrations.length > 48 && (
                      <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-slate-400 font-bold text-sm shadow-md">
                        + {registrations.length - 48} altri
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
          );})()}

          
          


          {/* BRACKET GRID SLIDE */}
          {currentSlide.type === "bracket_grid" && (
            <div className="flex flex-col items-center w-full h-full max-h-[85vh]">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 mb-6">
                <Swords className="w-5 h-5" /> Partite del Tabellone
              </div>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mb-8 text-center">
                {currentSlide.tournament.name}
              </h2>
              
              <div className="w-full overflow-y-auto px-2 custom-scrollbar pb-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full">
                  {currentSlide.tournament.matches?.map((m: any) => {
                    const isFinished = !!m.winnerTeamId;
                    return (
                      <div key={m.id} className={`flex flex-col rounded-3xl border-2 p-5 ${isFinished ? 'bg-slate-800/60 border-slate-700 opacity-60' : 'bg-slate-900 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]'}`}>
                        <div className="text-sm text-slate-400 font-bold mb-4 uppercase tracking-widest flex justify-between items-center">
                          <span>{isFinished ? "Completata" : (m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString('it-IT') : "Da Pianificare")}</span>
                          <Calendar className="w-4 h-4 text-purple-400" />
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <div className={`flex justify-between items-center p-3 rounded-xl ${m.winnerTeamId === m.teamAId ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
                            <span className="truncate text-lg flex flex-col">
  {m.teamAId && currentSlide.tournament.teamNames && currentSlide.tournament.teamNames[m.teamAId] && (
    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">"{currentSlide.tournament.teamNames[m.teamAId]}"</span>
  )}
  <span>{m.teamAId ? `${m.teamA?.player1?.name} & ${m.teamA?.player2?.name}` : "TBD"}</span>
</span>
                            <span className="font-black text-xl ml-3">{m.scoreTeamA}</span>
                          </div>
                          
                          <div className={`flex justify-between items-center p-3 rounded-xl ${m.winnerTeamId === m.teamBId ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
                            <span className="truncate text-lg flex flex-col">
  {m.teamBId && currentSlide.tournament.teamNames && currentSlide.tournament.teamNames[m.teamBId] && (
    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">"{currentSlide.tournament.teamNames[m.teamBId]}"</span>
  )}
  <span>{m.teamBId ? `${m.teamB?.player1?.name} & ${m.teamB?.player2?.name}` : "TBD"}</span>
</span>
                            <span className="font-black text-xl ml-3">{m.scoreTeamB}</span>
                          </div>
                          {m.setScores && formatSetScores(m.setScores) && (
                            <div className="bg-slate-950/80 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs font-bold mt-1">
                              <span className="text-[15px] text-purple-400 uppercase tracking-wider font-black">Gol Set:</span>
                              <span className="text-emerald-400 font-black tracking-wider text-sm">{formatSetScores(m.setScores)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TABELLONE TURNI / BRACKET TREE */}

          {currentSlide.type === "bracket_tree" && (() => {
            const t = currentSlide.tournament;
            const matchProbs = calculateMatchProbabilities(t, data.advancedPlayerStats);
            let rounds: any[][] = [];
            
            try {
               const bData = t.bracketData ? JSON.parse(t.bracketData) : null;
               if (bData && bData.rounds) {
                 rounds = bData.rounds.map((roundMatchIds: string[]) => 
                   roundMatchIds.map(id => t.matches?.find((m: any) => m.id === id)).filter(Boolean)
                 ).filter((r: any[]) => r.length > 0);
               }
            } catch (e) {}

            if (rounds.length === 0 && t.matches) {
               const grouped = t.matches.reduce((acc: any, m: any) => {
                 const bt = m.bracketType || 'Turno';
                 if (!acc[bt]) acc[bt] = [];
                 acc[bt].push(m);
                 return acc;
               }, {});
               rounds = Object.values(grouped);
            }

            return (
            <div className="flex flex-col items-center justify-center w-full h-full px-2 sm:px-6">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-pink-500/20 text-pink-400 rounded-full font-bold uppercase tracking-widest border border-pink-500/30 mb-4 animate-pulse">
                Svolgimento Torneo
              </div>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mb-8 text-center">
                Turni {t.name}
              </h2>
              
              <div className="flex gap-6 lg:gap-8 w-full h-[72vh] items-stretch justify-center">
                 {rounds.map((round, rIndex) => {
                    let roundName = `Turno ${rIndex + 1}`;
                    if (t.format === 'eliminazione_diretta') {
                        roundName = round.length === 1 ? "Finale" : round.length === 2 ? "Semifinali" : round.length === 4 ? "Quarti" : round.length === 8 ? "Ottavi" : `Turno ${rIndex + 1}`;
                    } else if (round[0]?.bracketType) {
                        roundName = round[0].bracketType.toUpperCase();
                    }
                    
                    return (
                      <div key={rIndex} className="flex-1 flex flex-col gap-4 min-w-[380px] max-w-5xl h-full overflow-y-auto custom-scrollbar pb-10">
                         <div className="bg-slate-900/90 p-4 text-center rounded-2xl border-2 border-pink-500/30 shadow-xl sticky top-0 z-10 backdrop-blur-md">
                           <h3 className="text-xl font-black text-pink-400 uppercase tracking-widest">{roundName}</h3>
                         </div>
                         <div className={`grid grid-cols-1 ${round.length > 4 ? 'xl:grid-cols-2' : ''} gap-4 w-full`}>
                           {round.map((m: any, mIndex: number) => (
                             <div key={m.id || mIndex} className={`p-4 rounded-2xl border-2 flex flex-col justify-center items-center gap-3 relative shadow-lg transition-all ${m.winnerTeamId ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-850 border-slate-600 hover:border-pink-500/60'}`}>
                                <div className="flex justify-between items-center w-full">
                                  <div className="flex-1 flex flex-col min-w-0 pr-2">
                                    {m.teamAId && t.teamNames && t.teamNames[m.teamAId] && (
                                      <span className="text-[11px] text-purple-400 font-bold uppercase tracking-wider truncate mb-0.5">
                                        "{t.teamNames[m.teamAId]}"
                                      </span>
                                    )}
                                    <span className={`text-base font-bold truncate leading-tight ${m.winnerTeamId === m.teamAId ? 'text-emerald-400 font-black' : 'text-slate-200'}`}>
                                      {m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}
                                    </span>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-3 mx-1">
                                    {matchProbs.has(m.id) && !m.winnerTeamId && (
                                      <span className="text-[15px] text-yellow-500/90 font-black tracking-wider text-right uppercase">WIN: {matchProbs.get(m.id).teamAProb.toFixed(0)}%</span>
                                    )}
                                    <div className="bg-slate-950 px-5 py-2.5 rounded-2xl text-2xl font-black text-white shadow-inner flex flex-col items-center border border-slate-800">
                                      <span>{m.winnerTeamId ? `${m.scoreTeamA} - ${m.scoreTeamB}` : 'VS'}</span>
                                      {m.winnerTeamId && m.setScores && formatSetScores(m.setScores) && (
                                        <span className="text-[15px] text-emerald-400 font-bold tracking-tight mt-1">
                                          ({formatSetScores(m.setScores)})
                                        </span>
                                      )}
                                    </div>
                                    {matchProbs.has(m.id) && !m.winnerTeamId && (
                                      <span className="text-[15px] text-yellow-500/90 font-black tracking-wider text-left uppercase">WIN: {matchProbs.get(m.id).teamBProb.toFixed(0)}%</span>
                                    )}
                                  </div>

                                  <div className="flex-1 flex flex-col min-w-0 pl-2 text-right">
                                    {m.teamBId && t.teamNames && t.teamNames[m.teamBId] && (
                                      <span className="text-[11px] text-purple-400 font-bold uppercase tracking-wider truncate mb-0.5">
                                        "{t.teamNames[m.teamBId]}"
                                      </span>
                                    )}
                                    <span className={`text-base font-bold truncate leading-tight ${m.winnerTeamId === m.teamBId ? 'text-emerald-400 font-black' : 'text-slate-200'}`}>
                                      {m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}
                                    </span>
                                  </div>
                                </div>
                                {(() => {
                                  if (m.winnerTeamId) return null;
                                  const dateToUse = m.scheduledAt || currentSlide.tournament.startDate;
                                  if (!dateToUse) return <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Data da definire</div>;
                                  return (
                                    <div className="text-sm font-black text-blue-400 bg-blue-500/20 px-4 py-1 rounded-lg mt-2">
                                      {new Date(dateToUse).toLocaleDateString('it-IT')} {m.scheduledAt ? `alle ${new Date(dateToUse).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : ''}
                                    </div>
                                  );
                                })()}
                             </div>
                           ))}
                         </div>
                      </div>
                    )
                 })}
              </div>
            </div>
            );
          })()}

          {/* LIVE BRACKET / MATCHES SLIDE */}
          {currentSlide.type === "live_bracket" && (() => {
            const matchProbsLive = calculateMatchProbabilities(currentSlide.tournament, data.advancedPlayerStats);
            return (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-500/20 text-blue-400 rounded-full font-bold uppercase tracking-widest border border-blue-500/30 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                Tabellone In Corso
              </div>
              <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-2">
                {currentSlide.tournament.name}
              </h2>
              <p className="text-xl text-slate-400 mb-8 uppercase tracking-widest">
                {formatName(currentSlide.tournament.format)}
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                {/* MATCHES IN CORSO O DA GIOCARE */}
                <div className="bg-slate-900/80 p-8 rounded-[2rem] border-2 border-slate-800 shadow-2xl backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <MonitorPlay className="w-6 h-6 text-blue-400" /> Prossimi Incontri
                  </h3>
                  <div className="flex flex-col gap-4">
                    {currentSlide.tournament.matches
                      ?.filter((m: any) => !m.winnerTeamId && m.teamAId && m.teamBId)
                      .sort((a: any, b: any) => new Date(a.playedAt || a.createdAt).getTime() - new Date(b.playedAt || b.createdAt).getTime())
                      .slice(0, 4)
                      .map((m: any) => (
                        <div key={m.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-col justify-center items-center text-lg font-bold gap-2 relative">
                          <div className="flex justify-between w-full items-center">
                            <div className="flex-1 flex flex-col">
                              <span className="text-white leading-tight">{m.teamA?.player1?.name} <span className="text-slate-500 text-sm mx-1">&</span> {m.teamA?.player2?.name}</span>
                            </div>
                            
                            <div className="shrink-0 flex items-center gap-3 mx-2">
                              {matchProbsLive.has(m.id) && (
                                <span className="text-[13px] text-yellow-500/90 font-black tracking-wider uppercase text-right leading-tight">WIN: {matchProbsLive.get(m.id).teamAProb.toFixed(0)}%</span>
                              )}
                              <span className="text-slate-500 shrink-0 font-black text-xl">VS</span>
                              {matchProbsLive.has(m.id) && (
                                <span className="text-[13px] text-yellow-500/90 font-black tracking-wider uppercase text-left leading-tight">WIN: {matchProbsLive.get(m.id).teamBProb.toFixed(0)}%</span>
                              )}
                            </div>
                            
                            <div className="flex-1 flex flex-col items-end text-right">
                              <span className="text-white leading-tight">{m.teamB?.player1?.name} <span className="text-slate-500 text-sm mx-1">&</span> {m.teamB?.player2?.name}</span>
                            </div>
                          </div>
                          {(() => {
                            const dateToUse = m.scheduledAt || currentSlide.tournament.startDate;
                            if (!dateToUse) return <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Data da definire</div>;
                            return (
                              <div className="text-xs font-black text-blue-400 bg-blue-500/20 px-3 py-1 rounded-lg mt-1">
                                {new Date(dateToUse).toLocaleDateString('it-IT')} {m.scheduledAt ? `alle ${new Date(dateToUse).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : ''}
                              </div>
                            );
                          })()}
                        </div>
                    ))}
                    {currentSlide.tournament.matches?.filter((m: any) => !m.winnerTeamId && m.teamAId && m.teamBId).length === 0 && (
                       <p className="text-slate-500 text-center py-4">In attesa del prossimo turno...</p>
                    )}
                  </div>
                </div>

                {/* ULTIMI RISULTATI */}
                <div className="bg-slate-900/80 p-8 rounded-[2rem] border-2 border-slate-800 shadow-2xl backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Swords className="w-6 h-6 text-emerald-400" /> Ultimi Risultati
                  </h3>
                  <div className="flex flex-col gap-4">
                    {currentSlide.tournament.matches
                      ?.filter((m: any) => m.winnerTeamId)
                      .slice(0, 4)
                      .map((m: any) => (
                        <div key={m.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
                          <span className={`text-lg font-bold flex-1 leading-tight ${m.winnerTeamId === m.teamAId ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {m.teamA?.player1?.name} & {m.teamA?.player2?.name}
                          </span>
                          <div className="shrink-0 bg-slate-950 px-4 py-1 rounded-xl text-xl font-black text-white shadow-inner mx-4">
                            {m.scoreTeamA} - {m.scoreTeamB}
                          </div>
                          <span className={`text-lg font-bold flex-1 text-right leading-tight ${m.winnerTeamId === m.teamBId ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {m.teamB?.player1?.name} & {m.teamB?.player2?.name}
                          </span>
                        </div>
                    ))}
                    {currentSlide.tournament.matches?.filter((m: any) => m.winnerTeamId).length === 0 && (
                       <p className="text-slate-500 text-center py-4">Nessun match ancora terminato.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })()}

          {/* LIVE AGENDA SLIDE */}
          {currentSlide.type === "live_agenda" && (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase tracking-widest border border-indigo-500/30 mb-6">
                <Clock className="w-5 h-5" /> Programmazione
              </div>
              <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-12">
                Agenda {currentSlide.tournament.name}
              </h2>
              
              <div className="bg-slate-900/80 p-8 rounded-[3rem] border-2 border-indigo-500/20 shadow-2xl backdrop-blur-sm w-full max-w-6xl">
                <div className="flex flex-col gap-6">
                  {currentSlide.tournament.matches
                    ?.filter((m: any) => m.scheduledAt && !m.winnerTeamId)
                    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .slice(0, 5)
                    .map((m: any) => {
                      const date = new Date(m.scheduledAt);
                      return (
                        <div key={m.id} className="flex items-center justify-between bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-md">
                          <div className="flex items-center gap-6">
                            <div className="bg-indigo-500/20 text-indigo-300 px-6 py-3 rounded-2xl border border-indigo-500/30 font-black text-xl text-center">
                              <div>{date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</div>
                              <div>{date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm uppercase font-bold tracking-widest mb-1">Girone / Turno: {formatName(m.bracketType)}</div>
                              <div className="text-2xl font-bold text-white flex items-center gap-4">
                                {m.teamAId ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}
                                <span className="text-slate-500 text-lg">VS</span>
                                {m.teamBId ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* HALL OF FAME SLIDE */}
          {currentSlide.type === "hall_of_fame" && (
            <div className="flex flex-col items-center w-full">
              <Crown className="w-20 h-20 text-yellow-500 mb-6 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse" />
              <h2 className="text-6xl font-black uppercase tracking-widest text-yellow-400 mb-14 drop-shadow-lg">
                Albo d'Oro Tornei
              </h2>
              
              <div className="flex flex-col gap-6 w-full">
                {completedTournaments.slice(0, 5).map((t: any) => {
                  const formatLabel = t.format === "eliminazione_diretta" 
                    ? "Eliminazione Diretta" 
                    : t.format === "doppia_eliminazione" 
                    ? "Doppia Eliminazione" 
                    : "Gironi + Playoff";
                  
                  const typeLabel = t.type === "sorteggio_ruoli" 
                    ? "Sorteggio Ruoli" 
                    : t.type === "sorteggio_integrale" 
                    ? "Sorteggio Integrale" 
                    : "Coppie Fisse";

                  const winnerTeamName = t.teamNames && t.winnerTeamId && t.teamNames[t.winnerTeamId] 
                    ? t.teamNames[t.winnerTeamId] 
                    : null;

                  return (
                    <div key={t.id} className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-2 border-yellow-500/30 p-7 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl shrink-0">
                          <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        </div>
                        <div className="text-left">
                          <div className="text-3xl font-black text-white mb-2">{t.name}</div>
                          <div className="flex items-center gap-3 text-sm font-bold flex-wrap">
                            <span className="text-slate-400 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              {new Date(t.createdAt).toLocaleDateString('it-IT')}
                            </span>
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs uppercase tracking-wider">
                              {formatLabel}
                            </span>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs uppercase tracking-wider">
                              {typeLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CENTER: CHAMPIONS (more important) */}
                      <div className="text-center shrink-0 self-center mx-6">
                        <div className="text-xs text-yellow-500 font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                          <Crown className="w-4 h-4 text-yellow-500" /> Campioni
                        </div>
                        {winnerTeamName && (
                          <div className="text-base font-black text-emerald-400 uppercase tracking-widest mb-1">
                            "{winnerTeamName}"
                          </div>
                        )}
                        <div className="text-3xl font-black text-white">
                          {t.winnerTeam?.player1?.name || "Campione 1"} <span className="text-slate-500 mx-2">&</span> {t.winnerTeam?.player2?.name || "Campione 2"}
                        </div>
                      </div>

                      {/* RIGHT: INDIVIDUAL AWARDS */}
                      {(() => {
                        if (!t.awardsData) return null;
                        const awards = typeof t.awardsData === 'string' ? JSON.parse(t.awardsData) : t.awardsData;
                        const gkNames = awards.goldenGloves?.map((g: any) => g.player?.name).filter(Boolean).join(' & ');
                        const stNames = awards.goldenBoots?.map((g: any) => g.player?.name).filter(Boolean).join(' & ');
                        if (!gkNames && !stNames) return null;
                        return (
                          <div className="flex flex-row items-center gap-10 mx-8 shrink-0 self-center">
                            {gkNames && (
                              <div className="flex items-center gap-3">
                                <span className="text-5xl">🧤</span>
                                <div className="flex flex-col">
                                  <span className="text-sm text-blue-400 font-black uppercase tracking-widest mb-0.5">Guantoni d'Oro</span>
                                  <span className="text-3xl font-black text-blue-200 uppercase tracking-wider leading-tight">{gkNames}</span>
                                </div>
                              </div>
                            )}
                            {gkNames && stNames && (
                              <div className="w-px h-16 bg-slate-600/60 shrink-0" />
                            )}
                            {stNames && (
                              <div className="flex items-center gap-3">
                                <span className="text-5xl">👟</span>
                                <div className="flex flex-col">
                                  <span className="text-sm text-red-400 font-black uppercase tracking-widest mb-0.5">Scarpa d'Oro</span>
                                  <span className="text-3xl font-black text-red-200 uppercase tracking-wider leading-tight">{stNames}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* BACKGROUND EFFECTS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scrollVertical {
          0% { transform: translateY(50vh); }
          100% { transform: translateY(calc(-100% - 20vh)); }
        }
        @keyframes spotlightIn {
          0% { opacity: 0; transform: scale(0.7) translateY(40px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scroll-vertical {
          animation-name: scrollVertical;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        .mask-edges {
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
        @keyframes scrollMatches {
          0% { transform: translateY(0); }
          15% { transform: translateY(0); }
          85% { transform: translateY(calc(-100% + 62vh)); }
          100% { transform: translateY(calc(-100% + 62vh)); }
        }
        .animate-scroll-matches {
          animation-name: scrollMatches;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}} />
    </div>
  );
}
