import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

# Add imports
content = content.replace(
    'import { addPlayerToTournament, removePlayerFromTournament, startTournament } from "@/app/actions/tournamentActions";',
    'import { addPlayerToTournament, removePlayerFromTournament, startTournament } from "@/app/actions/tournamentActions";\nimport { createPlayer } from "@/app/actions/matchActions";'
)
content = content.replace(
    'import { Users, Swords, AlertTriangle, UserPlus, X } from "lucide-react";',
    'import { Users, Swords, AlertTriangle, UserPlus, X, Calendar, Banknote, Trophy } from "lucide-react";'
)

# Add states for new player
content = content.replace(
    '  const availablePlayers = allPlayers.filter(p => !registeredIds.includes(p.id));',
    '  const availablePlayers = allPlayers.filter(p => !registeredIds.includes(p.id));\n  const [newPlayerName, setNewPlayerName] = useState("");\n  const [newPlayerRole, setNewPlayerRole] = useState("entrambi");\n  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);'
)

# Add handleCreatePlayer
content = content.replace(
    '  const handleStart = async () => {',
    """  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) return;
    const player = await createPlayer(newPlayerName, newPlayerRole);
    await addPlayerToTournament(tournament.id, player.id);
    setNewPlayerName("");
    setNewPlayerRole("entrambi");
    setIsCreatingPlayer(false);
  };

  const handleStart = async () => {"""
)

# Add tournament info display
pattern = r'(        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 uppercase tracking-widest mb-6">\n          \{tournament\.name\}\n        </h1>)'
replacement = """\\1
        <div className="flex flex-wrap gap-6 mb-8 text-slate-300 relative z-10">
          {tournament.startDate && (
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="font-medium">{new Date(tournament.startDate).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
          )}
          {tournament.pricePerPlayer != null && (
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <Banknote className="w-5 h-5 text-emerald-400" />
              <span className="font-medium">{tournament.pricePerPlayer} € <span className="text-slate-500 text-sm">/ gioc.</span></span>
            </div>
          )}
          {tournament.prizes && (
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-medium">{tournament.prizes}</span>
            </div>
          )}
        </div>"""
content = re.sub(pattern, replacement, content)

# Add Create Player UI
pattern = r'(              <button \n                onClick=\{handleAdd\}\n                disabled=\{\!selectedPlayerId\}\n                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"\n              >\n                Iscrivi Giocatore\n              </button>\n            </div>)'
replacement = """\\1

            <div className="mt-4">
              {!isCreatingPlayer ? (
                <button 
                  onClick={() => setIsCreatingPlayer(true)}
                  className="w-full text-emerald-400 hover:text-emerald-300 text-sm font-bold transition-colors"
                >
                  + Crea Nuovo Giocatore
                </button>
              ) : (
                <div className="flex flex-col gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 mt-2">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg py-2 px-3 focus:outline-none focus:border-emerald-500"
                  />
                  <select 
                    value={newPlayerRole} 
                    onChange={(e) => setNewPlayerRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg py-2 px-3 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="entrambi">Ruolo Libero</option>
                    <option value="attaccante">Attaccante</option>
                    <option value="portiere">Portiere</option>
                  </select>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsCreatingPlayer(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg"
                    >
                      Annulla
                    </button>
                    <button 
                      onClick={handleCreatePlayer}
                      disabled={!newPlayerName.trim()}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2 rounded-lg"
                    >
                      Salva & Iscrivi
                    </button>
                  </div>
                </div>
              )}
            </div>"""
content = re.sub(pattern, replacement, content)

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
