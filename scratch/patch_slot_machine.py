import re

with open('src/components/SlotMachineDraw.tsx', 'r') as f:
    content = f.read()

# 1. Update the union type for introState
content = content.replace(
    'useState<"pending" | "playing_intro" | "lineup_intro_text" | "player_lineup" | "draw_intro_text" | "countdown" | "slot_machine" | "pre_showcase_intro" | "rules_scroll">("pending")',
    'useState<"pending" | "playing_intro" | "lineup_intro_text" | "player_lineup" | "draw_intro_text" | "black_screen" | "countdown" | "slot_machine" | "pre_showcase_intro" | "rules_scroll">("pending")'
)

# 2. Update the logic inside useEffect for introState
old_draw_intro_text = """    if (introState === "draw_intro_text") {
      const timer = setTimeout(() => {
        triggerPhaseChange("countdown");
      }, 8000); // Wait 8 seconds
      return () => clearTimeout(timer);
    }
  }, [introState]);"""

new_draw_intro_text = """    if (introState === "draw_intro_text") {
      const timer = setTimeout(() => {
        triggerPhaseChange("black_screen");
      }, 8000); // Wait 8 seconds
      return () => clearTimeout(timer);
    }
    
    if (introState === "black_screen") {
      if (audioRef1.current) fadeOutAudio(audioRef1.current, 1500);
      if (audioRef2.current) {
        audioRef2.current.volume = 1;
        audioRef2.current.currentTime = 0;
        audioRef2.current.play().catch(e => console.error("Track 2 failed:", e));
      }
      const timer = setTimeout(() => {
        triggerPhaseChange("countdown");
      }, 3000); // Wait 3 seconds on black screen with music playing before starting countdown
      return () => clearTimeout(timer);
    }
  }, [introState]);"""

content = content.replace(old_draw_intro_text, new_draw_intro_text)

# 3. Update the logic for countdown
old_countdown_logic = """  // Countdown logic
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
  }, [introState, countdownValue]);"""

new_countdown_logic = """  // Countdown logic
  useEffect(() => {
    if (introState === "countdown") {
      if (countdownValue > 0) {
        const timer = setTimeout(() => setCountdownValue(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        triggerPhaseChange("slot_machine");
      }
    }
  }, [introState, countdownValue]);"""

content = content.replace(old_countdown_logic, new_countdown_logic)

# 4. Update the render block for countdown to handle black_screen
old_render_countdown = """      {introState === "countdown" && (
        <div className="absolute inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          <div key={countdownValue} className="animate-in zoom-in fade-in duration-500 flex flex-col items-center">
            <h1 className="text-[15rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_100px_rgba(250,204,21,0.8)] leading-none">
              {countdownValue}
            </h1>
          </div>
        </div>
      )}"""

new_render_countdown = """      {(introState === "black_screen" || introState === "countdown") && (
        <div className="absolute inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden">
          {introState === "countdown" && (
            <div key={countdownValue} className="animate-in zoom-in fade-in duration-500 flex flex-col items-center">
              <h1 className="text-[15rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_100px_rgba(250,204,21,0.8)] leading-none">
                {countdownValue}
              </h1>
            </div>
          )}
        </div>
      )}"""

content = content.replace(old_render_countdown, new_render_countdown)

with open('src/components/SlotMachineDraw.tsx', 'w') as f:
    f.write(content)

print("Patched!")
