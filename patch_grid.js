const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentLobby.tsx', 'utf8');

const targetStr = \`          {allPlayers.map(p => {
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
                <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors overflow-hidden", circleClass)}>
                  {p.avatarUrl ? (
                    <img src={\`/players/\${p.avatarUrl}\`} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    p.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className={clsx("font-bold", nameClass)}>
                  {p.name}
                </div>
                <div className="mt-1 flex justify-center">
                  <RoleIcon role={p.preferredRole} className="w-6 h-6" />
                </div>\`;

const replacementStr = \`          {allPlayers.map(p => {
            const registration = registrations.find((r: any) => r.playerId === p.id);
            const isSelected = !!registration;
            
            let containerClass = "opacity-40 hover:opacity-70 scale-95 hover:scale-100";
            let circleClass = "bg-slate-800 text-slate-500 grayscale opacity-80";
            let nameClass = "text-slate-500 font-medium";
            
            if (isSelected) {
              containerClass = "opacity-100 scale-100";
              circleClass = "bg-emerald-500 text-emerald-950 ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]";
              nameClass = "text-white font-black drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]";
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
                  "cursor-pointer transition-all duration-300 flex flex-col items-center justify-start gap-1.5 text-center select-none py-2",
                  !isReady && "active:scale-90",
                  isReady && !isSelected && "opacity-20 cursor-not-allowed",
                  containerClass
                )}
              >
                <div className={clsx("w-16 h-16 rounded-full flex items-center justify-center text-xl transition-all duration-300 overflow-hidden mb-1", circleClass)}>
                  {p.avatarUrl ? (
                    <img src={\`/players/\${p.avatarUrl}\`} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    p.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className={clsx("text-lg leading-tight truncate w-full px-1 transition-all duration-300", nameClass)}>
                  {p.name}
                </div>
                <div className="flex justify-center transition-all duration-300">
                  <RoleIcon role={p.preferredRole} className="w-5 h-5 opacity-80" />
                </div>\`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/TournamentLobby.tsx', code);
