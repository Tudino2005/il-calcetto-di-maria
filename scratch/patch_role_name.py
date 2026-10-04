with open('src/components/PlayerHistoryView.tsx', 'r') as f:
    content = f.read()

old_role = """                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
                        {partner.preferredRole || "Giocatore"}
                      </span>"""

new_role = """                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
                        {partner.preferredRole === 'portiere' ? 'difensore' : (partner.preferredRole || "Giocatore")}
                      </span>"""

old_in_porta = """                    {roleInMatch === "portiere" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        🛡️ In Porta
                      </span>
                    )}"""

new_in_porta = """                    {roleInMatch === "portiere" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        🛡️ In Difesa
                      </span>
                    )}"""

content = content.replace(old_role, new_role)
content = content.replace(old_in_porta, new_in_porta)

with open('src/components/PlayerHistoryView.tsx', 'w') as f:
    f.write(content)
