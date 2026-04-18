import { useState, useEffect, useRef, useCallback } from "react";
import { loadFromFirestore, saveToFirestore, subscribeToFirestore } from "./firebase.js";

// ── INITIAL DATA ──────────────────────────────────────────────────────────────
const INITIAL_DB = {
  restaurants: [
    { id: "r1", name: "Le Bistro Parisien", logo: "🥐", color: "#D4A017", address: "12 Rue de la Paix, Paris" },
    { id: "r2", name: "La Bella Italia", logo: "🍕", color: "#C0392B", address: "8 Via Roma, Lyon" },
    { id: "r3", name: "Layali Al Cham Laeken", logo: "🌙", color: "#8B2500", address: "Rue Fransman 42, 1020 Laeken" }
  ],
  users: [
    { id: "u1", rId: "r1", username: "gerant",  password: "1234", name: "Claire Moreau",  role: "manager", avatar: "📋" },
    { id: "u2", rId: "r1", username: "chef",    password: "1234", name: "Marc Dupont",    role: "chef",    avatar: "👨‍🍳" },
    { id: "u3", rId: "r1", username: "caisse",  password: "1234", name: "Sophie Martin",  role: "cashier", avatar: "💳" },
    { id: "u4", rId: "r1", username: "serveur", password: "1234", name: "Lucas Bernard",  role: "waiter",  avatar: "🍽️" },
    { id: "u5", rId: "r2", username: "chef2",   password: "1234", name: "Giovanni Rossi", role: "chef",    avatar: "👨‍🍳" },
    { id: "u6", rId: "r3", username: "Rkan",    password: "1234", name: "Rkan alssrag",   role: "manager", avatar: "📋" },
    { id: "u7", rId: "r3", username: "chef3",   password: "1234", name: "Chef Layali",    role: "chef",    avatar: "👨‍🍳" },
    { id: "u8", rId: "r3", username: "caisse3", password: "1234", name: "Caissier",       role: "cashier", avatar: "💳" },
  ],
  superAdmin: { username: "admin", password: "admin123" },
  menus: {
    r1: [
      { id: "m1", name: "Soupe à l'oignon", cat: "Entrées",  price: 8.5,  prep: 10, emoji: "🍲" },
      { id: "m2", name: "Foie gras",         cat: "Entrées",  price: 16,   prep: 5,  emoji: "🫙" },
      { id: "m3", name: "Steak Frites",      cat: "Plats",    price: 22,   prep: 20, emoji: "🥩" },
      { id: "m4", name: "Poulet Rôti",       cat: "Plats",    price: 18.5, prep: 25, emoji: "🍗" },
      { id: "m5", name: "Crème Brûlée",      cat: "Desserts", price: 7,    prep: 5,  emoji: "🍮" },
      { id: "m6", name: "Tarte Tatin",       cat: "Desserts", price: 8,    prep: 8,  emoji: "🥧" },
      { id: "m7", name: "Café",              cat: "Boissons", price: 2.5,  prep: 2,  emoji: "☕" },
      { id: "m8", name: "Vin Rouge",         cat: "Boissons", price: 6,    prep: 1,  emoji: "🍷" },
    ],
    r2: [
      { id: "m9",  name: "Bruschetta",       cat: "Entrées",  price: 7,    prep: 8,  emoji: "🍞" },
      { id: "m10", name: "Pizza Margherita", cat: "Plats",    price: 14,   prep: 18, emoji: "🍕" },
      { id: "m11", name: "Pasta Carbonara",  cat: "Plats",    price: 16,   prep: 15, emoji: "🍝" },
      { id: "m12", name: "Tiramisu",         cat: "Desserts", price: 6.5,  prep: 3,  emoji: "🍰" },
    ],
    r3: [
      { id: "r3m1",  name: "Houmous",          cat: "Mezze",     price: 6.5,  prep: 5,  emoji: "🫘" },
      { id: "r3m2",  name: "Fattoush",          cat: "Mezze",     price: 7.0,  prep: 8,  emoji: "🥗" },
      { id: "r3m3",  name: "Moutabal",          cat: "Mezze",     price: 6.5,  prep: 5,  emoji: "🍆" },
      { id: "r3m4",  name: "Falafel",           cat: "Mezze",     price: 7.5,  prep: 10, emoji: "🧆" },
      { id: "r3m5",  name: "Kibbeh",            cat: "Mezze",     price: 8.5,  prep: 12, emoji: "🥙" },
      { id: "r3m6",  name: "Poulet grillé",     cat: "Grillades", price: 16.0, prep: 25, emoji: "🍗" },
      { id: "r3m7",  name: "Kébab viande",      cat: "Grillades", price: 17.0, prep: 20, emoji: "🥩" },
      { id: "r3m8",  name: "Kofta",             cat: "Grillades", price: 16.0, prep: 20, emoji: "🍢" },
      { id: "r3m9",  name: "Mixte grillades",   cat: "Grillades", price: 22.0, prep: 25, emoji: "🍽️" },
      { id: "r3m10", name: "Shawarma poulet",   cat: "Sandwichs", price: 9.0,  prep: 10, emoji: "🌯" },
      { id: "r3m11", name: "Shawarma viande",   cat: "Sandwichs", price: 10.0, prep: 10, emoji: "🌯" },
      { id: "r3m12", name: "Sandwich falafel",  cat: "Sandwichs", price: 7.5,  prep: 8,  emoji: "🥙" },
      { id: "r3m13", name: "Baklava",           cat: "Desserts",  price: 5.5,  prep: 3,  emoji: "🍯" },
      { id: "r3m14", name: "Maamoul",           cat: "Desserts",  price: 5.0,  prep: 3,  emoji: "🍪" },
      { id: "r3m15", name: "Riz au lait",       cat: "Desserts",  price: 5.5,  prep: 3,  emoji: "🍚" },
      { id: "r3m16", name: "Jus d'orange",      cat: "Boissons",  price: 4.0,  prep: 3,  emoji: "🍊" },
      { id: "r3m17", name: "Ayran",             cat: "Boissons",  price: 3.5,  prep: 2,  emoji: "🥛" },
      { id: "r3m18", name: "Thé à la menthe",   cat: "Boissons",  price: 3.0,  prep: 5,  emoji: "🍵" },
      { id: "r3m19", name: "Café turc",         cat: "Boissons",  price: 3.5,  prep: 5,  emoji: "☕" },
    ]
  },
  orders: [],
  needs: [],
  reservations: [],
  inventory: {
    r1: [
      { id: "i1", name: "Viande bœuf",     unit: "kg", qty: 12, min: 5  },
      { id: "i2", name: "Pommes de terre", unit: "kg", qty: 25, min: 10 },
      { id: "i3", name: "Tomates",         unit: "kg", qty: 8,  min: 5  },
      { id: "i4", name: "Beurre",          unit: "kg", qty: 3,  min: 2  },
    ],
    r2: [
      { id: "i5", name: "Mozzarella", unit: "kg", qty: 6,  min: 2 },
      { id: "i6", name: "Farine",     unit: "kg", qty: 20, min: 8 },
    ],
    r3: [
      { id: "i7", name: "Viande agneau",  unit: "kg", qty: 10, min: 3 },
      { id: "i8", name: "Poulet",         unit: "kg", qty: 8,  min: 3 },
      { id: "i9", name: "Huile olive",    unit: "L",  qty: 5,  min: 2 },
      { id: "i10", name: "Pois chiches", unit: "kg", qty: 6,  min: 2 },
      { id: "i11", name: "Pain pita",    unit: "pcs", qty: 50, min: 20 },
    ]
  }
};

const uid  = () => Math.random().toString(36).substr(2, 8);
const ts   = () => new Date().toISOString();
const fmt  = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const fmtD = (iso) => new Date(iso).toLocaleDateString("fr-FR");
const fmtDT= (iso) => {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(d); target.setHours(0,0,0,0);
  const diff = (target - today) / 86400000;
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diff === 0) return `Aujourd'hui ${time}`;
  if (diff === 1) return `Demain ${time}`;
  return `${fmtD(iso)} ${time}`;
};

function defaultPickup() {
  const d = new Date(Date.now() + 45 * 60000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return d.toISOString().slice(0, 16);
}
function minsUntil(iso) { return Math.floor((new Date(iso) - Date.now()) / 60000); }

const SC = {
  scheduled: { label: "Programmée", color: "#8b5cf6", bg: "#10081a", icon: "🕐", next: "pending"   },
  pending:   { label: "Nouvelle",   color: "#f59e0b", bg: "#201800", icon: "🆕", next: "preparing" },
  preparing: { label: "En cuisine", color: "#3b82f6", bg: "#001020", icon: "🔥", next: "ready"     },
  ready:     { label: "Prête ✅",   color: "#10b981", bg: "#002010", icon: "🔔", next: "served"    },
  served:    { label: "Servie",     color: "#a78bfa", bg: "#100018", icon: "🍽️", next: "paid"      },
  paid:      { label: "Payée",      color: "#6b7280", bg: "#111",    icon: "💰", next: null         },
};
const ROLE_ADV = { chef: ["pending","preparing","ready","served","paid"], manager: ["pending","preparing","ready","served","paid"], cashier: ["paid"], waiter: ["served"] };

// ── VOICE HOOK ────────────────────────────────────────────────────────────────
function useVoice(onResult) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition)); }, []);
  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try {
      const r = new SR(); r.lang = "fr-FR"; r.interimResults = true; r.continuous = false;
      r.onresult = (e) => {
        const t = Array.from(e.results).map(x => x[0].transcript).join(" ");
        setTranscript(t);
        if (e.results[e.results.length - 1].isFinal) { onResult(t); setActive(false); }
      };
      r.onend = () => setActive(false); r.onerror = () => setActive(false);
      ref.current = r; r.start(); setActive(true); setTranscript("");
    } catch { setActive(false); }
  }, [onResult]);
  const stop = useCallback(() => { try { ref.current?.stop(); } catch {} setActive(false); }, []);
  return { active, transcript, start, stop, supported };
}

// ── VOICE INPUT WIDGET ────────────────────────────────────────────────────────
function VoiceInput({ onSubmit, placeholder = "Tapez ici...", buttonLabel = "Envoyer" }) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("text");
  const voice = useVoice(useCallback((t) => setText(t), []));
  const submit = () => { if (!text.trim()) return; onSubmit(text.trim()); setText(""); setMode("text"); };
  return (
    <div>
      <div style={{ display:"flex", gap:6, marginBottom:10 }}>
        <ModeBtn active={mode==="text"} onClick={()=>setMode("text")}>⌨️ Clavier</ModeBtn>
        <ModeBtn active={mode==="voice"} color="#3b82f6" onClick={()=>setMode("voice")}>
          🎤 Micro {!voice.supported && <span style={{fontSize:9,opacity:.5}}>(Chrome)</span>}
        </ModeBtn>
      </div>
      {mode === "voice" && (
        <div style={{ textAlign:"center", marginBottom:12 }}>
          {voice.supported ? (
            <>
              <button onClick={voice.active ? voice.stop : voice.start}
                style={{ width:74,height:74,borderRadius:"50%",border:`3px solid ${voice.active?"#ef4444":"#3b82f6"}`,background:voice.active?"#ef444412":"#3b82f612",cursor:"pointer",fontSize:32,outline:"none",boxShadow:voice.active?"0 0 30px #ef444455":"0 0 18px #3b82f633",animation:voice.active?"voicePulse 1.2s infinite":"none" }}>
                {voice.active ? "⏹" : "🎤"}
              </button>
              <p style={{ color:voice.active?"#ef4444":"#555", fontSize:12, marginTop:8 }}>
                {voice.active ? "🔴 En écoute..." : "Appuyez pour parler"}
              </p>
              {voice.transcript && <div style={{ background:"#080f1a",border:"1px solid #3b82f633",borderRadius:8,padding:10,color:"#93c5fd",fontSize:13,fontStyle:"italic",margin:"8px 0" }}>"{voice.transcript}"</div>}
            </>
          ) : (
            <div style={{ background:"#1a1500",border:"1px solid #f59e0b33",borderRadius:10,padding:14,color:"#f59e0b",fontSize:12 }}>
              ⚠️ Micro disponible sur Chrome/Edge uniquement
              <br/><button onClick={()=>setMode("text")} style={{ marginTop:8,background:"#f59e0b22",border:"1px solid #f59e0b44",borderRadius:6,padding:"5px 12px",color:"#f59e0b",cursor:"pointer",fontSize:12 }}>→ Utiliser le clavier</button>
            </div>
          )}
        </div>
      )}
      <div style={{ display:"flex", gap:8 }}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder={placeholder}
          style={{ flex:1,background:"#141414",border:"1px solid #2a2a2a",borderRadius:8,padding:"11px 13px",color:"#fff",fontSize:14,outline:"none",fontFamily:"Georgia,serif" }} />
        <button onClick={submit} disabled={!text.trim()}
          style={{ background:text.trim()?"linear-gradient(135deg,#D4A017,#b8860b)":"#1a1a1a",border:"none",borderRadius:8,padding:"0 16px",color:text.trim()?"#060606":"#444",cursor:text.trim()?"pointer":"not-allowed",fontWeight:900,fontSize:13,whiteSpace:"nowrap" }}>
          {buttonLabel}
        </button>
      </div>
      <style>{`@keyframes voicePulse{0%,100%{box-shadow:0 0 30px #ef444455}50%{box-shadow:0 0 50px #ef4444aa}}`}</style>
    </div>
  );
}

