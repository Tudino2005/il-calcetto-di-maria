import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Calendar, Banknote, Trophy, Users, Swords, Info } from "lucide-react";

export default async function PromoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      registrations: {
        include: { player: true }
      }
    }
  });

  if (!tournament) {
    notFound();
  }

  const getFormatDescription = () => {
    switch (tournament.format) {
      case "eliminazione_diretta":
        return "Eliminazione Diretta. Chi perde è fuori, chi vince avanza fino alla finale.";
      case "doppia_eliminazione":
        return "Doppia Eliminazione. Chi perde finisce nel tabellone dei perdenti per una seconda chance.";
      case "gironi_eliminazione":
        return "Gironi + Playoff. Fase a round-robin seguita dall'eliminazione diretta.";
      default:
        return "";
    }
  };

  const getTypeDescription = () => {
    switch (tournament.type) {
      case "sorteggio_ruoli":
        return "Sorteggio per Ruoli. Le coppie saranno estratte bilanciando un attaccante e un portiere.";
      case "sorteggio_integrale":
        return "Sorteggio Integrale. Composizione puramente casuale senza limiti di ruolo.";
      case "coppie_fisse":
        return "Coppie Fisse. Iscrizione a squadre già formate.";
      default:
        return "";
    }
  };

  const registeredPlayers = tournament.registrations.map((r: any) => r.player);

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
      {/* Background Graphic */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-slate-950 to-slate-950" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-12">
        
        {/* HERO SECTION */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-full mb-4 ring-1 ring-purple-500/30">
            <Swords className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">
            {tournament.name}
          </h1>
          
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            {tournament.startDate && (
              <div className="flex items-center gap-3 px-6 py-3 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <Calendar className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold">{new Date(tournament.startDate).toLocaleString('it-IT', { dateStyle: 'long', timeStyle: 'short' })}</span>
              </div>
            )}
            {tournament.pricePerPlayer != null && (
              <div className="flex items-center gap-3 px-6 py-3 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <Banknote className="w-6 h-6 text-emerald-400" />
                <span className="text-lg font-bold">{tournament.pricePerPlayer} € <span className="text-slate-400 font-normal">/ giocatore</span></span>
              </div>
            )}
          </div>
          
          {tournament.prizes && (
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-500 mt-4 backdrop-blur-sm">
              <Trophy className="w-8 h-8" />
              <span className="text-xl font-bold uppercase tracking-wider">{tournament.prizes}</span>
            </div>
          )}
        </header>

        {/* REGOLE E FORMATO */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-sm">
            <h3 className="text-purple-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" /> Formato Torneo
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed">{getFormatDescription()}</p>
          </div>
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-sm">
            <h3 className="text-blue-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Composizione Squadre
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed">{getTypeDescription()}</p>
          </div>
        </section>

        {/* HYPE & ROSTER */}
        <section className="bg-slate-900/80 rounded-3xl border border-slate-800 p-8 backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-black uppercase tracking-widest flex items-center gap-3">
              Iscritti Ufficiali
            </h2>
            <div className="bg-slate-950 px-6 py-2 rounded-full border border-slate-800 shadow-inner text-xl font-bold">
              <span className="text-emerald-400">{registeredPlayers.length}</span> Partecipanti
            </div>
          </div>

          {registeredPlayers.length === 0 ? (
            <div className="text-center p-12 bg-slate-950/50 rounded-2xl border border-slate-800/50">
              <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">Nessuno si è ancora iscritto. Sii il primo!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {registeredPlayers.map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-black text-slate-300 border border-slate-700 shadow-inner">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-white">{p.name}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{p.preferredRole}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
