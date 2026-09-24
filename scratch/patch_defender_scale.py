import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace the defender image classes to use standard height/width but apply scale-[2]
content = content.replace(
    'className="h-[84px] w-[144px] object-contain drop-shadow-md"',
    'className="h-7 w-12 object-contain drop-shadow-md scale-[2]"'
)
content = content.replace(
    'className="h-[96px] w-[168px] object-contain drop-shadow-md"',
    'className="h-8 w-14 object-contain drop-shadow-md scale-[2.5]"'
)

# And let's make striker scale too, just in case, because they both likely have padding
# Actually, the user specifically asked for defender. I'll leave striker alone.

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched defender scale")
