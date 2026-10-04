with open('src/components/PlayerHistoryView.tsx', 'r') as f:
    content = f.read()

old_icon = """                    <div className="w-12 h-12 bg-slate-700/80 rounded-full flex items-center justify-center shrink-0">
                      <RoleIcon role={partner.preferredRole || "entrambi"} className="w-6 h-6" />
                    </div>"""

new_icon = """                    <div className="w-12 h-12 shrink-0 relative">
                      {partner.avatarUrl ? (
                        <img src={`/players/${partner.avatarUrl}`} alt={partner.name} className="w-full h-full object-cover rounded-full border-2 border-purple-500/50" />
                      ) : (
                        <div className="w-full h-full rounded-full border-2 border-purple-500/50 bg-slate-800 flex items-center justify-center text-sm font-black text-purple-400">
                          {partner.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>"""

content = content.replace(old_icon, new_icon)

with open('src/components/PlayerHistoryView.tsx', 'w') as f:
    f.write(content)
