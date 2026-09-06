import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# I need to find where slot_machine is currently rendered in TVSlideshow.tsx
# It's currently inside the massive wrapper:
#           {/* SLOT MACHINE DRAW SLIDE */}
#           {currentSlide.type === "slot_machine" && (
#              <SlotMachineDraw tournament={currentSlide.tournament} />
#           )}

# Let's remove it from there.
old_slot_render = """          {/* SLOT MACHINE DRAW SLIDE */}
          {currentSlide.type === "slot_machine" && (
             <SlotMachineDraw tournament={currentSlide.tournament} />
          )}"""

content = content.replace(old_slot_render, "")

# Now I need to inject it at the very top of the render tree, right after:
#   if (slides.length === 0) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white text-3xl">Nessun dato disponibile</div>;
# 
#   const currentSlide = slides[currentIndex];
#
#   if (currentSlide.type === "slot_machine") {
#       return <SlotMachineDraw tournament={currentSlide.tournament} />;
#   }

injection_point = "  const currentSlide = slides[currentIndex];"
injection_code = """  const currentSlide = slides[currentIndex];

  if (currentSlide?.type === "slot_machine") {
      return (
        <div className="w-full h-screen bg-slate-950 text-white">
          <SlotMachineDraw tournament={currentSlide.tournament} />
        </div>
      );
  }"""

content = content.replace(injection_point, injection_code)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)

# And restore SlotMachineDraw to use normal width/height instead of fixed inset-0
with open("src/components/SlotMachineDraw.tsx", "r") as f:
    slot = f.read()

old_div = '    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center w-full h-full text-center p-8 bg-gradient-to-b from-slate-950 to-indigo-950 overflow-hidden">'
new_div = '    <div className="flex flex-col items-center justify-center w-full h-full text-center p-8 bg-gradient-to-b from-slate-950 to-indigo-950 overflow-hidden relative">'
slot = slot.replace(old_div, new_div)

# Also let's increase the height of the slots so they don't look cramped
old_slot_h = 'bg-slate-900 border-4 rounded-[3rem] h-64'
new_slot_h = 'bg-slate-900 border-4 rounded-[3rem] h-80' # bigger cards
slot = slot.replace(old_slot_h, new_slot_h)

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(slot)
