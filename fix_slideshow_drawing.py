import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Update slide generation
old_slides = """  // Slides for In Progress (Bracket & Agenda)
  inProgressTournaments.forEach((t: any) => {
    slides.push({ type: "live_bracket", tournament: t });
    slides.push({ type: "bracket_tree", tournament: t, duration: 15000 });
    
    // Check if there are scheduled matches
    const hasScheduled = t.matches?.some((m: any) => m.scheduledAt && !m.winnerTeamId);
    if (hasScheduled) {
      slides.push({ type: "live_agenda", tournament: t });
    }
  });"""

new_slides = """  // Slides for In Progress (Bracket & Agenda)
  inProgressTournaments.forEach((t: any) => {
    if (t.status === "drawing") {
      slides.push({ type: "slot_machine", tournament: t, duration: 600000 }); // 10 minutes max, the component will manually skip to next
    } else {
      slides.push({ type: "live_bracket", tournament: t });
      slides.push({ type: "bracket_tree", tournament: t, duration: 15000 });
      
      // Check if there are scheduled matches
      const hasScheduled = t.matches?.some((m: any) => m.scheduledAt && !m.winnerTeamId);
      if (hasScheduled) {
        slides.push({ type: "live_agenda", tournament: t });
      }
    }
  });"""

content = content.replace(old_slides, new_slides)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
