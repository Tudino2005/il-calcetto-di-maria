import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Replace the div for the left time
content = content.replace(
    '<div className="w-1/3 text-right shrink-0">',
    '<div className="w-1/3 text-right shrink-0 pr-10">'
)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
