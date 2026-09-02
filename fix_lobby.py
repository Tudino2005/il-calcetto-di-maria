import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

# Add imports
content = content.replace(
    'import { addPlayerToTournament, removePlayerFromTournament, startTournament } from "@/app/actions/tournamentActions";',
    'import { addPlayerToTournament, removePlayerFromTournament, startTournament, closeRegistrations, togglePlayerPayment } from "@/app/actions/tournamentActions";'
)
content = content.replace(
    'import { Users, Swords, AlertTriangle, UserPlus, X, Calendar, Banknote, Trophy, ArrowLeft } from "lucide-react";',
    'import { Users, Swords, AlertTriangle, UserPlus, X, Calendar, Banknote, Trophy, ArrowLeft, CheckCircle2, Circle } from "lucide-react";'
)

# Replace logic inside TournamentLobby
pattern = r'(  const \[selectedPlayerId, setSelectedPlayerId\] = useState\(""\);\n  const registeredIds = tournament\.registeredPlayers\.map\(\(p: any\) => p\.id\);\n  const availablePlayers = allPlayers\.filter\(p => !registeredIds\.includes\(p\.id\)\);)'
replacement = """  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const registrations = tournament.registrations || [];
  const registeredIds = registrations.map((r: any) => r.playerId);
  const availablePlayers = allPlayers.filter(p => !registeredIds.includes(p.id));
  const isReady = tournament.status === "ready_to_draw";
"""
content = re.sub(pattern, replacement, content)

# Handlers
content = content.replace(
"""  const handleStart = async () => {
    await startTournament(tournament.id);
  };""",
"""  const handleCloseRegistrations = async () => {
    await closeRegistrations(tournament.id);
  };

  const handleStart = async () => {
    await startTournament(tournament.id);
  };

  const handleTogglePayment = async (playerId: string, currentStatus: boolean) => {
    await togglePlayerPayment(tournament.id, playerId, !currentStatus);
  };"""
)

# Replace count references
content = content.replace(
    'const registeredCount = tournament.registeredPlayers.length;',
    'const registeredCount = registrations.length;'
)

# Replace Add Player Column logic
content = content.replace(
"""        {/* ADD PLAYER COLUMN */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-700 sticky top-8">""",
"""        {/* ADD PLAYER COLUMN */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-700 sticky top-8">
            {isReady ? (
              <div className="text-center p-4 bg-purple-900/20 border border-purple-500 rounded-xl mb-4">
                <h3 className="text-purple-400 font-bold mb-2">Iscrizioni Chiuse</h3>
                <p className="text-sm text-slate-300">Il torneo è pronto per il sorteggio. I giocatori non possono più essere modificati.</p>
              </div>
            ) : ("""
)

# End the Add Player block
content = content.replace(
"""            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <h4 className="text-purple-400 font-bold mb-2">Requisiti Avvio</h4>
              <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                <li>Almeno 4 giocatori (2 squadre)</li>
                {tournament.format !== "gironi_eliminazione" && <li>Il numero di squadre create deve essere una potenza di 2 (2, 4, 8, 16...)</li>}
              </ul>
            </div>
          </div>
        </div>""",
"""            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <h4 className="text-purple-400 font-bold mb-2">Requisiti Avvio</h4>
              <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                <li>Almeno 4 giocatori (2 squadre)</li>
                {tournament.format !== "gironi_eliminazione" && <li>Il numero di squadre create deve essere una potenza di 2 (2, 4, 8, 16...)</li>}
              </ul>
            </div>
            )}
          </div>
        </div>"""
)

# Registered List map
pattern = r'(            \{tournament\.registeredPlayers\.length === 0 \? \(\n              <div className="p-12 text-center text-slate-500">\n                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />\n                <p>Nessun giocatore ancora iscritto\.</p>\n              </div>\n            \) : \(\n              <ul className="divide-y divide-slate-800">\n                \{tournament\.registeredPlayers\.map\(\(p: any\) => \(\n                  <li key=\{p\.id\} className="flex justify-between items-center p-4 hover:bg-slate-800/50 transition-colors">\n                    <div className="flex items-center gap-4">\n                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">\n                        \{p\.name\.charAt\(0\)\.toUpperCase\(\)\}\n                      </div>\n                      <div>\n                        <div className="font-bold text-white">\{p\.name\}</div>\n                        <div className="text-xs text-slate-500 uppercase tracking-wider">\{p\.preferredRole\}</div>\n                      </div>\n                    </div>\n                    <button \n                      onClick=\{\(\) => handleRemove\(p\.id\)\}\n                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"\n                    >\n                      <X className="w-5 h-5" />\n                    </button>\n                  </li>\n                \)\)\}\n              </ul>\n            \)\})'
replacement = """            {registrations.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nessun giocatore ancora iscritto.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {registrations.map((r: any) => (
                  <li key={r.id} className="flex justify-between items-center p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">
                        {r.player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white">{r.player.name}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">{r.player.preferredRole}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleTogglePayment(r.player.id, r.hasPaid)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold transition-all ${r.hasPaid ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                      >
                        {r.hasPaid ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        {r.hasPaid ? 'Pagato' : 'Non Pagato'}
                      </button>
                      
                      {!isReady && (
                        <button 
                          onClick={() => handleRemove(r.player.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}"""
content = re.sub(pattern, replacement, content)

# Replace Action buttons
content = content.replace(
"""          <div className="mt-8 flex justify-end">
            <button
              onClick={handleStart}
              disabled={!canStart}
              className={clsx(
                "px-8 py-4 rounded-xl font-black text-lg tracking-widest uppercase flex items-center gap-3 transition-all",
                canStart 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-105 text-white shadow-lg shadow-purple-500/25" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              )}
            >
              <Swords /> Chiudi Iscrizioni e Crea Tabellone
            </button>
          </div>
          
          {!canStart && registeredCount > 0 && (
            <p className="text-right text-orange-400 text-sm mt-2 flex items-center justify-end gap-1">
              <AlertTriangle className="w-4 h-4" /> 
              Il numero di giocatori attuale ({registeredCount}) genererà {registeredCount / 2} squadre. Non rispetta i requisiti di formato.
            </p>
          )}""",
"""          <div className="mt-8 flex justify-end">
            {!isReady ? (
              <button
                onClick={handleCloseRegistrations}
                disabled={!canStart}
                className={clsx(
                  "px-8 py-4 rounded-xl font-black text-lg tracking-widest uppercase flex items-center gap-3 transition-all",
                  canStart 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-105 text-white shadow-lg shadow-blue-500/25" 
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                Chiudi Iscrizioni
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-8 py-4 rounded-xl font-black text-lg tracking-widest uppercase flex items-center gap-3 transition-all bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 text-white shadow-lg shadow-purple-500/25"
              >
                <Swords className="w-6 h-6 animate-pulse" /> Avvia Cerimonia Sorteggio
              </button>
            )}
          </div>
          
          {!isReady && !canStart && registeredCount > 0 && (
            <p className="text-right text-orange-400 text-sm mt-2 flex items-center justify-end gap-1">
              <AlertTriangle className="w-4 h-4" /> 
              Il numero di giocatori attuale ({registeredCount}) genererà {registeredCount / 2} squadre. Non rispetta i requisiti di formato.
            </p>
          )}"""
)

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
