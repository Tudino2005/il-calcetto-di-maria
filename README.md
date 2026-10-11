# ⚽ Arena del Biliardino — Product & Design Specification (PRD)

> **Documento di Specifica Funzionale e UI/UX per Google Stitch e Team di Design.**  
> Questo documento descrive l'intera architettura, le logiche di dominio, il sistema di punteggio e tutte le schermate dell'ecosistema **Arena del Biliardino** per la generazione dell'interfaccia utente ad alta fedeltà.

---

## 1. Visione del Prodotto ed Ecosistema

**Arena del Biliardino** è una piattaforma professionale e immersiva per la gestione, il tracciamento e lo spettacolo del calcio balilla competitivo (tornei di circolo, bar e leghe aziendali).

L'applicazione offre una **doppia esperienza utente asimmetrica**:

1. **Maxischermo TV (16:9 Landscape - 1080p / 4K):**
   * Dashboard dinamica a rotazione automatica (slideshow senza scroll) pensata per maxischermi fissi nei locali.
   * Tabelloni classifiche in stile *"Serie A"* (fissi a 15 posizioni, ultra-minimal, ad altissimo contrasto).
   * Cerimonie evento spettacolari con animazioni in stile *Las Vegas Slot Machine* e colonna sonora sincronizzata.
   * QR Code dinamici integrati a schermo per permettere ai presenti di scannerizzare e visualizzare le statistiche sul proprio smartphone.

2. **Mobile PWA (9:16 Portrait - Responsive Desktop/Tablet):**
   * Web App installabile per i giocatori.
   * Consultazione istantanea di classifiche (Singoli, Coppie, Ruoli).
   * Scheda Analitica Giocatore ("Fascicolo del Giocatore") con statistiche avanzate a 7 colonne, compagni storici e registro sfide.
   * Segnapunti digitale touch per arbitri e giocatori con attribuzione del gol al singolo atleta.

---

## 2. Glossario di Dominio e Regole Ufficiali (CRITICO)

Per preservare l'integrità del design e della terminologia, applicare rigorosamente le seguenti definizioni:

* **"Sfida" (Match):** L'intero scontro tra due formazioni, disputato tipicamente **al meglio delle 3 partite** (vince chi conquista 2 partite).
* **"Partita" (Set):** La singola frazione di gioco all'interno di una sfida (es. Set 1, Set 2, Set 3/La Bella), disputata a un target di gol (default: 6 o 7 gol con scarto di 2).
* **"Difensore" (ex Portiere):** Il giocatore schierato in difesa e tra i pali.
* **"Attaccante":** Il giocatore schierato sulle stecche offensive (centrocampo / attacco).
* **"Jolly":** Giocatore senza ruolo fisso o in rotazione libera.
* **"Stecca Segnapunti":** La classica stecca fisica a perline del biliardino (1-10 gol), replicata in versione touch digitale interattiva.

---

## 3. Logica Funzionale e Sistema di Punteggio

### 3.1 Punti in Classifica Generale (Formula Federale)
Per ogni **Sfida** (al meglio delle 3):
* **Vittoria 2-0 (Cappotto):** **3 Punti** (premio per non aver concesso nemmeno un set).
* **Vittoria 2-1 (Al terzo set):** **2 Punti**.
* **Sconfitta 1-2 (Sconfitta al terzo set):** **1 Punto** (bonus per aver strappato un set alla squadra vincente).
* **Sconfitta 0-2 (Sconfitta secca):** **0 Punti**.

**Criteri di ordinamento parità (Tie-Break):**
1. Punti totali
2. Sfide vinte
3. Percentuale di vittorie (Win Rate %)

### 3.2 Ranking per Ruolo e Sfide Libere (Algoritmo Wilson Score)
Nelle classifiche per Ruolo (Migliori Difensori, Migliori Attaccanti) e nelle Sfide Libere viene applicato l'intervallo di confidenza **Wilson Score (limite inferiore al 95%)**:
* L'algoritmo penalizza chi ha giocato pochissime partite con il 100% di vittorie casuali, premiando la costanza nel tempo di chi vince con alto volume di sfide (la stessa logica della Top 250 di IMDb).
* Ordinamento: `Wilson Score DESC` → `Win Rate % DESC` → `Differenza Set (DS) DESC`.