// ── SCHEDULED ALERT ───────────────────────────────────────────────────────────
function useScheduledAlerts(db, session, mutate) {
  const [alert30, setAlert30] = useState(null);
  const alerted = useRef(new Set());
  useEffect(() => {
    if (!session || session.type === "super") return;
    const { restaurant: r } = session;
    const check = () => {
      const orders = (db.orders||[]).filter(o => o.rId === r.id && o.status === "scheduled" && o.pickupAt);
      orders.forEach(o => {
        const mins = minsUntil(o.pickupAt);
        if (mins <= 30 && mins > 0 && !alerted.current.has(o.id)) {
          alerted.current.add(o.id);
          setAlert30(o);
          mutate(d => { const ord = d.orders.find(x => x.id === o.id); if (ord && ord.status === "scheduled") ord.status = "pending"; return d; },
            { type: "alert30", data: o });
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            [0, 200, 400].forEach(delay => {
              const osc = ctx.createOscillator(); const gain = ctx.createGain();
              osc.connect(gain); gain.connect(ctx.destination);
              osc.frequency.value = 880; gain.gain.value = 0.3;
              osc.start(ctx.currentTime + delay/1000); osc.stop(ctx.currentTime + delay/1000 + 0.18);
            });
          } catch {}
        }
      });
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [db, session, mutate]);
  return { alert30, dismissAlert: () => setAlert30(null) };
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [db, setDb] = useState(null); // null = loading
  const [session, setSession] = useState(null);
  const [flash, setFlash] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const flashTimer = useRef(null);
  const saveTimer = useRef(null);
  const localVersion = useRef(0);
  const remoteVersion = useRef(0);

  // Load initial data from Firestore — NEVER overwrite existing Firebase data
  useEffect(() => {
    loadFromFirestore().then(data => {
      if (data) {
        const merged = {
          ...INITIAL_DB,
          ...data,
          restaurants: data.restaurants?.length ? data.restaurants : INITIAL_DB.restaurants,
          users: data.users?.length ? data.users : INITIAL_DB.users,
          orders: data.orders || [],
          needs: data.needs || [],
          menus: { ...INITIAL_DB.menus, ...data.menus },
          inventory: { ...INITIAL_DB.inventory, ...data.inventory },
          superAdmin: data.superAdmin || INITIAL_DB.superAdmin,
        };
        setDb(merged);
      } else {
        setDb(INITIAL_DB);
        saveToFirestore(INITIAL_DB);
      }
    });
  }, []);

  // Subscribe to real-time Firestore updates — ALWAYS apply remote changes
  useEffect(() => {
    const unsub = subscribeToFirestore((remoteDb, remoteTs) => {
      // Only skip if we saved MORE recently than the remote update
      if (remoteTs && remoteTs <= localVersion.current) return;
      remoteVersion.current = remoteTs || 0;
      setDb(remoteDb);
    });
    return unsub;
  }, []);

  // Debounced save to Firestore
  const scheduleSave = useCallback((data) => {
    clearTimeout(saveTimer.current);
    setSyncing(true);
    const version = Date.now();
    localVersion.current = version;
    saveTimer.current = setTimeout(async () => {
      await saveToFirestore(data, version);
      setSyncing(false);
    }, 500);
  }, []);

  const mutate = useCallback((fn, flashData) => {
    setDb(prev => {
      if (!prev) return prev;
      const next = fn(JSON.parse(JSON.stringify(prev)));
      scheduleSave(next);
      if (flashData) {
        clearTimeout(flashTimer.current);
        setFlash(flashData);
        flashTimer.current = setTimeout(() => setFlash(null), 8000);
      }
      return next;
    });
  }, [scheduleSave]);

  const { alert30, dismissAlert } = useScheduledAlerts(db || INITIAL_DB, session, mutate);

  // Loading screen
  if (!db) return (
    <div style={{ minHeight:"100vh", background:"#060606", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif", color:"#fff" }}>
      <div style={{ fontSize:64, marginBottom:20, animation:"spin 1s linear infinite" }}>🍽️</div>
      <div style={{ color:"#D4A017", fontSize:16, letterSpacing:3 }}>CHARGEMENT...</div>
      <div style={{ color:"#444", fontSize:12, marginTop:8 }}>Connexion à la base de données</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!session) return <LoginScreen db={db} onLogin={setSession} />;
  const props = { db, mutate, session, onLogout: () => setSession(null), syncing };

  return (
    <div>
      {flash && <FlashBanner flash={flash} onClose={() => setFlash(null)} />}
      {alert30 && <Alert30Banner order={alert30} onClose={dismissAlert} />}
      <div style={{ paddingTop: (flash || alert30) ? 72 : 0 }}>
        {session.type === "super"        ? <SuperAdmin  {...props} /> :
         session.user.role === "manager" ? <ManagerApp  {...props} /> :
         session.user.role === "chef"    ? <ChefApp     {...props} /> :
         session.user.role === "cashier" ? <CashierApp  {...props} /> :
                                           <WaiterApp   {...props} />}
      </div>
    </div>
  );
}

// ── BANNERS ───────────────────────────────────────────────────────────────────
function Alert30Banner({ order, onClose }) {
  return (
    <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:10000,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 40px rgba(124,58,237,.6)",animation:"slideD .35s cubic-bezier(.34,1.56,.64,1)" }}>
      <span style={{ fontSize:36, animation:"ringBell .5s infinite alternate" }}>🔔</span>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:900,fontSize:15,color:"#fff" }}>COMMANDE DANS 30 MIN — {order.client}</div>
        <div style={{ color:"rgba(255,255,255,.8)",fontSize:12,marginTop:2 }}>Prête pour <strong>{fmtDT(order.pickupAt)}</strong> · ✅ Envoyée en cuisine</div>
      </div>
      <button onClick={onClose} style={{ background:"rgba(0,0,0,.3)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:14 }}>✕</button>
      <style>{`@keyframes slideD{from{transform:translateY(-100%)}to{transform:translateY(0)}} @keyframes ringBell{from{transform:rotate(-15deg)}to{transform:rotate(15deg)}}`}</style>
    </div>
  );
}

function FlashBanner({ flash, onClose }) {
  const isOrder = flash.type === "order";
  const isAlert = flash.type === "alert30";
  const bg = isOrder ? "linear-gradient(135deg,#b45309,#d97706)" : isAlert ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  return (
    <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:9999,background:bg,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 40px rgba(0,0,0,.8)",animation:"slideD .35s cubic-bezier(.34,1.56,.64,1)" }}>
      <span style={{ fontSize:36, animation:"wobble .4s ease" }}>{isOrder?"📞":isAlert?"🔔":"🛒"}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:900,fontSize:15,color:"#fff" }}>
          {isOrder ? `NOUVELLE COMMANDE — ${flash.data.client}` : isAlert ? `⚠️ COMMANDE DANS 30 MIN — ${flash.data.client}` : "BESOIN SIGNALÉ"}
        </div>
        <div style={{ color:"rgba(255,255,255,.8)",fontSize:12,marginTop:2 }}>
          {isOrder ? `${flash.data.items?.length} art. · ${flash.data.total?.toFixed(2)}€ · Prête pour ${fmtDT(flash.data.pickupAt)}` :
           isAlert ? `Prête pour ${fmtDT(flash.data.pickupAt)}` :
           `${flash.data.avatar} ${flash.data.by} : "${flash.data.text}"`}
        </div>
      </div>
      <button onClick={onClose} style={{ background:"rgba(0,0,0,.3)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:14 }}>✕</button>
      <style>{`@keyframes wobble{0%{transform:scale(1)}40%{transform:scale(1.3) rotate(-8deg)}100%{transform:scale(1)}}`}</style>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ db, onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");

  const login = () => {
    setErr("");
    // Super admin
    if (user === db.superAdmin.username && pass === db.superAdmin.password) { onLogin({ type:"super" }); return; }
    // Find user across ALL restaurants — staff only sees their own restaurant
    const found = (db.users||[]).find(u => u.username === user && u.password === pass);
    if (found) {
      const rest = (db.restaurants||[]).find(r => r.id === found.rId);
      if (rest) { onLogin({ type:"user", user:found, restaurant:rest }); return; }
    }
    setErr("Identifiants incorrects");
  };

  return (
    <div style={{ minHeight:"100vh",background:"#060606",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"Georgia,serif" }}>
      <div style={{ textAlign:"center",marginBottom:36 }}>
        <div style={{ fontSize:64 }}>🍽️</div>
        <h1 style={{ margin:"8px 0 4px",fontSize:30,fontWeight:900,color:"#fff",letterSpacing:5 }}>RESTAU<span style={{ color:"#D4A017" }}>PRO</span></h1>
        <div style={{ color:"#333",fontSize:10,letterSpacing:4 }}>GESTION EN TEMPS RÉEL</div>
      </div>
      <div style={{ width:"100%",maxWidth:380,background:"#0f0f0f",borderRadius:20,border:"1px solid #1e1e1e",padding:26,boxShadow:"0 30px 80px rgba(0,0,0,.9)" }}>
        <Lbl style={{ textAlign:"center",marginBottom:20 }}>CONNEXION</Lbl>
        <FInp label="IDENTIFIANT" val={user} set={setUser} icon="👤" />
        <FInp label="MOT DE PASSE" val={pass} set={setPass} icon="🔑" type="password" onEnter={login} />
        {err && <div style={{ color:"#ef4444",fontSize:13,textAlign:"center",marginBottom:12 }}>{err}</div>}
        <button onClick={login} style={{ width:"100%",background:"linear-gradient(135deg,#D4A017,#b8860b)",border:"none",borderRadius:12,padding:15,fontSize:15,fontWeight:900,color:"#060606",cursor:"pointer",letterSpacing:2 }}>
          SE CONNECTER →
        </button>
        <div style={{ color:"#333",fontSize:11,textAlign:"center",marginTop:16,lineHeight:1.8 }}>
          Chaque membre du staff se connecte avec<br/>son identifiant personnel unique
        </div>
      </div>
    </div>
  );
}

// ── SHELL ─────────────────────────────────────────────────────────────────────
function Shell({ session, onLogout, tabs, activeTab, setTab, children, syncing }) {
  const { user, restaurant:r } = session;
  const rL = { manager:"Gérant", chef:"Cuisinier", cashier:"Caissier", waiter:"Serveur" };
  return (
    <div style={{ minHeight:"100vh",background:"#080808",fontFamily:"Georgia,serif",color:"#fff" }}>
      <header style={{ background:`linear-gradient(135deg,#0d0d0d,${r.color}18)`,borderBottom:`2px solid ${r.color}33`,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:50 }}>
        <span style={{ fontSize:34 }}>{r.logo}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800,fontSize:13,letterSpacing:1 }}>{r.name}</div>
          <div style={{ fontSize:11,color:`${r.color}bb` }}>{user.avatar} {user.name} · {rL[user.role]}</div>
        </div>
        {syncing && <span style={{ fontSize:11,color:"#555",animation:"pulse 1s infinite" }}>⏳ sync</span>}
        <button onClick={onLogout} style={{ background:"#111",border:"1px solid #222",borderRadius:8,padding:"6px 10px",color:"#666",cursor:"pointer",fontSize:12 }}>🚪</button>
      </header>
      {tabs?.length > 1 && (
        <nav style={{ display:"flex",background:"#0a0a0a",borderBottom:"1px solid #161616" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ flex:1,padding:"11px 4px",background:"none",border:"none",borderBottom:activeTab===t.id?`3px solid ${r.color}`:"3px solid transparent",color:activeTab===t.id?r.color:"#444",cursor:"pointer",fontSize:11,fontWeight:700,letterSpacing:.3,position:"relative",transition:"color .2s" }}>
              {t.icon} {t.label}
              {t.badge > 0 && <span style={{ position:"absolute",top:5,right:"calc(50% - 20px)",background:"#ef4444",color:"#fff",borderRadius:"50%",width:15,height:15,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900 }}>{t.badge}</span>}
            </button>
          ))}
        </nav>
      )}
      <main style={{ padding:14,maxWidth:860,margin:"0 auto" }}>{children}</main>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}

