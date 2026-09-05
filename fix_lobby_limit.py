import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

# Calculate maxPlayers and update canStart
old_count = 'const registeredCount = registrations.length;'
new_count = """const registeredCount = registrations.length;
  const maxPlayers = (tournament.maxTeams || 8) * 2;"""

content = content.replace(old_count, new_count)

old_canStart = 'const canStart = registeredCount > 0 && registeredCount % 2 === 0;'
new_canStart = 'const canStart = registeredCount === maxPlayers;'

content = content.replace(old_canStart, new_canStart)

# Update Appello Header
old_appello = '<h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">'
new_appello = """<h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2">Appello Giocatori Presenti <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded">({registeredCount} / {maxPlayers})</span></span>"""

content = content.replace(old_appello + '\n            Appello Giocatori Presenti', new_appello)

# Disable Accetta button if full
old_accetta = """                  <button onClick={() => respondToRegistrationRequest(req.id, "accepted", "Pagami alla cassa prima di iniziare.")} className="flex flex-col items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl py-2 px-1 transition-colors">
                    <Check className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Accetta<br/>(Ricorda Pagamento)</span>
                  </button>"""

new_accetta = """                  <button 
                    onClick={() => respondToRegistrationRequest(req.id, "accepted", "Pagami alla cassa prima di iniziare.")} 
                    disabled={registeredCount >= maxPlayers}
                    className="flex flex-col items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-emerald-400 border border-emerald-500/30 rounded-xl py-2 px-1 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">
                      {registeredCount >= maxPlayers ? "Torneo Pieno" : "Accetta"}
                    </span>
                  </button>"""

content = content.replace(old_accetta, new_accetta)

# Update Warning text
old_warning = 'Il numero di giocatori attuale ({registeredCount}) genererà {registeredCount / 2} squadre. Non rispetta i requisiti di formato.'
new_warning = 'Devi raggiungere ESATTAMENTE {maxPlayers} iscritti ({maxPlayers/2} squadre) per poter avviare il torneo, in modo da creare un tabellone perfetto.'

content = content.replace(old_warning, new_warning)

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
