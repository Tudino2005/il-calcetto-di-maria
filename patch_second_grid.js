const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentLobby.tsx', 'utf8');

const targetStr = \`                      className={clsx(
                        "cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 text-center select-none active:scale-95",
                        isSelected ? "border-solid" : "border-dashed border-slate-700 hover:border-slate-500 bg-slate-800/50"
                      )}
                      style={pairColorValue ? { 
                        borderColor: pairColorValue,
                        backgroundColor: \`\${pairColorValue}22\`,
                        boxShadow: \`0 0 15px \${pairColorValue}44\`
                      } : {}}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-lg overflow-hidden border border-slate-700">
                        {p.avatarUrl ? (
                          <img src={\`/players/\${p.avatarUrl}\`} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          p.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className={clsx("font-bold", isSelected ? "text-white" : "text-slate-400")}>
                        {p.name}
                      </div>
                      <div className="mt-1 flex justify-center">
                        <RoleIcon role={p.preferredRole} className="w-6 h-6" />
                      </div>
                    </div>\`;

const replacementStr = \`                      className={clsx(
                        "cursor-pointer transition-all duration-300 flex flex-col items-center justify-start gap-1 text-center select-none py-2 w-28 active:scale-95",
                        !isSelected && "opacity-60 hover:opacity-80"
                      )}
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-xl transition-all duration-300 overflow-hidden mb-1"
                        style={pairColorValue ? { 
                          boxShadow: \`0 0 0 3px \${pairColorValue}, 0 0 20px \${pairColorValue}66\`,
                          filter: 'none',
                          opacity: 1
                        } : {
                          backgroundColor: '#1e293b',
                          filter: 'grayscale(100%)',
                          opacity: 0.8
                        }}
                      >
                        {p.avatarUrl ? (
                          <img src={\`/players/\${p.avatarUrl}\`} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          p.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className={clsx("text-lg leading-tight truncate w-full px-1 transition-all duration-300", isSelected ? "text-white font-black drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" : "text-slate-500 font-medium")}>
                        {p.name}
                      </div>
                      <div className="flex justify-center transition-all duration-300">
                        <RoleIcon role={p.preferredRole} className="w-5 h-5 opacity-80" />
                      </div>
                    </div>\`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/TournamentLobby.tsx', code);
