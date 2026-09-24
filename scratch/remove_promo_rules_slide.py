import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# 1. Remove from slides array
content = content.replace('    slides.push({ type: "promo_rules", tournament: t, duration: 20000 });\n', '')

# 2. Remove JSX block
old_jsx_block = """          {/* PROMO RULES SLIDE (Codice d'Onore) */}
          {currentSlide.type === "promo_rules" && (
            <div className="flex w-full h-full flex-col justify-center items-center px-16">
              <TournamentRulebook tournament={currentSlide.tournament} />
            </div>
          )}"""

content = content.replace(old_jsx_block, '')

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Removed promo_rules slide")
