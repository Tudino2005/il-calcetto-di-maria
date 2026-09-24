import re

with open('src/components/TournamentLobby.tsx', 'r') as f:
    content = f.read()

# Import TournamentRulebook
old_import = 'import RoleIcon from "./RoleIcon";'
new_import = 'import RoleIcon from "./RoleIcon";\nimport TournamentRulebook from "./TournamentRulebook";'
content = content.replace(old_import, new_import)

# Replace the format boxes with Rulebook
old_boxes = """        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-purple-400 font-bold uppercase tracking-wider mb-2 text-sm">Formato Scelto: {tournament.format.replace("_", " ")}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{getFormatDescription()}</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-blue-400 font-bold uppercase tracking-wider mb-2 text-sm">Composizione: {tournament.type.replace("_", " ")}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{getTypeDescription()}</p>
          </div>
        </div>
      </div>"""

new_boxes = """        <TournamentRulebook tournament={tournament} />
      </div>"""

content = content.replace(old_boxes, new_boxes)

with open('src/components/TournamentLobby.tsx', 'w') as f:
    f.write(content)

print("Patched TournamentLobby")
