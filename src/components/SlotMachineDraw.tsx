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

  const [introState, setIntroState] = useState<"pending" | "playing_intro" | "lineup_intro_text" | "player_lineup" | "draw_intro_text" | "countdown" | "slot_machine" | "pre_showcase_intro" | "rules_scroll">("pending");
  const [lineupIndex, setLineupIndex] = useState(0);
  const [showLineupVideo, setShowLineupVideo] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [isFadingOutPlayer, setIsFadingOutPlayer] = useState(false);
  const [flipState, setFlipState] = useState<"none" | "out" | "in">("none");
  const audioRef1 = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);
  const audioRef3 = useRef<HTMLAudioElement | null>(null);

  const triggerPhaseChange = (nextPhaseOrFn: string | (() => void)) => {
     setFlipState("out");
     setTimeout(() => {
        if (typeof nextPhaseOrFn === "string") {
           setIntroState(nextPhaseOrFn as any);
        } else {
           nextPhaseOrFn();
        }
        setFlipState("in");
        setTimeout(() => setFlipState("none"), 600);
     }, 600);
  };

  // When all teams are revealed, start pre-showcase cinematic
  useEffect(() => {
    if (revealedIndex >= teams.length && teams.length > 0 && showcaseIndex === -1 && introState !== "pre_showcase_intro") {
      if (audioRef2.current) fadeOutAudio(audioRef2.current, 1000); // Sfuma traccia 2
      
      triggerPhaseChange(() => {
         setIntroState("pre_showcase_intro");
         if (audioRef3.current) {
           audioRef3.current.volume = 1;
           audioRef3.current.currentTime = 0;
           audioRef3.current.play().catch(e => console.error("Track 3 failed:", e));
         }
         
         // After 4 seconds of black screen + text, transition to actual showcase
         setTimeout(() => {
            triggerPhaseChange(() => {
                setShowcaseIndex(0);
                setIntroState("slot_machine"); // Go back to slot_machine state to render the grid
            });
         }, 4500); // 4.5 seconds to account for fade animations
      });
    }
  }, [revealedIndex, teams.length, showcaseIndex, introState]);
  // Showcase sequencer
  useEffect(() => {
    if (showcaseIndex < 0 || showcaseIndex >= teams.length) return;

    // Phase 1: fly-in (1500ms)
    setShowcasePhase("fly-in");
    const holdTimer = setTimeout(() => {
      // Phase 2: hold (6 seconds)
      setShowcasePhase("hold");
      const outTimer = setTimeout(() => {
        // Phase 3: fly-out (1000ms)
        setShowcasePhase("fly-out");
        const nextTimer = setTimeout(() => {
          if (showcaseIndex + 1 >= teams.length) {
            // All teams shown → switch to scrolling rules cinematic
            triggerPhaseChange(() => {
               setShowcaseIndex(prev => prev + 1);
               setIntroState("rules_scroll");
            });
          } else {
            setShowcaseIndex(prev => prev + 1);
          }
        }, 1000);
        return () => clearTimeout(nextTimer);
      }, 6000);
      return () => clearTimeout(outTimer);
    }, 1500);
    return () => clearTimeout(holdTimer);
  }, [showcaseIndex, teams.length, tournament.id, router]);

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

  // Handle spin for a pair
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
    }
  }, [revealedIndex, teams.length, allPlayers.length, introState]);
  
  // Handle Intro
  const startIntro = () => {
    setIntroState("playing_intro");
    if (audioRef1.current) {
       audioRef1.current.volume = 1; // Reset volume
       audioRef1.current.currentTime = 0; // Play from the beginning
       audioRef1.current.play().catch(e => console.error("Audio autoplay failed:", e));
    }
    
    // 10 second animation duration
    setTimeout(() => {
       triggerPhaseChange("lineup_intro_text");
       
       // Hold the text for 3 seconds, then move to player lineup
       setTimeout(() => {
         triggerPhaseChange("player_lineup");
       }, 3500); // 3.5 seconds total to allow for fade animations
    }, 10000);
  };

  // Try auto-play on mount
  useEffect(() => {
    if (teams.length > 0 && introState === "pending") {
      // Browsers will likely block this unless user interacted with the page earlier
      const attemptPlay = async () => {
        if (audioRef1.current) {
          audioRef1.current.volume = 1;
          audioRef1.current.currentTime = 0; // default start time
          try {
            await audioRef1.current.play();
            // Autoplay succeeded!
            setIntroState("playing_intro");
            
            setTimeout(() => {
               triggerPhaseChange("lineup_intro_text");
               setTimeout(() => {
                 triggerPhaseChange("player_lineup");
               }, 3500);
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
        setShowLineupVideo(false);
        setIsFadingOutPlayer(false);
        const videoTimer = setTimeout(() => setShowLineupVideo(true), 2000); // 2s delay for the name
        
        const fadeTimer = setTimeout(() => {
           setIsFadingOutPlayer(true);
        }, 10500); // Start fade-out at 10.5s

        // 12s total
        const timer = setTimeout(() => setLineupIndex(prev => prev + 1), 12000);
        return () => { clearTimeout(timer); clearTimeout(videoTimer); clearTimeout(fadeTimer); };
      } else {
        triggerPhaseChange("draw_intro_text");
      }
    }
  }, [introState, lineupIndex, allPlayers.length]);

  // Draw Intro Logic
  useEffect(() => {
    if (introState === "draw_intro_text") {
      const timer = setTimeout(() => {
        triggerPhaseChange("countdown");
      }, 8000); // Wait 8 seconds
      return () => clearTimeout(timer);
    }
  }, [introState]);

  // Countdown logic
  useEffect(() => {
    if (introState === "countdown") {
      if (countdownValue === 3) {
        if (audioRef1.current) fadeOutAudio(audioRef1.current, 2500);
      }
      if (countdownValue > 0) {
        const timer = setTimeout(() => setCountdownValue(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        triggerPhaseChange("slot_machine");
        if (audioRef2.current) {
          audioRef2.current.volume = 1;
          audioRef2.current.currentTime = 0;
          audioRef2.current.play().catch(e => console.error("Track 2 failed:", e));
        }
      }
    }
  }, [introState, countdownValue]);
  if (teams.length === 0) return null;

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full text-center p-8 bg-gradient-to-b from-slate-950 to-indigo-950 overflow-hidden relative ${flipState === "out" ? "flip-out" : flipState === "in" ? "flip-in" : ""}`}>
      <style>{`
        @keyframes flipOut {
          from { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
          to { transform: perspective(1200px) rotateY(90deg); opacity: 0; }
        }
        @keyframes flipIn {
          from { transform: perspective(1200px) rotateY(-90deg); opacity: 0; }
          to { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
        }
        .flip-out { animation: flipOut 0.6s ease-in forwards; }
        .flip-in { animation: flipIn 0.6s ease-out forwards; }
      `}</style>

      <audio ref={audioRef1} src="/seven-nation-army.mp3" preload="auto" loop />
      <audio ref={audioRef2} src="/song2-blur.mp3" preload="auto" loop />
      <audio ref={audioRef3} src="/champions-league.mp3" preload="auto" onEnded={() => finishDrawAnimation(tournament.id).then(() => router.refresh())} />

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
           <style>{`
             @keyframes cinematicZoom {
               0% { transform: scale(0.85); opacity: 0; filter: blur(10px); }
               10% { opacity: 1; filter: blur(0px); }
               90% { opacity: 1; filter: blur(0px); }
               100% { transform: scale(1.15); opacity: 0; filter: blur(10px); }
             }
             @keyframes epicGlow {
               0%, 100% { filter: drop-shadow(0 0 30px rgba(255,255,255,0.2)); }
               50% { filter: drop-shadow(0 0 80px rgba(255,255,255,0.6)); }
             }
           `}</style>
           {/* Cinematic Ambient Lights */}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black"></div>

           {/* Stadium Lights Effect */}
           <div className="absolute top-0 left-1/4 w-32 h-[150vh] bg-white/5 blur-[100px] rotate-45 animate-pulse" style={{ animationDuration: '4s' }}></div>
           <div className="absolute top-0 right-1/4 w-32 h-[150vh] bg-white/5 blur-[100px] -rotate-45 animate-pulse" style={{ animationDuration: '5s' }}></div>
           
           <div className="flex flex-col items-center justify-center z-10 w-full max-w-4xl px-8" style={{ animation: 'cinematicZoom 10s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}>
              <img 
                src="/images/red-player-table-football.png" 
                alt="Il Calcetto di Maria" 
                className="w-full h-auto object-contain" 
                style={{ animation: 'epicGlow 4s ease-in-out infinite' }} 
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
          <div key={p.id} className={`absolute inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-1000 transition-opacity ease-in-out ${isFadingOutPlayer ? 'opacity-0 duration-[1500ms]' : 'opacity-100'}`}>
             {/* Dynamic Stadium BG */}
             <div className="absolute inset-0 bg-slate-900 opacity-80 mix-blend-luminosity pointer-events-none"></div>
             <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-emerald-600/20 blur-[120px] rounded-full animate-pulse"></div>
             
             {/* Giant Name Background - Starts prominent, then fades to background */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 px-8">
               <h1 className={`text-[8rem] md:text-[12rem] font-black uppercase tracking-tighter text-center leading-none animate-pulse drop-shadow-2xl transition-all duration-1000 ${showLineupVideo ? 'text-white/5' : 'text-white/80 scale-110'}`}>
                 {p.name}
               </h1>
             </div>
             
             {/* Player Image/Video or Fallback */}
             {showLineupVideo && (
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
             )}

             {/* LOWER THIRD BROADCAST GRAPHIC */}
             {showLineupVideo && (() => {
               const role = p.preferredRole;
               const roleText = role === 'Portiere' ? 'DEFENDER' : role === 'Attaccante' ? 'STRIKER' : 'DEFENDER & STRIKER';
               const barColor = role === 'Portiere' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : role === 'Attaccante' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]';
               const badgeColor = role === 'Portiere' ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : role === 'Attaccante' ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]';
               
               return (
                 <div className="absolute bottom-12 left-8 md:bottom-20 md:left-16 z-[60] flex flex-col animate-in slide-in-from-left-24 fade-in duration-1000 delay-500 fill-mode-both">
                   <div className="flex items-center shadow-2xl">
                     {/* Color Accent Bar */}
                     <div className={`w-3 h-14 md:h-20 rounded-l-lg ${barColor}`}></div>
                     
                     {/* Name Plate */}
                     <div className="bg-slate-900/95 backdrop-blur-xl px-6 py-2 md:px-8 md:py-3 rounded-r-lg border-y border-r border-slate-700/50 min-w-[250px] md:min-w-[320px]">
                       <h2 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tight drop-shadow-md">
                         {p.name}
                       </h2>
                     </div>
                   </div>
                   
                   {/* Role Badge */}
                   <div className={`mt-2 ml-3 px-4 py-1 md:px-5 md:py-1.5 rounded inline-block self-start border border-white/20 ${badgeColor}`}>
                      <span className="text-xs md:text-xl font-black uppercase tracking-[0.4em] text-white">
                        {roleText}
                      </span>
                   </div>
                 </div>
               );
             })()}
          </div>
        );
      })()}

      {introState === "draw_intro_text" && (
        <div className="absolute inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
           {/* Dark Dramatic Navy background */}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>
           
           <div className="z-10 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-1000 animate-out fade-out zoom-out slide-out-to-top-10 flex flex-col items-center text-center px-8">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-400 tracking-[0.3em] uppercase mb-12">
                {tournament.type === "coppie_fisse" ? "La presentazione delle squadre" : "Signore e Signori, ha inizio il sorteggio"}
              </h2>
              
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 uppercase tracking-widest drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] mb-8">
                {tournament.type === "sorteggio_ruoli" && "Sorteggio per Ruoli"}
                {tournament.type === "sorteggio_integrale" && "Sorteggio Integrale"}
                {tournament.type === "coppie_fisse" && "Coppie Fisse"}
              </h1>
              
              <p className="text-2xl md:text-4xl font-medium text-slate-300 max-w-4xl leading-relaxed italic">
                {tournament.type === "sorteggio_ruoli" && "L'equilibrio perfetto. L'urna unirà casualmente un Attaccante e un Difensore."}
                {tournament.type === "sorteggio_integrale" && "Il caos puro. Nessuna regola di ruolo, chiunque può finire in coppia con chiunque. Lasciate fare al destino."}
                {tournament.type === "coppie_fisse" && "Il destino è già scritto. I team sono stati scelti, è arrivato il momento di svelarli al mondo."}
              </p>
           </div>
        </div>
      )}

      {introState === "countdown" && (
        <div className="absolute inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          <div key={countdownValue} className="animate-in zoom-in fade-in duration-500 flex flex-col items-center">
            <h1 className="text-[15rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_100px_rgba(250,204,21,0.8)] leading-none">
              {countdownValue}
            </h1>
          </div>
        </div>
      )}

      {introState === "pre_showcase_intro" && (
        <div className="absolute inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden">
           <style>{`
             .typewriter-line1 {
               overflow: hidden;
               white-space: nowrap;
               margin: 0 auto;
               max-width: 0;
               border-right: 0.1em solid rgba(251, 191, 36, 0.8);
               animation: 
                 typing1 1.5s steps(30, end) forwards,
                 blinkCaret 0.75s step-end 3;
             }
             .typewriter-line2 {
               overflow: hidden;
               white-space: nowrap;
               margin: 0 auto;
               max-width: 0;
               border-right: 0.1em solid transparent;
               animation: 
                 typing2 2.5s steps(50, end) forwards;
               animation-delay: 2s;
             }
             @keyframes typing1 {
               from { max-width: 0 }
               to { max-width: 100% }
             }
             @keyframes typing2 {
               from { max-width: 0; border-right-color: rgba(251, 191, 36, 0.8); }
               to { max-width: 100%; border-right-color: transparent; }
             }
             @keyframes blinkCaret {
               from, to { border-right-color: transparent }
               50% { border-right-color: rgba(251, 191, 36, 0.8); }
             }
           `}</style>
           <div className="z-10 flex flex-col items-center text-center w-fit mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-700 uppercase tracking-[0.1em] leading-tight pb-2 typewriter-line1 px-4">
                Signore e Signori
              </h1>
              <span className="text-slate-200 text-2xl sm:text-4xl md:text-5xl font-light tracking-widest mt-6 block typewriter-line2 drop-shadow-md px-4">
                onorati di presentarvi le Squadre partecipanti
              </span>
           </div>
        </div>
      )}
      {introState === "rules_scroll" && (
        <div className="absolute inset-0 z-[10000] bg-slate-950 flex overflow-hidden">
           {/* Left Column */}
           <div className="w-[30%] h-full p-6 flex flex-col gap-4 overflow-y-auto animate-in slide-in-from-left-20 duration-[1500ms] border-r border-slate-800/50 scrollbar-hide">
             {teams.slice(0, Math.ceil(teams.length / 2)).map((t, i) => (
                <div key={i} className="bg-slate-900 border-2 border-yellow-400/30 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-transparent"></div>
                   {tournament.teamNames?.[t.id] && (
                     <span className="text-xs font-black text-yellow-400 uppercase tracking-widest relative z-10">"{tournament.teamNames[t.id]}"</span>
                   )}
                   <div className="flex items-center gap-3 w-full justify-center relative z-10">
                     <div className="flex flex-col items-center flex-1">
                       {t.player1?.avatarUrl ? (
                         <div className="w-14 h-14 rounded-full overflow-hidden mb-1 border-2 border-slate-700">
                           <img src={`/players/${t.player1.avatarUrl}`} className="w-full h-full object-cover object-top" />
                         </div>
                       ) : <RoleIcon role={t.player1?.preferredRole || "entrambi"} className="w-8 h-8 text-yellow-400 mb-1" />}
                       <span className="text-sm font-black text-white text-center leading-tight">{t.player1?.name}</span>
                     </div>
                     <span className="text-sm font-black text-slate-500">&</span>
                     <div className="flex flex-col items-center flex-1">
                       {t.player2?.avatarUrl ? (
                         <div className="w-14 h-14 rounded-full overflow-hidden mb-1 border-2 border-slate-700">
                           <img src={`/players/${t.player2.avatarUrl}`} className="w-full h-full object-cover object-top" />
                         </div>
                       ) : <RoleIcon role={t.player2?.preferredRole || "entrambi"} className="w-8 h-8 text-emerald-400 mb-1" />}
                       <span className="text-sm font-black text-white text-center leading-tight">{t.player2?.name}</span>
                     </div>
                   </div>
                </div>
             ))}
           </div>
           
           {/* Center Scrolling Credits */}
           <div className="w-[40%] h-full relative overflow-hidden flex justify-center perspective-[1000px]">
              <style>{`
                 @keyframes starWarsScroll {
                    0% { transform: translateY(100vh) rotateX(15deg); opacity: 0; }
                    5% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(-150vh) rotateX(15deg); opacity: 0; }
                 }
                 .scrollbar-hide::-webkit-scrollbar { display: none; }
                 .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
              {/* Fade out top edge */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950 to-transparent z-10 pointer-events-none"></div>
              {/* Fade out bottom edge */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none"></div>
              
              <div 
                className="absolute w-[90%] text-center leading-relaxed pb-32"
                style={{ animation: 'starWarsScroll 35s linear forwards' }}
                onAnimationEnd={() => finishDrawAnimation(tournament.id).then(() => router.refresh())}
              >
                 <h2 className="text-5xl font-black mb-8 text-yellow-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">Regolamento Ufficiale</h2>
                 <p className="text-2xl font-bold mb-16 italic text-slate-300">Eliminazione diretta pura e spietata: un errore e il team è fuori.</p>
                 
                 <div className="text-left space-y-16">
                    <div>
                       <h3 className="text-3xl font-black text-yellow-400 mb-6">1. Formato del Match</h3>
                       <p className="text-2xl text-slate-100 leading-relaxed">Il torneo si disputa con la formula dell'eliminazione diretta. Ogni partita si gioca al meglio dei 3 set (vince chi se ne aggiudica 2). Vince il singolo set la squadra che per prima raggiunge i 6 gol. È obbligatorio uno scarto di due reti per la vittoria: in caso di parità sul 6-6, si andrà ai vantaggi ad oltranza finché una delle due squadre non otterrà un doppio vantaggio consecutivo (es. 7-5, 8-6, 12-10).</p>
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-yellow-400 mb-6">2. Zero Rullate (Spinning)</h3>
                       <p className="text-2xl text-slate-100 leading-relaxed">La rotazione della stecca di 360 gradi, sia prima che dopo aver colpito la pallina, costituisce fallo. Questa regola traccia il confine invalicabile tra un torneo strutturato e il gioco casuale. Se la pallina entra in rete in seguito a una rullata, il gol è considerato nullo.</p>
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-yellow-400 mb-6">3. Divieto di Gancio (o Passetto)</h3>
                       <p className="text-2xl text-slate-100 leading-relaxed">È severamente vietato fermare, bloccare o controllare la pallina con un omino per poi scoccare il tiro in porta con lo stesso omino. Allo stesso modo, è vietato il "passetto", ovvero passare la palla a un omino posizionato sulla medesima stecca prima di effettuare il tiro. Il gioco deve svilupparsi di prima intenzione o tramite sponda.</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Column */}
           <div className="w-[30%] h-full p-6 flex flex-col gap-4 overflow-y-auto animate-in slide-in-from-right-20 duration-[1500ms] border-l border-slate-800/50 scrollbar-hide">
             {teams.slice(Math.ceil(teams.length / 2)).map((t, i) => (
                <div key={i} className="bg-slate-900 border-2 border-yellow-400/30 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-bl from-slate-800/50 to-transparent"></div>
                   {tournament.teamNames?.[t.id] && (
                     <span className="text-xs font-black text-yellow-400 uppercase tracking-widest relative z-10">"{tournament.teamNames[t.id]}"</span>
                   )}
                   <div className="flex items-center gap-3 w-full justify-center relative z-10">
                     <div className="flex flex-col items-center flex-1">
                       {t.player1?.avatarUrl ? (
                         <div className="w-14 h-14 rounded-full overflow-hidden mb-1 border-2 border-slate-700">
                           <img src={`/players/${t.player1.avatarUrl}`} className="w-full h-full object-cover object-top" />
                         </div>
                       ) : <RoleIcon role={t.player1?.preferredRole || "entrambi"} className="w-8 h-8 text-yellow-400 mb-1" />}
                       <span className="text-sm font-black text-white text-center leading-tight">{t.player1?.name}</span>
                     </div>
                     <span className="text-sm font-black text-slate-500">&</span>
                     <div className="flex flex-col items-center flex-1">
                       {t.player2?.avatarUrl ? (
                         <div className="w-14 h-14 rounded-full overflow-hidden mb-1 border-2 border-slate-700">
                           <img src={`/players/${t.player2.avatarUrl}`} className="w-full h-full object-cover object-top" />
                         </div>
                       ) : <RoleIcon role={t.player2?.preferredRole || "entrambi"} className="w-8 h-8 text-emerald-400 mb-1" />}
                       <span className="text-sm font-black text-white text-center leading-tight">{t.player2?.name}</span>
                     </div>
                   </div>
                </div>
             ))}
           </div>
        </div>
      )}

      {introState === "slot_machine" && (<>

      
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
                  transition: "transform 1500ms cubic-bezier(0.34,1.56,0.64,1), opacity 1500ms ease",
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

          {/* TESTO FINALE SOTTO LA GRIGLIA (Format, Titolo, Data) */}
          {showcaseIndex >= teams.length && (
            <div className="mt-16 text-center animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500 fill-mode-both">
              <h3 className="text-3xl font-black text-indigo-400 uppercase tracking-widest mb-3 drop-shadow-md">
                Modalità: {tournament.format === "eliminazione_diretta" ? "Eliminazione Diretta" : tournament.format === "doppia_eliminazione" ? "Doppia Eliminazione" : "Gironi + Eliminazione"}
              </h3>
              <p className="text-2xl text-slate-300 italic mb-8 max-w-4xl mx-auto font-medium">
                {tournament.format === "eliminazione_diretta" && "Tutto in una notte: chi perde è fuori. Verso la gloria senza paracadute."}
                {tournament.format === "doppia_eliminazione" && "Due vite a disposizione. Chi perde cade nel tabellone dei perdenti, ma può ancora arrivare in finale e vincere."}
                {tournament.format === "gironi_eliminazione" && "Fase a gironi iniziale seguita dalla fase a eliminazione. Ogni singola partita conta per i punti."}
              </p>
              
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-12 py-6 rounded-3xl border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] inline-flex flex-col items-center">
                 <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-widest mb-2 drop-shadow-lg">{tournament.name}</h2>
                 {tournament.startDate ? (
                   <p className="text-emerald-400 font-black text-2xl md:text-3xl tracking-widest uppercase drop-shadow-md">
                     Inizio Torneo: {new Date(tournament.startDate).toLocaleDateString("it-IT", { day: '2-digit', month: 'long', year: 'numeric' })}
                   </p>
                 ) : (
                   <p className="text-emerald-400 font-black text-2xl md:text-3xl tracking-widest uppercase drop-shadow-md">
                     Che la sfida abbia inizio
                   </p>
                 )}
              </div>
            </div>
          )}
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
      </>)}

    </div>
  );
}
