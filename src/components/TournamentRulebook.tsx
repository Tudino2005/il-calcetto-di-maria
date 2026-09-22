import React from 'react';
import { Swords, Goal, Users, ShieldAlert, AlertTriangle, CalendarDays } from 'lucide-react';
import clsx from 'clsx';

export default function TournamentRulebook({ tournament }: { tournament: any }) {
  if (!tournament) return null;

  // 1. Logica Dinamica: Formato
  let formatDesc = "";
  if (tournament.format === "eliminazione_diretta") {
    formatDesc = "Tabellone a eliminazione diretta (Dentro o Fuori). Chi perde il match è definitivamente fuori dai giochi.";
  } else if (tournament.format === "doppia_eliminazione") {
    formatDesc = "Tabellone a Doppia Eliminazione (Winners & Losers Bracket). Si viene eliminati dal torneo solo dopo due sconfitte.";
  } else if (tournament.format === "gironi_eliminazione" || tournament.format === "gironi") {
    formatDesc = "Fase a gruppi iniziale in stile Mondiali. Le migliori squadre passano ai Playoff a eliminazione diretta.";
  } else {
    formatDesc = "Formato personalizzato o in via di definizione.";
  }

  // 2. Logica Dinamica: Punteggio e Vantaggi
  const targetGoals = tournament.targetGoals || 7;
  const advantageThreshold = tournament.advantageThreshold || 5;
  const scoringDesc = `Ogni set viene vinto dalla prima squadra che raggiunge i ${targetGoals} Gol. Se si arriva sul punteggio di ${advantageThreshold}-${advantageThreshold}, si attivano i Vantaggi: per vincere servirà uno scarto di almeno 2 gol (es. ${advantageThreshold+2}-${advantageThreshold}, ${advantageThreshold+3}-${advantageThreshold+1}).`;

  // 3. Logica Dinamica: Ruoli e Composizione
  let rolesDesc = "";
  if (tournament.type === "sorteggio_ruoli") {
    rolesDesc += "Squadre bilanciate: ogni team è composto da un Attaccante e un Difensore estratti a sorte. ";
  } else if (tournament.type === "sorteggio_integrale") {
    rolesDesc += "Caos totale: estrazione puramente casuale senza tenere conto dei ruoli preferiti. ";
  } else {
    rolesDesc += "Coppie Fisse: le squadre si iscrivono già formate. ";
  }
  
  if (tournament.type !== "coppie_fisse") {
    rolesDesc += tournament.allowRoleSwaps 
      ? "\n🔄 FLESSIBILITÀ: È consentito scambiarsi i ruoli (attacco/difesa) durante la partita." 
      : "\n⛔ RUOLI FISSI: È severamente vietato scambiarsi di posizione durante i match.";
  }

  // Formatting Date
  const drawDateObj = tournament.drawDate ? new Date(tournament.drawDate) : null;
  const drawDateStr = drawDateObj ? drawDateObj.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'TBA';

  // Array delle Card da renderizzare
  const ruleCards = [
    {
      id: 'format',
      title: "L'Arena (Formato)",
      icon: <Swords className="w-6 h-6 text-purple-400" />,
      glowColor: "hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] border-purple-500/30",
      textColor: "text-purple-400",
      description: formatDesc
    },
    {
      id: 'scoring',
      title: "Condizioni di Vittoria",
      icon: <Goal className="w-6 h-6 text-emerald-400" />,
      glowColor: "hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] border-emerald-500/30",
      textColor: "text-emerald-400",
      description: scoringDesc
    },
    {
      id: 'roles',
      title: "Regole d'Ingaggio",
      icon: <Users className="w-6 h-6 text-blue-400" />,
      glowColor: "hover:shadow-[0_0_20px_rgba(96,165,250,0.4)] border-blue-500/30",
      textColor: "text-blue-400",
      description: rolesDesc
    },
    {
      id: 'logistics',
      title: "Logistica",
      icon: <CalendarDays className="w-6 h-6 text-slate-300" />,
      glowColor: "hover:shadow-[0_0_20px_rgba(203,213,225,0.4)] border-slate-600/50",
      textColor: "text-slate-300",
      description: `Data Sorteggio: ${drawDateStr} \nCosto: ${tournament.pricePerPlayer ? tournament.pricePerPlayer + '€' : 'Gratis'} a persona \nMassimo: ${tournament.maxTeams} squadre ammesse nell'Arena.`
    },
    {
      id: 'no-spin',
      title: "Codice d'Onore: Zero Rullate",
      icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
      glowColor: "hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] border-red-500/50 bg-red-950/10",
      textColor: "text-red-500",
      description: "La rotazione della stecca di 360 gradi, sia prima che dopo aver colpito la pallina, costituisce fallo. Questa regola traccia il confine invalicabile tra torneo e gioco casuale. Se la pallina entra in rete in seguito a una rullata, il gol è nullo."
    },
    {
      id: 'no-hook',
      title: "Codice d'Onore: Divieto di Gancio",
      icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
      glowColor: "hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] border-orange-500/50 bg-orange-950/10",
      textColor: "text-orange-500",
      description: "È vietato fermare o controllare la pallina per poi tirare con lo stesso omino. Vietato anche il 'passetto' (passare palla a un omino sulla stessa stecca prima del tiro). Il gioco deve svilupparsi di prima intenzione o tramite sponda."
    }
  ];

  return (
    <div className="w-full mt-12 mb-8">
      <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-purple-500" />
        Regolamento Ufficiale
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ruleCards.map((card) => (
          <div 
            key={card.id} 
            className={clsx(
              "group bg-slate-900 border rounded-2xl p-6 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden",
              card.glowColor
            )}
          >
            {/* Effetto sfondo luminoso leggero all'hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-3 bg-slate-800 rounded-xl shadow-inner border border-slate-700">
                {card.icon}
              </div>
              <h4 className={clsx("font-black uppercase tracking-wide text-sm", card.textColor)}>
                {card.title}
              </h4>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed relative z-10 whitespace-pre-line">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
