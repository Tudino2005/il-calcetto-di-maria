import re

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    content = f.read()

imports = """import { useState, useEffect, useRef } from "react";
import { Trophy, Dices, Users, Sparkles, Play } from "lucide-react";"""
content = content.replace('import { Trophy, Dices, Users, Sparkles } from "lucide-react";', imports)
content = content.replace('import { useState, useEffect } from "react";', "")

# Add state for intro
states_old = """  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(60);"""

states_new = """  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  // Intro states
  const [introState, setIntroState] = useState<"pending" | "playing_intro" | "slot_machine">("pending");
  const audioRef = useRef<HTMLAudioElement | null>(null);"""

content = content.replace(states_old, states_new)

# Modify the spinning logic to only run if introState === "slot_machine"
effect_old = """  useEffect(() => {
    if (teams.length === 0 || allPlayers.length === 0) return;"""

effect_new = """  useEffect(() => {
    if (introState !== "slot_machine") return;
    if (teams.length === 0 || allPlayers.length === 0) return;"""

content = content.replace(effect_old, effect_new)

# Add Intro Logic
intro_logic = """  // Handle Intro
  const startIntro = () => {
    setIntroState("playing_intro");
    if (audioRef.current) {
       // Assuming the chorus starts at 55 seconds as an example.
       // The user didn't specify, so we start at 0 or let them adjust it.
       audioRef.current.currentTime = 55; // Change this to the exact second the chorus starts
       audioRef.current.play().catch(e => console.error("Audio autoplay failed:", e));
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
          audioRef.current.currentTime = 55; // default start time
          try {
            await audioRef.current.play();
            // Autoplay succeeded!
            setIntroState("playing_intro");
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
  }, [teams.length, introState]);"""

# Insert intro_logic right before `if (teams.length === 0) return null;`
content = content.replace("  if (teams.length === 0) return null;", intro_logic + "\n  if (teams.length === 0) return null;")

# Add the UI for pending/intro
render_old = """  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center p-8 bg-gradient-to-b from-slate-950 to-indigo-950 overflow-hidden relative">"""

render_new = """  return (
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
"""

content = content.replace(render_old, render_new)

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(content)

