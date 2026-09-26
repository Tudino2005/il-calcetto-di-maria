import re

with open('src/components/SlotMachineDraw.tsx', 'r') as f:
    content = f.read()

old_countdown_end = """      if (countdownValue > 0) {
        const timer = setTimeout(() => setCountdownValue(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        triggerPhaseChange("slot_machine");
      }"""

new_countdown_end = """      if (countdownValue > 0) {
        const timer = setTimeout(() => setCountdownValue(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        if (tournament.type === "coppie_fisse") {
          setRevealedIndex(teams.length);
        }
        triggerPhaseChange("slot_machine");
      }"""

content = content.replace(old_countdown_end, new_countdown_end)

with open('src/components/SlotMachineDraw.tsx', 'w') as f:
    f.write(content)

print("Patched skip slot machine!")
