import re

with open("src/app/tournaments/[id]/join/page.tsx", "r") as f:
    content = f.read()

# Replace the whole status logic
old_logic = """  const [status, setStatus] = useState<"pending" | "accepted" | "rejected" | null>(null);
  const [adminReply, setAdminReply] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let interval: any;
    if (requestId && status === "pending") {
      interval = setInterval(async () => {
        const req = await getRegistrationRequest(requestId);
        if (req && req.status !== "pending") {
          setStatus(req.status as any);
          setAdminReply(req.adminReply);
          clearInterval(interval);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [requestId, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    const req = await createRegistrationRequest(tournamentId, name.trim(), role);
    setRequestId(req.id);
    setStatus(req.status as any);
    setIsSubmitting(false);
  };"""

new_logic = """  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    await createRegistrationRequest(tournamentId, name.trim(), role);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };"""

content = content.replace(old_logic, new_logic)

# Replace the render blocks for status
old_render = """  if (status === "pending") {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-16 h-16 text-emerald-400 animate-spin mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Richiesta Inviata!</h1>
        <p className="text-slate-400 max-w-sm">
          Attendi che Maria approvi la tua iscrizione dal suo tablet. Non chiudere questa pagina...
        </p>
      </main>
    );
  }

  if (status === "accepted") {
    return (
      <main className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-24 h-24 text-emerald-400 mb-6" />
        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Sei Dentro!</h1>
        <p className="text-emerald-200 mb-8 font-medium text-lg">La tua iscrizione è stata confermata.</p>
        
        {adminReply && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/30 max-w-sm">
            <h3 className="text-emerald-400 font-bold mb-2 uppercase tracking-wider text-sm">Messaggio da Maria:</h3>
            <p className="text-white text-lg">"{adminReply}"</p>
          </div>
        )}
      </main>
    );
  }

  if (status === "rejected") {
    return (
      <main className="min-h-screen bg-red-950 flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="w-24 h-24 text-red-400 mb-6" />
        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Iscrizione Rifiutata</h1>
        
        {adminReply && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-red-500/30 max-w-sm mt-6">
            <h3 className="text-red-400 font-bold mb-2 uppercase tracking-wider text-sm">Messaggio da Maria:</h3>
            <p className="text-white text-lg">"{adminReply}"</p>
          </div>
        )}
        
        <button onClick={() => { setStatus(null); setRequestId(null); }} className="mt-8 text-red-400 underline underline-offset-4">
          Torna indietro
        </button>
      </main>
    );
  }"""

new_render = """  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-24 h-24 text-emerald-400 mb-6" />
        <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-widest">Richiesta Inviata!</h1>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/30 max-w-md">
          <p className="text-emerald-200 text-lg leading-relaxed">
            Abbiamo inviato la tua richiesta a Maria. 
            <br/><br/>
            Poiché le iscrizioni richiedono tempo, non c'è bisogno di aspettare in questa pagina. 
            Controlla la locandina ufficiale nei prossimi giorni per vedere se il tuo nome è tra i partecipanti ufficiali!
          </p>
        </div>
      </main>
    );
  }"""

content = content.replace(old_render, new_render)
content = content.replace('const [requestId, setRequestId] = useState<string | null>(null);', '')
content = content.replace('import { createRegistrationRequest, getRegistrationRequest } from "@/app/actions/tournamentActions";', 'import { createRegistrationRequest } from "@/app/actions/tournamentActions";')

with open("src/app/tournaments/[id]/join/page.tsx", "w") as f:
    f.write(content)
