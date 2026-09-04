import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

# Add RoleIcon import
if 'import RoleIcon' not in content:
    content = content.replace('import clsx from "clsx";', 'import clsx from "clsx";\nimport RoleIcon from "@/components/RoleIcon";')

# We want to replace the entire <div className="grid lg:grid-cols-3 gap-8"> section
start_marker = '<div className="grid lg:grid-cols-3 gap-8">'
end_marker = '{isReady && tournament.type === "coppie_fisse" && ('

# Let's extract everything before the start marker and after the end marker
pre_content = content.split(start_marker)[0]
post_content = end_marker + content.split(end_marker)[1]

new_grid = """
      {/* CREA NUOVO GIOCATORE RAPIDO */}
      {!isReady && (
        <div className="mb-8 bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row items-center gap-4">
          <h3 className="text-white font-bold whitespace-nowrap flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" /> Nuovo:
          </h3>
          <input
            type="text"
            placeholder="Nome (Es. Mario)"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500"
          />
          <select 
            value={newPlayerRole}
            onChange={(e) => setNewPlayerRole(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500"
          >
            <option value="attaccante">Attaccante</option>
            <option value="portiere">Portiere</option>
            <option value="entrambi">Entrambi</option>
          </select>
          <button 
            onClick={handleCreatePlayer}
            disabled={!newPlayerName.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Salva & Aggiungi
          </button>
        </div>
      )}

      {/* APPELLO GRID */}
      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-400" /> Appello Giocatori Presenti
          </h2>
          {!isReady && (
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={async () => {
                  // Aggiunge tutti i non iscritti
                  for (const p of availablePlayers) {
                    await addPlayerToTournament(tournament.id, p.id);
                  }
                }} 
                className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 bg-slate-900 rounded-lg transition-colors"
              >
                Seleziona Tutti
              </button>
              <button 
                type="button" 
                onClick={async () => {
                  // Rimuove tutti
                  for (const id of registeredIds) {
                    await removePlayerFromTournament(tournament.id, id);
                  }
                }} 
                className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 bg-slate-900 rounded-lg transition-colors"
              >
                Azzera
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 mb-6 flex justify-between items-center">
          <span className="text-slate-400 font-bold text-lg">
            Giocatori Selezionati:
          </span>
          <span className="text-4xl font-black text-white">
            {registeredCount}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
          {allPlayers.map(p => {
            const registration = registrations.find((r: any) => r.playerId === p.id);
            const isSelected = !!registration;
            
            let colorClass = "bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-400";
            let circleClass = "bg-slate-800 text-slate-400";
            let nameClass = "text-slate-400";
            
            if (isSelected) {
              colorClass = "bg-emerald-500/20 border-emerald-500";
              circleClass = "bg-emerald-500 text-emerald-950";
              nameClass = "text-white";
            }

            return (
              <div 
                key={p.id}
                onClick={() => {
                  if (isReady) return;
                  if (isSelected) {
                    handleRemove(p.id);
                  } else {
                    addPlayerToTournament(tournament.id, p.id);
                  }
                }}
                className={clsx(
                  "cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 text-center select-none",
                  !isReady && "active:scale-95",
                  isReady && !isSelected && "opacity-30 cursor-not-allowed",
                  colorClass
                )}
              >
                <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors", circleClass)}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className={clsx("font-bold", nameClass)}>
                  {p.name}
                </div>
                <div className="mt-1 flex justify-center">
                  <RoleIcon role={p.preferredRole} className="w-6 h-6" />
                </div>
                {isSelected && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleTogglePayment(p.id, registration.hasPaid); 
                    }}
                    className={clsx(
                      "mt-2 w-full flex justify-center items-center gap-1 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all border",
                      registration.hasPaid 
                        ? "bg-emerald-900/50 border-emerald-500/30 text-emerald-400 hover:bg-emerald-800/60" 
                        : "bg-red-900/50 border-red-500/30 text-red-400 hover:bg-red-800/60"
                    )}
                  >
                    {registration.hasPaid ? 'Pagato' : 'Non Pagato'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
"""

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(pre_content + new_grid + post_content)
