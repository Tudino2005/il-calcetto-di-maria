"use client";

import { useState, useEffect, useRef } from "react";
import { Trophy, Dices, Users, Sparkles, Play } from "lucide-react";
import { finishDrawAnimation } from "@/app/actions/tournamentActions";
import { useRouter } from "next/navigation";
import RoleIcon from "./RoleIcon";

const fadeOutAudio = (audio: HTMLAudioElement, duration: number = 2000) => {
  const steps = 20;
  const stepTime = duration / steps;
  let currentVolume = audio.volume;
  const volumeStep = currentVolume / steps;
  
  const fadeInterval = setInterval(() => {
    if (currentVolume > volumeStep) {
      currentVolume -= volumeStep;
      audio.volume = currentVolume;
    } else {
      audio.volume = 0;
      audio.pause();
      clearInterval(fadeInterval);
    }
  }, stepTime);
};

export default function SlotMachineDraw({ tournament }: { tournament: any }) {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [revealedIndex, setRevealedIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [currentSlot1, setCurrentSlot1] = useState<any>(null);
  const [currentSlot2, setCurrentSlot2] = useState<any>(null);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Showcase states (replaces countdown)
  const [showcaseIndex, setShowcaseIndex] = useState(-1); // -1 = not started
  const [showcasePhase, setShowcasePhase] = useState<"fly-in" | "hold" | "fly-out">("fly-in");

  const [introState, setIntroState] = useState<"pending" | "playing_intro" | "lineup_intro_text" | "player_lineup" | "countdown" | "slot_machine">("pending");
  const [lineupIndex, setLineupIndex] = useState(0);
  const [countdownValue, setCountdownValue] = useState(3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // When all teams are revealed, start showcase
  useEffect(() => {
    if (revealedIndex >= teams.length && teams.length > 0 && showcaseIndex === -1) {
      // Small pause, then start showcase
      const t = setTimeout(() => setShowcaseIndex(0), 1000);
      return () => clearTimeout(t);
    }
  }, [revealedIndex, teams.length, showcaseIndex]);

  // Showcase sequencer
  useEffect(() => {
    if (showcaseIndex < 0 || showcaseIndex >= teams.length) return;

    // Phase 1: fly-in (600ms)
    setShowcasePhase("fly-in");
    const holdTimer = setTimeout(() => {
      // Phase 2: hold (3 seconds)
      setShowcasePhase("hold");
      const outTimer = setTimeout(() => {
        // Phase 3: fly-out (600ms)
        setShowcasePhase("fly-out");
        const nextTimer = setTimeout(() => {
          if (showcaseIndex + 1 >= teams.length) {
            // All teams shown → wait to admire the final grid
            setShowcaseIndex(prev => prev + 1); // Pushes the last team into the grid
            setTimeout(() => {
              finishDrawAnimation(tournament.id).then(() => router.refresh());
            }, 8000); // 8 seconds to admire the final grid
          } else {
            setShowcaseIndex(prev => prev + 1);
          }
        }, 600);
        return () => clearTimeout(nextTimer);
      }, 3000);
      return () => clearTimeout(outTimer);
    }, 600);
    return () => clearTimeout(holdTimer);
  }, [showcaseIndex]);

  useEffect(() => {
    if (teams.length > 0) return; // ONLY INIT ONCE, ignore router.refresh() updates
    const extracted = new Map();
    const playersMap = new Map();
    tournament.matches?.forEach((m: any) => {
       if (m.teamA) {
         extracted.set(m.teamA.id, m.teamA);
         playersMap.set(m.teamA.player1.id, m.teamA.player1);
         playersMap.set(m.teamA.player2.id, m.teamA.player2);
       }
       if (m.teamB) {
         extracted.set(m.teamB.id, m.teamB);
         playersMap.set(m.teamB.player1.id, m.teamB.player1);
         playersMap.set(m.teamB.player2.id, m.teamB.player2);
       }
    });
    const uniqueTeams = Array.from(extracted.values());
    uniqueTeams.sort(() => Math.random() - 0.5);
    setTeams(uniqueTeams);
    setAllPlayers(Array.from(playersMap.values()));
  }, [tournament, teams.length]);

  useEffect(() => {
    if (introState !== "slot_machine") return;
    if (teams.length === 0 || allPlayers.length === 0) return;
    
    if (revealedIndex < teams.length) {
      setSpinning(true);
      setShowConfetti(false);
      
      const spinDuration = 5000; // 3.5 seconds
      const interval = setInterval(() => {
         setCurrentSlot1(allPlayers[Math.floor(Math.random() * allPlayers.length)]);
         setCurrentSlot2(allPlayers[Math.floor(Math.random() * allPlayers.length)]);
      }, 150); 
      
      const timeout = setTimeout(() => {
         clearInterval(interval);
         setSpinning(false);
         const targetTeam = teams[revealedIndex];
         if (targetTeam) {
            setCurrentSlot1(targetTeam.player1);
            setCurrentSlot2(targetTeam.player2);
            setShowConfetti(true);
         }
         
         // Wait 5 seconds before moving to next pair
         setTimeout(() => {
            setRevealedIndex(prev => prev + 1);
         }, 5000);

      }, spinDuration);
      
      return () => { clearInterval(interval); clearTimeout(timeout); };
    } else {
      const finalTimeout = setTimeout(async () => {
         await finishDrawAnimation(tournament.id);
         router.refresh(); // Tells NextJS to reload the page data, updating TVSlideshow
      }, 60000);
      return () => clearTimeout(finalTimeout);
    }
  }, [revealedIndex, teams.length, allPlayers.length, introState]);
  
  // Handle Intro
  const startIntro = () => {
    setIntroState("playing_intro");
    if (audioRef.current) {
       audioRef.current.volume = 1; // Reset volume
       audioRef.current.currentTime = 55; // Change this to the exact second the chorus starts
       audioRef.current.play().catch(e => console.error("Audio autoplay failed:", e));
       
       // Start fade out at 8 seconds
       setTimeout(() => {
          if (audioRef.current) fadeOutAudio(audioRef.current, 2000);
       }, 8000);
    }
    
    // 10 second animation duration
    setTimeout(() => {
       setIntroState("lineup_intro_text");
       
       // Hold the text for 3 seconds, then move to player lineup
       setTimeout(() => {
         setIntroState("player_lineup");
       }, 3500); // 3.5 seconds total to allow for fade animations
    }, 10000);
  };

  // Try auto-play on mount
  useEffect(() => {
    if (teams.length > 0 && introState === "pending") {
      // Browsers will likely block this unless user interacted with the page earlier
      const attemptPlay = async () => {
        if (audioRef.current) {
          audioRef.current.volume = 1;
          audioRef.current.currentTime = 55; // default start time
          try {
            await audioRef.current.play();
            // Autoplay succeeded!
            setIntroState("playing_intro");
            
            // Start fade out at 8 seconds
            setTimeout(() => {
              if (audioRef.current) fadeOutAudio(audioRef.current, 2000);
            }, 8000);
            
            setTimeout(() => {
               setIntroState("player_lineup");
            }, 10000);
          } catch (err) {
            // Autoplay blocked, wait for user click
            console.log("Autoplay blocked, waiting for user interaction");
          }
        }
      };
      attemptPlay();
    }
  }, [teams.length, introState]);

  // Lineup logic
  useEffect(() => {
    if (introState === "player_lineup" && allPlayers.length > 0) {
      if (lineupIndex < allPlayers.length) {
        const timer = setTimeout(() => setLineupIndex(prev => prev + 1), 10000); // 10s per player
        return () => clearTimeout(timer);
      } else {
        setIntroState("countdown");
      }
    }
  }, [introState, lineupIndex, allPlayers.length]);

  // Countdown logic
  useEffect(() => {
    if (introState === "countdown") {
      if (countdownValue > 0) {
        const timer = setTimeout(() => setCountdownValue(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setIntroState("slot_machine");
      }
    }
  }, [introState, countdownValue]);
  if (teams.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center p-8 bg-gradient-to-b from-slate-950 to-indigo-950 overflow-hidden relative">
      <audio ref={audioRef} src="/intro.mp3" preload="auto" />

      {introState === "pending" && (
        <div className="absolute inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center">
           <Trophy className="w-48 h-48 text-yellow-500 mb-12 animate-pulse" />
           <h1 className="text-6xl font-black text-white mb-8">IL SORTEGGIO È PRONTO</h1>
           <button onClick={startIntro} className="px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-3xl animate-bounce-in shadow-[0_0_50px_rgba(79,70,229,0.5)] flex items-center gap-4">
             <Play className="w-10 h-10 fill-current" /> AVVIA SPETTACOLO E AUDIO
           </button>
           <p className="mt-8 text-slate-500 max-w-lg">Clicca qui per consentire la riproduzione musicale e avviare la cerimonia. Se avevi già cliccato sulla TV, questo pulsante non apparirà.</p>
        </div>
      )}

      {introState === "playing_intro" && (
        <div className="absolute inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden">
           {/* Stadium Lights Effect */}
           <div className="absolute top-0 left-1/4 w-32 h-[150vh] bg-white/10 blur-3xl rotate-45 animate-pulse" style={{ animationDuration: '0.5s' }}></div>
           <div className="absolute top-0 right-1/4 w-32 h-[150vh] bg-white/10 blur-3xl -rotate-45 animate-pulse" style={{ animationDuration: '0.7s' }}></div>
           
           <div className="animate-in fade-in zoom-in duration-1000 flex flex-col items-center z-10 animate-out fade-out zoom-out">
              <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_100px_rgba(79,70,229,0.8)] mb-12 animate-bounce">
                 <Trophy className="w-24 h-24 text-white" />
              </div>
              <img 
                src="/images/red-player-table-football.png" 
                alt="Il Calcetto di Maria" 
                className="w-full max-w-2xl h-auto drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-pulse" 
                style={{ animationDuration: '0.8s' }} 
              />
           </div>
        </div>
      )}

      {introState === "lineup_intro_text" && (
        <div className="absolute inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
           {/* Cinematic Ambient Lights */}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
           <div className="absolute top-1/2 left-0 w-full h-[2px] bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse"></div>
           
           <div className="z-10 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-1000 animate-out fade-out zoom-out slide-out-to-top-10">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 uppercase tracking-[0.2em] text-center leading-tight drop-shadow-2xl px-12">
                Signore e Signori<br/>
                <span className="text-white text-3xl sm:text-5xl md:text-7xl tracking-widest mt-6 block opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                  I giocatori partecipanti
                </span>
              </h1>
           </div>
        </div>
      )}

      {introState === "player_lineup" && allPlayers[lineupIndex] && (() => {
        const p = allPlayers[lineupIndex];
        const hasMedia = !!p.mediaUrl;
        const isVideo = hasMedia && p.mediaUrl.toLowerCase().endsWith('.mp4');
        return (
          <div key={p.id} className="absolute inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
             {/* Dynamic Stadium BG */}
             <div className="absolute inset-0 bg-slate-900 opacity-80 mix-blend-luminosity pointer-events-none"></div>
             <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-emerald-600/20 blur-[120px] rounded-full animate-pulse"></div>
             
             {/* Giant Name Background */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
               <h1 className="text-[20rem] font-black text-white/5 uppercase tracking-tighter whitespace-nowrap animate-pulse drop-shadow-2xl">
                 {p.name} {p.name}
               </h1>
             </div>
             
             {/* Player Image/Video or Fallback */}
             <div className="relative z-10 flex flex-col items-center h-full justify-end pb-24 animate-in slide-in-from-bottom-20 fade-in duration-700">
                {hasMedia ? (
                  isVideo ? (
                    <video src={`/players/${p.mediaUrl}`} autoPlay muted playsInline className="h-[80vh] object-contain drop-shadow-2xl" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} />
                  ) : (
                    <img src={`/players/${p.mediaUrl}`} className="h-[80vh] object-contain drop-shadow-2xl" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-[60vh]">
                    <div className="w-64 h-64 bg-slate-800 rounded-full flex items-center justify-center mb-8 border-4 border-slate-700 shadow-2xl">
                       <Users className="w-32 h-32 text-slate-500" />
                    </div>
                  </div>
                )}
             </div>
          </div>
        );
      })()}

      {introState === "countdown" && (
        <div className="absolute inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          <div key={countdownValue} className="animate-in zoom-in fade-in duration-500 flex flex-col items-center">
            <h1 className="text-[15rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_100px_rgba(250,204,21,0.8)] leading-none">
              {countdownValue}
            </h1>
          </div>
        </div>
      )}

      
      <div className="absolute top-10 flex flex-col items-center animate-fade-in-down z-20">
        <div className="inline-flex items-center gap-3 px-8 py-3 bg-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase tracking-widest border border-indigo-500/30 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse">
          <Dices className="w-6 h-6" /> Cerimonia Sorteggio in Diretta
        </div>
        <h2 className="text-6xl font-black uppercase tracking-tight text-white mb-2 drop-shadow-2xl">
          {tournament.name}
        </h2>
      </div>

      {showcaseIndex >= 0 ? (
        // TEAM SHOWCASE PHASE
        <div className="flex flex-col items-center justify-center animate-in fade-in duration-500 z-20 mt-20 w-full max-w-5xl">
          <div className="text-slate-400 font-bold uppercase tracking-widest mb-8 text-xl animate-pulse">
            Presentazione Squadre
          </div>

          {/* Flying card */}
          {teams[showcaseIndex] && (() => {
            const t = teams[showcaseIndex];
            const teamName = tournament.teamNames?.[t.id];
            const isFlyIn = showcasePhase === "fly-in";
            const isHold = showcasePhase === "hold";
            const isFlyOut = showcasePhase === "fly-out";

            return (
              <div
                className="w-full max-w-xl"
                style={{
                  transform: isFlyIn
                    ? "translateY(40vh) scale(0.4)"
                    : isHold
                    ? "translateY(0) scale(1)"
                    : "translateY(-10vh) scale(0.7)",
                  opacity: isFlyIn ? 0 : isHold ? 1 : 0,
                  transition: "transform 600ms cubic-bezier(0.34,1.56,0.64,1), opacity 400ms ease",
                }}
              >
                <div className="bg-slate-900 border-4 border-yellow-400 rounded-[3rem] p-10 flex flex-col items-center gap-6 shadow-[0_0_80px_rgba(250,204,21,0.4)]">
                  {teamName && (
                    <span className="text-2xl font-black text-yellow-400 uppercase tracking-widest">
                      "{teamName}"
                    </span>
                  )}
                  <div className="flex items-center gap-6 w-full justify-center">
                    <div className="flex flex-col items-center flex-1 relative">
                      {t.player1?.avatarUrl ? (
                        <div className="relative w-48 h-56 -mb-4 flex justify-center items-end">
                           <img 
                             src={`/players/${t.player1.avatarUrl}`} 
                             className="absolute bottom-0 w-full h-full object-cover object-top" 
                             style={{ 
                               WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', 
                               maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' 
                             }} 
                           />
                        </div>
                      ) : (
                        <RoleIcon role={t.player1?.preferredRole || "entrambi"} className="w-16 h-16 text-yellow-400 mb-2" />
                      )}
                      <span className="text-4xl font-black text-white text-center leading-tight relative z-10 drop-shadow-lg">{t.player1?.name}</span>
                    </div>
                    
                    <span className="text-4xl font-black text-slate-500 relative z-10">&</span>
                    
                    <div className="flex flex-col items-center flex-1 relative">
                      {t.player2?.avatarUrl ? (
                        <div className="relative w-48 h-56 -mb-4 flex justify-center items-end">
                           <img 
                             src={`/players/${t.player2.avatarUrl}`} 
                             className="absolute bottom-0 w-full h-full object-cover object-top" 
                             style={{ 
                               WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', 
                               maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' 
                             }} 
                           />
                        </div>
                      ) : (
                        <RoleIcon role={t.player2?.preferredRole || "entrambi"} className="w-16 h-16 text-emerald-400 mb-2" />
                      )}
                      <span className="text-4xl font-black text-white text-center leading-tight relative z-10 drop-shadow-lg">{t.player2?.name}</span>
                    </div>
                  </div>
                  <div className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                    Squadra {showcaseIndex + 1} di {teams.length}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Already shown teams stacking below */}
          <div className="mt-10 flex flex-wrap gap-4 justify-center w-full max-w-7xl px-4">
            {teams.slice(0, showcaseIndex).map((t, i) => (
              <div key={i} className="bg-slate-900 border-2 border-yellow-400/50 rounded-3xl p-5 flex flex-col items-center gap-3 shadow-[0_0_20px_rgba(250,204,21,0.15)] animate-in fade-in zoom-in duration-300 min-w-[240px]">
                {tournament.teamNames?.[t.id] && (
                  <span className="text-sm font-black text-yellow-400 uppercase tracking-widest">
                    "{tournament.teamNames[t.id]}"
                  </span>
                )}
                <div className="flex items-center gap-4 w-full justify-center">
                  <div className="flex flex-col items-center flex-1 relative">
                    {t.player1?.avatarUrl ? (
                      <div className="relative w-24 h-28 -mb-2 flex justify-center items-end">
                         <img 
                           src={`/players/${t.player1.avatarUrl}`} 
                           className="absolute bottom-0 w-full h-full object-cover object-top" 
                           style={{ 
                             WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', 
                             maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' 
                           }} 
                         />
                      </div>
                    ) : (
                      <RoleIcon role={t.player1?.preferredRole || "entrambi"} className="w-10 h-10 text-yellow-400 mb-1" />
                    )}
                    <span className="text-xl font-black text-white text-center leading-tight whitespace-nowrap relative z-10 drop-shadow-md">{t.player1?.name}</span>
                  </div>
                  
                  <span className="text-xl font-black text-slate-500 relative z-10">&</span>
                  
                  <div className="flex flex-col items-center flex-1 relative">
                    {t.player2?.avatarUrl ? (
                      <div className="relative w-24 h-28 -mb-2 flex justify-center items-end">
                         <img 
                           src={`/players/${t.player2.avatarUrl}`} 
                           className="absolute bottom-0 w-full h-full object-cover object-top" 
                           style={{ 
                             WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', 
                             maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' 
                           }} 
                         />
                      </div>
                    ) : (
                      <RoleIcon role={t.player2?.preferredRole || "entrambi"} className="w-10 h-10 text-emerald-400 mb-1" />
                    )}
                    <span className="text-xl font-black text-white text-center leading-tight whitespace-nowrap relative z-10 drop-shadow-md">{t.player2?.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : revealedIndex >= teams.length ? (
        <div className="flex flex-col items-center justify-center z-20 mt-20 gap-6 animate-in fade-in duration-700">
          <div className="text-5xl font-black text-emerald-400 uppercase tracking-widest animate-pulse text-center">
            Sorteggio Completato!
          </div>
          <div className="text-slate-400 font-bold uppercase tracking-widest">
            Preparazione presentazione squadre...
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center mt-12 z-20 w-full max-w-5xl">
           <div className="text-slate-400 font-bold uppercase tracking-widest mb-6 text-xl">
              Estrazione Coppia {revealedIndex + 1} di {teams.length}
           </div>
           
           {!spinning && showConfetti && tournament.teamNames && teams[revealedIndex] && tournament.teamNames[teams[revealedIndex].id] && (
              <div className="animate-in zoom-in slide-in-from-bottom-5 duration-500 mb-8 bg-emerald-500/20 border border-emerald-500/40 px-8 py-3 rounded-full shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <span className="text-3xl font-black text-emerald-400 uppercase tracking-widest">
                  "{tournament.teamNames[teams[revealedIndex].id]}"
                </span>
              </div>
           )}
           
           <div className="flex items-center gap-8 justify-center w-full">
              {/* SLOT 1 */}
              <div className={`flex-1 bg-slate-900 border-4 rounded-[3rem] h-80 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${!spinning && showConfetti ? 'border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)] scale-105' : 'border-slate-700 shadow-2xl'}`}>
                 <div className="absolute top-0 w-full h-1/3 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none"></div>
                 <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                 <div className={`flex flex-col items-center gap-4 ${spinning ? 'animate-slot-spin blur-[2px]' : 'animate-bounce-in'}`}>
                    <RoleIcon role={currentSlot1?.preferredRole || "entrambi"} className={`w-16 h-16 ${!spinning && showConfetti ? 'text-yellow-400' : 'text-slate-500'}`} />
                    <h3 className={`text-5xl font-black uppercase tracking-tight truncate w-full px-8 ${!spinning && showConfetti ? 'text-white' : 'text-slate-400'}`}>
                      {currentSlot1?.name || "???"}
                    </h3>
                 </div>
              </div>
              <div className="shrink-0 text-5xl font-black text-slate-600">&</div>
              {/* SLOT 2 */}
              <div className={`flex-1 bg-slate-900 border-4 rounded-[3rem] h-80 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${!spinning && showConfetti ? 'border-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.5)] scale-105' : 'border-slate-700 shadow-2xl'}`}>
                 <div className="absolute top-0 w-full h-1/3 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none"></div>
                 <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                 <div className={`flex flex-col items-center gap-4 ${spinning ? 'animate-slot-spin blur-[2px]' : 'animate-bounce-in'}`}>
                    <RoleIcon role={currentSlot2?.preferredRole || "entrambi"} className={`w-16 h-16 ${!spinning && showConfetti ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <h3 className={`text-5xl font-black uppercase tracking-tight truncate w-full px-8 ${!spinning && showConfetti ? 'text-white' : 'text-slate-400'}`}>
                      {currentSlot2?.name || "???"}
                    </h3>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Lista delle squadre già estratte (in basso) — visibile solo durante il sorteggio */}
      {showcaseIndex < 0 && (
        <div className="absolute bottom-0 w-full bg-slate-950/90 border-t border-slate-800 backdrop-blur-md p-5 flex flex-col items-center z-20 max-h-72 md:max-h-80 overflow-y-auto">
           <div className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-3">Coppie Formate</div>
           <div className="flex flex-wrap gap-3 justify-center w-full max-w-7xl pb-2">
              {teams.slice(0, revealedIndex).map((t, i) => (
                <div key={i} className="bg-slate-900 border border-slate-700 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg animate-fade-in-up">
                   <div className="flex flex-col items-center text-center">
                     {tournament.teamNames && tournament.teamNames[t.id] && (
                       <span className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-1">"{tournament.teamNames[t.id]}"</span>
                     )}
                     <div className="flex items-center gap-2">
                       <span className="text-white font-bold">{t.player1.name}</span>
                       <span className="text-slate-500 text-xs">&</span>
                       <span className="text-white font-bold">{t.player2.name}</span>
                     </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
