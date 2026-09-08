import re

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    content = f.read()

# I will add the fadeOut function inside the component or outside. Let's add it right before the component declaration or inside.
fade_function = """const fadeOutAudio = (audio: HTMLAudioElement, duration: number = 2000) => {
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

export default function SlotMachineDraw"""

content = content.replace("export default function SlotMachineDraw", fade_function)

# Now rewrite startIntro and attemptPlay
# First startIntro
old_startIntro = """  const startIntro = () => {
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
       if (audioRef.current) {
          audioRef.current.pause();
       }
    }, 10000);
  };"""

new_startIntro = """  const startIntro = () => {
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
  };"""

content = content.replace(old_startIntro, new_startIntro)

# Now attemptPlay
old_attempt = """        if (audioRef.current) {
          audioRef.current.currentTime = 55; // default start time
          try {
            await audioRef.current.play();
            // Autoplay succeeded!
            setIntroState("playing_intro");
            setTimeout(() => {
               setIntroState("slot_machine");
               if (audioRef.current) {
                  audioRef.current.pause();
               }
            }, 10000);
          } catch (err) {"""

new_attempt = """        if (audioRef.current) {
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
          } catch (err) {"""

content = content.replace(old_attempt, new_attempt)

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(content)
