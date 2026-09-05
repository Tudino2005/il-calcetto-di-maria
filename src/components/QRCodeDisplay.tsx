"use client";

import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";

export default function QRCodeDisplay({ tournamentId }: { tournamentId: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // Genera l'URL completo basato sul dominio attuale
    setUrl(`${window.location.origin}/tournaments/${tournamentId}/join`);
  }, [tournamentId]);

  if (!url) return null;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl mt-6">
      <h3 className="text-slate-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <QrCode className="w-5 h-5" /> Inquadra per Iscriverti
      </h3>
      <div className="bg-white p-4 rounded-2xl">
        {/* Usiamo un servizio gratuito e super affidabile per generare il QR */}
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`} 
          alt="QR Code Iscrizione"
          className="w-48 h-48 md:w-64 md:h-64 object-contain"
        />
      </div>
      <p className="text-slate-500 text-sm mt-4 text-center max-w-xs">
        Usa la fotocamera del tuo telefono per aprire il modulo di iscrizione.
      </p>
    </div>
  );
}
