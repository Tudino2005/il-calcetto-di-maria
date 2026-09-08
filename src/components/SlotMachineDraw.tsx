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
  const [countdown, setCountdown] = useState(60);
  
  // Intro states
  const [introState, setIntroState] = useState<"pending" | "playing_intro" | "slot_machine">("pending");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (revealedIndex >= teams.length && teams.length > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [revealedIndex, teams.length]);
  
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
         
         // Wait 2 seconds before moving to next pair
         setTimeout(() => {
            setRevealedIndex(prev => prev + 1);
         }, 2000);

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
       setIntroState("slot_machine");
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
               setIntroState("slot_machine");
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
           
           <div className="animate-in zoom-in duration-1000 flex flex-col items-center z-10">
              <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_100px_rgba(79,70,229,0.8)] mb-12 animate-bounce">
                 <Trophy className="w-24 h-24 text-white" />
              </div>
              <h1 className="text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 uppercase tracking-tighter leading-none text-center mix-blend-screen" style={{ textShadow: '0 0 50px rgba(255,255,255,0.3)' }}>
                IL CALCETTO
              </h1>
              <h1 className="text-[10rem] font-black text-emerald-400 uppercase tracking-tighter leading-none text-center animate-pulse" style={{ textShadow: '0 0 80px rgba(52,211,153,0.6)', animationDuration: '0.8s' }}>
                DI MARIA
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

      {revealedIndex >= teams.length ? (
        <div className="flex flex-col items-center justify-center animate-bounce-in z-20 mt-20">
           <div className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-4 tabular-nums leading-none drop-shadow-2xl">
             {countdown}
           </div>
           <h1 className="text-5xl font-black text-emerald-400 uppercase tracking-widest mb-6 text-center max-w-4xl drop-shadow-lg">
             Elaborazione del tabellone degli incontri
           </h1>
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

      {/* Lista delle squadre già estratte (in basso) */}
      <div className="absolute bottom-0 w-full bg-slate-950/80 border-t border-slate-800 backdrop-blur-md p-6 flex flex-col items-center z-20 max-h-48 overflow-y-auto">
         <div className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-4">Coppie Formate</div>
         <div className="flex flex-wrap gap-4 justify-center w-full max-w-7xl overflow-hidden">
            {teams.slice(0, revealedIndex).map((t, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg animate-fade-in-up">
                 <div className="flex flex-col">
                   {tournament.teamNames && tournament.teamNames[t.id] && (
                     <span className="text-emerald-400 font-black text-xs uppercase tracking-widest text-center mb-1">"{tournament.teamNames[t.id]}"</span>
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
    </div>
  );
}
