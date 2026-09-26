import re

with open('src/components/SlotMachineDraw.tsx', 'r') as f:
    content = f.read()

# Replace startCeremony logic
old_start = """    setTimeout(() => {
       triggerPhaseChange("lineup_intro_text");
       
       // Hold the text for 3 seconds, then move to player lineup
       setTimeout(() => {
         triggerPhaseChange("player_lineup");
       }, 3500); // 3.5 seconds total to allow for fade animations
    }, 10000);"""

new_start = """    setTimeout(() => {
       const isSunday = tournament?.name?.toLowerCase().includes("domenica");
       if (isSunday) {
         triggerPhaseChange("draw_intro_text");
       } else {
         triggerPhaseChange("lineup_intro_text");
         setTimeout(() => {
           triggerPhaseChange("player_lineup");
         }, 3500);
       }
    }, 10000);"""

content = content.replace(old_start, new_start)

# Replace attemptPlay logic
old_attempt = """            setTimeout(() => {
               triggerPhaseChange("lineup_intro_text");
               setTimeout(() => {
                 triggerPhaseChange("player_lineup");
               }, 3500);
            }, 10000);"""
            
new_attempt = """            setTimeout(() => {
               const isSunday = tournament?.name?.toLowerCase().includes("domenica");
               if (isSunday) {
                 triggerPhaseChange("draw_intro_text");
               } else {
                 triggerPhaseChange("lineup_intro_text");
                 setTimeout(() => {
                   triggerPhaseChange("player_lineup");
                 }, 3500);
               }
            }, 10000);"""

content = content.replace(old_attempt, new_attempt)

with open('src/components/SlotMachineDraw.tsx', 'w') as f:
    f.write(content)

print("Patched SlotMachineDraw!")
