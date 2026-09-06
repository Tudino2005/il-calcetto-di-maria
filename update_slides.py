import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# 1. Update duration for live_bracket
old_push = 'slides.push({ type: "live_bracket", tournament: t });'
new_push = 'slides.push({ type: "live_bracket", tournament: t, duration: 120000 });'
content = content.replace(old_push, new_push)

# 2. Update duration for bracket_tree (just in case they meant both, but I'll do live_bracket first. Let's do both to 2 mins)
old_push_tree = 'slides.push({ type: "bracket_tree", tournament: t, duration: 15000 });'
new_push_tree = 'slides.push({ type: "bracket_tree", tournament: t, duration: 120000 });'
content = content.replace(old_push_tree, new_push_tree)

# 3. Fallback to tournament.startDate if scheduledAt is null
# We need to find the JSX block rendering the date.

# The existing block:
# {m.scheduledAt ? (
#   <div className="text-xs font-black text-blue-400 bg-blue-500/20 px-3 py-1 rounded-lg">
#     {new Date(m.scheduledAt).toLocaleDateString('it-IT')} alle {new Date(m.scheduledAt).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}
#   </div>
# ) : null}

# We replace it with:
# {(() => {
#   const displayDate = m.scheduledAt || currentSlide.tournament.startDate;
#   if (!displayDate) return <div className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-lg">Data da definire</div>;
#   const isTimeSet = !!m.scheduledAt; // If fallback, time might just be midnight
#   return (
#     <div className="text-xs font-black text-blue-400 bg-blue-500/20 px-3 py-1 rounded-lg mt-2">
#       {new Date(displayDate).toLocaleDateString('it-IT')} {isTimeSet ? `alle ${new Date(displayDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : ''}
#     </div>
#   )
# })()}

# Let's just use regex or exact replace

old_date_render = """                          {m.scheduledAt ? (
                            <div className="text-xs font-black text-blue-400 bg-blue-500/20 px-3 py-1 rounded-lg">
                              {new Date(m.scheduledAt).toLocaleDateString('it-IT')} alle {new Date(m.scheduledAt).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          ) : null}"""

# Wait, what if old_date_render is not exactly formatted like this? Let's check exactly how it's formatted.
