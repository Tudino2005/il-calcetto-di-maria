with open('src/app/players/page.tsx', 'r') as f:
    content = f.read()

old_header = """          <div className="flex flex-col mb-6">
            <h2 className="text-xl font-bold text-white">Giocatori Registrati ({players.length})</h2>
            <div className="flex flex-wrap items-center gap-6 mt-4 mb-2">"""

new_header = """          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-bold text-white whitespace-nowrap">Giocatori Registrati ({players.length})</h2>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">"""

content = content.replace(old_header, new_header)

with open('src/app/players/page.tsx', 'w') as f:
    f.write(content)
