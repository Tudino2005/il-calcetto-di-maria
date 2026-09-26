import re

with open('src/app/players/[id]/page.tsx', 'r') as f:
    content = f.read()

# Change back to xl:flex-row so it is side by side with the player name?
# Or just keep it flex-col and use grid-cols-4?
# "devono stare su una riga sola" -> grid-cols-4
old_grid = '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">'
new_grid = '<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">'

content = content.replace(old_grid, new_grid)

# Also let's put the player name and the grid back on the same line if possible, or leave it flex-col.
# Let's see what happens if I restore the xl:flex-row
old_header = '<div className="bg-slate-800 rounded-3xl p-6 lg:p-8 mb-8 border border-slate-700 shadow-xl flex flex-col gap-8">'
new_header = '<div className="bg-slate-800 rounded-3xl p-6 lg:p-8 mb-8 border border-slate-700 shadow-xl flex flex-col xl:flex-row gap-8 xl:items-center justify-between">'

content = content.replace(old_header, new_header)

with open('src/app/players/[id]/page.tsx', 'w') as f:
    f.write(content)

print("Shrunk cards!")
