import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

old_logic = """  inProgressTournaments.forEach((t: any) => {
    if (t.status === "drawing") {
      slides.push({ type: "slot_machine", tournament: t, duration: 1200000 }); // 20 minutes max, the component will manually skip to next
    } else {
      slides.push({ type: "bracket_tree", tournament: t, duration: 30000 });
      
    }
  });"""

new_logic = """  inProgressTournaments.forEach((t: any) => {
    if (t.status === "drawing") {
      slides.push({ type: "slot_machine", tournament: t, duration: 1200000 }); // 20 minutes max, the component will manually skip to next
    } else if (t.status === "matches_drawing") {
      slides.push({ type: "matches_draw", tournament: t, duration: 1200000 }); // Max 20 min, component will auto-skip
    } else {
      slides.push({ type: "bracket_tree", tournament: t, duration: 30000 });
    }
  });"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    print("Patched slides array!")
else:
    print("Could not find slides array logic!")

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)
