import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

old_logic = """                      if (stage < mySpotlightStage) {
                        styles = {
                          opacity: 0,
                          transform: 'translate(-50%, 50%) scale(0.5)',
                          zIndex: 0,
                        };
                      } else if (stage === mySpotlightStage) {
                        styles = {
                          opacity: 1,
                          transform: 'translate(-50%, -50%) scale(1.4)',
                          zIndex: 50,
                          borderColor: 'rgba(99,102,241,0.9)',
                          boxShadow: '0 0 80px rgba(99,102,241,0.6)'
                        };
                      } else {
                        const podiumOffsets = [
                          { x: '0px', y: '-80px', scale: 1.35, color: 'rgba(234,179,8,0.8)', shadow: '0 0 60px rgba(234,179,8,0.4)' },
                          { x: '-460px', y: '40px', scale: 1.25, color: 'rgba(203,213,225,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                          { x: '460px', y: '60px', scale: 1.25, color: 'rgba(249,115,22,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                        ];
                        const pos = podiumOffsets[cardIdx];
                        styles = {
                          opacity: 1,
                          transform: `translate(calc(-50% + ${pos.x}), calc(-50% + ${pos.y})) scale(${pos.scale})`,
                          zIndex: cardIdx === 0 ? 30 : (cardIdx === 1 ? 20 : 10),
                          borderColor: pos.color,
                          boxShadow: pos.shadow
                        };
                      }"""

new_logic = """                      const podiumOffsets = [
                        { x: '0px', y: '-80px', scale: 1.35, color: 'rgba(234,179,8,0.8)', shadow: '0 0 60px rgba(234,179,8,0.4)' },
                        { x: '-460px', y: '40px', scale: 1.25, color: 'rgba(203,213,225,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                        { x: '460px', y: '60px', scale: 1.25, color: 'rgba(249,115,22,0.8)', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
                      ];
                      const pos = podiumOffsets[cardIdx];

                      if (stage < mySpotlightStage) {
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

content = content.replace(old_logic, new_logic)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched to remove center popup")
