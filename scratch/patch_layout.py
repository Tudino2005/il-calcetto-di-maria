import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

# Fix Row 1 column spans
old_row1 = """        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-2">
          <div className="md:col-span-5 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Orario Primo Fischio</span>
            <input
              type="time"
              value={scheduleStartTime}
              onChange={(e) => setScheduleStartTime(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
            />
          </div>
          <div className="md:col-span-4 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Max Partite al Giorno</span>
            <input
              type="number"
              min="1"
              max="50"
              value={maxMatchesPerDay}
              onChange={(e) => setMaxMatchesPerDay(Math.max(1, Number(e.target.value)))}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
            />
          </div>
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Biliardini Disponibili</span>"""

new_row1 = """        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-2">
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Orario Primo Fischio</span>
            <input
              type="time"
              value={scheduleStartTime}
              onChange={(e) => setScheduleStartTime(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
            />
          </div>
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Max Partite al Giorno</span>
            <input
              type="number"
              min="1"
              max="50"
              value={maxMatchesPerDay}
              onChange={(e) => setMaxMatchesPerDay(Math.max(1, Number(e.target.value)))}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
            />
          </div>
          <div className="md:col-span-4 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Biliardini Disponibili</span>"""

content = content.replace(old_row1, new_row1)

# Fix Row 2 label position
old_row2 = """        {/* ROW 2 - Giorni di gioco */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
          <div className="md:col-span-12 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Giorni di Gioco Settimanali</span>
            <div className="flex flex-wrap gap-4 items-center">"""

new_row2 = """        {/* ROW 2 - Giorni di gioco */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
          <div className="md:col-span-12 flex flex-col group">
            <span className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Giorni di Gioco Settimanali</span>
            <div className="flex flex-wrap gap-4 items-center">"""

content = content.replace(old_row2, new_row2)

with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)
