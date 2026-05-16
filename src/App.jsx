import { useState, useRef } from "react";

const CATEGORIES = ["Todas","Material","Accesorio","Herramienta","Insumo","Otro"];
const UMS = ["UND","MT","CJA","PAR","KG","RLL","PL","M2","GL","CTO","MLL","KIT"];

const SAMPLE = [
  { id: 1, nombre: "Tela Canvas", caracteristicas: "100% algodón, 300g/m², resistente al agua", categoria: "Material", precio: 45.00, um: "MT", marca: "TextilPro", proveedor: "Distribuidora Lima SAC", imagen: "", notas: "Disponible en colores neutros" },
  { id: 2, nombre: "Hilo Encerado", caracteristicas: "Grosor 1mm, alta resistencia, no se deshilacha", categoria: "Insumo", precio: 12.50, um: "RLL", marca: "HiloMax", proveedor: "Insumos Craft Perú", imagen: "", notas: "" },
  { id: 3, nombre: "Tijera Industrial", caracteristicas: "Acero inoxidable, 25cm, mango ergonómico", categoria: "Herramienta", precio: 85.00, um: "UND", marca: "Fiskars", proveedor: "Ferrería Central", imagen: "", notas: "Requiere mantenimiento semestral" },
];

const COLORS = { Material:"#1B4F72", Accesorio:"#6C3483", Herramienta:"#784212", Insumo:"#1D6A39", Otro:"#555" };
const BG = { Material:"#D6EAF8", Accesorio:"#E8DAEF", Herramienta:"#FAE5D3", Insumo:"#D5F5E3", Otro:"#EAEAEA" };
const genId = () => Date.now();
const emptyForm = { nombre:"", caracteristicas:"", categoria:"Material", precio:"", um:"", marca:"", proveedor:"", imagen:"", notas:"" };

