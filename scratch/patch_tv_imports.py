import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = 'import SlotMachineDraw from "./SlotMachineDraw";'
if import_stmt in content:
    content = content.replace(import_stmt, import_stmt + '\nimport MatchesDrawCeremony from "./MatchesDrawCeremony";')

# Add render block
slot_machine_render = """  if (currentSlide?.type === "slot_machine") {
      return (
        <div className="w-full h-screen bg-slate-950 text-white">
          <SlotMachineDraw tournament={currentSlide.tournament} advancedPlayerStats={data.advancedPlayerStats} />
        </div>
      );
  }"""

matches_draw_render = """  if (currentSlide?.type === "matches_draw") {
      return (
        <div className="w-full h-screen bg-slate-950 text-white">
          <MatchesDrawCeremony tournament={currentSlide.tournament} />
        </div>
      );
  }"""

if slot_machine_render in content:
    content = content.replace(slot_machine_render, slot_machine_render + '\n\n' + matches_draw_render)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched TVSlideshow imports and render!")
