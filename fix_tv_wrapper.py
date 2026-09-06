import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Let's see if we can do: if currentSlide.type === "slot_machine" return the slot machine immediately, bypassing everything else for this slide.
# In TVSlideshow.tsx, inside the return statement:
# return (
#    <div className="w-full h-screen bg-slate-950 text-white overflow-hidden relative flex flex-col">
#       {currentSlide.type === "slot_machine" ? (
#          <SlotMachineDraw tournament={currentSlide.tournament} />
#       ) : (
#          <> ... existing header and content ... </>
#       )}
#    </div>
# )

# Alternatively, I can just make SlotMachineDraw fixed. Let's do that! It's much simpler.

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    slot = f.read()

# Change the outermost div in SlotMachineDraw
old_div = '    <div className="flex flex-col items-center justify-center w-full h-full text-center p-8 bg-gradient-to-b from-slate-950 to-indigo-950 overflow-hidden relative">'
new_div = '    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center w-full h-full text-center p-8 bg-gradient-to-b from-slate-950 to-indigo-950 overflow-hidden">'
slot = slot.replace(old_div, new_div)

# Change the history list layout so it doesn't overlap
old_history = '      <div className="absolute bottom-0 w-full h-48 bg-slate-950/80 border-t border-slate-800 backdrop-blur-md p-6 flex flex-col items-center z-20">'
new_history = '      <div className="absolute bottom-0 w-full bg-slate-950/80 border-t border-slate-800 backdrop-blur-md p-6 flex flex-col items-center z-20 max-h-48 overflow-y-auto">'
slot = slot.replace(old_history, new_history)

# Also fix the top padding so it doesn't look bad
old_mt = '        <div className="flex flex-col items-center mt-32 z-20 w-full max-w-5xl">'
new_mt = '        <div className="flex flex-col items-center mt-12 z-20 w-full max-w-5xl">'
slot = slot.replace(old_mt, new_mt)

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(slot)
