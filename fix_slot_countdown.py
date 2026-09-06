import re

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    content = f.read()

old_state = "const [showConfetti, setShowConfetti] = useState(false);"
new_state = """const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(60);

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
  }, [revealedIndex, teams.length]);"""

content = content.replace(old_state, new_state)

old_ui = """      {revealedIndex >= teams.length ? (
        <div className="flex flex-col items-center justify-center animate-bounce-in z-20 mt-32">
           <Trophy className="w-40 h-40 text-yellow-500 mb-8 drop-shadow-[0_0_50px_rgba(234,179,8,0.6)]" />
           <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-widest mb-4">
             Tabellone Pronto!
           </h1>
           <p className="text-2xl text-slate-300">Preparazione delle sfide in corso...</p>
        </div>
      ) : ("""

new_ui = """      {revealedIndex >= teams.length ? (
        <div className="flex flex-col items-center justify-center animate-bounce-in z-20 mt-20">
           <div className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-4 tabular-nums leading-none drop-shadow-2xl">
             {countdown}
           </div>
           <h1 className="text-5xl font-black text-emerald-400 uppercase tracking-widest mb-6 text-center max-w-4xl drop-shadow-lg">
             Elaborazione del tabellone degli incontri
           </h1>
        </div>
      ) : ("""

content = content.replace(old_ui, new_ui)

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(content)
