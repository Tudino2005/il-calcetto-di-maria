import re

with open('src/app/players/[id]/page.tsx', 'r') as f:
    content = f.read()

# Change the container from a flex-nowrap to a 2x2 grid.
old_container = '<div className="flex flex-wrap lg:flex-nowrap gap-4 w-full xl:w-auto">'
new_container = '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full xl:w-2/3">'
content = content.replace(old_container, new_container)

# Remove `flex-1 min-w-[140px]` from the 4 cards since we are using CSS Grid now
content = content.replace('flex-1 min-w-[140px]', 'w-full')

# Maybe the main header container should be `items-start` instead of `items-center` since it's a 2x2 grid now
content = content.replace('xl:items-center justify-between', 'xl:items-start justify-between')

with open('src/app/players/[id]/page.tsx', 'w') as f:
    f.write(content)

print("Patched!")
