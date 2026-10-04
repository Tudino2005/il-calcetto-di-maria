import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Update startIntro
    old_start_intro = """  const startIntro = () => {
    setIntroState("playing_intro");
    if (audioRef1.current) {
       audioRef1.current.volume = 1; // Reset volume
       audioRef1.current.currentTime = 0; // Play from the beginning
       audioRef1.current.play().catch(e => console.error("Audio autoplay failed:", e));
    }
    
    // 10 second animation duration
    setTimeout(() => {
       const isSunday = tournament?.name?.toLowerCase().includes("domenica");
       if (isSunday) {
         triggerPhaseChange("draw_intro_text");
       } else {
         triggerPhaseChange("lineup_intro_text");
         setTimeout(() => {
           triggerPhaseChange("player_lineup");
         }, 3500);
       }
    }, 10000);
  };"""

    new_start_intro = """  const startIntro = () => {
    setIntroState("playing_intro");
    if (audioRef1.current) {
       audioRef1.current.volume = 1; // Reset volume
       audioRef1.current.currentTime = 0; // Play from the beginning
       audioRef1.current.play().catch(e => console.error("Audio autoplay failed:", e));
    }
  };"""

    # 2. Update playing_intro JSX
    old_playing_intro_jsx = """      {introState === "playing_intro" && (
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
      )}"""

    new_playing_intro_jsx = """      {introState === "playing_intro" && (
        <div className="absolute inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden">
           <video 
             src="/IntroTorneo.mp4" 
             autoPlay 
             className="w-full h-full object-cover" 
             onEnded={() => {
                const isSunday = tournament?.name?.toLowerCase().includes("domenica");
                if (isSunday) {
                  triggerPhaseChange("draw_intro_text");
                } else {
                  triggerPhaseChange("lineup_intro_text");
                  setTimeout(() => {
                    triggerPhaseChange("player_lineup");
                  }, 3500);
                }
             }}
             onError={() => {
                const isSunday = tournament?.name?.toLowerCase().includes("domenica");
                if (isSunday) {
                  triggerPhaseChange("draw_intro_text");
                } else {
                  triggerPhaseChange("lineup_intro_text");
                  setTimeout(() => {
                    triggerPhaseChange("player_lineup");
                  }, 3500);
                }
             }}
           />
        </div>
      )}"""

    content = content.replace(old_start_intro, new_start_intro)
    content = content.replace(old_playing_intro_jsx, new_playing_intro_jsx)

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/components/SlotMachineDraw.tsx')
