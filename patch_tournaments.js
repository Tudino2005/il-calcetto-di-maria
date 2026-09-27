const fs = require('fs');
let code = fs.readFileSync('src/app/tournaments/page.tsx', 'utf8');

code = code.replace(
  /import \{ ArrowLeft, Plus \} from "lucide-react";/,
  'import { ArrowLeft, Plus, Archive } from "lucide-react";'
);

const target = `<h2 className="text-2xl font-bold text-white mb-6">Tornei Recenti</h2>
          <div className="flex flex-col gap-4 w-full md:w-1/2">
            {tournaments.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Nessun torneo creato.</p>
            ) : (
              tournaments.map((t) => (`

const replacement = `<div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Tornei in Corso</h2>
            <Link href="/tournaments/history" className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-sm font-bold text-slate-300 transition-colors shadow-lg">
              <Archive className="w-4 h-4" /> Archivio
            </Link>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-1/2">
            {tournaments.filter(t => t.status !== 'completed').length === 0 ? (
              <p className="text-slate-400 text-center py-8">Nessun torneo in corso.</p>
            ) : (
              tournaments.filter(t => t.status !== 'completed').map((t) => (`

code = code.replace(target, replacement);

fs.writeFileSync('src/app/tournaments/page.tsx', code);