// ── PICKUP TIME PICKER ────────────────────────────────────────────────────────
function PickupPicker({ value, onChange, color }) {
  const mins = minsUntil(value);
  const labelColor = mins <= 0 ? "#ef4444" : mins <= 30 ? "#10b981" : "#8b5cf6";
  const label = mins <= 0 ? "⚠️ Heure passée" : mins <= 30 ? `⚡ Dans ${mins} min → cuisine immédiate` : `🕐 Dans ${mins} min`;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:6 }}>PRÊTE POUR QUELLE HEURE ? *</div>
      <input type="datetime-local" value={value} onChange={e=>onChange(e.target.value)} min={new Date().toISOString().slice(0,16)}
        style={{ width:"100%",background:"#141414",border:`2px solid ${color}44`,borderRadius:9,padding:"12px 14px",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif",colorScheme:"dark" }} />
      <div style={{ fontSize:12,color:labelColor,marginTop:6,fontWeight:700 }}>{label}</div>
      <div style={{ display:"flex",gap:6,marginTop:8,flexWrap:"wrap" }}>
        {[15,30,45,60,90,120].map(m => {
          const d = new Date(Date.now() + m*60000); d.setSeconds(0,0);
          const v = d.toISOString().slice(0,16);
          return <button key={m} onClick={()=>onChange(v)} style={{ padding:"5px 10px",borderRadius:20,border:`1px solid ${color}44`,background:value===v?`${color}33`:"transparent",color:value===v?color:"#666",cursor:"pointer",fontSize:11,fontWeight:700 }}>+{m>=60?`${m/60}h`:`${m}min`}</button>;
        })}
      </div>
    </div>
  );
}

