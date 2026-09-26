"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Users, Goal, ShieldAlert, AlertTriangle, Calendar, Banknote, Medal, Crown, Activity, Swords, Clock, MonitorPlay, Shield } from "lucide-react";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import SlotMachineDraw from "@/components/SlotMachineDraw";
import MatchesDrawCeremony from "@/components/MatchesDrawCeremony";
import TournamentRulebook from "@/components/TournamentRulebook";

import { formatSetScores } from "@/lib/scoreUtils";
import { calculateTournamentProbabilities, calculateMatchProbabilities } from "@/lib/probabilityUtils";
import { getFeederMatchInfo } from "@/lib/tournamentLogic";
import { computeGroupStandings } from "@/lib/tournamentEngines";
import { BracketWithSpotlight } from "@/components/BracketWithSpotlight";


export default function TVSlideshow({ data }: { data: any }) {
  const router = useRouter();
  const { playerStats, teamStats, promoTournaments, inProgressTournaments, completedTournaments } = data;
  
  // Filter out players with 0 wins from Sfide Libere
  if (data.freeMatchesStats) {
    data.freeMatchesStats = data.freeMatchesStats.filter((p: any) => p.v > 0);
  }
  
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

  // Slides for Player Advanced Stats (TOP 3 Podiums)
  if (data.advancedPlayerStats && data.advancedPlayerStats.length > 0) {
    // Global
    const globalCount = Math.min(3, data.advancedPlayerStats.length);
    slides.push({ type: "player_stats", duration: globalCount * 6300 + 10000, roleFilter: 'all' });
    
    // Defenders
    const defs = data.advancedPlayerStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'difensore' || p.player.preferredRole?.toLowerCase() === 'portiere');
    if (defs.length > 0) {
      slides.push({ type: "player_stats", duration: Math.min(3, defs.length) * 6300 + 10000, roleFilter: 'defender' });
    }
    
    // Strikers
    const strks = data.advancedPlayerStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'attaccante');
    if (strks.length > 0) {
      slides.push({ type: "player_stats", duration: Math.min(3, strks.length) * 6300 + 10000, roleFilter: 'striker' });
    }
  }
  
  // Slides for Promo
  promoTournaments.forEach((t: any) => {
    slides.push({ type: "promo", tournament: t, duration: 15000 });
  });  // Slides for In Progress (Bracket & Agenda)
  inProgressTournaments.forEach((t: any) => {
    if (t.status === "drawing") {
      slides.push({ type: "slot_machine", tournament: t, duration: 1200000 }); // 20 minutes max, the component will manually skip to next
    } else if (t.status === "matches_drawing") {
      slides.push({ type: "matches_draw", tournament: t, duration: 1200000 }); // Max 20 min, component will auto-skip
    } else {
      if (t.format === "gironi_eliminazione") {
        slides.push({ type: "group_stage", tournament: t, duration: 30000 });
        // If there are playoff matches, also push the bracket_tree slide
        const playoffMatches = (t.matches || []).filter((m: any) => m.bracketType === "playoff" || m.bracketType?.startsWith("Quarti") || m.bracketType?.startsWith("Semifinal") || m.bracketType?.startsWith("Final") || m.bracketType?.startsWith("Ottavi"));
        if (playoffMatches.length > 0) {
          const matchesToAnimate = playoffMatches.filter((m: any) => !m.winnerTeamId).length;
          const calcDuration = matchesToAnimate > 0 ? 1500 + (matchesToAnimate * 5000) + 9000 : 30000;
          slides.push({ type: "bracket_tree", tournament: t, duration: Math.max(30000, calcDuration) });
        }
      } else {
        const matchesToAnimate = (t.matches || []).filter((m: any) => !m.winnerTeamId).length;
        // 1.5s initial delay + 5s per match + 1s fade + 8s persistence at the end
        const calcDuration = matchesToAnimate > 0 ? 1500 + (matchesToAnimate * 5000) + 9000 : 30000;
        slides.push({ type: "bracket_tree", tournament: t, duration: Math.max(30000, calcDuration) });
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

  // Advance spotlight to next player every 6.3 seconds
  useEffect(() => {
    if (spotlightPlayerIdx === null) return;
    const slide = slides[currentIndex < slides.length ? currentIndex : 0];
    if (slide?.type !== 'player_stats') return;
    
    let filtered = data.advancedPlayerStats || [];
    if (slide.roleFilter === 'defender') {
      filtered = filtered.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'difensore' || p.player.preferredRole?.toLowerCase() === 'portiere');
    } else if (slide.roleFilter === 'striker') {
      filtered = filtered.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'attaccante');
    }
    
    const playersOnPage = Math.min(3, filtered.length);
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

  if (currentSlide?.type === "matches_draw") {
      return (
        <div className="w-full h-screen bg-slate-950 text-white">
          <MatchesDrawCeremony tournament={currentSlide.tournament} />
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
            <div className="flex flex-col w-full h-[90vh] gap-6">
              
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
                      p.points === playerStats[0].points && 
                      p.wins === playerStats[0].wins && 
                      p.winRate === playerStats[0].winRate
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

                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10 justify-center">
                        <div className="text-3xl font-black text-yellow-500 flex items-baseline gap-1">
                          {playerStats[0].points} <span className="text-xl">PT</span>
                        </div>
                        <div className="text-lg font-bold text-slate-400">
                          {playerStats[0].wins} V / {playerStats[0].played} G
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
                    {playerStats.slice(playerStats.filter((p: any) => p.points === playerStats[0]?.points && p.wins === playerStats[0]?.wins && p.winRate === playerStats[0]?.winRate).length).map((p: any, i: number) => {
                      const rank = i + 1 + playerStats.filter((ps: any) => ps.points === playerStats[0]?.points && ps.wins === playerStats[0]?.wins && ps.winRate === playerStats[0]?.winRate).length;
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

                            </div>
                          </div>

                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <div className="text-2xl font-black text-yellow-500 flex items-baseline gap-1">
                            {p.points} <span className="text-sm">PT</span>
                          </div>
                          <div className="text-sm font-bold text-slate-400 text-right">
                            {p.wins} V / {p.played} G
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
                      t.points === teamStats[0].points && 
                      t.wins === teamStats[0].wins && 
                      t.winRate === teamStats[0].winRate
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
                        <div className="text-3xl font-black text-yellow-500 flex items-baseline gap-1">
                          {teamStats[0].points} <span className="text-xl">PT</span>
                        </div>
                        <div className="text-lg font-bold text-slate-400">
                          {teamStats[0].wins} V / {teamStats[0].played} G
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
                    {teamStats.slice(teamStats.filter((t: any) => t.points === teamStats[0]?.points && t.wins === teamStats[0]?.wins && t.winRate === teamStats[0]?.winRate).length).map((t: any, i: number) => {
                      const rank = i + 1 + teamStats.filter((ts: any) => ts.points === teamStats[0]?.points && ts.wins === teamStats[0]?.wins && ts.winRate === teamStats[0]?.winRate).length;
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
                          <div className="text-2xl font-black text-yellow-500 flex items-baseline gap-1">
                            {t.points} <span className="text-sm">PT</span>
                          </div>
                          <div className="text-sm font-bold text-slate-400 text-right">
                            {t.wins} V / {t.played} G
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
            <div className="flex flex-col w-full h-[90vh] gap-6">
              
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
                                  <div className="flex items-center gap-6 shrink-0 ml-8">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-[13px] text-blue-400 font-bold tracking-widest uppercase">Tot Subiti</span>
                                      <span className="text-3xl font-black text-white leading-none">{tSubiti}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-[13px] text-blue-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-3xl font-black text-white leading-none">{mSubiti}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10 justify-center">
                        <div className="text-3xl font-black text-blue-500 flex items-baseline gap-1">
                          {defenderStats[0].points} <span className="text-xl">PT</span>
                        </div>
                        <div className="text-lg font-bold text-slate-400">
                          {defenderStats[0].wins} V / {defenderStats[0].played} G
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
                      <div key={p.id} className="flex items-center bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 w-[40%] shrink-0">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-blue-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                          <div className="flex flex-col min-w-0 justify-center">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold text-white truncate leading-tight">{p.name}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 flex justify-center items-center min-w-0">
                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === p.id);
                            const rStats = advStats?.roleStats;
                            const tSubiti = rStats?.gkGoalsConceded || 0;
                            const mSubiti = rStats?.gkMatches > 0 ? (tSubiti / rStats.gkMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-6 shrink-0 mx-2">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[12px] text-blue-500 font-bold uppercase tracking-widest leading-none">Tot Subiti</span>
                                  <span className="text-2xl font-black text-white leading-none">{tSubiti}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[12px] text-blue-500 font-bold uppercase tracking-widest leading-none">Media</span>
                                  <span className="text-2xl font-black text-white leading-none">{mSubiti}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex flex-col items-end w-[25%] shrink-0 ml-auto">
                          <div className="text-2xl font-black text-blue-500 flex items-baseline gap-1">
                            {p.points} <span className="text-sm">PT</span>
                          </div>
                          <div className="text-sm font-bold text-slate-400 text-right">
                            {p.wins} V / {p.played} G
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
                                  <div className="flex items-center gap-6 shrink-0 ml-8">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-[13px] text-red-400 font-bold tracking-widest uppercase">Tot Fatti</span>
                                      <span className="text-3xl font-black text-white leading-none">{tFatti}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-[13px] text-red-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-3xl font-black text-white leading-none">{mFatti}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                             </div>
                           </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4 z-10 justify-center">
                        <div className="text-3xl font-black text-red-500 flex items-baseline gap-1">
                          {strikerStats[0].points} <span className="text-xl">PT</span>
                        </div>
                        <div className="text-lg font-bold text-slate-400">
                          {strikerStats[0].wins} V / {strikerStats[0].played} G
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
                      <div key={t.id} className="flex items-center bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0 w-[40%] shrink-0">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-red-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                          <div className="flex flex-col min-w-0 justify-center">
                            <span className="text-2xl font-bold text-white truncate leading-tight">{t.name}</span>
                          </div>
                        </div>
                        <div className="flex-1 flex justify-center items-center min-w-0">
                          {(() => {
                            const advStats = data.advancedPlayerStats?.find((aps: any) => aps.player.id === t.id);
                            const rStats = advStats?.roleStats;
                            const tFatti = rStats?.stGoalsScored || 0;
                            const mFatti = rStats?.stMatches > 0 ? (tFatti / rStats.stMatches).toFixed(2) : '-';
                            return (
                              <div className="flex items-center gap-6 shrink-0 mx-2">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[12px] text-red-500 font-bold uppercase tracking-widest leading-none">Tot Fatti</span>
                                  <span className="text-2xl font-black text-white leading-none">{tFatti}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[12px] text-red-500 font-bold uppercase tracking-widest leading-none">Media</span>
                                  <span className="text-2xl font-black text-white leading-none">{mFatti}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex flex-col items-end w-[25%] shrink-0 ml-auto">
                          <div className="text-2xl font-black text-red-500 flex items-baseline gap-1">
                            {t.points} <span className="text-sm">PT</span>
                          </div>
                          <div className="text-sm font-bold text-slate-400 text-right">
                            {t.wins} V / {t.played} G
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
            <div className="flex flex-col items-center w-full max-w-7xl h-[90vh] justify-start relative z-10 mx-auto px-4">
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
            let filteredStats = data.advancedPlayerStats || [];
            if (currentSlide.roleFilter === 'defender') {
              filteredStats = filteredStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'difensore' || p.player.preferredRole?.toLowerCase() === 'portiere');
              filteredStats.sort((a: any, b: any) => {
                const wrA = a.roleStats?.gkMatches > 0 ? (a.roleStats.gkWins / a.roleStats.gkMatches) : 0;
                const wrB = b.roleStats?.gkMatches > 0 ? (b.roleStats.gkWins / b.roleStats.gkMatches) : 0;
                if (wrB !== wrA) return wrB - wrA;
                const winsA = a.roleStats?.gkWins || 0;
                const winsB = b.roleStats?.gkWins || 0;
                if (winsB !== winsA) return winsB - winsA;
                return (b.roleStats?.gkMatches || 0) - (a.roleStats?.gkMatches || 0);
              });
            } else if (currentSlide.roleFilter === 'striker') {
              filteredStats = filteredStats.filter((p: any) => p.player.preferredRole?.toLowerCase() === 'attaccante');
              filteredStats.sort((a: any, b: any) => {
                const wrA = a.roleStats?.stMatches > 0 ? (a.roleStats.stWins / a.roleStats.stMatches) : 0;
                const wrB = b.roleStats?.stMatches > 0 ? (b.roleStats.stWins / b.roleStats.stMatches) : 0;
                if (wrB !== wrA) return wrB - wrA;
                const winsA = a.roleStats?.stWins || 0;
                const winsB = b.roleStats?.stWins || 0;
                if (winsB !== winsA) return winsB - winsA;
                return (b.roleStats?.stMatches || 0) - (a.roleStats?.stMatches || 0);
              });
            }
            const pageStats = filteredStats.slice(0, 3);
            
            const titleText = currentSlide.roleFilter === 'defender' ? 'TOP 3 DEFENDER' : currentSlide.roleFilter === 'striker' ? 'TOP 3 STRIKER' : 'TOP 3';
            
            
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
              <div className="flex flex-col items-center justify-center w-full h-[90vh] relative z-10 px-8 animate-fade-in">
                <div className="flex flex-row items-center justify-center shrink-0 mb-6 absolute top-0 pt-8 w-full z-10 gap-6">
                  <Activity className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-pulse" />
                  <h2 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg flex items-center">
                    {titleText}
                  </h2>
                </div>
                
                <div className="w-full h-full relative max-w-[1600px] mx-auto pt-[160px]">
                    {pageStats.map((ps: any, cardIdx: number) => {
                      const { player, rank, played, wins, winRate, totalGoalsScored, avgGoalsPerMatch, roleStats } = ps;
                      
                      let displayRank = rank;
                      let displayPlayed = played;
                      let displayWins = wins;
                      let displayWinRate = winRate;
                      let showDefenderBox = true;
                      let showStrikerBox = true;

                      if (currentSlide.roleFilter === 'defender') {
                        displayRank = cardIdx + 1;
                        displayPlayed = roleStats?.gkMatches || 0;
                        displayWins = roleStats?.gkWins || 0;
                        displayWinRate = displayPlayed > 0 ? ((displayWins / displayPlayed) * 100).toFixed(1) : '0.0';
                        showStrikerBox = false;
                      } else if (currentSlide.roleFilter === 'striker') {
                        displayRank = cardIdx + 1;
                        displayPlayed = roleStats?.stMatches || 0;
                        displayWins = roleStats?.stWins || 0;
                        displayWinRate = displayPlayed > 0 ? ((displayWins / displayPlayed) * 100).toFixed(1) : '0.0';
                        showDefenderBox = false;
                      }

                      const mySpotlightStage = (pageStats.length - 1) - cardIdx;
                      let styles: any = {};
                      
                      const podiumOffsets = [
                        { x: '0px', y: '0px', scale: 1.35, color: 'rgba(234,179,8,0.8)', shadow: '0 0 60px rgba(234,179,8,0.4)' },
                        { x: '-460px', y: '100px', scale: 1.25, color: 'rgba(203,213,225,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                        { x: '460px', y: '160px', scale: 1.25, color: 'rgba(249,115,22,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                      ];
                      if (pageStats.length === 2) {
                        podiumOffsets[0].x = '230px';
                        podiumOffsets[1].x = '-230px';
                      }
                      
                      const pos = podiumOffsets[cardIdx];

                      if (stage < mySpotlightStage) {
                        styles = {
                          opacity: 0,
                          transform: `translate(calc(-50% + ${pos.x}), ${pos.y}) scale(0.5)`,
                          transformOrigin: 'top center',
                          zIndex: 0,
                        };
                      } else {
                        // Apare directly in the podium spot
                        styles = {
                          opacity: 1,
                          transform: `translate(calc(-50% + ${pos.x}), ${pos.y}) scale(${pos.scale})`,
                          transformOrigin: 'top center',
                          zIndex: cardIdx === 0 ? 30 : (cardIdx === 1 ? 20 : 10),
                          borderColor: pos.color,
                          boxShadow: stage === mySpotlightStage ? '0 0 80px rgba(255,255,255,0.5)' : pos.shadow // Flash when it appears
                        };
                      }
                      
                      return (
                        <div
                          key={player.id}
                          className="absolute left-1/2 top-[12vh] bg-slate-900 border-4 p-4 rounded-3xl flex flex-col gap-3 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-[380px]"
                          style={styles}
                        >
                          {displayRank === 1 && <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none text-8xl">👑</div>}
                          
                          {/* POINTS IN TOP RIGHT */}
                          <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
                            <div className="text-3xl font-black text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                              {ps.points} <span className="text-lg">PT</span>
                            </div>
                          </div>

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
                                {displayRank && <span className="text-2xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)] flex-shrink-0">{displayRank}°</span>}
                              </div>
                              <div className="text-[17px] font-black text-slate-400 uppercase tracking-widest">{formatRole(player.preferredRole)}</div>
                            </div>
                          </div>

                          {/* MIDDLE ROW: Key stats — Gioc / Vinte / WR% */}
                          <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 z-10 mt-2">
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Gioc</span>
                              <span className="text-xl font-black text-white">{displayPlayed}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Vinte</span>
                              <span className="text-xl font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">{displayWins}</span>
                            </div>
                            <div className="flex flex-col items-center bg-yellow-500/10 rounded-lg -m-1 p-1 border border-yellow-500/20">
                              <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500 mb-0.5">WR%</span>
                              <span className="text-xl font-black text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{displayWinRate}%</span>
                            </div>
                          </div>

                          {/* ROLE SPECIFIC STATS */}
                          <div className="flex flex-col gap-2 z-10 mt-2">
                            {showDefenderBox && roleStats.gkMatches > 0 && (
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

                            {showStrikerBox && roleStats.stMatches > 0 && (
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
              </div>
            );
          })()}

          {/* RECENT MATCHES SLIDE */}
          {currentSlide.type === "recent_matches" && (() => {
            const scrollNeeded = currentSlide.scrollNeeded ?? (data.recentFreeMatches.length > 3);
            const durationSec = (currentSlide.duration || 12000) / 1000;

            return (
              <div className="flex flex-col items-center w-full h-[90vh] relative z-10 px-12">
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
              ? "Tabellone classico a scontro diretto. Nessun appello: chi vince passa al turno successivo, chi perde viene eliminato definitivamente." 
              : t.format === "doppia_eliminazione" 
              ? "Ogni squadra ha due vite! Chi perde la prima volta finisce nel 'Losers Bracket' e può ancora sperare di arrivare in finale vincendo le partite di recupero." 
              : "Ogni squadra affronterà tutte le altre del proprio girone. Solo le prime classificate accederanno alle fasi finali a eliminazione diretta.";
            
            const typeTitle = t.type === "sorteggio_ruoli" ? "Sorteggio per Ruoli" : t.type === "sorteggio_integrale" ? "Sorteggio Integrale" : "Coppie Fisse";
            const typeDesc = t.type === "sorteggio_ruoli" 
              ? "L'algoritmo formerà le coppie in modo bilanciato, accoppiando obbligatoriamente un Attaccante con un Difensore. (Chi sceglie 'Entrambi' farà da jolly)." 
              : t.type === "sorteggio_integrale" 
              ? "Sorteggio totalmente cieco. La fortuna decide chi sarà il tuo compagno, indipendentemente dal ruolo preferito." 
              : "Le coppie sono già decise. Ci si iscrive insieme al proprio compagno storico per sfidare le altre coppie.";

            return (
            <div className="flex w-full h-[90vh] gap-8 text-left items-start mt-4">
              
              {/* MAIN CONTENT CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-8 rounded-[2rem] border border-slate-700 shadow-2xl w-full">
                
                <div className="flex gap-8 mb-6">
                  {/* LEFT INFO SECTION */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      {iscritti < maxPlayers ? (
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 animate-pulse">
                          Iscrizioni Aperte
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-500/20 text-red-400 rounded-full font-bold uppercase tracking-widest border border-red-500/30">
                          Iscrizioni Chiuse (In Attesa)
                        </div>
                      )}
                      <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-800 text-slate-300 rounded-full font-bold uppercase tracking-widest border border-slate-700">
                        {missingText}
                      </div>
                    </div>
                    
                    <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-6 line-clamp-1">
                      {t.name}
                    </h2>
                    
                    {t.type !== 'coppie_fisse' && (
                      <div className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 rounded-3xl shadow-[0_0_40px_rgba(147,51,234,0.4)] mb-6 border border-purple-400 flex items-center gap-8 shrink-0">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-white/20 p-4 rounded-2xl shrink-0">
                            <Calendar className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-purple-100 font-bold uppercase tracking-widest text-xs">Evento Dal Vivo</span>
                            <span className="text-2xl font-black text-white uppercase leading-tight truncate">Cerimonia Sorteggio<br/>Coppie e Calendario</span>
                          </div>
                        </div>
                        <div className="text-left shrink-0 pl-6 border-l border-white/20">
                          {t.drawDate ? (
                            <div className="flex flex-col">
                              <span className="text-2xl font-black text-white leading-none mb-1">{new Date(t.drawDate).toLocaleDateString('it-IT')}</span>
                              <span className="text-sm font-bold text-purple-200">alle {new Date(t.drawDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          ) : (
                            <div className="text-2xl font-black text-white">DA DEFINIRE</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-4 w-full">
                      <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center gap-4 flex-1 min-w-0">
                        <Calendar className="w-8 h-8 text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider truncate">Inizio Torneo</div>
                          <div className="text-xl font-bold whitespace-nowrap truncate">{t.startDate ? new Date(t.startDate).toLocaleDateString('it-IT') : "Da Def."}</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center gap-4 flex-1 min-w-0">
                        <Banknote className="w-8 h-8 text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider truncate">Costo a persona</div>
                          <div className="text-xl font-bold truncate">{t.pricePerPlayer ? `${t.pricePerPlayer} €` : "Gratis"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT QR SECTION INSIDE THE CARD */}
                  {iscritti < maxPlayers && (
                    <div className="w-[350px] shrink-0 bg-slate-950/50 p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
                       <QRCodeDisplay tournamentId={t.id} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden group flex items-center gap-6">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <Trophy className="w-24 h-24 text-yellow-500" />
                    </div>
                    <div className="w-1/4 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-500 font-bold uppercase text-[10px] tracking-widest">Regolamento</span>
                      </div>
                      <div className="text-xl font-black text-white leading-tight">{formatTitle}</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-6">
                      <p className="text-slate-400 font-medium text-sm leading-snug">{formatDesc}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden group flex items-center gap-6">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <Users className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="w-1/4 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-500 font-bold uppercase text-[10px] tracking-widest">Formazione Squadre</span>
                      </div>
                      <div className="text-xl font-black text-white leading-tight">{typeTitle}</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-6">
                      <p className="text-slate-400 font-medium text-sm leading-snug">{typeDesc}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden group flex items-center gap-6">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <Goal className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="w-1/4 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Goal className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Punteggio</span>
                      </div>
                      <div className="text-xl font-black text-white leading-tight">Condizioni di Vittoria</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-6">
                      <p className="text-slate-400 font-medium text-sm leading-snug">
                        Ogni set viene vinto dalla prima squadra che raggiunge i <b>{t.targetGoals || 7} Gol</b>. Se si arriva sul <b>{(t.advantageThreshold || 5)}-{(t.advantageThreshold || 5)}</b>, si attivano i Vantaggi: per vincere servirà uno scarto di 2 gol.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-red-900/30 relative overflow-hidden group flex items-center gap-6">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <ShieldAlert className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="w-1/4 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span className="text-red-500 font-bold uppercase text-[10px] tracking-widest">Codice D'Onore</span>
                      </div>
                      <div className="text-xl font-black text-white leading-tight">Zero Rullate</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-6">
                      <p className="text-slate-400 font-medium text-sm leading-snug">La rotazione della stecca di 360 gradi, sia prima che dopo aver colpito la pallina, costituisce fallo. Se la pallina entra in rete in seguito a una rullata, il gol è nullo.</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-orange-900/30 relative overflow-hidden group flex items-center gap-6">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <AlertTriangle className="w-24 h-24 text-orange-500" />
                    </div>
                    <div className="w-1/4 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-500 font-bold uppercase text-[10px] tracking-widest">Codice D'Onore</span>
                      </div>
                      <div className="text-xl font-black text-white leading-tight">Divieto di Gancio</div>
                    </div>
                    <div className="flex-1 relative z-10 border-l border-slate-700/50 pl-6">
                      <p className="text-slate-400 font-medium text-sm leading-snug">È vietato fermare o controllare la pallina per poi tirare con lo stesso omino. Vietato anche il 'passetto' (passare palla a un omino sulla stessa stecca). Gioco di prima intenzione o sponda.</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          );})()}

          
          


          {/* BRACKET GRID SLIDE */}
          {currentSlide.type === "bracket_grid" && (
            <div className="flex flex-col items-center w-full h-full max-h-[90vh]">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 mb-6">
                <Swords className="w-5 h-5" /> Partite del Tabellone
              </div>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mb-8 text-center">
                {currentSlide.tournament.name}
              </h2>
              
              <div className="w-full overflow-y-auto px-2 no-scrollbar pb-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full">
                  {currentSlide.tournament.matches?.map((m: any) => {
                    const isFinished = !!m.winnerTeamId;
                    return (
                      <div key={m.id} className={`flex flex-col rounded-3xl border-2 p-5 ${isFinished ? 'bg-slate-800/60 border-slate-700 opacity-60' : 'bg-slate-900 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]'}`}>
                        <div className="text-sm text-slate-400 font-bold mb-4 uppercase tracking-widest flex justify-between items-center">
                          <span>{isFinished ? "Completata" : (m.scheduledAt ? `${new Date(m.scheduledAt).toLocaleDateString('it-IT')} ${new Date(m.scheduledAt).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : "Da Pianificare")}</span>
                          <Calendar className="w-4 h-4 text-purple-400" />
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <div className={`flex justify-between items-center p-3 rounded-xl ${m.winnerTeamId === m.teamAId ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
                            <span className="truncate text-lg flex flex-col">
  {m.teamAId && currentSlide.tournament.teamNames && currentSlide.tournament.teamNames[m.teamAId] && (
    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">"{currentSlide.tournament.teamNames[m.teamAId]}"</span>
  )}
  <span>{m.teamAId ? `${m.teamA?.player1?.name} & ${m.teamA?.player2?.name}` : getFeederMatchInfo(currentSlide.tournament, m.id, "A")}</span>
</span>
                            <span className="font-black text-xl ml-3">{m.scoreTeamA}</span>
                          </div>
                          
                          <div className={`flex justify-between items-center p-3 rounded-xl ${m.winnerTeamId === m.teamBId ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
                            <span className="truncate text-lg flex flex-col">
  {m.teamBId && currentSlide.tournament.teamNames && currentSlide.tournament.teamNames[m.teamBId] && (
    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">"{currentSlide.tournament.teamNames[m.teamBId]}"</span>
  )}
  <span>{m.teamBId ? `${m.teamB?.player1?.name} & ${m.teamB?.player2?.name}` : getFeederMatchInfo(currentSlide.tournament, m.id, "B")}</span>
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

          {currentSlide.type === "group_stage" && (() => {
            const t = currentSlide.tournament;
            return (
              <div className="flex flex-col items-center w-full h-full px-8 py-4">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase tracking-widest border border-indigo-500/30 mb-6 animate-pulse">
                  Fase a Gironi in Diretta
                </div>
                <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-8 text-center drop-shadow-2xl">
                  {t.name}
                </h2>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full max-w-[1600px] h-auto max-h-[70vh] overflow-hidden px-4">
                  {t.groups && t.groups.map((group: any) => {
                    const teamsFromMatches = group.matches ? Array.from(new Map(group.matches.map((m: any) => m.teamA).concat(group.matches.map((m: any) => m.teamB)).filter(Boolean).map((team: any) => [team.id, team])).values()) : [];
                    const teamsFromStandings = group.standings ? group.standings.map((s: any) => s.team).filter(Boolean) : [];
                    const teamsToUse = teamsFromStandings.length > 0 ? teamsFromStandings : teamsFromMatches;
                    const computedStandings = computeGroupStandings(teamsToUse as any, group.matches || []);
                    
                    return (
                    <div key={group.id} className="bg-[#151927] border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
                      <div className="bg-[#1e2436] py-5 px-6 border-b border-slate-700/60 flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white uppercase tracking-widest">{group.name}</h3>
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                        <table className="w-full text-left border-collapse table-fixed">
                          <thead>
                            <tr className="border-b border-slate-700/60 text-slate-400 text-xs uppercase tracking-widest">
                              <th className="py-4 px-6 font-bold w-20">Pos</th>
                              <th className="py-4 px-6 font-bold w-auto">Squadra</th>
                              <th className="py-4 px-6 font-bold text-center w-24">PG</th>
                              <th className="py-4 px-6 font-bold text-center w-24">V</th>
                              <th className="py-4 px-6 font-bold text-center w-24">DS</th>
                              <th className="py-4 px-6 font-bold text-center text-fuchsia-400 w-24">PTI</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...computedStandings].sort((a: any, b: any) => {
                              // 1. Punti
                              if (a.points !== b.points) return b.points - a.points;
                              
                              // 2. Differenza Set (DS)
                              const diffA = (a.setsFor || 0) - (a.setsAgainst || 0);
                              const diffB = (b.setsFor || 0) - (b.setsAgainst || 0);
                              if (diffA !== diffB) return diffB - diffA;
                              
                              // 3. Sets Fatti
                              if (a.setsFor !== b.setsFor) return (b.setsFor || 0) - (a.setsFor || 0);
                              
                              // 4. Scontro Diretto (H2H)
                              const h2h = group.matches?.find((m: any) => 
                                (m.teamAId === a.teamId && m.teamBId === b.teamId) || 
                                (m.teamAId === b.teamId && m.teamBId === a.teamId)
                              );
                              if (h2h && h2h.winnerTeamId) {
                                return h2h.winnerTeamId === a.teamId ? -1 : 1;
                              }
                              
                              return 0;
                            }).map((standing: any, index: number) => {
                              const isQualifying = index < 2; // Assuming top 2 qualify
                              const ds = (standing.setsFor || 0) - (standing.setsAgainst || 0);
                              return (
                                <tr key={standing.id || standing.teamId} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-colors">
                                  <td className="py-4 px-6">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isQualifying ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}>
                                      {index + 1}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6 truncate">
                                    <span className="text-lg font-bold text-slate-200 truncate">
                                      {standing.team?.player1?.name} & {standing.team?.player2?.name}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 text-center text-lg font-medium text-slate-400">{standing.played}</td>
                                  <td className="py-4 px-6 text-center text-lg font-medium text-slate-400">{standing.won}</td>
                                  <td className="py-4 px-6 text-center text-lg font-medium text-slate-400">{ds > 0 ? `+${ds}` : ds}</td>
                                  <td className="py-4 px-6 text-center">
                                    <span className="text-xl font-bold text-fuchsia-400">{standing.points}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            );
          })()}


          {currentSlide.type === "bracket_tree" && (() => {
            const t = currentSlide.tournament;
            const matchProbs = calculateMatchProbabilities(t, data.advancedPlayerStats);
            let rounds: any[][] = [];
            
            try {
               const bData = t.bracketData ? JSON.parse(t.bracketData) : null;
               if (bData && bData.rounds) {
                 rounds = bData.rounds.map((roundMatchIds: any[]) => 
                   roundMatchIds.map((id: any) => id ? (t.matches?.find((m: any) => m.id === id) || null) : null)
                 );
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
              <BracketWithSpotlight rounds={rounds} tournament={t} matchProbs={matchProbs} />
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

          {/* HALL OF FAME SLIDE */}
          {currentSlide.type === "hall_of_fame" && (
            <div className="flex flex-col items-center w-full h-full pb-8">
              <Crown className="w-20 h-20 text-yellow-500 mb-6 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse shrink-0" />
              <h2 className="text-6xl font-black uppercase tracking-widest text-yellow-400 mb-14 drop-shadow-lg shrink-0">
                Albo d'Oro Tornei
              </h2>
              
              <div className="flex-1 w-full overflow-hidden relative mask-edges px-4">
                <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: `${(currentSlide.duration || 15000) / 1000}s` }}>
                  {completedTournaments.map((t: any) => {
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
