import { useState, useEffect, useRef } from "react";
import { getItems, createItem, updateItem, verifyPassword } from "./api";

const CATEGORIES = ["Todas","CONSUMIBLE","ACCESORIO","ILUMINACION","MELAMINA","MADERA","DECORACION","SERVICIO"];
const UMS = ["UND","MT","CJA","PAR","KG","RLL","PL","M2","GL","CTO","KIT","LT"];

const COLORS = { CONSUMIBLE:"#38bdf8", ACCESORIO:"#c084fc", ILUMINACION:"#facc15", MELAMINA:"#4ade80", MADERA:"#fb923c", DECORACION:"#f87171", SERVICIO:"#9ca3af" };
const BG = { CONSUMIBLE:"rgba(56,189,248,0.12)", ACCESORIO:"rgba(192,132,252,0.12)", ILUMINACION:"rgba(250,204,21,0.12)", MELAMINA:"rgba(74,222,128,0.12)", MADERA:"rgba(251,146,60,0.12)", DECORACION:"rgba(248,113,113,0.12)", SERVICIO:"rgba(156,163,175,0.12)" };

const MARCAS = ["Afix","Arauco","Danco","Durolac","Duratex","D' Mueble","Ducasse","Formma","Halcon","Indeco","Lecco","Mas Casa","Medelac","Opalux","Pelikano","Somafix","Soudal","Soldiflex","S/M","Tableros Hispanos","—"];

const emptyForm = { nombre:"", caracteristicas:"", categoria:"", precio:"", um:"", marca:"", proveedor:"", notas:"" };

