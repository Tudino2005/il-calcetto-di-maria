import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Replace the block for scheduledAt in live_bracket
# We want to fallback to tournament.startDate if scheduledAt is missing.

old_block = r'''                          \{m\.scheduledAt \? \(
                            <div className="text-xs font-black text-blue-400 bg-blue-500/20 px-3 py-1 rounded-lg">
                              \{new Date\(m\.scheduledAt\)\.toLocaleDateString\('it-IT'\)\} alle \{new Date\(m\.scheduledAt\)\.toLocaleTimeString\('it-IT', \{hour: '2-digit', minute:'2-digit'\}\)\}
                            </div>
                          \) : (.*?)\}'''

def replacer(match):
    return """                          {(() => {
                            const dateToUse = m.scheduledAt || currentSlide.tournament.startDate;
                            if (!dateToUse) return <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Data da definire</div>;
                            return (
                              <div className="text-xs font-black text-blue-400 bg-blue-500/20 px-3 py-1 rounded-lg mt-1">
                                {new Date(dateToUse).toLocaleDateString('it-IT')} {m.scheduledAt ? `alle ${new Date(dateToUse).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : ''}
                              </div>
                            );
                          })()}"""

content = re.sub(old_block, replacer, content, flags=re.DOTALL)

# Do the same for the bracket_tree slide:
# {m.scheduledAt ? `${new Date(m.scheduledAt).toLocaleDateString('it-IT')} - ${new Date(m.scheduledAt).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : 'Da programmare'}

old_tree_block = r"\{m\.scheduledAt \? `\$\{new Date\(m\.scheduledAt\)\.toLocaleDateString\('it-IT'\)\} - \$\{new Date\(m\.scheduledAt\)\.toLocaleTimeString\('it-IT', \{hour: '2-digit', minute:'2-digit'\}\)\}` : 'Da programmare'\}"
new_tree_block = "{m.scheduledAt ? `${new Date(m.scheduledAt).toLocaleDateString('it-IT')} - ${new Date(m.scheduledAt).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : (currentSlide.tournament.startDate ? new Date(currentSlide.tournament.startDate).toLocaleDateString('it-IT') : 'Da programmare')}"
content = re.sub(old_tree_block, new_tree_block, content)


# 1. Update duration for live_bracket
old_push = 'slides.push({ type: "live_bracket", tournament: t });'
new_push = 'slides.push({ type: "live_bracket", tournament: t, duration: 120000 });'
content = content.replace(old_push, new_push)

# 2. Update duration for bracket_tree
old_push_tree = 'slides.push({ type: "bracket_tree", tournament: t, duration: 15000 });'
new_push_tree = 'slides.push({ type: "bracket_tree", tournament: t, duration: 120000 });'
content = content.replace(old_push_tree, new_push_tree)


with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)