// ── MANAGER APP ───────────────────────────────────────────────────────────────
function ManagerApp({ db, mutate, session, onLogout, syncing }) {
  const [tab, setTab] = useState("call");
  const { restaurant:r, user } = session;
  const menu   = db.menus?.[r.id] || [];
  const orders = (db.orders||[]).filter(o => o.rId === r.id);
  const needs  = (db.needs||[]).filter(n => n.rId === r.id);
  const [calling, setCalling] = useState(false);
  const [step, setStep] = useState("info");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [orderType, setOrderType] = useState("phone");
  const [cart, setCart] = useState([]);
  const [catFilter, setCatFilter] = useState("Tous");
  const [pickupAt, setPickupAt] = useState(defaultPickup);

  const addToCart = (item) => setCart(p => { const ex = p.find(x => x.mid === item.id); return ex ? p.map(x => x.mid===item.id?{...x,qty:x.qty+1}:x) : [...p,{mid:item.id,name:item.name,price:item.price,qty:1,emoji:item.emoji}]; });
  const handleVoice = useCallback((text) => {
    const lower = text.toLowerCase();
    menu.forEach(item => { if (lower.includes(item.name.toLowerCase())) addToCart(item); });
    const nm = text.match(/(?:pour|client|c'est|monsieur|madame|nom)\s+([A-ZÀ-Üa-zà-ü]+(?:\s+[A-ZÀ-Üa-zà-ü]+)?)/i);
    if (nm) setClientName(nm[1].charAt(0).toUpperCase() + nm[1].slice(1));
  }, [menu]);
  const voice = useVoice(handleVoice);
  const resetForm = () => { setCart([]); setClientName(""); setClientPhone(""); setCalling(false); setStep("info"); setPickupAt(defaultPickup()); };

  const submitOrder = () => {
    if (!clientName || !cart.length || !pickupAt) return;
    const mins = minsUntil(pickupAt);
    const status = mins > 30 ? "scheduled" : "pending";
    const prepMin = Math.min(Math.max(...cart.map(c => (menu.find(m=>m.id===c.mid)?.prep||15))), 45);
    const order = { id:uid(), rId:r.id, client:clientName, phone:clientPhone, type:orderType, items:cart, total:cart.reduce((s,c)=>s+c.price*c.qty,0), prepMin, status, pickupAt, createdAt:ts(), by:user.name };
    mutate(d => { d.orders.push(order); return d; }, { type:"order", data:order });
    resetForm(); setTab("orders");
  };

  const cats = ["Tous", ...new Set(menu.map(m=>m.cat))];
  const menuItems = catFilter==="Tous" ? menu : menu.filter(m=>m.cat===catFilter);
  const scheduled = orders.filter(o => o.status==="scheduled");
  const active = orders.filter(o => !["paid","scheduled"].includes(o.status));

  const tabs = [
    { id:"call",   icon:"📞", label:"Appel",       badge:0 },
    { id:"orders", icon:"📋", label:"Commandes",   badge:active.length },
    { id:"sched",  icon:"🕐", label:"Programmées", badge:scheduled.length },
    { id:"needs",  icon:"🛒", label:"Besoins",     badge:needs.filter(n=>!n.done).length },
    { id:"res",    icon:"🪑", label:"Réservations", badge:(db.reservations||[]).filter(rv=>rv.rId===r.id&&!rv.done&&new Date(rv.date)>=new Date()).length },
  ];

  const reservations = (db.reservations||[]).filter(rv => rv.rId===r.id);

  return (
    <Shell session={session} onLogout={onLogout} tabs={tabs} activeTab={tab} setTab={setTab} syncing={syncing}>
      {tab==="call" && !calling && (
        <div style={{ textAlign:"center",paddingTop:36 }}>
          <div style={{ color:"#333",fontSize:10,letterSpacing:3,marginBottom:36 }}>GÉRANT · HORS RESTAURANT</div>
          <div style={{ position:"relative",display:"inline-block",marginBottom:44 }}>
            <div style={{ position:"absolute",inset:-18,borderRadius:"50%",background:"#16a34a0e",animation:"ring1 2s ease-out infinite" }} />
            <div style={{ position:"absolute",inset:-36,borderRadius:"50%",background:"#16a34a06",animation:"ring1 2s ease-out infinite .5s" }} />
            <button onClick={()=>setCalling(true)} style={{ position:"relative",width:180,height:180,borderRadius:"50%",border:"none",background:"linear-gradient(145deg,#16a34a,#15803d)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 0 50px #16a34a33" }}>
              <span style={{ fontSize:66 }}>📞</span>
              <span style={{ color:"#fff",fontWeight:900,fontSize:13,letterSpacing:3 }}>APPEL</span>
              <span style={{ color:"rgba(255,255,255,.5)",fontSize:10,letterSpacing:2 }}>ENTRANT</span>
            </button>
          </div>
          <p style={{ color:"#444",fontSize:13,maxWidth:260,margin:"0 auto 32px" }}>Un client appelle ? Appuyez pour prendre sa commande.</p>
          {scheduled.length > 0 && (
            <div style={{ textAlign:"left",background:"#0d0820",border:"1px solid #8b5cf644",borderRadius:12,padding:14,marginBottom:16 }}>
              <Lbl style={{ color:"#8b5cf6" }}>🕐 COMMANDES PROGRAMMÉES</Lbl>
              {scheduled.sort((a,b)=>new Date(a.pickupAt)-new Date(b.pickupAt)).slice(0,3).map(o => {
                const m = minsUntil(o.pickupAt);
                return (
                  <div key={o.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1a1030" }}>
                    <div><span style={{ fontWeight:700 }}>{o.client}</span><span style={{ color:"#555",fontSize:12,marginLeft:8 }}>{o.phone}</span></div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color:"#8b5cf6",fontWeight:700,fontSize:13 }}>{fmtDT(o.pickupAt)}</div>
                      <div style={{ color:m<=60?"#f59e0b":"#555",fontSize:11 }}>dans {m>=60?`${Math.floor(m/60)}h${m%60>0?m%60+"min":""}`:`${m} min`}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {active.length > 0 && (
            <div style={{ textAlign:"left" }}>
              <Lbl>COMMANDES EN COURS</Lbl>
              {active.slice(0,3).map(o => (
                <div key={o.id} style={{ background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:10,padding:"11px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div><span style={{ fontWeight:700 }}>{o.client}</span><span style={{ color:"#444",fontSize:12,marginLeft:8 }}>{fmt(o.createdAt)}</span></div>
                  <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                    <span style={{ color:r.color,fontWeight:700 }}>{o.total.toFixed(2)}€</span>
                    <span style={{ background:SC[o.status].bg,color:SC[o.status].color,borderRadius:6,padding:"3px 8px",fontSize:11 }}>{SC[o.status].icon}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <style>{`@keyframes ring1{0%{transform:scale(.85);opacity:.7}100%{transform:scale(1.7);opacity:0}}`}</style>
        </div>
      )}

      {tab==="call" && calling && (
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ width:8,height:8,borderRadius:"50%",background:"#16a34a",display:"inline-block",animation:"blink 1s infinite" }} />
              <span style={{ color:"#16a34a",fontWeight:900,fontSize:12,letterSpacing:2 }}>APPEL EN COURS</span>
            </div>
            <button onClick={resetForm} style={{ background:"#1a0808",border:"1px solid #ef4444",borderRadius:8,padding:"6px 12px",color:"#ef4444",cursor:"pointer",fontWeight:700,fontSize:12 }}>✕ Raccrocher</button>
          </div>
          <div style={{ display:"flex",gap:4,marginBottom:16 }}>
            {[["info","1 · Client"],["items","2 · Articles"],["time","3 · Heure"],["confirm","4 · Confirmer"]].map(([id,lb]) => (
              <button key={id} onClick={()=>setStep(id)} style={{ flex:1,padding:"8px 2px",borderRadius:8,border:"none",background:step===id?r.color:"#141414",color:step===id?"#060606":"#444",cursor:"pointer",fontWeight:800,fontSize:10 }}>{lb}</button>
            ))}
          </div>
          {step==="info" && (
            <Pane color={r.color} title="👤 CLIENT">
              <FInp label="NOM DU CLIENT *" val={clientName} set={setClientName} icon="👤" />
              <FInp label="TÉLÉPHONE" val={clientPhone} set={setClientPhone} icon="📱" />
              <div style={{ display:"flex",gap:6,marginBottom:14 }}>
                {[["phone","📞 Tél"],["dine-in","🪑 Place"],["takeaway","🥡 Emporter"]].map(([v,lb]) => (
                  <button key={v} onClick={()=>setOrderType(v)} style={{ flex:1,padding:"9px 4px",borderRadius:8,border:`2px solid ${orderType===v?r.color:"#1e1e1e"}`,background:orderType===v?`${r.color}22`:"transparent",color:orderType===v?r.color:"#444",cursor:"pointer",fontWeight:700,fontSize:11 }}>{lb}</button>
                ))}
              </div>
              <BigBtn color={r.color} onClick={()=>setStep("items")} disabled={!clientName}>Articles →</BigBtn>
            </Pane>
          )}
          {step==="items" && (
            <div>
              <Pane color="#16a34a" title="🎤 DICTER LA COMMANDE">
                <div style={{ textAlign:"center" }}>
                  {voice.supported ? (
                    <>
                      <button onClick={voice.active?voice.stop:voice.start} style={{ width:72,height:72,borderRadius:"50%",border:`3px solid ${voice.active?"#ef4444":"#16a34a"}`,background:voice.active?"#ef444412":"#16a34a12",cursor:"pointer",fontSize:30,outline:"none",animation:voice.active?"voicePulse 1.2s infinite":"none" }}>
                        {voice.active?"⏹":"🎤"}
                      </button>
                      <p style={{ color:voice.active?"#ef4444":"#555",fontSize:12,marginTop:8 }}>{voice.active?"🔴 En écoute...":'Ex: "un steak frites pour Jean"'}</p>
                      {voice.transcript && <div style={{ background:"#080f08",border:"1px solid #16a34a33",borderRadius:8,padding:10,color:"#86efac",fontSize:13,fontStyle:"italic" }}>"{voice.transcript}"</div>}
                    </>
                  ) : <div style={{ color:"#f59e0b",fontSize:12,background:"#1a1500",borderRadius:8,padding:12,border:"1px solid #f59e0b33" }}>⚠️ Micro disponible sur Chrome/Edge · Utilisez le menu ci-dessous</div>}
                </div>
              </Pane>
              <Pane color={r.color} title="🍽️ MENU">
                <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:12 }}>
                  {cats.map(c => <button key={c} onClick={()=>setCatFilter(c)} style={{ padding:"5px 11px",borderRadius:20,border:`1px solid ${catFilter===c?r.color:"#1e1e1e"}`,background:catFilter===c?r.color:"transparent",color:catFilter===c?"#060606":"#555",cursor:"pointer",fontSize:11,fontWeight:700 }}>{c}</button>)}
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:8 }}>
                  {menuItems.map(item => (
                    <button key={item.id} onClick={()=>addToCart(item)} style={{ background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:9,cursor:"pointer",textAlign:"center",color:"#fff",transition:"all .15s" }}
                      onMouseOver={e=>{e.currentTarget.style.borderColor=r.color;e.currentTarget.style.background=`${r.color}11`;}}
                      onMouseOut={e=>{e.currentTarget.style.borderColor="#1a1a1a";e.currentTarget.style.background="#111";}}>
                      <div style={{ fontSize:24 }}>{item.emoji}</div>
                      <div style={{ fontSize:10,fontWeight:700,margin:"3px 0" }}>{item.name}</div>
                      <div style={{ color:r.color,fontSize:11,fontWeight:800 }}>{item.price.toFixed(2)}€</div>
                    </button>
                  ))}
                </div>
              </Pane>
              {cart.length > 0 && (
                <Pane color={r.color} title={`🛒 PANIER (${cart.length})`}>
                  {cart.map(c => (
                    <div key={c.mid} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #141414" }}>
                      <span style={{ fontSize:20 }}>{c.emoji}</span><span style={{ flex:1,fontSize:13 }}>{c.name}</span>
                      <QB onClick={()=>setCart(p=>{const e=p.find(x=>x.mid===c.mid);return e.qty>1?p.map(x=>x.mid===c.mid?{...x,qty:x.qty-1}:x):p.filter(x=>x.mid!==c.mid)})}>−</QB>
                      <span style={{ width:22,textAlign:"center",fontWeight:800 }}>{c.qty}</span>
                      <QB onClick={()=>setCart(p=>p.map(x=>x.mid===c.mid?{...x,qty:x.qty+1}:x))}>+</QB>
                      <span style={{ color:r.color,fontWeight:700,width:50,textAlign:"right",fontSize:13 }}>{(c.price*c.qty).toFixed(2)}€</span>
                    </div>
                  ))}
                  <BigBtn color={r.color} onClick={()=>setStep("time")} style={{ marginTop:12 }}>Heure →</BigBtn>
                </Pane>
              )}
              <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            </div>
          )}
          {step==="time" && (
            <Pane color="#8b5cf6" title="🕐 HEURE DE RETRAIT">
              <PickupPicker value={pickupAt} onChange={setPickupAt} color="#8b5cf6" />
              <div style={{ background:"#0d0820",borderRadius:10,padding:12,marginBottom:14,fontSize:12,color:"#a78bfa" }}>
                ℹ️ Si l'heure est dans plus de 30 min → commande <strong>programmée</strong>, envoyée en cuisine 30 min avant automatiquement.
              </div>
              <BigBtn color="#8b5cf6" onClick={()=>setStep("confirm")} disabled={!pickupAt||minsUntil(pickupAt)<0}>Confirmer →</BigBtn>
            </Pane>
          )}
          {step==="confirm" && (
            <Pane color="#16a34a" title="✅ RÉCAPITULATIF">
              <div style={{ background:"#0a140a",borderRadius:10,padding:14,marginBottom:14 }}>
                <RR l="Client" v={clientName} c="#fff" bold /><RR l="Téléphone" v={clientPhone||"—"} c="#888" />
                <RR l="Type" v={{phone:"📞 Téléphone","dine-in":"🪑 Sur place",takeaway:"🥡 Emporter"}[orderType]} c="#fff" />
                <RR l="Prête pour" v={fmtDT(pickupAt)} c="#8b5cf6" bold />
                <div style={{ background:minsUntil(pickupAt)>30?"#0d0820":"#0a140a",border:`1px solid ${minsUntil(pickupAt)>30?"#8b5cf633":"#16a34a33"}`,borderRadius:8,padding:"8px 12px",margin:"8px 0",fontSize:12,color:minsUntil(pickupAt)>30?"#a78bfa":"#86efac" }}>
                  {minsUntil(pickupAt)>30?"🕐 Commande programmée — cuisine alertée 30 min avant":"⚡ Commande immédiate — envoyée en cuisine maintenant"}
                </div>
                <div style={{ borderTop:"1px solid #1a2e1a",margin:"10px 0" }} />
                {cart.map(c=><RR key={c.mid} l={`${c.emoji} ${c.name} ×${c.qty}`} v={`${(c.price*c.qty).toFixed(2)}€`} c={r.color} />)}
                <div style={{ borderTop:"1px solid #1a2e1a",margin:"10px 0" }} />
                <RR l="TOTAL" v={`${cart.reduce((s,c)=>s+c.price*c.qty,0).toFixed(2)}€`} c="#16a34a" bold />
              </div>
              <button onClick={submitOrder} style={{ width:"100%",background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:14,padding:17,fontSize:15,fontWeight:900,color:"#fff",cursor:"pointer",letterSpacing:2,textTransform:"uppercase",boxShadow:"0 8px 30px #16a34a44" }}>
                📡 VALIDER LA COMMANDE
              </button>
            </Pane>
          )}
        </div>
      )}
      {tab==="orders" && <OrdersPanel orders={orders.filter(o=>o.status!=="scheduled")} color={r.color} userRole="manager" mutate={mutate} userName={user.name} />}
      {tab==="sched"  && <ScheduledPanel orders={scheduled} color={r.color} mutate={mutate} />}
      {tab==="needs"  && <NeedsPanel needs={needs} rId={r.id} user={user} mutate={mutate} color={r.color} isManager />}
    </Shell>
  );
}

// ── CHEF APP ──────────────────────────────────────────────────────────────────
function ChefApp({ db, mutate, session, onLogout, syncing }) {
  const [tab, setTab] = useState("call");
  const [calling, setCalling] = useState(false);
  const [step, setStep] = useState("info");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [orderType, setOrderType] = useState("phone");
  const [cart, setCart] = useState([]);
  const [catFilter, setCatFilter] = useState("Tous");
  const [pickupAt, setPickupAt] = useState(defaultPickup);
  const { restaurant:r, user } = session;
  const orders = (db.orders||[]).filter(o => o.rId===r.id && ["pending","preparing","ready","scheduled"].includes(o.status));
  const needs  = (db.needs||[]).filter(n => n.rId===r.id);
  const menu   = db.menus?.[r.id] || [];
  const scheduled = orders.filter(o => o.status==="scheduled");
  const reservations = (db.reservations||[]).filter(rv => rv.rId===r.id);

  const addToCart = (item) => setCart(p => { const ex = p.find(x => x.mid===item.id); return ex ? p.map(x=>x.mid===item.id?{...x,qty:x.qty+1}:x) : [...p,{mid:item.id,name:item.name,price:item.price,qty:1,emoji:item.emoji}]; });
  const handleVoiceChef = useCallback((text) => {
    const lower = text.toLowerCase();
    menu.forEach(item => { if (lower.includes(item.name.toLowerCase())) addToCart(item); });
    const nm = text.match(/(?:pour|client|monsieur|madame)\s+([A-Za-zÀ-ɏ]+(?:\s+[A-Za-zÀ-ɏ]+)?)/i);
    if (nm) setClientName(nm[1].charAt(0).toUpperCase() + nm[1].slice(1));
  }, [menu]);
  const voiceChef = useVoice(handleVoiceChef);
  const resetChefForm = () => { setCart([]); setClientName(""); setClientPhone(""); setCalling(false); setStep("info"); setPickupAt(defaultPickup()); };
  const submitChefOrder = () => {
    if (!clientName || !cart.length || !pickupAt) return;
    const mins = minsUntil(pickupAt);
    const status = mins > 30 ? "scheduled" : "pending";
    const prepMin = Math.min(Math.max(...cart.map(c=>(menu.find(m=>m.id===c.mid)?.prep||15))),45);
    const order = { id:uid(), rId:r.id, client:clientName, phone:clientPhone, type:orderType, items:cart, total:cart.reduce((s,c)=>s+c.price*c.qty,0), prepMin, status, pickupAt, createdAt:ts(), by:user.name };
    mutate(d=>{ d.orders.push(order); return d; }, { type:"order", data:order });
    resetChefForm(); setTab("orders");
  };
  const cats = ["Tous", ...new Set(menu.map(m=>m.cat))];
  const menuItems = catFilter==="Tous" ? menu : menu.filter(m=>m.cat===catFilter);

  const tabs = [
    { id:"call",   icon:"📞", label:"Appel",        badge:0 },
    { id:"orders", icon:"📋", label:"Commandes",    badge:orders.filter(o=>!["paid","scheduled"].includes(o.status)).length },
    { id:"sched",  icon:"🕐", label:"Programmées",  badge:scheduled.length },
    { id:"needs",  icon:"🛒", label:"Besoins",      badge:needs.filter(n=>!n.done).length },
    { id:"res",    icon:"🪑", label:"Réserv.",       badge:reservations.filter(rv=>!rv.done&&new Date(rv.date)>=new Date()).length },
  ];
    return (
    <Shell session={session} onLogout={onLogout} tabs={tabs} activeTab={tab} setTab={setTab} syncing={syncing}>

      {tab==="call" && !calling && (
        <div style={{ textAlign:"center",paddingTop:60,minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
          <div style={{ color:"#555",fontSize:10,letterSpacing:3,marginBottom:36 }}>CUISINIER · PRISE DE COMMANDE</div>
          <div style={{ position:"relative",display:"inline-block",marginBottom:44 }}>
            <div style={{ position:"absolute",inset:-18,borderRadius:"50%",background:"#16a34a0e",animation:"ring1 2s ease-out infinite" }} />
            <button onClick={()=>setCalling(true)} style={{ position:"relative",width:160,height:160,borderRadius:"50%",border:"none",background:"linear-gradient(145deg,#16a34a,#15803d)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 0 50px #16a34a33" }}>
              <span style={{ fontSize:58 }}>📞</span>
              <span style={{ color:"#fff",fontWeight:900,fontSize:12,letterSpacing:3 }}>APPEL</span>
              <span style={{ color:"rgba(255,255,255,.5)",fontSize:10 }}>ENTRANT</span>
            </button>
          </div>
          <style>{`@keyframes ring1{0%{transform:scale(.85);opacity:.7}100%{transform:scale(1.7);opacity:0}}`}</style>
        </div>
      )}
      {tab==="call" && calling && (
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ width:8,height:8,borderRadius:"50%",background:"#16a34a",display:"inline-block",animation:"blink 1s infinite" }} />
              <span style={{ color:"#16a34a",fontWeight:900,fontSize:12,letterSpacing:2 }}>APPEL EN COURS</span>
            </div>
            <button onClick={resetChefForm} style={{ background:"#1a0808",border:"1px solid #ef4444",borderRadius:8,padding:"6px 12px",color:"#ef4444",cursor:"pointer",fontSize:12 }}>✕ Raccrocher</button>
          </div>
          <div style={{ display:"flex",gap:4,marginBottom:16 }}>
            {[["info","1.Client"],["items","2.Articles"],["time","3.Heure"],["confirm","4.Confirmer"]].map(([id,lb])=>(
              <button key={id} onClick={()=>setStep(id)} style={{ flex:1,padding:"8px 2px",borderRadius:8,border:"none",background:step===id?r.color:"#141414",color:step===id?"#060606":"#444",cursor:"pointer",fontWeight:800,fontSize:10 }}>{lb}</button>
            ))}
          </div>
          {step==="info" && (
            <Pane color={r.color} title="CLIENT">
              <FInp label="NOM DU CLIENT *" val={clientName} set={setClientName} icon="👤" />
              <FInp label="TELEPHONE" val={clientPhone} set={setClientPhone} icon="📱" />
              <div style={{ display:"flex",gap:6,marginBottom:14 }}>
                {[["phone","Tel"],["dine-in","Place"],["takeaway","Emporter"]].map(([v,lb])=>(
                  <button key={v} onClick={()=>setOrderType(v)} style={{ flex:1,padding:"9px 4px",borderRadius:8,border:`2px solid ${orderType===v?r.color:"#1e1e1e"}`,background:orderType===v?`${r.color}22`:"transparent",color:orderType===v?r.color:"#444",cursor:"pointer",fontWeight:700,fontSize:11 }}>{lb}</button>
                ))}
              </div>
              <BigBtn color={r.color} onClick={()=>setStep("items")} disabled={!clientName}>Articles</BigBtn>
            </Pane>
          )}
          {step==="items" && (
            <div>
              <Pane color={r.color} title="MENU">
                <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:12 }}>
                  {cats.map(c=><button key={c} onClick={()=>setCatFilter(c)} style={{ padding:"5px 11px",borderRadius:20,border:`1px solid ${catFilter===c?r.color:"#1e1e1e"}`,background:catFilter===c?r.color:"transparent",color:catFilter===c?"#060606":"#555",cursor:"pointer",fontSize:11,fontWeight:700 }}>{c}</button>)}
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:8 }}>
                  {menuItems.map(item=>(
                    <button key={item.id} onClick={()=>addToCart(item)} style={{ background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:9,cursor:"pointer",textAlign:"center",color:"#fff" }}
                      onMouseOver={e=>{e.currentTarget.style.borderColor=r.color;}} onMouseOut={e=>{e.currentTarget.style.borderColor="#1a1a1a";}}>
                      <div style={{ fontSize:24 }}>{item.emoji}</div>
                      <div style={{ fontSize:10,fontWeight:700,margin:"3px 0" }}>{item.name}</div>
                      <div style={{ color:r.color,fontSize:11,fontWeight:800 }}>{item.price.toFixed(2)}€</div>
                    </button>
                  ))}
                </div>
              </Pane>
              {cart.length > 0 && (
                <Pane color={r.color} title={`PANIER (${cart.length})`}>
                  {cart.map(c=>(
                    <div key={c.mid} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #141414" }}>
                      <span style={{ fontSize:20 }}>{c.emoji}</span><span style={{ flex:1,fontSize:13 }}>{c.name}</span>
                      <QB onClick={()=>setCart(p=>{const e=p.find(x=>x.mid===c.mid);return e.qty>1?p.map(x=>x.mid===c.mid?{...x,qty:x.qty-1}:x):p.filter(x=>x.mid!==c.mid)})}>-</QB>
                      <span style={{ width:22,textAlign:"center",fontWeight:800 }}>{c.qty}</span>
                      <QB onClick={()=>setCart(p=>p.map(x=>x.mid===c.mid?{...x,qty:x.qty+1}:x))}>+</QB>
                      <span style={{ color:r.color,fontWeight:700,width:50,textAlign:"right",fontSize:13 }}>{(c.price*c.qty).toFixed(2)}€</span>
                    </div>
                  ))}
                  <BigBtn color={r.color} onClick={()=>setStep("time")} style={{ marginTop:12 }}>Heure</BigBtn>
                </Pane>
              )}
            </div>
          )}
          {step==="time" && (
            <Pane color="#8b5cf6" title="HEURE DE RETRAIT">
              <PickupPicker value={pickupAt} onChange={setPickupAt} color="#8b5cf6" />
              <BigBtn color="#8b5cf6" onClick={()=>setStep("confirm")} disabled={!pickupAt||minsUntil(pickupAt)<0}>Confirmer</BigBtn>
            </Pane>
          )}
          {step==="confirm" && (
            <Pane color="#16a34a" title="RECAPITULATIF">
              <div style={{ background:"#0a140a",borderRadius:10,padding:14,marginBottom:14 }}>
                <RR l="Client" v={clientName} c="#fff" bold />
                <RR l="Type" v={{phone:"Tel","dine-in":"Sur place",takeaway:"Emporter"}[orderType]} c="#fff" />
                <RR l="Prete pour" v={fmtDT(pickupAt)} c="#8b5cf6" bold />
                <div style={{ borderTop:"1px solid #1a2e1a",margin:"10px 0" }} />
                {cart.map(c=><RR key={c.mid} l={`${c.emoji} ${c.name} x${c.qty}`} v={`${(c.price*c.qty).toFixed(2)}€`} c={r.color} />)}
                <div style={{ borderTop:"1px solid #1a2e1a",margin:"10px 0" }} />
                <RR l="TOTAL" v={`${cart.reduce((s,c)=>s+c.price*c.qty,0).toFixed(2)}€`} c="#16a34a" bold />
              </div>
              <button onClick={submitChefOrder} style={{ width:"100%",background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:14,padding:16,fontSize:15,fontWeight:900,color:"#fff",cursor:"pointer",letterSpacing:2 }}>
                VALIDER LA COMMANDE
              </button>
            </Pane>
          )}
        </div>
      )}

      {tab==="orders" && <OrdersPanel orders={orders.filter(o=>o.status!=="scheduled")} color={r.color} userRole="chef" mutate={mutate} userName={user.name} />}
      {tab==="sched"  && <ScheduledPanel orders={scheduled} color={r.color} mutate={mutate} />}
      {tab==="needs"  && <NeedsPanel needs={needs} rId={r.id} user={user} mutate={mutate} color={r.color} isManager />}
      {tab==="res"    && <ReservationsPanel reservations={reservations} rId={r.id} user={user} mutate={mutate} color={r.color} />}

    </Shell>
  );
}

function CashierApp({ db, mutate, session, onLogout, syncing }) {
  const [tab, setTab] = useState("cash");
  const { restaurant:r, user } = session;
  const menu   = db.menus?.[r.id] || [];
  const orders = (db.orders||[]).filter(o => o.rId===r.id);
  const needs  = (db.needs||[]).filter(n => n.rId===r.id);
  const reservations = (db.reservations||[]).filter(rv => rv.rId===r.id);
  const toEnc  = orders.filter(o => ["ready","served"].includes(o.status));
  const paidToday = orders.filter(o => o.status==="paid" && fmtD(o.createdAt)===fmtD(ts()));
  const todayCA = paidToday.reduce((s,o)=>s+o.total,0);
  const upcomingRes = reservations.filter(rv => !rv.done && new Date(rv.date) >= new Date(new Date().setHours(0,0,0,0)));



  const tabs = [
    { id:"cash", icon:"💳", label:"Caisse", badge: toEnc.length },
  ];

  return (
    <Shell session={session} onLogout={onLogout} tabs={tabs} activeTab={tab} setTab={setTab} syncing={syncing}>

      {/* ── CAISSE ── */}
      {tab==="cash" && (
        <div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16 }}>
            <StatCard icon="💰" label="CA Aujourd'hui" val={`${todayCA.toFixed(2)}€`} color={r.color} />
            <StatCard icon="✅" label="Payées" val={paidToday.length} color="#10b981" />
            <StatCard icon="⏳" label="À encaisser" val={toEnc.length} color="#f59e0b" />
          </div>
          <Lbl>💳 À ENCAISSER ({toEnc.length})</Lbl>
          {toEnc.length===0 ? <Empty icon="☕" text="Rien à encaisser" /> :
            toEnc.map(o => <CashierOrderCard key={o.id} order={o} color={r.color} mutate={mutate} userName={user.name} rId={r.id} />)}
          <Lbl style={{ marginTop:20 }}>📜 PAYÉES AUJOURD'HUI</Lbl>
          {paidToday.length===0 ? <Empty icon="📋" text="Aucune" /> :
            paidToday.map(o => <OrderCard key={o.id} order={o} color="#10b981" userRole="cashier" mutate={mutate} userName={user.name} readonly />)}
        </div>
      )}

      {/* ── CAISSE ── */}
      {tab==="cash" && (
        <div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16 }}>
            <StatCard icon="💰" label="CA Aujourd'hui" val={`${todayCA.toFixed(2)}€`} color={r.color} />
            <StatCard icon="✅" label="Payées" val={paidToday.length} color="#10b981" />
            <StatCard icon="⏳" label="À encaisser" val={toEnc.length} color="#f59e0b" />
          </div>
          <Lbl>💳 À ENCAISSER ({toEnc.length})</Lbl>
          {toEnc.length===0 ? <Empty icon="☕" text="Rien à encaisser" /> :
            toEnc.map(o => <CashierOrderCard key={o.id} order={o} color={r.color} mutate={mutate} userName={user.name} rId={r.id} />)}
          <Lbl style={{ marginTop:20 }}>📜 PAYÉES AUJOURD'HUI</Lbl>
          {paidToday.length===0 ? <Empty icon="📋" text="Aucune" /> :
            paidToday.map(o => <OrderCard key={o.id} order={o} color="#10b981" userRole="cashier" mutate={mutate} userName={user.name} readonly />)}
        </div>
      )}
    </Shell>
  );
}

