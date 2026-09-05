"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RoleIcon from "@/components/RoleIcon";
import { Trophy, Users, Calendar, Banknote, Medal, Crown, Activity, Swords, Clock, MonitorPlay } from "lucide-react";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export default function TVSlideshow({ data }: { data: any }) {
  const router = useRouter();
  const { playerStats, teamStats, promoTournaments, inProgressTournaments, completedTournaments } = data;
  
  // Build slides array
  const slides: any[] = [];  // Leaderboard Slide (Auto-scrolling)
  const maxRows = Math.max(playerStats.length, teamStats.length);
  // Calculate dynamic duration based on rows (approx 1.5s per row), minimum 12 seconds
  const leaderboardDuration = Math.max(12000, maxRows * 1500);
  slides.push({ type: "leaderboard", duration: leaderboardDuration });
  
  if (data.recentFreeMatches && data.recentFreeMatches.length > 0) {
    slides.push({ type: "recent_matches", duration: 12000 });
  }
  
  // Slides for Promo
  promoTournaments.forEach((t: any) => slides.push({ type: "promo", tournament: t, duration: 60000 }));  // Slides for In Progress (Bracket & Agenda)
  inProgressTournaments.forEach((t: any) => {
    slides.push({ type: "live_bracket", tournament: t });
    
    // Check if there are scheduled matches
    const hasScheduled = t.matches?.some((m: any) => m.scheduledAt && !m.winnerTeamId);
    if (hasScheduled) {
      slides.push({ type: "live_agenda", tournament: t });
    }
  });
  
  // Slide for Hall of Fame
  if (completedTournaments.length > 0) {
    slides.push({ type: "hall_of_fame" });
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    // Get duration of current slide (default 12s if not specified)
    const currentDuration = slides[currentIndex]?.duration || 12000;
    
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

  if (slides.length === 0) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white text-3xl">Nessun dato disponibile</div>;

  const currentSlide = slides[currentIndex];

  const formatName = (fmt: string) => fmt.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="w-full h-screen bg-slate-950 text-white overflow-hidden relative flex flex-col">
      {/* GLOBAL HEADER */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50 bg-gradient-to-b from-slate-950 to-transparent">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-widest uppercase">
          IL CALCETTO DI MARIA
        </h1>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-1000 ${i === currentIndex ? 'w-12 bg-emerald-400' : 'w-3 bg-slate-700'}`} />
          ))}
        </div>
      </div>

      <div key={cycleCount} className="flex-1 flex items-center justify-center pt-24 pb-8 px-12 relative z-10 w-full h-full">
        <div className="w-full max-w-7xl animate-fade-in-up">
          
          {/* LEADERBOARD SLIDE */}
          {currentSlide.type === "leaderboard" && (
            <div className="flex w-full h-[85vh] gap-16">
              
              {/* TOP SINGLES FIXED CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-8 rounded-[3rem] border-2 border-yellow-500/20 shadow-2xl backdrop-blur-sm relative">
                
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
                            <div className="text-3xl font-black text-white truncate leading-tight">{tp.name}</div>
                            <div className="mt-2"><RoleIcon role={tp.preferredRole} className="w-8 h-8" /></div>
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
                    <Medal className="w-10 h-10 text-yellow-500" /> Classifica Singoli
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: `${(currentSlide.duration || 12000) / 1000}s` }}>
                    {playerStats.slice(playerStats.filter((p: any) => p.winRate === playerStats[0]?.winRate && p.wins === playerStats[0]?.wins && p.played === playerStats[0]?.played).length).map((p: any, i: number) => {
                      const rank = i + 1 + playerStats.filter((ps: any) => ps.winRate === playerStats[0]?.winRate && ps.wins === playerStats[0]?.wins && ps.played === playerStats[0]?.played).length;
                      return (
                      <div key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-yellow-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="text-2xl font-bold text-white truncate leading-tight">{p.name}</div>
                            <div className="mt-1"><RoleIcon role={p.preferredRole || "GIOCATORE"} className="w-6 h-6" /></div>
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
                             <div className="text-3xl font-black text-white leading-tight">{tt.player1.name}</div>
                             <div className="text-3xl font-black text-white leading-tight">{tt.player2.name}</div>
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
                    <Users className="w-10 h-10 text-blue-400" /> Classifica Coppie
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10 w-full mask-edges">
                  <div className="absolute top-0 left-0 w-full animate-scroll-vertical flex flex-col gap-6" style={{ animationDuration: `${(currentSlide.duration || 12000) / 1000}s` }}>
                    {teamStats.slice(teamStats.filter((t: any) => t.winRate === teamStats[0]?.winRate && t.wins === teamStats[0]?.wins && t.played === teamStats[0]?.played).length).map((t: any, i: number) => {
                      const rank = i + 1 + playerStats.filter((ps: any) => ps.winRate === playerStats[0]?.winRate && ps.wins === playerStats[0]?.wins && ps.played === playerStats[0]?.played).length;
                      return (
                      <div key={t.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 px-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 min-w-0">
                          <div className={`text-3xl font-black w-8 text-center shrink-0 ${
                            rank === 1 ? "text-yellow-500" :
                            rank === 2 ? "text-slate-300" :
                            rank === 3 ? "text-orange-400" :
                            "text-slate-600"
                          }`}>
                            {rank}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="text-xl font-bold text-white truncate leading-tight">{t.player1.name}</div>
                            <div className="text-xl font-bold text-white truncate leading-tight">{t.player2.name}</div>
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

            </div>
          )}

          {/* RECENT MATCHES SLIDE */}
          {currentSlide.type === "recent_matches" && (
            <div className="flex flex-col items-center justify-center w-full h-full relative z-10 px-12">
              <h2 className="text-5xl font-black uppercase tracking-widest text-white mb-12 flex items-center gap-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <span className="relative flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-rose-600"></span>
                </span>
                Ultime Sfide
              </h2>
              
              <div className="relative w-full max-w-5xl mx-auto flex flex-col gap-6 before:absolute before:inset-y-0 before:left-1/3 before:-ml-[1.5px] before:w-[3px] before:bg-slate-800/80">
                {data.recentFreeMatches.map((m: any) => {
                  const date = new Date(m.playedAt);
                  const isToday = new Date().toDateString() === date.toDateString();
                  const timeLabel = isToday 
                    ? `Oggi, ${date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
                    : date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

                  const teamAWon = m.winnerTeamId === m.teamAId;
                  const winner = teamAWon ? m.teamA : m.teamB;
                  const loser = teamAWon ? m.teamB : m.teamA;
                  const scoreW = teamAWon ? m.scoreTeamA : m.scoreTeamB;
                  const scoreL = teamAWon ? m.scoreTeamB : m.scoreTeamA;

                  return (
                  <div key={m.id} className="relative flex items-center gap-10 w-full">
                    {/* LEFT: TIME */}
                    <div className="w-1/3 text-right shrink-0 pr-10">
                      <div className="text-2xl font-bold text-slate-300 uppercase tracking-widest">{timeLabel}</div>
                      {isToday && <div className="text-emerald-500 text-sm font-black uppercase mt-1 tracking-widest">Recente</div>}
                    </div>
                    
                    {/* CENTER: NODE */}
                    <div className="absolute left-1/3 -ml-[10px] w-5 h-5 rounded-full bg-slate-950 border-[4px] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] z-10" />

                    {/* RIGHT: CARD */}
                    <div className="flex-1 bg-slate-900/90 border border-slate-700 p-6 rounded-3xl shadow-xl backdrop-blur-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center text-3xl">
                        <div className="font-bold text-white flex items-center gap-4 leading-tight">
                          <Trophy className="w-8 h-8 text-yellow-500 shrink-0 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                          <span>
                            {winner?.player1?.name} <span className="text-slate-500 text-xl mx-1">&</span> {winner?.player2?.name}
                          </span>
                        </div>
                        <div className="font-black text-emerald-400 bg-emerald-500/10 px-4 py-1 rounded-xl">{scoreW}</div>
                      </div>
                      
                      <div className="flex justify-between items-center text-2xl">
                        <div className="font-bold text-slate-500 flex items-center gap-4 pl-12 leading-tight">
                          <span>
                            {loser?.player1?.name} <span className="text-slate-700 text-lg mx-1">&</span> {loser?.player2?.name}
                          </span>
                        </div>
                        <div className="font-black text-slate-600 bg-slate-950 px-4 py-1 rounded-xl border border-slate-800">{scoreL}</div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

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
              const missingAtt = Math.max(0, reqPerRole - attCount - Math.floor(entCount / 2));
              const missingPor = Math.max(0, reqPerRole - porCount - Math.ceil(entCount / 2));
              
              missingText = `Mancano: ${missingAtt} Attaccanti, ${missingPor} Portieri`;
            } else {
              missingText = `Mancano: ${maxPlayers - iscritti} Giocatori`;
            }

            const formatTitle = t.format === "eliminazione_diretta" ? "Eliminazione Diretta" : t.format === "doppia_eliminazione" ? "Doppia Eliminazione" : "Gironi + Eliminazione";
            const formatDesc = t.format === "eliminazione_diretta" 
              ? "Tabellone classico a scontro diretto. Nessun appello: chi vince passa al turno successivo, chi perde viene eliminato definitivamente dal torneo." 
              : t.format === "doppia_eliminazione" 
              ? "Ogni squadra ha due vite! Chi perde la prima volta finisce nel 'Losers Bracket' e può ancora sperare di arrivare in finale vincendo tutte le partite di recupero." 
              : "Ogni squadra affronterà tutte le altre del proprio girone. Solo le prime classificate accederanno alle fasi finali a eliminazione diretta.";
            
            const typeTitle = t.type === "sorteggio_ruoli" ? "Sorteggio per Ruoli" : t.type === "sorteggio_integrale" ? "Sorteggio Integrale" : "Coppie Fisse";
            const typeDesc = t.type === "sorteggio_ruoli" 
              ? "L'algoritmo formerà le coppie in modo bilanciato, accoppiando obbligatoriamente un Attaccante con un Portiere. (Chi sceglie 'Entrambi' farà da jolly)." 
              : t.type === "sorteggio_integrale" 
              ? "Sorteggio totalmente cieco. La fortuna decide chi sarà il tuo compagno, indipendentemente dal ruolo preferito." 
              : "Le coppie sono già decise. Ci si iscrive insieme al proprio compagno storico per sfidare le altre coppie.";

            return (
            <div className="flex w-full h-[85vh] gap-12 text-left items-start mt-8">
              
              {/* LEFT COLUMN - INFO */}
              <div className="flex-1 flex flex-col h-full bg-slate-900/80 p-10 rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 mb-6 w-fit animate-pulse">
                  Iscrizioni Aperte
                </div>
                
                <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-8 line-clamp-2">
                  {t.name}
                </h2>
                
                <div className={`grid gap-6 mb-8 ${t.drawDate && t.type !== 'coppie_fisse' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <Calendar className="w-10 h-10 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Data Inizio</div>
                      <div className="text-xl font-bold whitespace-nowrap">{t.startDate ? new Date(t.startDate).toLocaleDateString('it-IT') : "Da Def."}</div>
                    </div>
                  </div>
                  
                  {t.drawDate && t.type !== 'coppie_fisse' && (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                      <Calendar className="w-10 h-10 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Sorteggio</div>
                        <div className="text-xl font-bold whitespace-nowrap">{new Date(t.drawDate).toLocaleDateString('it-IT')}</div>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <Banknote className="w-10 h-10 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Costo</div>
                      <div className="text-xl font-bold">{t.pricePerPlayer || "Gratis"} €</div>
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
                <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col items-center">
                   <QRCodeDisplay tournamentId={t.id} />
                </div>
                
                {/* LISTA NOMI */}
                <div className="flex-1 bg-slate-900/80 p-8 rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-center mb-6">Giocatori Iscritti</h3>
                  <div className="flex flex-wrap gap-3 overflow-hidden content-start justify-center">
                    {registrations.length === 0 ? (
                       <div className="text-slate-500 mt-10 text-center w-full">Nessun iscritto finora. Fai il primo passo!</div>
                    ) : (
                      registrations.slice(0, 48).map((r: any) => (
                        <div key={r.id} className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-white font-bold text-sm flex items-center gap-2 shadow-md">
                          <RoleIcon role={r.player?.preferredRole} className="w-4 h-4" />
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

          {/* LIVE BRACKET / MATCHES SLIDE */}
          {currentSlide.type === "live_bracket" && (
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
              
              <div className="grid grid-cols-2 gap-8 w-full max-w-6xl">
                {/* MATCHES IN CORSO O DA GIOCARE */}
                <div className="bg-slate-900/80 p-8 rounded-[2rem] border-2 border-slate-800 shadow-2xl backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <MonitorPlay className="w-6 h-6 text-blue-400" /> Prossimi Incontri
                  </h3>
                  <div className="flex flex-col gap-4">
                    {currentSlide.tournament.matches
                      ?.filter((m: any) => !m.winnerTeamId && m.teamAId && m.teamBId)
                      .slice(0, 4)
                      .map((m: any) => (
                        <div key={m.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex justify-between items-center text-lg font-bold">
                          <span className="text-white flex-1 leading-tight">{m.teamA?.player1?.name} <span className="text-slate-500 text-sm mx-1">&</span> {m.teamA?.player2?.name}</span>
                          <span className="text-slate-500 mx-4 shrink-0">VS</span>
                          <span className="text-white flex-1 text-right leading-tight">{m.teamB?.player1?.name} <span className="text-slate-500 text-sm mx-1">&</span> {m.teamB?.player2?.name}</span>
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
          )}

          {/* LIVE AGENDA SLIDE */}
          {currentSlide.type === "live_agenda" && (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase tracking-widest border border-indigo-500/30 mb-6">
                <Clock className="w-5 h-5" /> Programmazione
              </div>
              <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-12">
                Agenda {currentSlide.tournament.name}
              </h2>
              
              <div className="bg-slate-900/80 p-8 rounded-[3rem] border-2 border-indigo-500/20 shadow-2xl backdrop-blur-sm w-full max-w-4xl">
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
              <Crown className="w-20 h-20 text-yellow-500 mb-8 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              <h2 className="text-6xl font-black uppercase tracking-widest text-yellow-400 mb-16">
                Albo d'Oro
              </h2>
              
              <div className="flex flex-col gap-6 w-full max-w-5xl">
                {completedTournaments.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-yellow-500/20 p-8 rounded-3xl shadow-xl">
                    <div className="flex items-center gap-6">
                      <Trophy className="w-12 h-12 text-yellow-500" />
                      <div className="text-left">
                        <div className="text-3xl font-bold text-white mb-2">{t.name}</div>
                        <div className="text-lg text-slate-400">{new Date(t.createdAt).toLocaleDateString('it-IT')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-yellow-500 font-bold uppercase tracking-widest mb-2">Campioni</div>
                      <div className="text-3xl font-black text-white">
                        {t.winnerTeam?.player1.name} <span className="text-slate-500 mx-2">&</span> {t.winnerTeam?.player2.name}
                      </div>
                    </div>
                  </div>
                ))}
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
        .animate-scroll-vertical {
          animation-name: scrollVertical;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        .mask-edges {
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
      `}} />
    </div>
  );
}
