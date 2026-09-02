import re

with open("src/app/players/[id]/page.tsx", "r") as f:
    content = f.read()

if 'import { deletePlayer }' not in content:
    content = content.replace(
        'import { notFound } from "next/navigation";',
        'import { notFound, redirect } from "next/navigation";\nimport { deletePlayer } from "@/app/actions/matchActions";'
    )

# Add the delete button next to the player name
pattern_header = r'(          <div className="flex items-center gap-6">\n\s*<div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">\n\s*<User className="w-10 h-10 text-slate-400" />\n\s*</div>\n\s*<div>\n\s*<h2 className="text-4xl font-black text-white mb-2">\{player\.name\}</h2>\n\s*<span className="px-4 py-2 bg-slate-900 text-slate-300 rounded-lg text-sm uppercase tracking-wider font-bold border border-slate-700">\n\s*\{player\.preferredRole\}\n\s*</span>\n\s*</div>\n\s*</div>)'

# We need an inline server action for the form
action_code = """
  async function handleDelete() {
    "use server";
    await deletePlayer(id);
    redirect("/players");
  }
"""

# Insert action code before return
content = content.replace('  return (\n    <main', action_code + '\n  return (\n    <main')

# Import Trash icon
content = content.replace('User, Trophy, Swords, Calendar }', 'User, Trophy, Swords, Calendar, Trash2 }')

replacement_header = """          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white mb-2">{player.name}</h2>
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 bg-slate-900 text-slate-300 rounded-lg text-sm uppercase tracking-wider font-bold border border-slate-700">
                  {player.preferredRole}
                </span>
                <form action={handleDelete}>
                  <button 
                    type="submit" 
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-sm font-bold border border-red-500/30"
                    title="Elimina Giocatore"
                  >
                    <Trash2 className="w-4 h-4" /> Elimina
                  </button>
                </form>
              </div>
            </div>
          </div>"""

content = re.sub(pattern_header, replacement_header, content)

with open("src/app/players/[id]/page.tsx", "w") as f:
    f.write(content)