function WaiterApp({ db, mutate, session, onLogout, syncing }) {
  const { restaurant:r, user } = session;
  const toServe = (db.orders||[]).filter(o => o.rId===r.id && o.status==="ready");
  const served  = (db.orders||[]).filter(o => o.rId===r.id && o.status==="served" && fmtD(o.createdAt)===fmtD(ts()));
  return (
    <Shell session={session} onLogout={onLogout} tabs={[]} activeTab="" setTab={()=>{}} syncing={syncing}>
      <Lbl>🍽️ À SERVIR ({toServe.length})</Lbl>
      {toServe.length===0?<Empty icon="😊" text="Rien à servir" />:toServe.map(o=><OrderCard key={o.id} order={o} color={r.color} userRole="waiter" mutate={mutate} userName={user.name} />)}
      <Lbl style={{ marginTop:18 }}>✅ SERVIES AUJOURD'HUI ({served.length})</Lbl>
      {served.map(o=><OrderCard key={o.id} order={o} color="#10b981" userRole="waiter" mutate={mutate} userName={user.name} readonly />)}
    </Shell>
  );
}


// ── CASHIER ORDER CARD — with payment modal ───────────────────────────────────
function CashierOrderCard({ order:o, color, mutate, userName, rId }) {
  const [open, setOpen] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState("cash");
  const [received, setReceived] = useState("");
  const sc = SC[o.status]; if (!sc) return null;

  const change = payMethod === "cash" && received ? Math.max(0, parseFloat(received) - o.total) : 0;

  const confirmPayment = () => {
    mutate(d => {
      const ord = d.orders.find(x => x.id === o.id);
      if (ord) { ord.status = "paid"; ord.payMethod = payMethod; ord.paidAt = new Date().toISOString(); ord.paidBy = userName; }
      return d;
    });
    setPaying(false);
  };

  return (
    <div style={{ background:"#0c0c0c",borderRadius:14,marginBottom:12,border:`2px solid ${color}55`,overflow:"hidden" }}>
      {/* Payment modal */}
      {paying && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"#111",borderRadius:20,padding:24,width:"100%",maxWidth:380,border:`2px solid ${color}44` }}>
            <div style={{ color:color,fontSize:11,letterSpacing:2,fontWeight:700,marginBottom:16 }}>💳 ENCAISSER LA COMMANDE</div>
            <div style={{ background:"#0a140a",borderRadius:10,padding:14,marginBottom:16 }}>
              <div style={{ fontSize:13,color:"#888",marginBottom:4 }}>Client</div>
              <div style={{ fontSize:18,fontWeight:900,color:"#fff",marginBottom:8 }}>{o.client}</div>
              <div style={{ fontSize:28,fontWeight:900,color:color,textAlign:"center",padding:"8px 0" }}>{o.total.toFixed(2)} €</div>
            </div>
            {/* Payment method */}
            <div style={{ color:"#555",fontSize:10,letterSpacing:2,marginBottom:10 }}>MODE DE PAIEMENT</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16 }}>
              {[["cash","💵","Espèces"],["card","💳","Carte"],["bancontact","📱","Bancontact"]].map(([v,ic,lb]) => (
                <button key={v} onClick={()=>setPayMethod(v)}
                  style={{ padding:"12px 6px",borderRadius:10,border:`2px solid ${payMethod===v?color:"#2a2a2a"}`,background:payMethod===v?`${color}22`:"transparent",cursor:"pointer",textAlign:"center" }}>
                  <div style={{ fontSize:24 }}>{ic}</div>
                  <div style={{ color:payMethod===v?color:"#666",fontSize:11,fontWeight:700,marginTop:4 }}>{lb}</div>
                </button>
              ))}
            </div>
            {/* Cash: montant reçu + rendu */}
            {payMethod === "cash" && (
              <div style={{ marginBottom:16 }}>
                <div style={{ color:"#555",fontSize:10,letterSpacing:2,marginBottom:8 }}>MONTANT REÇU</div>
                <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                  <input type="number" value={received} onChange={e=>setReceived(e.target.value)} placeholder={`Ex: ${Math.ceil(o.total/5)*5}.00`}
                    style={{ flex:1,background:"#1a1a1a",border:"1px solid #333",borderRadius:8,padding:"12px",color:"#fff",fontSize:18,outline:"none",textAlign:"right" }} />
                  <span style={{ display:"flex",alignItems:"center",color:"#fff",fontSize:18,fontWeight:700 }}>€</span>
                </div>
                {/* Quick amount buttons */}
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {[Math.ceil(o.total), Math.ceil(o.total/5)*5, Math.ceil(o.total/10)*10, Math.ceil(o.total/20)*20, Math.ceil(o.total/50)*50].filter((v,i,a)=>a.indexOf(v)===i).slice(0,5).map(amt => (
                    <button key={amt} onClick={()=>setReceived(amt.toString())}
                      style={{ padding:"6px 12px",borderRadius:20,border:`1px solid ${received==amt?color:"#333"}`,background:received==amt?`${color}22`:"transparent",color:received==amt?color:"#888",cursor:"pointer",fontSize:13,fontWeight:700 }}>
                      {amt}€
                    </button>
                  ))}
                </div>
                {received && parseFloat(received) >= o.total && (
                  <div style={{ background:"#0a2010",border:"1px solid #16a34a44",borderRadius:10,padding:"10px 14px",marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ color:"#888",fontSize:13 }}>Rendu monnaie</span>
                    <span style={{ color:"#10b981",fontSize:22,fontWeight:900 }}>{change.toFixed(2)} €</span>
                  </div>
                )}
              </div>
            )}
            {(payMethod !== "cash" || (received && parseFloat(received) >= o.total)) && (
              <button onClick={confirmPayment}
                style={{ width:"100%",background:`linear-gradient(135deg,${color},${color}aa)`,border:"none",borderRadius:12,padding:16,color:"#060606",fontWeight:900,fontSize:16,cursor:"pointer",letterSpacing:1 }}>
                ✅ CONFIRMER LE PAIEMENT
              </button>
            )}
            {payMethod === "cash" && (!received || parseFloat(received) < o.total) && (
              <div style={{ textAlign:"center",color:"#444",fontSize:12,marginTop:8 }}>Entrez le montant reçu pour continuer</div>
            )}
            <button onClick={()=>setPaying(false)} style={{ width:"100%",background:"transparent",border:"none",color:"#555",cursor:"pointer",padding:"10px",marginTop:8,fontSize:13 }}>← Annuler</button>
          </div>
        </div>
      )}

      <div style={{ padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10 }} onClick={()=>setOpen(!open)}>
        <div style={{ width:10,height:10,borderRadius:"50%",background:sc.color,flexShrink:0,boxShadow:`0 0 8px ${sc.color}` }} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between" }}>
            <span style={{ fontWeight:800,fontSize:15 }}>{o.client}</span>
            <span style={{ color:sc.color,fontSize:11,fontWeight:700 }}>{sc.icon} {sc.label}</span>
          </div>
          <div style={{ fontSize:11,color:"#444",marginTop:2 }}>
            {o.type==="phone"?"📞":o.type==="dine-in"?"🪑":"🥡"} {fmt(o.createdAt)}
            {o.phone?` · ${o.phone}`:""}
            &nbsp;·&nbsp;<strong style={{ color }}>{o.total.toFixed(2)}€</strong>
            {o.pickupAt && <span style={{ color:"#8b5cf6",marginLeft:6,fontWeight:700 }}>🕐 {fmtDT(o.pickupAt)}</span>}
          </div>
        </div>
        <span style={{ color:"#333",fontSize:11 }}>{open?"▲":"▼"}</span>
      </div>

      {open && (
        <div style={{ padding:"0 14px 14px",borderTop:"1px solid #141414" }}>
          {o.items.map((it,i)=>(
            <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #121212",fontSize:13 }}>
              <span>{it.emoji} {it.name} <span style={{ color:"#444" }}>×{it.qty}</span></span>
              <span style={{ color }}>{(it.price*it.qty).toFixed(2)}€</span>
            </div>
          ))}
          <div style={{ display:"flex",justifyContent:"space-between",padding:"9px 0",fontWeight:900,fontSize:15 }}>
            <span>TOTAL</span><span style={{ color }}>{o.total.toFixed(2)}€</span>
          </div>
          <button onClick={()=>setPaying(true)}
            style={{ width:"100%",background:`linear-gradient(135deg,${color},${color}88)`,border:"none",borderRadius:10,padding:14,color:"#fff",fontWeight:900,cursor:"pointer",fontSize:15,letterSpacing:1,boxShadow:`0 4px 20px ${color}33` }}>
            💳 ENCAISSER
          </button>
        </div>
      )}
    </div>
  );
}


