import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

start_str = "{/* LIVE AGENDA SLIDE */}"
end_str = "{/* HALL OF FAME SLIDE */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]
    with open('src/components/TVSlideshow.tsx', 'w') as f:
        f.write(content)
    print("Removed live_agenda block")
else:
    print("Not found")

