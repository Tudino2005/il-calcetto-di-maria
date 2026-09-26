import re

with open('src/app/tournaments/page.tsx', 'r') as f:
    content = f.read()

# Add import
if 'DeleteTournamentButton' not in content:
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport DeleteTournamentButton from "@/components/DeleteTournamentButton";')

# Inject button next to status badge
old_badge = """                      <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs uppercase tracking-wider font-medium border border-slate-700">
                        {t.status === "completed" ? "Completato" : "In Corso"}
                      </span>"""

new_badge = """                      <div className="flex items-center">
                        <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs uppercase tracking-wider font-medium border border-slate-700">
                          {t.status === "completed" ? "Completato" : "In Corso"}
                        </span>
                        <DeleteTournamentButton tournamentId={t.id} />
                      </div>"""

if old_badge in content:
    content = content.replace(old_badge, new_badge)
    print("Patched tournaments page!")
else:
    print("Could not find badge in tournaments page!")

with open('src/app/tournaments/page.tsx', 'w') as f:
    f.write(content)
