import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

# Add fixedPairs state
state_injection = """  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [fixedPairs, setFixedPairs] = useState<string[][]>([]);"""
content = content.replace('  const [selectedPlayerId, setSelectedPlayerId] = useState("");', state_injection)

# Modify handleStart to use fixedPairs
start_injection = """  const handleStart = async () => {
    if (tournament.type === "coppie_fisse") {
      const validPairs = fixedPairs.filter(p => p.length === 2);
      if (validPairs.length * 2 !== registrations.length) {
        alert("Devi formare tutte le squadre prima di avviare il torneo!");
        return;
      }
      await startTournament(tournament.id, { fixedPairs: validPairs });
    } else {
      await startTournament(tournament.id);
    }
  };"""
content = re.sub(r'  const handleStart = async \(\) => \{\s*await startTournament\(tournament.id\);\s*\};', start_injection, content)

# Inject the pairing UI before the start button when isReady and coppie_fisse
pairing_ui = """
          {isReady && tournament.type === "coppie_fisse" && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-orange-500/50 mb-6 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="text-orange-400" /> Forma le Squadre (Tocca 2 giocatori per accoppiarli)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {registrations.map((r: any) => {
                  const p = r.player;
                  let isSelected = false;
                  let pairColorValue = "";
                  
                  const pairIndex = fixedPairs.findIndex(pair => pair.includes(p.id));
                  if (pairIndex !== -1) {
                    isSelected = true;
                    const cssColors = [
                        "#10b981", "#3b82f6", "#f97316", "#ec4899", "#a855f7", "#06b6d4", "#f43f5e", "#eab308"
                    ];
                    pairColorValue = cssColors[pairIndex % cssColors.length];
                  }

                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        const id = p.id;
                        const pIdx = fixedPairs.findIndex(pair => pair.includes(id));
                        if (pIdx !== -1) {
                          const newPairs = [...fixedPairs];
                          newPairs[pIdx] = newPairs[pIdx].filter(pId => pId !== id);
                          setFixedPairs(newPairs.filter(pair => pair.length > 0));
                        } else {
                          const openPairIndex = fixedPairs.findIndex(pair => pair.length === 1);
                          if (openPairIndex !== -1) {
                            const newPairs = [...fixedPairs];
                            newPairs[openPairIndex].push(id);
                            setFixedPairs(newPairs);
                          } else {
                            setFixedPairs([...fixedPairs, [id]]);
                          }
                        }
                      }}
                      className={clsx(
                        "cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 text-center select-none active:scale-95",
                        isSelected ? "border-solid" : "border-dashed border-slate-700 hover:border-slate-500 bg-slate-800/50"
                      )}
                      style={pairColorValue ? { 
                          borderColor: pairColorValue, 
                          backgroundColor: pairColorValue + "33" 
                      } : {}}
                    >
                      <div className="font-bold" style={pairColorValue ? { color: "#fff" } : { color: "#94a3b8" }}>
                        {p.name}
                      </div>
                      {pairColorValue && (
                        <div className="text-[10px] font-black uppercase px-2 py-1 rounded bg-black/50 text-white mt-1">
                          Squadra {pairIndex + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
"""
content = content.replace('          <div className="mt-8 flex justify-end">', pairing_ui + '\n          <div className="mt-8 flex justify-end">')

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
