import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Replace specific durations
content = content.replace('slides.push({ type: "recent_matches", duration: 12000 });', 'slides.push({ type: "recent_matches", duration: 30000 });')
content = content.replace('slides.push({ type: "promo", tournament: t, duration: 60000 });', 'slides.push({ type: "promo", tournament: t, duration: 30000 });')
content = content.replace('slides.push({ type: "bracket_grid", tournament: t, duration: 120000 });', 'slides.push({ type: "bracket_grid", tournament: t, duration: 30000 });')
content = content.replace('slides.push({ type: "live_bracket", tournament: t, duration: 120000 });', 'slides.push({ type: "live_bracket", tournament: t, duration: 30000 });')
content = content.replace('slides.push({ type: "bracket_tree", tournament: t, duration: 120000 });', 'slides.push({ type: "bracket_tree", tournament: t, duration: 30000 });')

content = content.replace('slides.push({ type: "live_agenda", tournament: t });', 'slides.push({ type: "live_agenda", tournament: t, duration: 30000 });')
content = content.replace('slides.push({ type: "hall_of_fame" });', 'slides.push({ type: "hall_of_fame", duration: 30000 });')

# Update default duration in useEffect
content = content.replace('const currentDuration = slides[currentIndex]?.duration || 12000;', 'const currentDuration = slides[currentIndex]?.duration || 30000;')

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
