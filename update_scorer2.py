import re

with open("src/components/MatchScorer.tsx", "r") as f:
    content = f.read()

pattern = r'  const backLink = match\.tournamentId \? `/tournaments/\$\{match\.tournamentId\}` : "/";\n  const backText = match\.tournamentId \? "Torna al Tabellone" : "Torna alla Home";\n\n  return \('
replacement = """  const backLink = match.tournamentId ? `/tournaments/${match.tournamentId}` : "/";
  const backText = match.tournamentId ? "Torna al Tabellone" : "Torna alla Home";

  if (!match.teamA || !match.teamB) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-screen">
        <h2 className="text-2xl font-bold text-slate-400 mb-4">In attesa degli avversari...</h2>
        <p className="text-slate-500 mb-8">Questa partita non ha ancora entrambe le squadre assegnate. Ritorna quando il tabellone sarà aggiornato.</p>
        <Link href={backLink} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition">
          {backText}
        </Link>
      </div>
    );
  }

  return ("""

content = re.sub(pattern, replacement, content)

with open("src/components/MatchScorer.tsx", "w") as f:
    f.write(content)
