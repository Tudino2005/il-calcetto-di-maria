import re

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    content = f.read()

# Add introState to dependency array
content = content.replace("}, [revealedIndex, teams.length, allPlayers.length]);", "}, [revealedIndex, teams.length, allPlayers.length, introState]);")

# Stop music after 10 seconds in startIntro
old_startIntro = """    // 10 second animation duration
    setTimeout(() => {
       setIntroState("slot_machine");
    }, 10000);
  };"""

new_startIntro = """    // 10 second animation duration
    setTimeout(() => {
       setIntroState("slot_machine");
       if (audioRef.current) {
          audioRef.current.pause();
       }
    }, 10000);
  };"""
content = content.replace(old_startIntro, new_startIntro)

# Stop music after 10 seconds in attemptPlay
old_attempt = """            // Autoplay succeeded!
            setIntroState("playing_intro");
            setTimeout(() => {
               setIntroState("slot_machine");
            }, 10000);"""

new_attempt = """            // Autoplay succeeded!
            setIntroState("playing_intro");
            setTimeout(() => {
               setIntroState("slot_machine");
               if (audioRef.current) {
                  audioRef.current.pause();
               }
            }, 10000);"""
content = content.replace(old_attempt, new_attempt)

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(content)

