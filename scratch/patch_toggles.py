import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

# I will replace the div content of the toggles card.
# The card wrapper is:
#           <div className="flex flex-col justify-center flex-1">
#             <div className={clsx("bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-center items-center h-full gap-6 shadow-inner transition-all duration-300"

old_wrapper_start = '<div className="flex flex-col justify-center flex-1">'
new_wrapper_start = '<div className="flex flex-col justify-center">'
content = content.replace(old_wrapper_start, new_wrapper_start)

# Now I'll replace the inner div classes and the `max-w-[250px]` container.
# Currently:
#             <div className={clsx("bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-center items-center h-full gap-6 shadow-inner transition-all duration-300", type === "coppie_fisse" ? "opacity-0 pointer-events-none" : "opacity-100")}>
#               {type !== "coppie_fisse" && (
#                 <div className="w-full max-w-[250px] flex flex-col items-center">

# I want to change it to:
#             <div className={clsx("bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-center h-full gap-6 shadow-inner transition-all duration-300", type === "coppie_fisse" ? "opacity-0 pointer-events-none" : "opacity-100")}>
#               {type !== "coppie_fisse" && (
#                 <div className="w-full flex flex-col items-start gap-4">

content = content.replace(
    'p-6 flex flex-col justify-center items-center h-full gap-6',
    'p-6 flex flex-col justify-center h-full gap-6'
)

content = content.replace(
    '<div className="w-full max-w-[250px] flex flex-col items-center">',
    '<div className="w-full flex flex-col items-start">'
)

# Fix Torneo Equilibrato
content = content.replace(
    '<div className="flex items-center justify-between w-full">',
    '<div className="flex items-center justify-start gap-4 w-full cursor-pointer">'
)
content = content.replace(
    '<div className="flex flex-col items-end pl-4">',
    '<div className="flex flex-col items-start">'
)
content = content.replace(
    'text-sm font-bold tracking-wider text-emerald-400 block text-right',
    'text-sm font-bold tracking-wider text-emerald-400 block text-left'
)
content = content.replace(
    'text-[10px] text-slate-400 text-right leading-tight mt-0.5',
    'text-[10px] text-slate-400 text-left leading-tight mt-0.5'
)

# Fix Evita coppie ripetute
content = content.replace(
    '<div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50">',
    '<div className="flex items-center justify-start gap-4 w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer">'
)
content = content.replace(
    'text-sm font-bold tracking-wider text-amber-400 block text-right',
    'text-sm font-bold tracking-wider text-amber-400 block text-left'
)

# Fix Inversione Ruoli
content = content.replace(
    '<div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 opacity-50 grayscale cursor-not-allowed">',
    '<div className="flex items-center justify-start gap-4 w-full mt-4 pt-4 border-t border-slate-700/50 opacity-50 grayscale cursor-not-allowed">'
)
content = content.replace(
    'text-sm font-bold tracking-wider text-slate-400 block text-right',
    'text-sm font-bold tracking-wider text-slate-400 block text-left'
)
content = content.replace(
    'text-[10px] text-slate-500 text-right leading-tight mt-0.5',
    'text-[10px] text-slate-500 text-left leading-tight mt-0.5'
)


with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)
