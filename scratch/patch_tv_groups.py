import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace bracket_tree with group_stage for gironi_eliminazione
old_in_progress_logic = """    } else {
      slides.push({ type: "bracket_tree", tournament: t, duration: 30000 });
    }"""
    
new_in_progress_logic = """    } else {
      if (t.format === "gironi_eliminazione") {
        slides.push({ type: "group_stage", tournament: t, duration: 30000 });
      } else {
        slides.push({ type: "bracket_tree", tournament: t, duration: 30000 });
      }
    }"""
    
content = content.replace(old_in_progress_logic, new_in_progress_logic)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched slide generation!")
