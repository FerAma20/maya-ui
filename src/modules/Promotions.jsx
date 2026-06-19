// ERP MAYA — Promotions / Motor de Promociones
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';

const Q   = (n) => `Q ${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const Qs  = (n) => `Q ${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 0,  maximumFractionDigits: 0  })}`;
const pct = (n) => `${n}%`;

// ── Tipos de promoción ─────────────────────────────────────────────────────
const PROMO_TYPES = [
  { id: 'pct_desc',   label: '% Descuento',             icon: 'tag',      desc: 'Porcentaje sobre el precio original' },
  { id: 'monto_fijo', label: 'Descuento fijo (Q)',       icon: 'cash',     desc: 'Monto fijo en quetzales' },
  { id: 'nxm',        label: 'NxM (2x1, 3x2…)',         icon: 'box',      desc: 'Compra N unidades, lleva M' },
  { id: 'precio_esp', label: 'Precio especial',          icon: 'tag',      desc: 'Precio fijo para el producto' },
  { id: 'combo',      label: 'Combo / Bundle',           icon: 'receipt',  desc: 'Descuento al comprar productos juntos' },
  { id: 'min_compra', label: 'Por monto mínimo',         icon: 'chart',    desc: 'Descuento si el ticket supera X quetzales' },
];

const TYPE_MAP = Object.fromEntries(PROMO_TYPES.map(t => [t.id, t]));

// ── Condiciones aplicables ─────────────────────────────────────────────────
const DIAS_SEMANA = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const CLIENT_TYPES = ['Todos', 'Consumidor final', 'Minorista', 'Mayorista', 'Exento'];
const BRANCHES_OPT = ['Todas', 'Zona 10', 'Zona 1', 'Zona 15', 'Mixco', 'Escuintla'];
const CATEGORIES   = ['Abarrotes', 'Bebidas', 'Lácteos', 'Limpieza', 'Higiene', 'Snacks', 'Panadería', 'Congelados'];

// ── Mock promotions ────────────────────────────────────────────────────────
const TODAY = new Date();
const fmtDate = (d) => d.toISOString().slice(0,10);
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate()+n); return r; };

const PROMOS = [
  {
    id: 'PRO-001', name: 'Descuento abarrotes fin de semana',
    type: 'pct_desc', value: 10, status: 'active',
    category: 'Abarrotes', product: null,
    clientType: 'Todos', branches: 'Todas',
    dias: [5,6], horaInicio: '', horaFin: '',
    minCompra: 0, nxm_n: null, nxm_m: null,
    dateStart: fmtDate(addDays(TODAY,-15)), dateEnd: fmtDate(addDays(TODAY,15)),
    uses: 284, savings: 1820.50, tickets: 284,
    desc: '10% de descuento en toda la categoría Abarrotes los fines de semana.',
  },
  {
    id: 'PRO-002', name: '2×1 en bebidas carbonatadas',
    type: 'nxm', value: null, status: 'active',
    category: 'Bebidas', product: 'Coca-Cola 600ml',
    clientType: 'Todos', branches: 'Zona 10',
    dias: [0,1,2,3,4,5,6], horaInicio: '14:00', horaFin: '18:00',
    minCompra: 0, nxm_n: 2, nxm_m: 1,
    dateStart: fmtDate(addDays(TODAY,-5)), dateEnd: fmtDate(addDays(TODAY,10)),
    uses: 96, savings: 960.00, tickets: 96,
    desc: 'Lleva 2 Coca-Cola 600ml y paga solo 1. Válido 2pm–6pm.',
  },
  {
    id: 'PRO-003', name: 'Q50 de descuento en compras mayores a Q500',
    type: 'min_compra', value: 50, status: 'active',
    category: null, product: null,
    clientType: 'Mayorista', branches: 'Todas',
    dias: [0,1,2,3,4,5,6], horaInicio: '', horaFin: '',
    minCompra: 500, nxm_n: null, nxm_m: null,
    dateStart: fmtDate(addDays(TODAY,-30)), dateEnd: fmtDate(addDays(TODAY,30)),
    uses: 42, savings: 2100.00, tickets: 42,
    desc: 'Clientes mayoristas que superen Q500 en un ticket reciben Q50 de descuento automático.',
  },
  {
    id: 'PRO-004', name: 'Precio especial detergente Ariel',
    type: 'precio_esp', value: 32.00, status: 'active',
    category: 'Limpieza', product: 'Detergente Ariel 1kg',
    clientType: 'Todos', branches: 'Todas',
    dias: [0,1,2,3,4,5,6], horaInicio: '', horaFin: '',
    minCompra: 0, nxm_n: null, nxm_m: null,
    dateStart: fmtDate(addDays(TODAY,-3)), dateEnd: fmtDate(addDays(TODAY,4)),
    uses: 118, savings: 767.00, tickets: 118,
    desc: 'Precio especial Q32.00 en Detergente Ariel 1kg (precio regular Q38.50).',
  },
  {
    id: 'PRO-005', name: 'Combo desayuno — pan + leche + café',
    type: 'combo', value: 15, status: 'scheduled',
    category: null, product: 'Pan + Leche + Café',
    clientType: 'Todos', branches: 'Zona 10',
    dias: [0,1,2,3,4,5,6], horaInicio: '06:00', horaFin: '10:00',
    minCompra: 0, nxm_n: null, nxm_m: null,
    dateStart: fmtDate(addDays(TODAY,3)), dateEnd: fmtDate(addDays(TODAY,33)),
    uses: 0, savings: 0, tickets: 0,
    desc: '15% de descuento al comprar juntos Pan, Leche Foremost y Café Soluble.',
  },
  {
    id: 'PRO-006', name: '5% descuento clientes minoristas',
    type: 'pct_desc', value: 5, status: 'paused',
    category: null, product: null,
    clientType: 'Minorista', branches: 'Todas',
    dias: [0,1,2,3,4,5,6], horaInicio: '', horaFin: '',
    minCompra: 0, nxm_n: null, nxm_m: null,
    dateStart: fmtDate(addDays(TODAY,-60)), dateEnd: fmtDate(addDays(TODAY,30)),
    uses: 320, savings: 4800.00, tickets: 320,
    desc: 'Descuento general del 5% para clientes tipo Minorista en todas las sucursales.',
  },
  {
    id: 'PRO-007', name: 'Promo lácteos vencimiento próximo — 20%',
    type: 'pct_desc', value: 20, status: 'expired',
    category: 'Lácteos', product: null,
    clientType: 'Todos', branches: 'Todas',
    dias: [0,1,2,3,4,5,6], horaInicio: '', horaFin: '',
    minCompra: 0, nxm_n: null, nxm_m: null,
    dateStart: fmtDate(addDays(TODAY,-20)), dateEnd: fmtDate(addDays(TODAY,-1)),
    uses: 67, savings: 890.00, tickets: 67,
    desc: '20% de descuento en lácteos próximos a vencer. Aplicado automáticamente por el sistema.',
  },
];

const STATUS_CFG = {
  active:    { label:'Activa',     pill:'success',  dot:true },
  scheduled: { label:'Programada', pill:'info',     dot:true },
  paused:    { label:'Pausada',    pill:'warning',  dot:true },
  expired:   { label:'Expirada',   pill:'neutral',  dot:false },
};

function PromoTypeBadge({ type }) {
  const t = TYPE_MAP[type];
  if (!t) return null;
  return (
    <span className="pill" style={{gap:4}}>
      <Icon name={t.icon} size={10}/>{t.label}
    </span>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.expired;
  return (
    <span className={`pill ${cfg.pill}`}>
      {cfg.dot && <span className="dot"/>}{cfg.label}
    </span>
  );
}

// ── Nuevo promo — estado inicial del formulario ───────────────────────────
const NEW_DEFAULTS = {
  name:'', type:'pct_desc', value:'', status:'active',
  category:'', product:'', clientType:'Todos', branches:'Todas',
  dias:[0,1,2,3,4,5,6], horaInicio:'', horaFin:'',
  minCompra:'', nxm_n:'2', nxm_m:'1',
  dateStart: fmtDate(TODAY), dateEnd: fmtDate(addDays(TODAY,30)),
  desc:'',
};

// ══════════════════════════════════════════════════════════════════════════════
export default function Promotions({ pushToast }) {
  const [tab,      setTab]      = useState('activas');
  const [selPromo, setSelPromo] = useState(null);
  const [showNew,  setShowNew]  = useState(false);
  const [search,   setSearch]   = useState('');
  const [form,     setForm]     = useState(NEW_DEFAULTS);
  const [step,     setStep]     = useState(1); // wizard step

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleDia = (d) => setF('dias', form.dias.includes(d)
    ? form.dias.filter(x => x !== d) : [...form.dias, d]);

  const activePromos    = PROMOS.filter(p => p.status === 'active');
  const scheduledPromos = PROMOS.filter(p => p.status === 'scheduled');
  const pausedPromos    = PROMOS.filter(p => p.status === 'paused');
  const expiredPromos   = PROMOS.filter(p => p.status === 'expired');

  const summary = useMemo(() => ({
    active:   activePromos.length,
    totalUses:    PROMOS.reduce((s,p) => s + p.uses, 0),
    totalSavings: PROMOS.reduce((s,p) => s + p.savings, 0),
    avgSaving:    PROMOS.filter(p=>p.uses>0).reduce((s,p)=>s+p.savings/p.uses,0) / Math.max(1, PROMOS.filter(p=>p.uses>0).length),
  }), []);

  const tabPromos = {
    activas:    [...activePromos, ...pausedPromos],
    programadas:scheduledPromos,
    historial:  expiredPromos,
    efectividad:PROMOS.filter(p => p.uses > 0),
  }[tab] ?? activePromos;

  const filtered = tabPromos.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name.trim()) { pushToast && pushToast('Ingresa el nombre de la promoción', 'danger'); return; }
    pushToast && pushToast(`Promoción "${form.name}" creada`, 'success');
    setShowNew(false);
    setForm(NEW_DEFAULTS);
    setStep(1);
  };

  const handleToggle = (promo) => {
    const next = promo.status === 'active' ? 'pausada' : 'activa';
    pushToast && pushToast(`Promoción ${next}`, 'success');
    setSelPromo(null);
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Promociones</h1>
          <div className="page-subtitle">
            Motor de reglas · Descuentos · 2×1 · Combos · Por tipo de cliente · Vigencia automática
          </div>
        </div>
        <div className="page-head-actions">
          <button className="btn"><Icon name="download" size={12}/>Exportar</button>
          <button className="btn accent" onClick={() => { setShowNew(true); setStep(1); }}>
            <Icon name="plus" size={12}/>Nueva promoción
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)', marginBottom:16}}>
        <div className="stat">
          <div className="label"><Icon name="tag" size={11}/>Promociones activas</div>
          <div className="val mono" style={{fontSize:26, color:'var(--success)'}}>{summary.active}</div>
          <div className="delta" style={{color:'var(--muted)'}}>{scheduledPromos.length} programadas</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="receipt" size={11}/>Usos totales (mes)</div>
          <div className="val mono" style={{fontSize:26}}>{summary.totalUses.toLocaleString('es-GT')}</div>
          <div className="delta up"><Icon name="arrowUp" size={11}/>12% vs mes anterior</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="cash" size={11}/>Ahorro total clientes</div>
          <div className="val mono" style={{fontSize:26}}>{Q(summary.totalSavings)}</div>
          <div className="delta" style={{color:'var(--muted)'}}>Descuentos aplicados</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="chart" size={11}/>Ahorro promedio/uso</div>
          <div className="val mono" style={{fontSize:26}}>{Q(summary.avgSaving)}</div>
          <div className="delta" style={{color:'var(--muted)'}}>Por ticket con promo</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { id:'activas',     label:`Activas y pausadas (${activePromos.length + pausedPromos.length})` },
          { id:'programadas', label:`Programadas (${scheduledPromos.length})` },
          { id:'historial',   label:`Historial (${expiredPromos.length})` },
          { id:'efectividad', label:'Efectividad' },
        ].map(t => (
          <button key={t.id} className={`tab ${tab===t.id?'active':''}`}
            onClick={() => setTab(t.id)}>{t.label}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="toolbar">
        <div className="search-wrap" style={{flex:1, maxWidth:320}}>
          <Icon name="search" size={13} className="icon"/>
          <input className="search-input" placeholder="Buscar promoción…"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <span className="muted" style={{fontSize:11, marginLeft:'auto'}}>{filtered.length} registros</span>
      </div>

      {/* ── TAB: LISTA ── */}
      {tab !== 'efectividad' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Aplica a</th>
                <th>Condiciones</th>
                <th>Vigencia</th>
                <th className="num">Usos</th>
                <th className="num">Ahorro generado</th>
                <th>Estado</th>
                <th/>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="clickable" onClick={() => setSelPromo(p)}>
                  <td className="mono">{p.id}</td>
                  <td style={{fontWeight:500, maxWidth:220, whiteSpace:'normal'}}>{p.name}</td>
                  <td><PromoTypeBadge type={p.type}/></td>
                  <td>
                    <div style={{fontSize:11.5}}>
                      {p.category && <span className="pill" style={{marginRight:4}}>{p.category}</span>}
                      {p.product && <span style={{color:'var(--muted)'}}>{p.product}</span>}
                      {!p.category && !p.product && <span className="muted">Todo el carrito</span>}
                    </div>
                  </td>
                  <td style={{fontSize:11, color:'var(--muted)'}}>
                    <div>{p.clientType !== 'Todos' ? p.clientType : 'Todos los clientes'}</div>
                    <div>{p.branches}</div>
                    {p.minCompra > 0 && <div>Min. {Q(p.minCompra)}</div>}
                    {p.horaInicio && <div>{p.horaInicio}–{p.horaFin}</div>}
                  </td>
                  <td className="mono" style={{fontSize:11}}>
                    <div>{p.dateStart}</div>
                    <div style={{color:'var(--muted)'}}>→ {p.dateEnd}</div>
                  </td>
                  <td className="num">{p.uses.toLocaleString('es-GT')}</td>
                  <td className="num" style={{color:'var(--success)'}}>{p.savings > 0 ? Q(p.savings) : '—'}</td>
                  <td><StatusPill status={p.status}/></td>
                  <td>
                    <button className="btn sm ghost" onClick={ev=>{ev.stopPropagation();setSelPromo(p);}}>
                      <Icon name="eye" size={11}/>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="empty">Sin promociones en esta categoría</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB: EFECTIVIDAD ── */}
      {tab === 'efectividad' && (
        <>
          <div className="grid-2 mt-12" style={{gridTemplateColumns:'2fr 1fr', gap:16}}>
            {/* Ranking */}
            <div className="card">
              <div className="card-head">
                <h3>Ranking por ahorro generado</h3>
                <span className="meta">Mes actual</span>
              </div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>#</th><th>Promoción</th><th>Tipo</th>
                      <th className="num">Usos</th>
                      <th className="num">Ahorro total</th>
                      <th className="num">Ahorro/uso</th>
                      <th>Efectividad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...PROMOS].filter(p=>p.uses>0)
                      .sort((a,b)=>b.savings-a.savings)
                      .map((p,i) => {
                        const maxSav = Math.max(...PROMOS.map(x=>x.savings));
                        const barW = Math.round((p.savings/maxSav)*100);
                        return (
                          <tr key={p.id}>
                            <td className="mono" style={{color:'var(--muted)'}}>{String(i+1).padStart(2,'0')}</td>
                            <td style={{fontWeight:500, maxWidth:200, whiteSpace:'normal'}}>{p.name}</td>
                            <td><PromoTypeBadge type={p.type}/></td>
                            <td className="num">{p.uses}</td>
                            <td className="num" style={{color:'var(--success)', fontWeight:600}}>{Q(p.savings)}</td>
                            <td className="num">{Q(p.savings/p.uses)}</td>
                            <td style={{minWidth:120}}>
                              <div className="bar" style={{width:90}}>
                                <div style={{width:`${barW}%`}}/>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Por tipo */}
            <div className="card">
              <div className="card-head"><h3>Usos por tipo de promo</h3></div>
              <div className="card-body">
                {PROMO_TYPES.map(t => {
                  const ps = PROMOS.filter(p => p.type === t.id && p.uses > 0);
                  if (!ps.length) return null;
                  const totalUses = ps.reduce((s,p)=>s+p.uses,0);
                  const totalSav  = ps.reduce((s,p)=>s+p.savings,0);
                  const maxU = Math.max(...PROMO_TYPES.map(tt =>
                    PROMOS.filter(p=>p.type===tt.id).reduce((s,p)=>s+p.uses,0)));
                  const barW = Math.round((totalUses/Math.max(maxU,1))*100);
                  return (
                    <div key={t.id} style={{marginBottom:14}}>
                      <div className="row" style={{justifyContent:'space-between', marginBottom:4, fontSize:12}}>
                        <span style={{fontWeight:500}}>
                          <Icon name={t.icon} size={11} style={{marginRight:5, color:'var(--muted)'}}/>
                          {t.label}
                        </span>
                        <span className="mono">{totalUses} usos · {Q(totalSav)}</span>
                      </div>
                      <div className="bar"><div style={{width:`${barW}%`}}/></div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── DRAWER: Detalle promoción ── */}
      {selPromo && (
        <>
          <div className="drawer-overlay" onClick={() => setSelPromo(null)}/>
          <div className="drawer" style={{width:520}}>
            <div className="drawer-head">
              <div>
                <div className="drawer-title">{selPromo.name}</div>
                <div className="muted" style={{fontSize:11, marginTop:2}}>{selPromo.id}</div>
              </div>
              <button className="icon-btn" onClick={() => setSelPromo(null)}><Icon name="x"/></button>
            </div>
            <div className="drawer-body">
              <div className="row" style={{gap:8, marginBottom:16}}>
                <StatusPill status={selPromo.status}/>
                <PromoTypeBadge type={selPromo.type}/>
              </div>

              <p style={{fontSize:13, color:'var(--text-2)', margin:'0 0 20px'}}>{selPromo.desc}</p>

              {/* Valor de la promoción */}
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8}}>Valor de la promoción</div>
              <div className="card" style={{marginBottom:20}}>
                <div className="card-body" style={{padding:'12px 14px'}}>
                  {selPromo.type === 'pct_desc'   && <div style={{fontSize:28, fontWeight:700, color:'var(--accent)'}}>{pct(selPromo.value)} <span style={{fontSize:14, fontWeight:400, color:'var(--muted)'}}>de descuento</span></div>}
                  {selPromo.type === 'monto_fijo'  && <div style={{fontSize:28, fontWeight:700, color:'var(--accent)'}}>{Q(selPromo.value)} <span style={{fontSize:14, fontWeight:400, color:'var(--muted)'}}>de descuento fijo</span></div>}
                  {selPromo.type === 'nxm'         && <div style={{fontSize:28, fontWeight:700, color:'var(--accent)'}}>{selPromo.nxm_n}×{selPromo.nxm_m} <span style={{fontSize:14, fontWeight:400, color:'var(--muted)'}}>compra {selPromo.nxm_n}, lleva {selPromo.nxm_m+selPromo.nxm_n}</span></div>}
                  {selPromo.type === 'precio_esp'  && <div style={{fontSize:28, fontWeight:700, color:'var(--accent)'}}>{Q(selPromo.value)} <span style={{fontSize:14, fontWeight:400, color:'var(--muted)'}}>precio especial</span></div>}
                  {selPromo.type === 'combo'       && <div style={{fontSize:28, fontWeight:700, color:'var(--accent)'}}>{pct(selPromo.value)} <span style={{fontSize:14, fontWeight:400, color:'var(--muted)'}}>en combo</span></div>}
                  {selPromo.type === 'min_compra'  && <div><div style={{fontSize:28, fontWeight:700, color:'var(--accent)'}}>{Q(selPromo.value)} <span style={{fontSize:14, fontWeight:400, color:'var(--muted)'}}>de descuento</span></div><div style={{fontSize:12, color:'var(--muted)', marginTop:4}}>al superar {Q(selPromo.minCompra)} en el ticket</div></div>}
                </div>
              </div>

              {/* Condiciones */}
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8}}>Condiciones</div>
              <div className="detail-grid" style={{marginBottom:20}}>
                {[
                  ['Aplica a',       selPromo.category || (selPromo.product ? selPromo.product : 'Todo el carrito')],
                  ['Tipo de cliente',selPromo.clientType],
                  ['Sucursales',     selPromo.branches],
                  ['Días válidos',   selPromo.dias.map(d => DIAS_SEMANA[d]).join(', ')],
                  ['Horario',        selPromo.horaInicio ? `${selPromo.horaInicio} – ${selPromo.horaFin}` : 'Todo el día'],
                  ['Vigencia',       `${selPromo.dateStart} → ${selPromo.dateEnd}`],
                ].map(([l,v]) => (
                  <div className="detail-row" key={l}>
                    <span className="detail-label">{l}</span>
                    <span style={{fontSize:12, textAlign:'right'}}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Métricas */}
              {selPromo.uses > 0 && (
                <>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8}}>Rendimiento</div>
                  <div className="stat-grid" style={{gridTemplateColumns:'1fr 1fr', gap:8}}>
                    <div className="stat" style={{padding:'10px 12px'}}>
                      <div className="label" style={{fontSize:10}}>Usos totales</div>
                      <div className="val mono" style={{fontSize:20}}>{selPromo.uses}</div>
                    </div>
                    <div className="stat" style={{padding:'10px 12px'}}>
                      <div className="label" style={{fontSize:10}}>Ahorro generado</div>
                      <div className="val mono" style={{fontSize:20, color:'var(--success)'}}>{Q(selPromo.savings)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="drawer-foot">
              <button className="btn ghost" onClick={() => setSelPromo(null)}>Cerrar</button>
              {selPromo.status !== 'expired' && (
                <button className="btn" onClick={() => handleToggle(selPromo)}>
                  <Icon name={selPromo.status==='active'?'alert':'check'} size={12}/>
                  {selPromo.status === 'active' ? 'Pausar' : 'Activar'}
                </button>
              )}
              <button className="btn accent"><Icon name="edit" size={12}/>Editar</button>
            </div>
          </div>
        </>
      )}

      {/* ── MODAL: Nueva promoción (wizard 3 pasos) ── */}
      {showNew && (
        <div className="modal-overlay" onClick={() => { setShowNew(false); setStep(1); }}>
          <div className="modal" style={{width:580}} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Nueva promoción</h3>
              <div className="row gap-6">
                {[1,2,3].map(s => (
                  <span key={s} style={{
                    width:22, height:22, borderRadius:'50%', fontSize:11, fontWeight:600,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: step === s ? 'var(--accent)' : step > s ? 'var(--success)' : 'var(--surface-3)',
                    color: step >= s ? 'white' : 'var(--muted)',
                  }}>{step > s ? '✓' : s}</span>
                ))}
                <button className="icon-btn" onClick={() => { setShowNew(false); setStep(1); }}>
                  <Icon name="x"/>
                </button>
              </div>
            </div>

            <div className="modal-body">
              {/* Paso 1: Tipo y valor */}
              {step === 1 && (
                <>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12}}>Paso 1 — Tipo y valor de la promoción</div>
                  <div className="form-grid">
                    <div className="field span-2">
                      <label className="field-label">Nombre de la promoción</label>
                      <input className="field-input" placeholder="Ej. Descuento fin de semana en abarrotes"
                        value={form.name} onChange={e => setF('name', e.target.value)}/>
                    </div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, margin:'16px 0'}}>
                    {PROMO_TYPES.map(t => (
                      <button key={t.id} type="button"
                        onClick={() => setF('type', t.id)}
                        style={{
                          padding:'12px', border: form.type===t.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                          background: form.type===t.id ? 'var(--accent-soft)' : 'var(--surface)',
                          borderRadius:'var(--r-md)', cursor:'pointer', textAlign:'left',
                          color: form.type===t.id ? 'var(--accent-ink)' : 'var(--text)',
                        }}>
                        <div style={{display:'flex', alignItems:'center', gap:7, fontWeight:600, fontSize:12, marginBottom:3}}>
                          <Icon name={t.icon} size={13}/>{t.label}
                        </div>
                        <div style={{fontSize:11, color:'var(--muted)'}}>{t.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Valor según tipo */}
                  <div className="form-grid">
                    {form.type === 'pct_desc' && (
                      <div className="field">
                        <label className="field-label">Porcentaje de descuento (%)</label>
                        <input className="field-input mono" type="number" placeholder="Ej. 10"
                          value={form.value} onChange={e => setF('value', e.target.value)}/>
                      </div>
                    )}
                    {form.type === 'monto_fijo' && (
                      <div className="field">
                        <label className="field-label">Monto de descuento (Q)</label>
                        <input className="field-input mono" type="number" placeholder="Ej. 25.00"
                          value={form.value} onChange={e => setF('value', e.target.value)}/>
                      </div>
                    )}
                    {form.type === 'nxm' && (
                      <>
                        <div className="field">
                          <label className="field-label">Compra N unidades</label>
                          <input className="field-input mono" type="number" placeholder="2"
                            value={form.nxm_n} onChange={e => setF('nxm_n', e.target.value)}/>
                        </div>
                        <div className="field">
                          <label className="field-label">Lleva M unidades</label>
                          <input className="field-input mono" type="number" placeholder="1"
                            value={form.nxm_m} onChange={e => setF('nxm_m', e.target.value)}/>
                        </div>
                      </>
                    )}
                    {form.type === 'precio_esp' && (
                      <div className="field">
                        <label className="field-label">Precio especial (Q)</label>
                        <input className="field-input mono" type="number" placeholder="Ej. 32.00"
                          value={form.value} onChange={e => setF('value', e.target.value)}/>
                      </div>
                    )}
                    {form.type === 'combo' && (
                      <div className="field">
                        <label className="field-label">% de descuento en combo</label>
                        <input className="field-input mono" type="number" placeholder="Ej. 15"
                          value={form.value} onChange={e => setF('value', e.target.value)}/>
                      </div>
                    )}
                    {form.type === 'min_compra' && (
                      <>
                        <div className="field">
                          <label className="field-label">Monto mínimo del ticket (Q)</label>
                          <input className="field-input mono" type="number" placeholder="500"
                            value={form.minCompra} onChange={e => setF('minCompra', e.target.value)}/>
                        </div>
                        <div className="field">
                          <label className="field-label">Descuento fijo (Q)</label>
                          <input className="field-input mono" type="number" placeholder="50"
                            value={form.value} onChange={e => setF('value', e.target.value)}/>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Paso 2: A qué aplica */}
              {step === 2 && (
                <>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12}}>Paso 2 — ¿A qué aplica?</div>
                  <div className="form-grid">
                    <div className="field">
                      <label className="field-label">Categoría de producto</label>
                      <select className="field-input" value={form.category} onChange={e => setF('category', e.target.value)}>
                        <option value="">Todas las categorías</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Tipo de cliente</label>
                      <select className="field-input" value={form.clientType} onChange={e => setF('clientType', e.target.value)}>
                        {CLIENT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Sucursales</label>
                      <select className="field-input" value={form.branches} onChange={e => setF('branches', e.target.value)}>
                        {BRANCHES_OPT.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Producto específico (opcional)</label>
                      <input className="field-input" placeholder="Ej. Coca-Cola 600ml"
                        value={form.product} onChange={e => setF('product', e.target.value)}/>
                    </div>
                    <div className="field span-2">
                      <label className="field-label">Descripción interna</label>
                      <input className="field-input" placeholder="Descripción para el equipo…"
                        value={form.desc} onChange={e => setF('desc', e.target.value)}/>
                    </div>
                  </div>
                </>
              )}

              {/* Paso 3: Vigencia y horario */}
              {step === 3 && (
                <>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12}}>Paso 3 — Vigencia y horario</div>
                  <div className="form-grid">
                    <div className="field">
                      <label className="field-label">Fecha inicio</label>
                      <input className="field-input" type="date" value={form.dateStart}
                        onChange={e => setF('dateStart', e.target.value)}/>
                    </div>
                    <div className="field">
                      <label className="field-label">Fecha fin</label>
                      <input className="field-input" type="date" value={form.dateEnd}
                        onChange={e => setF('dateEnd', e.target.value)}/>
                    </div>
                    <div className="field">
                      <label className="field-label">Hora inicio (opcional)</label>
                      <input className="field-input mono" type="time" value={form.horaInicio}
                        onChange={e => setF('horaInicio', e.target.value)}/>
                    </div>
                    <div className="field">
                      <label className="field-label">Hora fin (opcional)</label>
                      <input className="field-input mono" type="time" value={form.horaFin}
                        onChange={e => setF('horaFin', e.target.value)}/>
                    </div>
                  </div>

                  <div style={{marginTop:16}}>
                    <div className="field-label" style={{marginBottom:8}}>Días de la semana</div>
                    <div style={{display:'flex', gap:6}}>
                      {DIAS_SEMANA.map((d,i) => (
                        <button key={i} type="button"
                          onClick={() => toggleDia(i)}
                          style={{
                            width:38, height:38, borderRadius:'var(--r-md)',
                            border: form.dias.includes(i) ? '2px solid var(--accent)' : '1px solid var(--border)',
                            background: form.dias.includes(i) ? 'var(--accent)' : 'var(--surface)',
                            color: form.dias.includes(i) ? 'white' : 'var(--text-2)',
                            cursor:'pointer', fontSize:11, fontWeight:600,
                          }}>{d}</button>
                      ))}
                    </div>
                  </div>

                  {/* Resumen */}
                  <div style={{marginTop:20, padding:'14px', background:'var(--surface-2)', borderRadius:'var(--r-md)', border:'1px solid var(--border)'}}>
                    <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8}}>Resumen de la promoción</div>
                    <div style={{fontSize:13, fontWeight:600, marginBottom:6}}>{form.name || '(Sin nombre)'}</div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                      <PromoTypeBadge type={form.type}/>
                      {form.category && <span className="pill">{form.category}</span>}
                      <span className="pill">{form.clientType}</span>
                      <span className="pill">{form.branches}</span>
                      <span className="pill">{form.dateStart} → {form.dateEnd}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-foot">
              <button className="btn ghost" onClick={() => { setShowNew(false); setStep(1); }}>Cancelar</button>
              {step > 1 && (
                <button className="btn" onClick={() => setStep(s => s - 1)}>
                  <Icon name="chevronLeft" size={12}/>Anterior
                </button>
              )}
              {step < 3 ? (
                <button className="btn accent" onClick={() => setStep(s => s + 1)}>
                  Siguiente<Icon name="chevronRight" size={12}/>
                </button>
              ) : (
                <button className="btn accent" onClick={handleSave}>
                  <Icon name="check" size={12}/>Crear promoción
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
