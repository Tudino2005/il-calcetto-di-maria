with open('src/app/players/page.tsx', 'r') as f:
    content = f.read()

old_link = """              players.map((p) => (
                <Link href={`/players/${p.id}`} key={p.id} className="flex flex-col items-center justify-start transition-all group cursor-pointer py-2">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3">"""

new_link = """              players.map((p) => (
                <Link href={`/players/${p.id}`} key={p.id} title="Clicca per aprire la scheda del giocatore" className="flex flex-col items-center justify-start transition-all group cursor-pointer py-2">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3">"""

content = content.replace(old_link, new_link)

with open('src/app/players/page.tsx', 'w') as f:
    f.write(content)
