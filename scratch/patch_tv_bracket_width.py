import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Fix container width
old_container = "w-[500px]"
new_container = "w-[800px]"
# Only in BracketSpotlightManager
# The easiest way is string replace
start_idx = content.find("function BracketSpotlightManager")
end_idx = content.find("export default function TVSlideshow")

manager_block = content[start_idx:end_idx]

# Replace w-[500px] with w-[800px]
manager_block = manager_block.replace("w-[500px]", "w-full max-w-[900px]")

# Remove truncate from Team names and Player names
manager_block = manager_block.replace("truncate mb-1", "mb-1")
manager_block = manager_block.replace("truncate leading-tight", "leading-tight")

content = content[:start_idx] + manager_block + content[end_idx:]

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched width and text wrapping")