const overlayStyle = { position:"fixed", inset:0, background:"rgba(11,17,32,0.92)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 };
const inputStyle = { width:"100%", boxSizing:"border-box", marginBottom:10, borderRadius:10, border:"0.5px solid var(--border-hover)", background:"var(--bg-secondary)", color:"var(--text-primary)", padding:"7px 11px", fontSize:14, outline:"none" };
const labelStyle = { fontSize:12, color:"var(--text-muted)", display:"block", marginBottom:3 };
const cardStyle = { background:"var(--bg-elevated)", borderRadius:16, padding:"1.5rem", border:"0.5px solid var(--border)", color:"var(--text-primary)" };

function Combobox({ label, value, onChange, options, placeholder, readonly, style }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = readonly ? options : options.filter(o => o.toLowerCase().includes(value.toLowerCase()));
  const pad = readonly && !label ? "9px 12px" : "7px 11px";

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position:"relative", ...style }}>
      {label && <label style={labelStyle}>{label}</label>}
      <input value={value} readOnly={readonly} onChange={e => { if (!readonly) onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} placeholder={placeholder} style={{...inputStyle, padding:pad, marginBottom: readonly && !label ? 0 : undefined, cursor: readonly ? "pointer" : undefined}} />
      {open && filtered.length > 0 && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:999,
          background:"var(--bg-elevated)", border:"0.5px solid var(--border)",
          borderRadius:8, maxHeight:180, overflowY:"auto", marginTop:2 }}>
          {filtered.map(o => (
            <div key={o} onClick={() => { onChange(o); setOpen(false); }}
              style={{ padding:"6px 10px", cursor:"pointer", fontSize:13, color:"var(--text-primary)" }}
              onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ cat }) {
  return <span style={{ fontSize:11, fontWeight:500, padding:"2px 8px", borderRadius:20, background:BG[cat]||"#eee", color:COLORS[cat]||"#333" }}>{cat}</span>;
}

function FormModal({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(initial || emptyForm);
  const set = (k, v) => setForm(f=>({...f, [k]:v}));
  const valid = form.nombre.trim() && form.precio !== "";

  const fld = (label, key, placeholder, type="text") => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder}
        style={inputStyle} min={type==="number"?0:undefined} step={type==="number"?"0.01":undefined}/>
    </div>
  );

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={e=>e.stopPropagation()} style={{...cardStyle, width:420, maxHeight:"90vh", overflowY:"auto", position:"relative", zIndex:201}}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:600, color:"var(--text-primary)" }}>{initial ? "Editar artículo" : "Nuevo artículo"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"var(--text-muted)", lineHeight:1 }}>×</button>
        </div>
        {fld("Nombre *","nombre","Ejemplo: accesorio")}
        <div>
          <label style={labelStyle}>Características</label>
          <textarea value={form.caracteristicas} onChange={e=>set("caracteristicas",e.target.value)}
            placeholder="Descripción detallada" rows={2} style={{...inputStyle, resize:"vertical"}}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <Combobox label="Categoría" value={form.categoria} onChange={v => set("categoria", v)} options={CATEGORIES.slice(1)} placeholder="Seleccionar" />
          <Combobox label="U.M." value={form.um} onChange={v => set("um", v)} options={UMS} placeholder="Seleccionar" />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {fld("Precio (S/) *","precio","0.00","number")}
          <Combobox label="Marca" value={form.marca} onChange={v => set("marca", v)} options={MARCAS} placeholder="Buscar o escribir" />
        </div>
        {fld("Proveedor","proveedor","Nombre del proveedor")}
        <div>
          <label style={labelStyle}>Notas opcionales</label>
          <textarea value={form.notas} onChange={e=>set("notas",e.target.value)}
            placeholder="Observaciones, estado, etc." rows={2} style={{...inputStyle, resize:"vertical"}}/>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8 }}>
          <button onClick={onClose} style={{ fontSize:13, background:"var(--bg-secondary)", border:"0.5px solid var(--border)", color:"var(--text-primary)", borderRadius:8, padding:"6px 14px", cursor:"pointer" }}>Cancelar</button>
          <button disabled={!valid || loading} onClick={()=>{ if(valid) onSave({...form, precio: parseFloat(form.precio)||0}); }}
            style={{ background: valid?"var(--accent)":"var(--bg-hover)", color:"#fff", border:"none", borderRadius:8, padding:"6px 18px", cursor: valid?"pointer":"not-allowed", fontWeight:500, fontSize:14 }}>
            {loading ? "Guardando..." : initial ? "Guardar cambios" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordModal({ error, busy, value, onChange, onCancel, onSubmit }) {
  return (
    <div onClick={onCancel} style={overlayStyle}>
      <div onClick={e=>e.stopPropagation()} style={{...cardStyle, width:320}}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
          <h2 style={{ margin:0, fontSize:15, fontWeight:600, color:"var(--text-primary)" }}>Desbloquear edición</h2>
          <button onClick={onCancel} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"var(--text-muted)", lineHeight:1 }}>×</button>
        </div>
        <p style={{ margin:"0 0 10px", fontSize:13, color:"var(--text-muted)" }}>Ingresa la contraseña para poder editar el catálogo.</p>
        <input type="password" value={value} onChange={e=>onChange(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter" && value && !busy) onSubmit(); }}
          placeholder="Contraseña" style={inputStyle} autoFocus/>
        {error && <p style={{ margin:"0 0 8px", fontSize:12, color:"var(--danger)" }}>Contraseña incorrecta</p>}
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:6 }}>
          <button onClick={onCancel} style={{ fontSize:13, background:"var(--bg-secondary)", border:"0.5px solid var(--border)", color:"var(--text-primary)", borderRadius:8, padding:"6px 14px", cursor:"pointer" }}>Cancelar</button>
          <button disabled={!value || busy} onClick={onSubmit}
            style={{ background: value?"var(--accent)":"var(--bg-hover)", color:"#fff", border:"none", borderRadius:8, padding:"6px 16px", cursor: value?"pointer":"not-allowed", fontWeight:500, fontSize:13 }}>
            {busy ? "Verificando..." : "Desbloquear"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose, onEdit, canEdit }) {
  const fields = [["Características",item.caracteristicas],["U.M.",item.um],["Marca",item.marca],["Proveedor",item.proveedor],["Notas",item.notas]];
  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={e=>e.stopPropagation()} style={{...cardStyle, width:390, maxHeight:"88vh", overflowY:"auto"}}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ width:52, height:52, borderRadius:10, background:BG[item.categoria]||"var(--bg-hover)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
                <span style={{ fontSize:24, color:COLORS[item.categoria], fontWeight:500 }}>{item.nombre[0]}</span>
              </div>
              <div>
                <p style={{ margin:"0 0 4px", fontWeight:500, fontSize:17, color:"var(--text-primary)" }}>{item.nombre}</p>
                <Badge cat={item.categoria}/>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"var(--text-muted)", lineHeight:1 }}>×</button>
          </div>
          <div style={{ borderTop:"0.5px solid var(--border)", paddingTop:10 }}>
            {fields.map(([k,v])=> v ? (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"0.5px solid var(--border)", fontSize:14 }}>
                <span style={{ color:"var(--text-muted)" }}>{k}</span>
                <span style={{ color:"var(--text-primary)", textAlign:"right", maxWidth:"58%", wordBreak:"break-word" }}>{v}</span>
              </div>
            ) : null)}
          </div>
          <div style={{ marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:22, fontWeight:600, color:"var(--accent-light)" }}>S/ {Number(item.precio).toFixed(2)} <span style={{ fontSize:13, fontWeight:400, color:"var(--text-muted)" }}>/ {item.um}</span></span>
            {canEdit && <button onClick={onEdit} style={{ fontSize:13, background:"var(--bg-secondary)", border:"0.5px solid var(--border)", color:"var(--text-primary)", borderRadius:8, padding:"5px 12px", cursor:"pointer" }}>Editar</button>}
          </div>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todas");
  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem("pw_unlocked") === "1");
  const [pwOpen, setPwOpen] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const passwordRef = useRef(null);

  const fetchItems = async () => {
    try {
      const data = await getItems();
      setItems(data || []);
    } catch {
      setError("Error al cargar los artículos.");
    }
    setLoadingData(false);
  };

  useEffect(() => {
    getItems().then(data => {
      setItems(data || []);
      setLoadingData(false);
    }).catch(() => {
      setError("Error al cargar los artículos.");
      setLoadingData(false);
    });
  }, []);

  const unlock = async () => {
    setPwBusy(true);
    setPwError(false);
    try {
      await verifyPassword(pwInput);
      passwordRef.current = pwInput;
      setUnlocked(true);
      localStorage.setItem("pw_unlocked", "1");
      setPwOpen(false);
      setPwInput("");
    } catch {
      setPwError(true);
    }
    setPwBusy(false);
  };

  const lock = () => {
    passwordRef.current = null;
    setUnlocked(false);
    localStorage.removeItem("pw_unlocked");
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const match = !q || i.nombre.toLowerCase().includes(q) || (i.marca||"").toLowerCase().includes(q) || (i.proveedor||"").toLowerCase().includes(q);
    const cat = catFilter === "Todas" || i.categoria === catFilter;
    return match && cat;
  }).sort((a, b) => a.nombre.localeCompare(b.nombre));

  const save = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await updateItem({ ...form, id: editing.id }, passwordRef.current);
        await fetchItems();
        setDetail({ ...form, id: editing.id });
      } else {
        await createItem(form, passwordRef.current);
        await fetchItems();
      }
    } catch {
      setError("Error al guardar.");
    }
    setSaving(false);
    setEditing(null);
    setFormOpen(false);
  };

  return (
    <div style={{ padding:"1rem 1.25rem", fontFamily:"var(--font-sans)" }}>
      <h2 style={{ position:"absolute", left:"-9999px" }}>Catálogo de materiales del negocio</h2>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem", flexWrap:"wrap", gap:8 }}>
        <div>
          <p style={{ margin:0, fontSize:20, fontWeight:500, color:"var(--color-text-primary)" }}>Catálogo de materiales</p>
          <p style={{ margin:0, fontSize:13, color:"var(--color-text-secondary)" }}>{items.length} artículo{items.length!==1?"s":""} registrado{items.length!==1?"s":""}</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {unlocked ? (
            <>
              <span style={{ fontSize:12, fontWeight:500, padding:"4px 10px", borderRadius:20, background:"var(--accent-subtle)", color:"var(--accent)" }}>Modo edición</span>
              <button onClick={lock} style={{ background:"var(--bg-secondary)", color:"var(--text-primary)", border:"0.5px solid var(--border)", borderRadius:8, padding:"7px 14px", cursor:"pointer", fontWeight:500, fontSize:13 }}>Bloquear</button>
              <button onClick={()=>{ setEditing(null); setFormOpen(true); }} style={{ background:"#5a32b0", color:"#fff", border:"none", borderRadius:8, padding:"7px 16px", cursor:"pointer", fontWeight:500, fontSize:14 }}>+ Nuevo artículo</button>
            </>
          ) : (
            <button onClick={()=>setPwOpen(true)} style={{ background:"var(--bg-secondary)", color:"var(--text-primary)", border:"0.5px solid var(--border)", borderRadius:8, padding:"7px 14px", cursor:"pointer", fontWeight:500, fontSize:13 }}>Desbloquear edición</button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background:"var(--danger-subtle)", color:"var(--danger)", padding:"10px 14px", borderRadius:8, marginBottom:12, fontSize:14, display:"flex", justifyContent:"space-between" }}>
          {error} <span style={{ cursor:"pointer", fontWeight:500 }} onClick={()=>setError(null)}>×</span>
        </div>
      )}

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:"1rem", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, marca o proveedor..." style={{ flex:1, minWidth:180, borderRadius:10, padding:"9px 12px", background:"var(--bg-secondary)", border:"1px solid var(--border)", color:"var(--text-primary)", fontSize:14, outline:"none" }}/>
        <Combobox value={catFilter} onChange={v => setCatFilter(v)} options={CATEGORIES} placeholder="Filtrar" readonly style={{ minWidth:140, width:140 }} />
      </div>

      {loadingData ? (
        <div style={{ textAlign:"center", padding:"3rem 0", color:"var(--color-text-secondary)", fontSize:14 }}>Cargando artículos...</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.map(item => (
            <div key={item.id} style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, padding:"4px 14px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
              onClick={()=>setDetail(item)}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-border-secondary)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--color-border-tertiary)"}>
              <div style={{ width:40, height:40, borderRadius:8, background:BG[item.categoria]||"#eee", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                <span style={{ fontSize:18, color:COLORS[item.categoria]||"#888", fontWeight:500 }}>{item.nombre[0]}</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontWeight:500, fontSize:14, color:"var(--color-text-primary)" }}>{item.nombre}</p>
                <p style={{ margin:0, fontSize:12, color:"var(--color-text-secondary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.marca} · {item.proveedor}</p>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <Badge cat={item.categoria}/>
                <p style={{ margin:"4px 0 4px", fontWeight:600, fontSize:14, color:"var(--accent)" }}>S/ {Number(item.precio).toFixed(2)}<span style={{ fontWeight:400, fontSize:11, color:"var(--color-text-secondary)" }}> /{item.um}</span></p>
                <div onClick={e=>e.stopPropagation()}>
                  {unlocked && (
                    <button onClick={()=>{ setEditing(item); setFormOpen(true); }} style={{ fontSize:11, padding:"2px 8px", borderRadius:5, background:"var(--bg-secondary)", border:"0.5px solid var(--border)", color:"var(--text-muted)", cursor:"pointer", fontWeight:500 }}>Editar</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loadingData && filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"3rem 0", color:"var(--color-text-secondary)", fontSize:14 }}>
          {items.length === 0 ? "Aún no hay artículos. ¡Agrega el primero!" : "No se encontraron artículos con ese criterio."}
        </div>
      )}

      {detail && !formOpen && (
        <DetailModal item={detail} onClose={()=>setDetail(null)} onEdit={()=>{ setEditing(detail); setFormOpen(true); }} canEdit={unlocked}/>
      )}

      {formOpen && (
        <FormModal initial={editing} onSave={save} onClose={()=>{ setFormOpen(false); setEditing(null); }} loading={saving}/>
      )}

      {pwOpen && (
        <PasswordModal error={pwError} busy={pwBusy} value={pwInput} onChange={setPwInput}
          onCancel={()=>{ setPwOpen(false); setPwInput(""); setPwError(false); }}
          onSubmit={unlock}/>
      )}
    </div>  
  );
}