import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace w-40 h-40 shrink-0 aspect-square with w-28 h-28 min-w-[112px] min-h-[112px] shrink-0 aspect-square
# 112px should easily fit in the flex container without triggering the global max-width constraint
content = content.replace('w-40 h-40 shrink-0 aspect-square', 'w-32 h-32 min-w-[128px] min-h-[128px] shrink-0 aspect-square')

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched avatar sizes")