### 3.3 Statistiche Individuali di Merito (Gol Fatti vs Gol Subiti)
Per valorizzare il singolo giocatore al di fuori della coppia:
* **GOL FATTI (Merito Offensivo):** Somma di tutti i gol segnati esplicitamente dal giocatore (tasto GOL individuale) + gol di squadra non attribuiti nelle partite in cui era schierato in **Attacco**.
* **GOL SUBITI (Responsabilità Difensiva):** Somma dei soli gol incassati dalla squadra nelle partite in cui il giocatore era schierato in **Difesa** (non penalizza l'attaccante per i gol subiti dal compagno).

---

## 4. Specifiche Schermate per Google Stitch (UI/UX Flows)

### Schermata 1: Maxischermo TV Dashboard (`/classifiche`)
* **Aspect Ratio:** 16:9 orizzontale fisso (Full HD 1920x1080 / 4K 3840x2160).
* **Layout:** Schermata scura senza scrolling verticale (nessuna scrollbar visibile, nessun testo tronco `...` sui nomi dei giocatori).
* **Header Globale Superiore:**
  * Logo Ufficiale a stemma oro/blu circolare *"Arena del Biliardino"* ad alta definizione.
  * Titolo gradiente brillante (*Cyan to Emerald*).
  * Barra con pillole di avanzamento dello slideshow (indicatore di slide attiva).
* **Ciclo delle Slide (Rotazione Temporizzata):**
  1. **Slide 1 - RANKING ASSOLUTO:** Tabella Serie A ultra-minimalista a 15 righe fisse (Posizione, Avatar circolare, Nome Giocatore, PG, V, P, Punti oro, Win Rate %). In alto a destra: Card bianca con QR Code scansionabile e dicitura *"Classifica Completa"*.
  2. **Slide 2 - RANKING SFIDE LIBERE:** Tabella 10 righe con statistiche sfide non di torneo ordinate per Wilson Score.
  3. **Slide 3 - RANKING PER RUOLO:** Schermo diviso in due colonne parallele (Colonna Sinistra: *Top Difensori* con scudo blu; Colonna Destra: *Top Attaccanti* con spade rosse).
  4. **Slide 4 - FASCICOLO GIOCATORI (TOP 3):** Podio visivo dei 3 migliori giocatori con foto grande, statistiche chiave e indici di performance.
  5. **Slide 5 - ULTIME PARTITE:** Feed delle sfide recenti concluse con badge vincitori, set scores e data.
  6. **Slide 6 - PROMO TORNEO (Se presente torneo in arrivo):** Hero card promozionale con countdown, data evento, costo d'iscrizione, montepremi e grande QR Code per iscriversi da smartphone.
  7. **Slide 7 - CERIMONIA SORTEGGIO (Se torneo in stato `drawing`):** Schermata speciale prioritaria che blocca lo slideshow e avvia la cerimonia.

---

### Schermata 2: Mobile Leaderboard PWA (`/classifiche` Mobile / `/leaderboard`)
* **Aspect Ratio:** 9:16 mobile portrait (con supporto responsive su schermi ampi).
* **Top Header Fisso:**
  * Logo circolare Arena del Biliardino + Titolo compatto.
  * Barra di ricerca immediata con icona lente per filtrare i giocatori per nome.
  * **Segmented Navigation Tabs** posizionati subito sotto la ricerca:
    * `[ 👤 SINGOLI ]` | `[ 👥 COPPIE ]` | `[ 🛡️ RUOLI ]`
* **Corpo Principale (Griglia Classifica):**
  * Layout a righe orizzontali ad alto contrasto identico alla TV (Posizione, Avatar, Nome, Sfide, Vinte, Punti, WR).
  * Click su qualsiasi riga apre istantaneamente il **Fascicolo Giocatore** (Bottom Sheet).

---

### Schermata 3: Scheda Profilo Giocatore ("Fascicolo del Giocatore")
* **Componente:** Bottom Sheet scorrevole su mobile / Modale centrata su desktop (apertura animata dal basso).
* **Intestazione Superiore (Desktop & Mobile):**
  * Sinistra: Avatar circolare 64x64, Nome completo (es. `Ale Suglia`), Posizione attuale in classifica (es. `1°` in oro), Badge Ruolo di preferenza (`ATTACCANTE` o `DIFENSORE`).
  * Destra / In mezzo (Griglia Statistiche a 7 Colonne):
    * `SFIDE GIOCATE` (bianco)
    * `SFIDE VINTE` (verde smeraldo)
    * `PARTITE GIOCATE` (bianco, con background evidenziato)
    * `PARTITE VINTE` (verde smeraldo, con background evidenziato)
    * `GOL FATTI` (verde smeraldo, calcolato con regola di merito)
    * `GOL SUBITI` (rosso, calcolato con regola difensiva)
    * `WIN RATE` (verde bold, con percentuale)
  * Tasto chiusura `X` in alto a destra.
* **3 Tab di Navigazione Interni:**
  * **Tab 1: "Panoramica":**
    * Card in evidenza *"Miglior Partner"* con nome del compagno ideale, sfide giocate insieme e win rate di coppia.
  * **Tab 2: "Partner":**
    * Griglia responsive di card (auto-fill minmax 280px) per ogni compagno con cui ha giocato.
    * Header card: Avatar del compagno, Nome e *"Ranking di coppia"* con posizione numerica viola.
    * Sub-griglia a 7 statistiche: `Sfide Giocate`, `Sfide Vinte`, `Partite Giocate`, `Partite Vinte`, `Gol Fatti`, `Gol Subiti`, `Win Rate %`.
  * **Tab 3: "Storico":**
    * Griglia responsive di card dei match passati.
    * Header card: Badge colorato a sinistra (`TORNEO` in oro brillante con sfondo giallo 20%, oppure `SFIDA LIBERA` in blu con sfondo azzurro 20%), Risultato finale set in grande (es. `2 - 1` verde se vinto, rosso se perso), Data del match.
    * Layout incontro verticale a 3 righe (T-shape):
      * Riga 1 (in alto): Squadra A (giocatore + compagno in bianco).
      * Riga 2 (centro): Scritta **`VS`** centrata e distanziata. A destra: pillole dei set scores (es. `6-4`, `5-7`, `7-9`) con evidenziati i gol individuali segnati dal giocatore (es. `6-4 ⚽2`).
      * Riga 3 (in basso): Squadra B (avversari in grigio chiaro).

---

### Schermata 4: Segnapunti Live / Digital Scoreboard (`/match/[id]`)
* **Layout:** Arena split-screen a due colonne (Rosso vs Blu).
* **Barra di Controllo Superiore:**
  * Selettore rapido gol target per set (`5`, `6`, `7`, `8`, `9`, `10`).
  * Switch Vantaggi scarto di 2 (`SÌ` / `NO`).
  * Indicatore centrale di set: *"In corso: Partita 1 di 3"*.
* **Colonna Squadra A (Rosso) & Colonna Squadra B (Blu):**
  * **Box Giocatori e Ruoli:**
    * Chip Difesa: icona `🛡️ Porta:` [Nome Giocatore].
    * Pulsante intermedio: `[ ⇆ Inverti Ruoli ]`.
    * Chip Attacco: icona `⚔️ Attacco:` [Nome Giocatore].
  * **Pulsanti GOL Individuali:**
    * Sopra ciascuno dei 4 giocatori è posizionato un pulsante **`[ ⚽ GOL ]`**. Un tap aggiunge 1 gol alla squadra e accredita il gol al singolo giocatore (con contatore numerico dei gol fatti nel set).
  * **Display Punteggio Gigante:**
    * Cifra enorme al centro (font `text-9xl` tabular-nums).
    * HUD Vantaggi ad oltranza quando si è in parità (indicatori visivi `GOL 1 (+1)` e `GOL 2 (+2 Vittoria)`).
  * **Stecca Segnapunti Interattiva (1 - 10):**
    * 10 caselle numerate cliccabili che si colorano di rosso/blu con segno di spunta (Check).
  * **Pulsanti Azione Inferiori:**
    * Tasto `-` per annullare l'ultimo gol.
    * Tasto gigante `+ GOL ROSSO` / `+ GOL BLU` per gol di squadra generici non attribuiti.
* **Barra Inferiore:**
  * Tasto *"Annulla Partita Precedente"* per correggere errori di set chiusi.
  * Tasto *"Azzera Partita"* per ripartire da 0-0.

---

### Schermata 5: Cerimonia di Sorteggio Torneo ("Slot Machine Draw")
* **Stile Visivo:** Show televisivo drammatico con animazioni 3D/perspective e sound design cinematografico.
* **Flusso della Cerimonia:**
  1. **Attesa e Lancio:** Schermata con coppa d'oro pulsante e grande bottone *"AVVIA SPETTACOLO E AUDIO"*.
  2. **Intro Video:** Riproduzione a tutto schermo di `IntroTorneo.mp4`.
  3. **Sottofondo Musicale 1:** Traccia audio *Seven Nation Army* durante la sfilata dei giocatori iscritti (figurine 3D che ruotano).
  4. **Sorteggio Slot Machine:** Traccia audio *Song 2 - Blur*. Due rulli verticali girano freneticamente ed estraggono casualmente Giocatore 1 (Attaccante) e Giocatore 2 (Difensore), con esplosione di coriandoli alla composizione della coppia.
  5. **Showcase Squadre:** Traccia audio *Champions League Anthem*. Card olografica per ogni squadra con probabilità di vittoria e calcolo di forza della coppia (*Power Score*).
  6. **Regolamento Star Wars:** Scorrimento prospettico dal basso verso l'alto delle regole ufficiali del torneo.
  7. **Controlli di Emergenza per Test e Arbitri:**
    * Pulsante sempre visibile in alto a destra: **`[ ⏩ Salta Cerimonia (ESC) ]`**.
    * Tasto rapido da tastiera: pressione di `ESC` o `S` interrompe subito video e musica, salva lo stato del torneo nel database su `in_progress` e porta immediatamente al tabellone delle partite.

---

### Schermata 6: Tabelloni e Formati Torneo (`/tournaments/[id]`)
Supporta 3 modalità di torneo distinte:
1. **Eliminazione Diretta:** Albero classico (Quarti → Semifinali → Finale).
2. **Doppia Eliminazione (Double Elimination):** Tabellone Winners Bracket e Losers Bracket (ripescaggio degli sconfitti con Grand Final).
3. **Fase a Gironi + Playoff:** Gironi all'italiana con classifica automatica (PG, V, P, Differenza Set, Punti) e passaggio alle fasi finali a eliminazione diretta.
4. **Schermata Promo (`/promo`):** Card fullscreen per maxischermo con countdown, montepremi e QR Code.
5. **Modulo Iscrizione Mobile (`/join`):** Form per giocatori con selezione nome e ruolo preferito.

---

### Schermata 7: Pannello di Controllo Admin (`/admin`)
* Creazione rapida tornei con configurazione regole (target gol, vantaggi, tavoli disponibili, orari).
* Gestione anagrafica giocatori con caricamento avatar e video-sigle personali `.mp4`.
* Approvazione/rifiuto richieste di iscrizione inviate tramite QR Code.
* Pianificazione automatica orari sfide e tavoli di gioco.

---

## 5. Design System e Linee Guida UI per Google Stitch

### 5.1 Palette Colori (Dark Theme Premium)
| Token Colore | Esadecimale / Tailwind | Utilizzo |
|---|---|---|
| **Background Darkest** | `#020617` (`slate-950`) | Sfondo generale dell'app e della TV |
| **Card Surface** | `#0f172a` (`slate-900/90`) | Superfici di card, tabelle e finestre modali |
| **Borders & Dividers** | `#1e293b` (`slate-800`), `#334155` (`slate-700/50`) | Bordi sottili, separatori di tabelle |
| **Red Team / Attacco** | `#ef4444` (`red-500`), `#dc2626` (`red-600`) | Squadra Rossa, Ruolo Attaccante, Gol Subiti |
| **Blue Team / Difesa** | `#3b82f6` (`blue-500`), `#2563eb` (`blue-600`) | Squadra Blu, Ruolo Difensore, Sfida Libera |
| **Tournament Gold** | `#eab308` (`yellow-500`), `#f59e0b` (`amber-500`) | Badge Torneo, Coppe, Punti Classifica, 1° Posto |
| **Emerald Success** | `#10b981` (`emerald-500`), `#059669` (`emerald-600`) | Vittorie, Gol Fatti, Win Rate elevato, Set vinti |
| **Purple Accent** | `#a855f7` (`purple-500`), `#9333ea` (`purple-600`) | Coppie, Ranking di Coppia, Miglior Partner |

### 5.2 Tipografia e Gerarchia
* **Font Family:** Geometric Sans-Serif ad alta leggibilità (Geist Sans, Inter o Montserrat).
* **Numeri e Punteggi:** Utilizzare obbligatoriamente `tabular-nums` per evitare oscillazioni orizzontali durante l'aggiornamento dei gol e del tempo.
* **Casing:** Nomi dei giocatori sempre in `Title Case` o `Normal Case` (mai troncati con ellissi `...` e mai a capo su due righe).
* **Badge ed Etichette:** Tutte le etichette tecniche (`ATTACCANTE`, `DIFENSORE`, `TORNEO`, `SFIDA LIBERA`, colonne statistiche) sono in **UPPERCASE** con tracking allargato (`tracking-wider` / `tracking-widest`) e font-weight `font-black` (900).

### 5.3 Principi di Layout e Responsività
1. **Zero Clutter:** UI estremamente pulita, priva di orpelli inutili, con ampio respiro e gradienti morbidi solo su elementi chiave.
2. **Adattabilità Desktop/TV:** Le liste di card usano sempre CSS Grid con `auto-fill` e `minmax` (es. `minmax(280px, 1fr)`) per evitare che su monitor larghi le card si allunghino orizzontalmente all'infinito.
3. **Immediatezza Touch sul Segnapunti:** I pulsanti di azione durante la partita devono avere un'altezza minima di 56px (`h-14` / `h-16`) per essere premuti al volo con le mani sudate o mentre si gioca.

---

## 6. Schema Dati (Database Prisma Reference)

```prisma
model Player {
  id            String   @id @default(uuid())
  name          String   @unique
  preferredRole String   // 'attaccante', 'portiere', 'entrambi'
  mediaUrl      String?  // Video sigla personale (.mp4)
  avatarUrl     String?  // Figurina statica (.png / .jpg)
  createdAt     DateTime @default(now())
}

model Team {
  id            String   @id @default(uuid())
  player1Id     String
  player2Id     String
  uniqueTeamKey String   @unique // [player1Id, player2Id].sort().join('-')
}

model Match {
  id                 String    @id @default(uuid())
  teamAId            String?
  teamBId            String?
  winnerTeamId       String?
  scoreTeamA         Int       @default(0) // Partite (set) vinte dal Team A
  scoreTeamB         Int       @default(0) // Partite (set) vinte dal Team B
  setScores          Json?     // Array di set: [{ setNumber: 1, scoreA: 6, scoreB: 4, scorers: { "<playerId>": 2 } }]
  teamA_goalkeeperId String?
  teamA_strikerId    String?
  teamB_goalkeeperId String?
  teamB_strikerId    String?
  tournamentId       String?
  groupId            String?
  bracketType        String    @default("winners")
  playedAt           DateTime  @default(now())
}

model Tournament {
  id                 String    @id @default(uuid())
  name               String
  type               String    // 'coppie_fisse', 'sorteggio_ruoli', 'sorteggio_integrale'
  format             String    // 'eliminazione_diretta', 'doppia_eliminazione', 'gironi_eliminazione'
  status             String    // 'setup', 'ready_to_draw', 'drawing', 'matches_drawing', 'in_progress', 'completed'
  targetGoals        Int       @default(7)
  advantageThreshold Int       @default(5)
  scoringMode        String    @default("goals")
}
```

---

*Documento redatto e validato per importazione diretta in Google Stitch per la generazione delle interfacce grafiche.*
