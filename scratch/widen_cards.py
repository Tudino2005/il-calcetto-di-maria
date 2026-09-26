import re

with open('src/app/players/[id]/page.tsx', 'r') as f:
    content = f.read()

# Replace the flex row header with a flex col header so the grid can take 100% width
old_header = '<div className="bg-slate-800 rounded-3xl p-6 lg:p-8 mb-8 border border-slate-700 shadow-xl flex flex-col xl:flex-row gap-8 xl:items-start justify-between">'
new_header = '<div className="bg-slate-800 rounded-3xl p-6 lg:p-8 mb-8 border border-slate-700 shadow-xl flex flex-col gap-8">'

content = content.replace(old_header, new_header)

old_grid_container = '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full xl:w-2/3">'
new_grid_container = '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">'

content = content.replace(old_grid_container, new_grid_container)

with open('src/app/players/[id]/page.tsx', 'w') as f:
    f.write(content)

print("Widened cards!")