const overlayStyle = { position:"fixed", inset:0, background:"rgba(5,12,28,0.88)", backdropFilter:"blur(3px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 };

const inputStyle = { width:"100%", boxSizing:"border-box", marginBottom:10, borderRadius:10, border:"0.5px solid rgba(255,255,255,0.25)", background:"rgba(255,255,255,0.1)", color:"#fff", padding:"7px 11px", fontSize:14, outline:"none" };
const labelStyle = { fontSize:12, color:"rgba(255,255,255,0.6)", display:"block", marginBottom:3 };
const cardStyle = { background:"rgba(15,30,60,0.97)", borderRadius:16, padding:"1.5rem", border:"0.5px solid rgba(255,255,255,0.12)", color:"#fff" };

function Badge({ cat }) {
  return <span style={{ fontSize:11, fontWeight:500, padding:"2px 8px", borderRadius:20, background: BG[cat]||"#eee", color: COLORS[cat]||"#333" }}>{cat}</span>;
}

function FormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || emptyForm);
  const fileRef = useRef();
  const set = (k, v) => setForm(f=>({...f, [k]:v}));
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => set("imagen", ev.target.result);
    r.readAsDataURL(file);
  };
  const valid = form.nombre.trim() && form.precio !== "";

  const fld = (label, key, placeholder, type="text") => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder}
        style={inputStyle} min={type==="number"?0:undefined} step={type==="number"?"0.01":undefined}/>
    </div>
  );
  const sel = (label, key, opts, placeholder) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={form[key]} onChange={e=>set(key,e.target.value)}
        style={{...inputStyle, appearance:"none"}}>
        {placeholder && <option value="">{placeholder}</option>}
        {opts.map(o=><option key={o} style={{background:"#0f1e3c",color:"#fff"}}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={e=>e.stopPropagation()} style={{...cardStyle, width:420, maxHeight:"90vh", overflowY:"auto", position:"relative", zIndex:201}}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:500, color:"#fff" }}>{initial ? "Editar artículo" : "Nuevo artículo"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"rgba(255,255,255,0.6)", lineHeight:1 }}>×</button>
        </div>

        {fld("Nombre *","nombre","Ej: Tela Canvas")}
        <div>
          <label style={labelStyle}>Características</label>
          <textarea value={form.caracteristicas} onChange={e=>set("caracteristicas",e.target.value)}
            placeholder="Descripción detallada" rows={2}
            style={{...inputStyle, resize:"vertical"}}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {sel("Categoría","categoria", CATEGORIES.slice(1))}
          {sel("U.M.","um", UMS, "— seleccionar —")}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {fld("Precio (S/) *","precio","0.00","number")}
          {fld("Marca","marca","Ej: Fiskars")}
        </div>
        {fld("Proveedor","proveedor","Nombre del proveedor")}

        <div>
          <label style={labelStyle}>Imagen referencial</label>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
            {form.imagen && <img src={form.imagen} alt="" style={{ width:40, height:40, objectFit:"cover", borderRadius:8, border:"0.5px solid rgba(255,255,255,0.2)" }}/>}
            <button onClick={()=>fileRef.current.click()}
              style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, background:"rgba(255,255,255,0.12)", border:"0.5px solid rgba(255,255,255,0.25)", color:"#fff", borderRadius:8, padding:"5px 12px", cursor:"pointer" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              Subir imagen
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
            {form.imagen && <button onClick={()=>set("imagen","")} style={{ fontSize:12, background:"none", border:"0.5px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.6)", borderRadius:8, padding:"4px 10px", cursor:"pointer" }}>Quitar</button>}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Notas opcionales</label>
          <textarea value={form.notas} onChange={e=>set("notas",e.target.value)}
            placeholder="Observaciones, estado, etc." rows={2}
            style={{...inputStyle, resize:"vertical"}}/>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8 }}>
          <button onClick={onClose} style={{ fontSize:13, background:"rgba(255,255,255,0.1)", border:"0.5px solid rgba(255,255,255,0.2)", color:"#fff", borderRadius:8, padding:"6px 14px", cursor:"pointer" }}>Cancelar</button>
          <button disabled={!valid} onClick={()=>{ if(valid) onSave({...form, id: initial?.id || genId(), precio: parseFloat(form.precio)||0 }); }}
            style={{ background: valid?"#2563b0":"rgba(255,255,255,0.15)", color:"#fff", border:"none", borderRadius:8, padding:"6px 18px", cursor: valid?"pointer":"not-allowed", fontWeight:500, fontSize:14 }}>
            {initial ? "Guardar cambios" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose, onEdit, onDel }) {
  const fields = [
    ["Características", item.caracteristicas],
    ["U.M.", item.um],
    ["Marca", item.marca],
    ["Proveedor", item.proveedor],
    ["Notas", item.notas],
  ];
  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={e=>e.stopPropagation()} style={{...cardStyle, width:390, maxHeight:"88vh", overflowY:"auto"}}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ width:52, height:52, borderRadius:10, background: BG[item.categoria]||"#eee", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
              {item.imagen ? <img src={item.imagen} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ fontSize:24, color: COLORS[item.categoria], fontWeight:500 }}>{item.nombre[0]}</span>}
            </div>
            <div>
              <p style={{ margin:"0 0 4px", fontWeight:500, fontSize:17, color:"#fff" }}>{item.nombre}</p>
              <Badge cat={item.categoria}/>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"rgba(255,255,255,0.5)", lineHeight:1 }}>×</button>
        </div>
        <div style={{ borderTop:"0.5px solid rgba(255,255,255,0.12)", paddingTop:10 }}>
          {fields.map(([k,v])=> v ? (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"0.5px solid rgba(255,255,255,0.08)", fontSize:14 }}>
              <span style={{ color:"rgba(255,255,255,0.5)" }}>{k}</span>
              <span style={{ color:"#fff", textAlign:"right", maxWidth:"58%", wordBreak:"break-word" }}>{v}</span>
            </div>
          ) : null)}
        </div>
        <div style={{ marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:22, fontWeight:500, color:"#7db8f7" }}>S/ {Number(item.precio).toFixed(2)} <span style={{ fontSize:13, fontWeight:400, color:"rgba(255,255,255,0.5)" }}>/ {item.um}</span></span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onEdit} style={{ fontSize:13, background:"rgba(255,255,255,0.1)", border:"0.5px solid rgba(255,255,255,0.2)", color:"#fff", borderRadius:8, padding:"5px 12px", cursor:"pointer" }}>Editar</button>
            <button onClick={onDel} style={{ fontSize:13, background:"rgba(220,60,60,0.2)", border:"0.5px solid rgba(220,60,60,0.4)", color:"#f87171", borderRadius:8, padding:"5px 12px", cursor:"pointer" }}>Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState(SAMPLE);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todas");
  const [view, setView] = useState("grid");
  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const match = !q || i.nombre.toLowerCase().includes(q) || i.marca.toLowerCase().includes(q) || i.proveedor.toLowerCase().includes(q);
    const cat = catFilter === "Todas" || i.categoria === catFilter;
    return match && cat;
  });

  const save = (item) => {
    if (editing) { setItems(prev => prev.map(i => i.id === item.id ? item : i)); setDetail(item); }
    else setItems(prev => [...prev, item]);
    setEditing(null); setFormOpen(false);
  };

  const del = (id) => { if (confirm("¿Eliminar este artículo?")) { setItems(prev => prev.filter(i => i.id !== id)); setDetail(null); } };

  return (
    <div style={{ padding:"1rem 0", fontFamily:"var(--font-sans)" }}>
      <h2 style={{ position:"absolute", left:"-9999px" }}>Catálogo de materiales del negocio</h2>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem", flexWrap:"wrap", gap:8 }}>
        <div>
          <p style={{ margin:0, fontSize:20, fontWeight:500, color:"var(--color-text-primary)" }}>Catálogo de materiales</p>
          <p style={{ margin:0, fontSize:13, color:"var(--color-text-secondary)" }}>{items.length} artículo{items.length!==1?"s":""} registrado{items.length!==1?"s":""}</p>
        </div>
        <button onClick={()=>{ setEditing(null); setFormOpen(true); }} style={{ background:"#1B3A6B", color:"#fff", border:"none", borderRadius:8, padding:"7px 16px", cursor:"pointer", fontWeight:500, fontSize:14 }}>+ Nuevo artículo</button>
      </div>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:"1rem", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, marca o proveedor..." style={{ flex:1, minWidth:180, borderRadius:10 }}/>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{ minWidth:130, borderRadius:10 }}>
          {CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
        <div style={{ display:"flex", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, overflow:"hidden" }}>
          {["grid","list"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:"5px 12px", background: view===v?"#1B3A6B":"var(--color-background-primary)", color: view===v?"#fff":"var(--color-text-secondary)", border:"none", cursor:"pointer", fontSize:13 }}>
              {v==="grid" ? "⊞ Grid" : "≡ Lista"}
            </button>
          ))}
        </div>
      </div>

      {view === "grid" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12 }}>
          {filtered.map(item => (
            <div key={item.id} onClick={()=>setDetail(item)} style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, overflow:"hidden", cursor:"pointer" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-border-secondary)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--color-border-tertiary)"}>
              <div style={{ height:90, background: BG[item.categoria]||"#eee", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {item.imagen ? <img src={item.imagen} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ fontSize:32, color: COLORS[item.categoria]||"#888", fontWeight:500 }}>{item.nombre[0]}</span>}
              </div>
              <div style={{ padding:"10px 12px" }}>
                <p style={{ margin:"0 0 4px", fontWeight:500, fontSize:14, color:"var(--color-text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.nombre}</p>
                <Badge cat={item.categoria}/>
                <p style={{ margin:"6px 0 0", fontWeight:500, fontSize:15, color:"#1B3A6B" }}>S/ {Number(item.precio).toFixed(2)} <span style={{ fontWeight:400, fontSize:12, color:"var(--color-text-secondary)" }}>/{item.um}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "list" && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.map(item => (
            <div key={item.id} style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
              onClick={()=>setDetail(item)}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-border-secondary)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--color-border-tertiary)"}>
              <div style={{ width:40, height:40, borderRadius:8, background: BG[item.categoria]||"#eee", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                {item.imagen ? <img src={item.imagen} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ fontSize:18, color: COLORS[item.categoria]||"#888", fontWeight:500 }}>{item.nombre[0]}</span>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontWeight:500, fontSize:14, color:"var(--color-text-primary)" }}>{item.nombre}</p>
                <p style={{ margin:0, fontSize:12, color:"var(--color-text-secondary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.marca} · {item.proveedor}</p>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <Badge cat={item.categoria}/>
                <p style={{ margin:"4px 0 0", fontWeight:500, fontSize:14, color:"#1B3A6B" }}>S/ {Number(item.precio).toFixed(2)}<span style={{ fontWeight:400, fontSize:11, color:"var(--color-text-secondary)" }}> /{item.um}</span></p>
              </div>
              <div style={{ display:"flex", gap:4, flexShrink:0 }} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>{ setEditing(item); setFormOpen(true); }} style={{ fontSize:12, padding:"3px 8px", borderRadius:7 }}>Editar</button>
                <button onClick={()=>del(item.id)} style={{ fontSize:12, padding:"3px 8px", borderRadius:7, color:"var(--color-text-danger)", borderColor:"var(--color-border-danger)" }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"3rem 0", color:"var(--color-text-secondary)", fontSize:14 }}>
          No se encontraron artículos con ese criterio.
        </div>
      )}

      {detail && !formOpen && (
        <DetailModal
          item={detail}
          onClose={()=>setDetail(null)}
          onEdit={()=>{ setEditing(detail); setFormOpen(true); }}
          onDel={()=>del(detail.id)}
        />
      )}

      {formOpen && (
        <FormModal
          initial={editing}
          onSave={save}
          onClose={()=>{ setFormOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}