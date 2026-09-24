import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace podium offsets
old_offsets = """                      const podiumOffsets = [
                        { x: '0px', y: '-80px', scale: 1.35, color: 'rgba(234,179,8,0.8)', shadow: '0 0 60px rgba(234,179,8,0.4)' },
                        { x: '-460px', y: '40px', scale: 1.25, color: 'rgba(203,213,225,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                        { x: '460px', y: '60px', scale: 1.25, color: 'rgba(249,115,22,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                      ];"""

new_offsets = """                      const podiumOffsets = [
                        { x: '0px', y: '0px', scale: 1.35, color: 'rgba(234,179,8,0.8)', shadow: '0 0 60px rgba(234,179,8,0.4)' },
                        { x: '-460px', y: '100px', scale: 1.25, color: 'rgba(203,213,225,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                        { x: '460px', y: '160px', scale: 1.25, color: 'rgba(249,115,22,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                      ];"""

content = content.replace(old_offsets, new_offsets)

# Replace transforms and add transformOrigin
old_logic = """                      if (stage < mySpotlightStage) {
                        styles = {
                          opacity: 0,
                          transform: `translate(calc(-50% + ${pos.x}), calc(-50% + ${pos.y})) scale(0.5)`,
                          zIndex: 0,
                        };
                      } else {
                        // Apare directly in the podium spot
                        styles = {
                          opacity: 1,
                          transform: `translate(calc(-50% + ${pos.x}), calc(-50% + ${pos.y})) scale(${pos.scale})`,
                          zIndex: cardIdx === 0 ? 30 : (cardIdx === 1 ? 20 : 10),
                          borderColor: pos.color,
                          boxShadow: stage === mySpotlightStage ? '0 0 80px rgba(255,255,255,0.5)' : pos.shadow // Flash when it appears
                        };
                      }"""

new_logic = """                      if (stage < mySpotlightStage) {
                        styles = {
                          opacity: 0,
                          transform: `translate(calc(-50% + ${pos.x}), ${pos.y}) scale(0.5)`,
                          transformOrigin: 'top center',
                          zIndex: 0,
                        };
                      } else {
                        // Apare directly in the podium spot
                        styles = {
                          opacity: 1,
                          transform: `translate(calc(-50% + ${pos.x}), ${pos.y}) scale(${pos.scale})`,
                          transformOrigin: 'top center',
                          zIndex: cardIdx === 0 ? 30 : (cardIdx === 1 ? 20 : 10),
                          borderColor: pos.color,
                          boxShadow: stage === mySpotlightStage ? '0 0 80px rgba(255,255,255,0.5)' : pos.shadow // Flash when it appears
                        };
                      }"""

content = content.replace(old_logic, new_logic)

# Replace top-1/2 with top-[15vh]
# It looks like: className="absolute left-1/2 top-1/2 bg-slate-900 border-4 p-4 rounded-3xl flex flex-col gap-3 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-[380px]"
old_class = 'className="absolute left-1/2 top-1/2 bg-slate-900 border-4 p-4 rounded-3xl flex flex-col gap-3 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-[380px]"'
new_class = 'className="absolute left-1/2 top-[12vh] bg-slate-900 border-4 p-4 rounded-3xl flex flex-col gap-3 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-[380px]"'

content = content.replace(old_class, new_class)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched podium alignment")
