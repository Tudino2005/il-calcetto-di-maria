import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Check if it already exists
if "function BracketSpotlightManager" not in content:
    manager_code = """
function BracketSpotlightManager({ rounds, tournament, matchProbs }: { rounds: any[][], tournament: any, matchProbs: any }) {
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const toAnimate = rounds.flat().filter(m => !m.winnerTeamId && m.scheduledAt).sort((a, b) => {
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });

    if (toAnimate.length === 0) return;

    let idx = 0;
    let isMounted = true;
    let interval: any;
    
    const startDelay = setTimeout(() => {
      if (!isMounted) return;
      setActiveMatch(toAnimate[idx]);
      setIsFading(true);
      
      interval = setInterval(() => {
        setIsFading(false);
        setTimeout(() => {
          if (!isMounted) return;
          idx++;
          if (idx >= toAnimate.length) {
            setActiveMatch(null);
            clearInterval(interval);
            return;
          }
          setActiveMatch(toAnimate[idx]);
          setIsFading(true);
        }, 500);
      }, 3500);
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(startDelay);
      clearInterval(interval);
    };
  }, [rounds]);

  if (!activeMatch) return null;

  const m = activeMatch;
  const t = tournament;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm pointer-events-none transition-opacity duration-500 ${isFading ? 'opacity-100' : 'opacity-0'}`}>
       <div className={`transform transition-transform duration-500 ${isFading ? 'scale-[1.6]' : 'scale-50'} w-[500px]`}>
           <div className="p-6 rounded-2xl border-4 flex flex-col justify-center items-center gap-4 relative shadow-[0_0_80px_rgba(236,72,153,0.6)] bg-slate-900 border-pink-500">
                <div className="flex justify-between items-center w-full">
                  <div className="flex-1 flex flex-col min-w-0 pr-2">
                    {m.teamAId && t.teamNames && t.teamNames[m.teamAId] && (
                      <span className="text-xs text-purple-400 font-bold uppercase tracking-wider truncate mb-1">
                        "{t.teamNames[m.teamAId]}"
                      </span>
                    )}
                    <span className="text-lg font-bold truncate leading-tight text-slate-200">
                      {m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center gap-4 mx-2">
                    {matchProbs.has(m.id) && (
                      <span className="text-[17px] text-yellow-500/90 font-black tracking-wider text-right uppercase">WIN: {matchProbs.get(m.id).teamAProb.toFixed(0)}%</span>
                    )}
                    <div className="bg-slate-950 px-6 py-4 rounded-2xl text-4xl font-black text-white shadow-inner flex flex-col items-center border border-slate-800">
                      <span>VS</span>
                    </div>
                    {matchProbs.has(m.id) && (
                      <span className="text-[17px] text-yellow-500/90 font-black tracking-wider text-left uppercase">WIN: {matchProbs.get(m.id).teamBProb.toFixed(0)}%</span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col min-w-0 pl-2 text-right">
                    {m.teamBId && t.teamNames && t.teamNames[m.teamBId] && (
                      <span className="text-xs text-purple-400 font-bold uppercase tracking-wider truncate mb-1">
                        "{t.teamNames[m.teamBId]}"
                      </span>
                    )}
                    <span className="text-lg font-bold truncate leading-tight text-slate-200">
                      {m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}
                    </span>
                  </div>
                </div>
                {(() => {
                  const dateToUse = m.scheduledAt || tournament.startDate;
                  if (!dateToUse) return null;
                  return (
                    <div className="text-lg font-black text-white bg-pink-500 px-6 py-2 rounded-xl mt-3 shadow-lg">
                      {new Date(dateToUse).toLocaleDateString('it-IT')} {m.scheduledAt ? `alle ${new Date(dateToUse).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : ''}
                    </div>
                  );
                })()}
             </div>
       </div>
    </div>
  );
}
"""
    # Insert it right before export default function TVSlideshow
    content = content.replace("export default function TVSlideshow", manager_code + "\nexport default function TVSlideshow")
    
    # Inject it into the bracket_tree slide
    target = 'Turni {t.name}\n              </h2>'
    replacement = target + '\n              <BracketSpotlightManager rounds={rounds} tournament={t} matchProbs={matchProbs} />'
    content = content.replace(target, replacement)

    with open('src/components/TVSlideshow.tsx', 'w') as f:
        f.write(content)
    
    print("Patched animation logic")
else:
    print("Already patched")