// ── RESERVATIONS PANEL ────────────────────────────────────────────────────────
function ReservationsPanel({ reservations, rId, user, mutate, color }) {
  const [showAdd, setShowAdd] = useState(false);
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(() => { const d = new Date(); d.setHours(d.getHours()+1,0,0,0); return d.toISOString().slice(0,16); });
  const [tables, setTables] = useState(1);
  const [persons, setPersons] = useState(2);
  const [note, setNote] = useState("");

  const addRes = () => {
    if (!client || !date) return;
    const res = { id:uid(), rId, client, phone, date, tables, persons, note, createdAt:ts(), by:user.name, done:false };
    mutate(d => { d.reservations = [...(d.reservations||[]), res]; return d; });
    setClient(""); setPhone(""); setNote(""); setShowAdd(false);
  };

  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = [...reservations].filter(r => new Date(r.date) >= today && !r.done).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const past = [...reservations].filter(r => new Date(r.date) < today || r.done).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10);

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <Lbl>🪑 RÉSERVATIONS À VENIR ({upcoming.length})</Lbl>
        <button onClick={()=>setShowAdd(!showAdd)} style={{ background:`${color}22`,border:`1px solid ${color}44`,borderRadius:8,padding:"7px 14px",color,cursor:"pointer",fontWeight:700,fontSize:12 }}>+ Nouvelle</button>
      </div>

      {showAdd && (
        <Pane color={color} title="🪑 NOUVELLE RÉSERVATION">
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            <FInp label="NOM CLIENT *" val={client} set={setClient} icon="👤" />
            <FInp label="TÉLÉPHONE" val={phone} set={setPhone} icon="📱" />
          </div>
          <div style={{ marginBottom:13 }}>
            <div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:4 }}>DATE & HEURE *</div>
            <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)}
              style={{ width:"100%",background:"#141414",border:"1px solid #222",borderRadius:9,padding:"11px 12px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box",colorScheme:"dark" }} />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            <div>
              <div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:4 }}>NOMBRE DE TABLES</div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <QB onClick={()=>setTables(t=>Math.max(1,t-1))}>−</QB>
                <span style={{ width:30,textAlign:"center",fontWeight:800,color:"#fff",fontSize:18 }}>{tables}</span>
                <QB onClick={()=>setTables(t=>t+1)}>+</QB>
              </div>
            </div>
            <div>
              <div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:4 }}>NOMBRE DE PERSONNES</div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <QB onClick={()=>setPersons(p=>Math.max(1,p-1))}>−</QB>
                <span style={{ width:30,textAlign:"center",fontWeight:800,color:"#fff",fontSize:18 }}>{persons}</span>
                <QB onClick={()=>setPersons(p=>p+1)}>+</QB>
              </div>
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:4 }}>NOTE (allergies, préférences...)</div>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex: Anniversaire, végétarien..."
              style={{ width:"100%",background:"#141414",border:"1px solid #222",borderRadius:9,padding:"11px 12px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box" }} />
          </div>
          <BigBtn color={color} onClick={addRes} disabled={!client}>✅ Confirmer la réservation</BigBtn>
        </Pane>
      )}

      {upcoming.length === 0 ? <Empty icon="🪑" text="Aucune réservation à venir" /> :
        upcoming.map(res => {
          const d = new Date(res.date);
          const isToday = d.toDateString() === new Date().toDateString();
          const isSoon = (d - Date.now()) < 3600000 && (d - Date.now()) > 0;
          return (
            <div key={res.id} style={{ background: isSoon?"#1a0f00":"#0c0c0c", borderRadius:14, padding:16, marginBottom:10, border:`2px solid ${isSoon?"#f59e0b":color+"33"}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:800,fontSize:16,color:"#fff" }}>{res.client}</div>
                  <div style={{ color:"#555",fontSize:12,marginTop:2 }}>{res.phone}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color: isSoon?"#f59e0b":color, fontWeight:900, fontSize:14 }}>
                    {isToday ? `Aujourd'hui ${fmt(res.date)}` : fmtDT(res.date)}
                  </div>
                  {isSoon && <div style={{ color:"#f59e0b",fontSize:11,fontWeight:700 }}>⚠️ Dans moins d'1h !</div>}
                </div>
              </div>
              <div style={{ display:"flex",gap:16,marginBottom:12 }}>
                <div style={{ background:"#1a1a1a",borderRadius:8,padding:"8px 14px",textAlign:"center" }}>
                  <div style={{ fontSize:20 }}>🪑</div>
                  <div style={{ color:"#fff",fontWeight:700,fontSize:16 }}>{res.tables}</div>
                  <div style={{ color:"#555",fontSize:10 }}>table(s)</div>
                </div>
                <div style={{ background:"#1a1a1a",borderRadius:8,padding:"8px 14px",textAlign:"center" }}>
                  <div style={{ fontSize:20 }}>👥</div>
                  <div style={{ color:"#fff",fontWeight:700,fontSize:16 }}>{res.persons}</div>
                  <div style={{ color:"#555",fontSize:10 }}>personne(s)</div>
                </div>
                {res.note && (
                  <div style={{ flex:1,background:"#1a1a10",borderRadius:8,padding:"8px 12px",border:"1px solid #333" }}>
                    <div style={{ color:"#888",fontSize:10,marginBottom:2 }}>NOTE</div>
                    <div style={{ color:"#f59e0b",fontSize:13 }}>{res.note}</div>
                  </div>
                )}
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={()=>mutate(d=>{const r=d.reservations?.find(x=>x.id===res.id);if(r)r.done=true;return d;})}
                  style={{ flex:1,background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:10,padding:12,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13 }}>
                  ✅ Client arrivé
                </button>
                <button onClick={()=>mutate(d=>{d.reservations=d.reservations?.filter(x=>x.id!==res.id);return d;})}
                  style={{ background:"#1a0808",border:"1px solid #ef4444",borderRadius:10,padding:"0 14px",color:"#ef4444",cursor:"pointer",fontSize:18 }}>
                  🗑️
                </button>
              </div>
            </div>
          );
        })}

      {past.length > 0 && (
        <>
          <Lbl style={{ marginTop:20 }}>📜 PASSÉES ({past.length})</Lbl>
          {past.map(res => (
            <div key={res.id} style={{ background:"#0c0c0c",borderRadius:12,padding:"12px 14px",marginBottom:8,border:"1px solid #1e1e1e",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:.6 }}>
              <div>
                <div style={{ fontWeight:700 }}>{res.client}</div>
                <div style={{ color:"#555",fontSize:12 }}>{fmtDT(res.date)} · {res.persons} pers. · {res.tables} table(s)</div>
              </div>
              <button onClick={()=>mutate(d=>{d.reservations=d.reservations?.filter(x=>x.id!==res.id);return d;})}
                style={{ background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:18 }}>🗑️</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function OrderCard({ order:o, color, userRole, mutate, userName, readonly }) {
  const [open, setOpen] = useState(o.status==="pending");
  const sc = SC[o.status]; if (!sc) return null;
  const canAdv = !readonly && ROLE_ADV[userRole]?.includes(sc.next);
  const elapsed = Math.floor((Date.now()-new Date(o.createdAt))/60000);
  const late = elapsed>(o.prepMin||20) && ["pending","preparing"].includes(o.status);
  const advance = () => mutate(d=>{ const x=d.orders.find(i=>i.id===o.id); if(x) x.status=sc.next; return d; });
  return (
    <div style={{ background:"#0c0c0c",borderRadius:14,marginBottom:10,border:`1px solid ${late?"#ef4444":open?color+"44":"#181818"}`,overflow:"hidden" }}>
      <div style={{ padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10 }} onClick={()=>setOpen(!open)}>
        <div style={{ width:10,height:10,borderRadius:"50%",background:sc.color,flexShrink:0,boxShadow:`0 0 8px ${sc.color}` }} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between" }}>
            <span style={{ fontWeight:800,fontSize:14 }}>{o.client}</span>
            <span style={{ color:sc.color,fontSize:11,fontWeight:700 }}>{sc.icon} {sc.label}</span>
          </div>
          <div style={{ fontSize:11,color:"#444",marginTop:2 }}>
            {o.type==="phone"?"📞":o.type==="dine-in"?"🪑":"🥡"} {fmt(o.createdAt)}
            {o.phone?` · ${o.phone}`:""}
            &nbsp;·&nbsp;<strong style={{ color }}>{o.total.toFixed(2)}€</strong>
            {o.pickupAt && <span style={{ color:"#8b5cf6",marginLeft:6,fontWeight:700 }}>🕐 {fmtDT(o.pickupAt)}</span>}
            {late && <span style={{ color:"#ef4444",marginLeft:8,fontWeight:700 }}>⚠️ {elapsed}min</span>}
          </div>
        </div>
        <span style={{ color:"#333",fontSize:11 }}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"0 14px 14px",borderTop:"1px solid #141414" }}>
          {o.pickupAt && <div style={{ background:"#0d0820",border:"1px solid #8b5cf633",borderRadius:8,padding:"8px 12px",margin:"10px 0",fontSize:12,color:"#a78bfa" }}>🕐 Prête pour : <strong>{fmtDT(o.pickupAt)}</strong></div>}
          <div style={{ paddingTop:4 }}>
            {o.items.map((it,i)=>(
              <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #121212",fontSize:13 }}>
                <span>{it.emoji} {it.name} <span style={{ color:"#444" }}>×{it.qty}</span></span>
                <span style={{ color }}>{(it.price*it.qty).toFixed(2)}€</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",padding:"9px 0",fontWeight:900,fontSize:14 }}><span>TOTAL</span><span style={{ color }}>{o.total.toFixed(2)}€</span></div>
          <div style={{ color:"#444",fontSize:11,marginBottom:12 }}>⏱ Estimé: <strong style={{ color:"#f59e0b" }}>{o.prepMin||15} min</strong> · par <strong style={{ color:"#666" }}>{o.by}</strong></div>
          {canAdv && <button onClick={advance} style={{ width:"100%",background:`linear-gradient(135deg,${SC[sc.next].color},${SC[sc.next].color}88)`,border:"none",borderRadius:10,padding:13,color:"#fff",fontWeight:900,cursor:"pointer",fontSize:13,letterSpacing:1 }}>{SC[sc.next].icon} {SC[sc.next].label.toUpperCase()}</button>}
        </div>
      )}
    </div>
  );
}

function ScheduledPanel({ orders, color, mutate }) {
  const sorted = [...orders].sort((a,b)=>new Date(a.pickupAt)-new Date(b.pickupAt));
  return (
    <div>
      <Lbl>COMMANDES PROGRAMMÉES ({orders.length})</Lbl>
      {orders.length===0?<Empty icon="🕐" text="Aucune commande programmée" />:
        sorted.map(o => {
          const m = minsUntil(o.pickupAt);
          return (
            <div key={o.id} style={{ background:"#0d0820",border:"1px solid #8b5cf633",borderRadius:14,padding:14,marginBottom:10 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div><div style={{ fontWeight:800,fontSize:15 }}>{o.client}</div><div style={{ color:"#555",fontSize:12 }}>{o.phone} · par {o.by}</div></div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:"#8b5cf6",fontWeight:900,fontSize:14 }}>{fmtDT(o.pickupAt)}</div>
                  <div style={{ fontSize:11,color:m<=60?"#f59e0b":"#8b5cf6" }}>{m>=60?`dans ${Math.floor(m/60)}h${m%60>0?m%60+"min":""}`:`dans ${m} min`}</div>
                </div>
              </div>
              {o.items.map((it,i)=><div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1a1030",fontSize:13 }}><span>{it.emoji} {it.name} ×{it.qty}</span><span style={{ color }}>{(it.price*it.qty).toFixed(2)}€</span></div>)}
              <div style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",fontWeight:900 }}><span>TOTAL</span><span style={{ color }}>{o.total.toFixed(2)}€</span></div>
              <button onClick={()=>mutate(d=>{const x=d.orders.find(i=>i.id===o.id);if(x)x.status="pending";return d;})} style={{ width:"100%",background:"linear-gradient(135deg,#f59e0b,#d97706)",border:"none",borderRadius:10,padding:12,color:"#060606",fontWeight:900,cursor:"pointer",fontSize:13,marginTop:6 }}>
                🚀 Envoyer maintenant en cuisine
              </button>
            </div>
          );
        })}
    </div>
  );
}

function OrdersPanel({ orders, color, userRole, mutate, userName }) {
  const [f, setF] = useState("active");
  const shown = f==="active"?orders.filter(o=>o.status!=="paid"):orders;
  return (
    <div>
      <div style={{ display:"flex",gap:8,marginBottom:12 }}>
        {[["active","⚡ En cours"],["all","📋 Toutes"]].map(([id,lb])=>(
          <button key={id} onClick={()=>setF(id)} style={{ padding:"6px 12px",borderRadius:20,border:`1px solid ${f===id?color:"#1e1e1e"}`,background:f===id?`${color}22`:"transparent",color:f===id?color:"#444",cursor:"pointer",fontSize:12,fontWeight:700 }}>{lb}</button>
        ))}
      </div>
      {shown.length===0?<Empty icon="✨" text="Aucune commande" />:shown.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(o=><OrderCard key={o.id} order={o} color={color} userRole={userRole} mutate={mutate} userName={userName} />)}
    </div>
  );
}

function NeedsPanel({ needs, rId, user, mutate, color, isManager }) {
  const addNeed = useCallback((text) => {
    if (!text?.trim()) return;
    const need = { id:uid(), rId, text:text.trim(), by:user.name, avatar:user.avatar, createdAt:ts(), done:false };
    mutate(d=>{ d.needs.push(need); return d; }, { type:"need", data:need });
  }, [rId, user, mutate]);
  const pending = needs.filter(n=>!n.done); const done = needs.filter(n=>n.done);
  return (
    <div>
      <Pane color="#3b82f6" title="📣 SIGNALER UN BESOIN"><VoiceInput onSubmit={addNeed} placeholder='Ex: "il manque du beurre"' buttonLabel="Signaler" /></Pane>
      <Lbl>EN ATTENTE ({pending.length})</Lbl>
      {pending.length===0?<Empty icon="✅" text="Rien à acheter !" />:pending.map(n=>(
        <div key={n.id} style={{ background:"#0a0f1a",border:"1px solid #1e3050",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12 }}>
          {isManager && <button onClick={()=>mutate(d=>{const x=d.needs.find(i=>i.id===n.id);if(x)x.done=true;return d;})} style={{ width:26,height:26,borderRadius:"50%",border:"2px solid #3b82f6",background:"transparent",cursor:"pointer",flexShrink:0,color:"#3b82f6",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center" }}>✓</button>}
          <div style={{ flex:1 }}><div style={{ fontSize:14,fontWeight:600 }}>{n.text}</div><div style={{ color:"#444",fontSize:11,marginTop:2 }}>{n.avatar} {n.by} · {fmt(n.createdAt)}</div></div>
          {isManager && <button onClick={()=>mutate(d=>{d.needs=d.needs.filter(x=>x.id!==n.id);return d;})} style={{ background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:18 }}>🗑️</button>}
        </div>
      ))}
      {done.length>0 && (<><Lbl style={{ marginTop:16 }}>ACHETÉ ({done.length})</Lbl>{done.map(n=>(
        <div key={n.id} style={{ background:"#0a120a",border:"1px solid #1a2e1a",borderRadius:12,padding:"10px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,opacity:.55 }}>
          {isManager && <button onClick={()=>mutate(d=>{const x=d.needs.find(i=>i.id===n.id);if(x)x.done=false;return d;})} style={{ width:26,height:26,borderRadius:"50%",border:"none",background:"#16a34a",cursor:"pointer",color:"#fff",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>✓</button>}
          <div style={{ flex:1,textDecoration:"line-through",fontSize:13 }}>{n.text} <span style={{ color:"#444",fontSize:11 }}>· {n.by}</span></div>
          {isManager && <button onClick={()=>mutate(d=>{d.needs=d.needs.filter(x=>x.id!==n.id);return d;})} style={{ background:"none",border:"none",color:"#333",cursor:"pointer" }}>🗑️</button>}
        </div>
      ))}</>)}
    </div>
  );
}

function StockPanel({ inventory, color }) {
  return (<div><Lbl>INVENTAIRE</Lbl>{inventory.map(item=>{const crit=item.qty<=item.min;return(<div key={item.id} style={{ background:"#0c0c0c",borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${crit?"#ef4444":"#181818"}`,display:"flex",alignItems:"center",gap:12 }}>{crit&&<span>⚠️</span>}<div style={{ flex:1 }}><div style={{ fontWeight:700 }}>{item.name}</div><div style={{ fontSize:11,color:"#444" }}>Min: {item.min} {item.unit}</div></div><div style={{ textAlign:"center" }}><div style={{ fontSize:21,fontWeight:900,color:crit?"#ef4444":"#10b981" }}>{item.qty}</div><div style={{ fontSize:11,color:"#555" }}>{item.unit}</div></div></div>);})}</div>);
}

function SuperAdmin({ db, mutate, onLogout, syncing }) {
  const [tab, setTab] = useState("restaurants");
  const [nr, setNr] = useState({ name:"",logo:"🍽️",color:"#D4A017",address:"" });
  const [nu, setNu] = useState({ name:"",username:"",password:"",role:"chef",rId:"" });
  const [showNr,setShowNr]=useState(false); const [showNu,setShowNu]=useState(false);
  const rEmoji = { chef:"👨‍🍳",cashier:"💳",waiter:"🍽️",manager:"📋" };
  const addRest=()=>{ if(!nr.name)return; const id=uid(); mutate(d=>{d.restaurants.push({...nr,id});d.menus[id]=[];d.inventory[id]=[];return d;}); setNr({name:"",logo:"🍽️",color:"#D4A017",address:""}); setShowNr(false); };
  const addUser=()=>{ if(!nu.name||!nu.username||!nu.rId)return; mutate(d=>{d.users.push({...nu,id:uid(),avatar:rEmoji[nu.role]||"👤"});return d;}); setNu({name:"",username:"",password:"",role:"chef",rId:""}); setShowNu(false); };
  return (
    <div style={{ minHeight:"100vh",background:"#060606",fontFamily:"Georgia,serif",color:"#fff" }}>
      <header style={{ background:"linear-gradient(135deg,#0d0d0d,#1a1a2e)",borderBottom:"1px solid #1e1e2e",padding:"12px 16px",display:"flex",alignItems:"center",gap:12 }}>
        <span style={{ fontSize:34 }}>👑</span>
        <div style={{ flex:1 }}><div style={{ fontWeight:900,letterSpacing:2,fontSize:14 }}>SUPER ADMINISTRATEUR</div><div style={{ color:"#444",fontSize:11 }}>RestauPro · Toutes les données en temps réel ✅</div></div>
        {syncing && <span style={{ color:"#555",fontSize:11,animation:"pulse 1s infinite" }}>⏳</span>}
        <button onClick={onLogout} style={{ background:"#111",border:"1px solid #222",borderRadius:8,padding:"6px 10px",color:"#666",cursor:"pointer" }}>🚪</button>
      </header>
      <div style={{ display:"flex",background:"#0a0a0a",borderBottom:"1px solid #161616" }}>
        {[["restaurants","🏪","Restaurants"],["users","👥","Utilisateurs"]].map(([id,ic,lb])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1,padding:12,background:"none",border:"none",borderBottom:tab===id?"3px solid #D4A017":"3px solid transparent",color:tab===id?"#D4A017":"#444",cursor:"pointer",fontWeight:700 }}>{ic} {lb}</button>
        ))}
      </div>
      <div style={{ padding:14,maxWidth:700,margin:"0 auto" }}>
        {tab==="restaurants" && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}><Lbl>RESTAURANTS ({(db.restaurants||[]).length})</Lbl><button onClick={()=>setShowNr(!showNr)} style={addBtnS}>+ Nouveau</button></div>
            {showNr && <div style={{ background:"#111",borderRadius:12,padding:14,marginBottom:14,border:"1px solid #D4A01733" }}><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}><SI ph="Nom" val={nr.name} set={v=>setNr(p=>({...p,name:v}))} /><SI ph="Emoji logo" val={nr.logo} set={v=>setNr(p=>({...p,logo:v}))} /><SI ph="Adresse" val={nr.address} set={v=>setNr(p=>({...p,address:v}))} /><div style={{ display:"flex",gap:8,alignItems:"center" }}><input type="color" value={nr.color} onChange={e=>setNr(p=>({...p,color:e.target.value}))} style={{ width:44,height:40,border:"none",borderRadius:6,cursor:"pointer" }} /><span style={{ color:"#555",fontSize:12 }}>Couleur</span></div></div><BigBtn color="#D4A017" onClick={addRest}>✅ Créer</BigBtn></div>}
            {(db.restaurants||[]).map(r=>(
              <div key={r.id} style={{ background:"#0f0f0f",borderRadius:14,padding:14,marginBottom:10,border:`1px solid ${r.color}33`,display:"flex",alignItems:"center",gap:14 }}>
                <span style={{ fontSize:40 }}>{r.logo}</span>
                <div style={{ flex:1 }}><div style={{ fontWeight:800,fontSize:15 }}>{r.name}</div><div style={{ color:"#555",fontSize:12 }}>{r.address}</div><div style={{ fontSize:11,color:"#444",marginTop:3 }}>👥 {(db.users||[]).filter(u=>u.rId===r.id).length} · 🍽️ {(db.menus?.[r.id]||[]).length} plats</div></div>
                <button onClick={()=>mutate(d=>{d.restaurants=d.restaurants.filter(x=>x.id!==r.id);d.users=d.users.filter(u=>u.rId!==r.id);delete d.menus[r.id];delete d.inventory[r.id];return d;})} style={{ background:"#1a0808",border:"1px solid #ef4444",borderRadius:8,padding:"7px 11px",color:"#ef4444",cursor:"pointer" }}>🗑️</button>
              </div>
            ))}
          </div>
        )}
        {tab==="users" && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}><Lbl>UTILISATEURS ({(db.users||[]).length})</Lbl><button onClick={()=>setShowNu(!showNu)} style={addBtnS}>+ Nouveau</button></div>
            {showNu && <div style={{ background:"#111",borderRadius:12,padding:14,marginBottom:14,border:"1px solid #D4A01733" }}><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}><SI ph="Nom complet" val={nu.name} set={v=>setNu(p=>({...p,name:v}))} /><SI ph="Identifiant" val={nu.username} set={v=>setNu(p=>({...p,username:v}))} /><SI ph="Mot de passe" val={nu.password} set={v=>setNu(p=>({...p,password:v}))} type="password" /><select value={nu.role} onChange={e=>setNu(p=>({...p,role:e.target.value}))} style={selS}><option value="chef">👨‍🍳 Cuisinier</option><option value="cashier">💳 Caissier</option><option value="waiter">🍽️ Serveur</option><option value="manager">📋 Gérant</option></select><select value={nu.rId} onChange={e=>setNu(p=>({...p,rId:e.target.value}))} style={{...selS,gridColumn:"1/-1"}}><option value="">-- Restaurant --</option>{(db.restaurants||[]).map(r=><option key={r.id} value={r.id}>{r.logo} {r.name}</option>)}</select></div><BigBtn color="#D4A017" onClick={addUser}>✅ Créer</BigBtn></div>}
            {(db.users||[]).map(u=>{const rest=(db.restaurants||[]).find(r=>r.id===u.rId);const rL={chef:"Cuisinier",cashier:"Caissier",waiter:"Serveur",manager:"Gérant"};return(<div key={u.id} style={{ background:"#0f0f0f",borderRadius:12,padding:"12px 14px",marginBottom:8,border:"1px solid #181818",display:"flex",alignItems:"center",gap:12 }}><span style={{ fontSize:28 }}>{u.avatar}</span><div style={{ flex:1 }}><div style={{ fontWeight:700 }}>{u.name}</div><div style={{ fontSize:12,color:"#555" }}>@{u.username} · {rL[u.role]}</div>{rest&&<div style={{ fontSize:11,color:"#444" }}>{rest.logo} {rest.name}</div>}</div><button onClick={()=>mutate(d=>{d.users=d.users.filter(x=>x.id!==u.id);return d;})} style={{ background:"#1a0808",border:"1px solid #ef4444",borderRadius:8,padding:"7px 11px",color:"#ef4444",cursor:"pointer" }}>🗑️</button></div>);})}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MICRO HELPERS ─────────────────────────────────────────────────────────────
function Pane({ color, title, children }) { return <div style={{ background:"#0c0c0c",border:`1px solid ${color}22`,borderRadius:14,padding:14,marginBottom:14 }}><div style={{ color,fontSize:10,letterSpacing:2,fontWeight:700,marginBottom:12 }}>{title}</div>{children}</div>; }
function FInp({ label, val, set, icon, type="text", onEnter }) {
  return (<div style={{ marginBottom:13 }}><div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:4 }}>{label}</div><div style={{ position:"relative" }}><span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:16 }}>{icon}</span><input type={type} value={val} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onEnter?.()} style={{ width:"100%",background:"#141414",border:"1px solid #222",borderRadius:9,padding:"11px 11px 11px 38px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif" }} /></div></div>);
}
function SI({ ph, val, set, type="text" }) { return <input type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)} style={{ background:"#181818",border:"1px solid #222",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"Georgia,serif",width:"100%",boxSizing:"border-box" }} />; }
function BigBtn({ color, onClick, children, disabled, style={} }) { return <button onClick={onClick} disabled={disabled} style={{ width:"100%",background:disabled?"#141414":`linear-gradient(135deg,${color},${color}aa)`,border:"none",borderRadius:10,padding:13,color:disabled?"#333":"#060606",fontWeight:900,cursor:disabled?"not-allowed":"pointer",fontSize:14,letterSpacing:1,fontFamily:"Georgia,serif",...style }}>{children}</button>; }
function QB({ onClick, children }) { return <button onClick={onClick} style={{ width:28,height:28,borderRadius:6,border:"1px solid #222",background:"#141414",color:"#fff",cursor:"pointer",fontWeight:900,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",padding:0 }}>{children}</button>; }
function RR({ l, v, c, bold }) { return <div style={{ display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13 }}><span style={{ color:"#555" }}>{l}</span><span style={{ color:c||"#fff",fontWeight:bold?900:400 }}>{v}</span></div>; }
function ModeBtn({ active, color="#D4A017", onClick, children }) { return <button onClick={onClick} style={{ flex:1,padding:"8px",borderRadius:8,border:`2px solid ${active?color:"#222"}`,background:active?`${color}22`:"transparent",color:active?color:"#555",cursor:"pointer",fontWeight:700,fontSize:12 }}>{children}</button>; }
function StatCard({ icon, label, val, color }) { return <div style={{ background:"#0c0c0c",borderRadius:12,padding:14,border:`1px solid ${color}22`,textAlign:"center" }}><div style={{ fontSize:24 }}>{icon}</div><div style={{ fontSize:21,fontWeight:900,color,margin:"4px 0" }}>{val}</div><div style={{ fontSize:11,color:"#444" }}>{label}</div></div>; }
function Lbl({ children, style={} }) { return <div style={{ color:"#444",fontSize:10,letterSpacing:3,marginBottom:9,...style }}>{children}</div>; }
function Empty({ icon, text }) { return <div style={{ textAlign:"center",padding:"36px 20px",color:"#2a2a2a" }}><div style={{ fontSize:44,marginBottom:10 }}>{icon}</div><div style={{ fontSize:14 }}>{text}</div></div>; }
const addBtnS = { background:"#D4A01711",border:"1px solid #D4A01733",borderRadius:8,padding:"6px 14px",color:"#D4A017",cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"Georgia,serif" };
const selS = { background:"#181818",border:"1px solid #222",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:13,fontFamily:"Georgia,serif",outline:"none",width:"100%",boxSizing:"border-box" };
