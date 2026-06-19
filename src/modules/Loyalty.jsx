// ERP MAYA — Fidelización / Puntos
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';

const Q  = (n) => `Q ${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const Qs = (n) => `Q ${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const pts = (n) => `${Number(n).toLocaleString('es-GT')} pts`;

// ── Configuración del programa ─────────────────────────────────────────────
const CONFIG = {
  puntosXQ10: 1,       // 1 punto por cada Q10 gastados
  valorPunto: 0.10,    // Q0.10 por punto al canjear
  expiracionMeses: 12,
};

const TIERS = [
  { id: 'basico',  nombre: 'Básico',  min: 0,    max: 499,        pill: '',        bonus: 1.0,  icon: '⬡' },
  { id: 'plata',   nombre: 'Plata',   min: 500,  max: 1999,       pill: 'info',    bonus: 1.25, icon: '◈' },
  { id: 'oro',     nombre: 'Oro',     min: 2000, max: 4999,       pill: 'warning', bonus: 1.5,  icon: '★' },
  { id: 'platino', nombre: 'Platino', min: 5000, max: Infinity,   pill: 'accent',  bonus: 2.0,  icon: '✦' },
];

const tierOf = (pts) => TIERS.findLast(t => pts >= t.min) ?? TIERS[0];

// ── Mock data ──────────────────────────────────────────────────────────────
const MEMBERS = [
  { id:'M-001', nombre:'María García López',    nit:'1234567-8', tel:'+502 5555-1234', email:'maria@gmail.com',      points:2840, totalSpent:32400, joinDate:'2024-03-15', lastPurchase:'2026-05-20', earned:3200, redeemed:360 },
  { id:'M-002', nombre:'Carlos Méndez Ruiz',    nit:'8765432-1', tel:'+502 4444-5678', email:'cmendes@hotmail.com',  points:5620, totalSpent:68000, joinDate:'2023-11-02', lastPurchase:'2026-05-22', earned:6800, redeemed:1180 },
  { id:'M-003', nombre:'Ana Juárez de López',   nit:'3456789-0', tel:'+502 3333-9012', email:'anajuarez@gmail.com',  points:890,  totalSpent:9800,  joinDate:'2025-01-20', lastPurchase:'2026-05-18', earned:980,  redeemed:90 },
  { id:'M-004', nombre:'Roberto Pérez Castro',  nit:'2345678-9', tel:'+502 7777-3456', email:'rperez@empresa.gt',    points:320,  totalSpent:3500,  joinDate:'2025-06-10', lastPurchase:'2026-04-30', earned:350,  redeemed:30 },
  { id:'M-005', nombre:'Lucía Barrios Sandoval', nit:'9876543-2', tel:'+502 6666-7890', email:'lbarrios@gmail.com',   points:4150, totalSpent:47200, joinDate:'2024-07-08', lastPurchase:'2026-05-21', earned:4720, redeemed:570 },
  { id:'M-006', nombre:'Javier Ramos Morales',  nit:'4567890-1', tel:'+502 2222-4567', email:'jramos@yahoo.com',     points:1240, totalSpent:14600, joinDate:'2024-12-01', lastPurchase:'2026-05-15', earned:1460, redeemed:220 },
  { id:'M-007', nombre:'Patricia Lima Vásquez', nit:'5678901-2', tel:'+502 8888-2345', email:'plima@gmail.com',       points:75,   totalSpent:820,   joinDate:'2026-04-02', lastPurchase:'2026-05-10', earned:82,   redeemed:7 },
  { id:'M-008', nombre:'Diego Castillo Díaz',   nit:'6789012-3', tel:'+502 1111-6789', email:'dcastillo@gmail.com',  points:7890, totalSpent:95000, joinDate:'2023-05-18', lastPurchase:'2026-05-23', earned:9500, redeemed:1610 },
];

const TXNS = [
  { id:'TX-0042', memberId:'M-008', nombre:'Diego Castillo Díaz',    type:'earned',   points:120, ref:'T-2026-04892', date:'2026-05-23', monto:1200.00 },
  { id:'TX-0041', memberId:'M-001', nombre:'María García López',     type:'earned',   points:45,  ref:'T-2026-04889', date:'2026-05-22', monto:450.00 },
  { id:'TX-0040', memberId:'M-002', nombre:'Carlos Méndez Ruiz',     type:'redeemed', points:-80, ref:'T-2026-04881', date:'2026-05-22', monto:-8.00 },
  { id:'TX-0039', memberId:'M-005', nombre:'Lucía Barrios Sandoval', type:'earned',   points:63,  ref:'T-2026-04876', date:'2026-05-21', monto:630.00 },
  { id:'TX-0038', memberId:'M-006', nombre:'Javier Ramos Morales',   type:'earned',   points:28,  ref:'T-2026-04870', date:'2026-05-20', monto:280.00 },
  { id:'TX-0037', memberId:'M-001', nombre:'María García López',     type:'redeemed', points:-50, ref:'T-2026-04865', date:'2026-05-20', monto:-5.00 },
  { id:'TX-0036', memberId:'M-003', nombre:'Ana Juárez de López',    type:'earned',   points:19,  ref:'T-2026-04860', date:'2026-05-18', monto:190.00 },
  { id:'TX-0035', memberId:'M-008', nombre:'Diego Castillo Díaz',    type:'bonus',    points:60,  ref:'PRO-FDS',      date:'2026-05-18', monto:0 },
  { id:'TX-0034', memberId:'M-004', nombre:'Roberto Pérez Castro',   type:'earned',   points:15,  ref:'T-2026-04852', date:'2026-05-15', monto:150.00 },
  { id:'TX-0033', memberId:'M-006', nombre:'Javier Ramos Morales',   type:'redeemed', points:-40, ref:'T-2026-04848', date:'2026-05-15', monto:-4.00 },
  { id:'TX-0032', memberId:'M-005', nombre:'Lucía Barrios Sandoval', type:'earned',   points:85,  ref:'T-2026-04840', date:'2026-05-14', monto:850.00 },
  { id:'TX-0031', memberId:'M-002', nombre:'Carlos Méndez Ruiz',     type:'earned',   points:200, ref:'T-2026-04831', date:'2026-05-12', monto:2000.00 },
  { id:'TX-0030', memberId:'M-007', nombre:'Patricia Lima Vásquez',  type:'earned',   points:12,  ref:'T-2026-04825', date:'2026-05-10', monto:120.00 },
  { id:'TX-0029', memberId:'M-003', nombre:'Ana Juárez de López',    type:'ajuste',   points:20,  ref:'ADJ-2026-05',  date:'2026-05-08', monto:0 },
  { id:'TX-0028', memberId:'M-008', nombre:'Diego Castillo Díaz',    type:'redeemed', points:-200,ref:'T-2026-04812', date:'2026-05-05', monto:-20.00 },
];

const TYPE_META = {
  earned:   { label:'Acumulado',  pill:'success', icon:'↑' },
  redeemed: { label:'Canjeado',   pill:'danger',  icon:'↓' },
  bonus:    { label:'Bono',       pill:'warning', icon:'★' },
  ajuste:   { label:'Ajuste',     pill:'',        icon:'⟳' },
};

// ── Componente ─────────────────────────────────────────────────────────────
export default function Loyalty({ pushToast }) {
  const [tab, setTab]       = useState('resumen');
  const [search, setSearch] = useState('');
  const [tierFiltro, setTierFiltro] = useState('todos');
  const [txnFiltro, setTxnFiltro]   = useState('todos');
  const [drawer, setDrawer] = useState(null);
  const [showAjuste, setShowAjuste] = useState(null); // member for manual adjustment
  const [ajustePts, setAjustePts]   = useState('');
  const [ajusteNota, setAjusteNota] = useState('');

  // KPIs
  const totalMembers   = MEMBERS.length;
  const totalPoints    = MEMBERS.reduce((s, m) => s + m.points, 0);
  const totalRedeemed  = MEMBERS.reduce((s, m) => s + m.redeemed, 0);
  const activeThisMonth = MEMBERS.filter(m => m.lastPurchase >= '2026-05-01').length;

  // Filtered members
  const filteredMembers = useMemo(() => {
    let list = MEMBERS;
    if (tierFiltro !== 'todos') list = list.filter(m => tierOf(m.points).id === tierFiltro);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => m.nombre.toLowerCase().includes(q) || m.nit.includes(q));
    }
    return list.sort((a, b) => b.points - a.points);
  }, [search, tierFiltro]);

  // Filtered transactions
  const filteredTxns = useMemo(() => {
    if (txnFiltro === 'todos') return TXNS;
    return TXNS.filter(t => t.type === txnFiltro);
  }, [txnFiltro]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Fidelización · Programa de Puntos</div>
          <div className="muted" style={{fontSize:12}}>
            {CONFIG.puntosXQ10} punto por cada Q10 · Valor de canje Q{CONFIG.valorPunto.toFixed(2)} / punto
          </div>
        </div>
        <div className="row gap-8">
          <button className="btn" onClick={() => pushToast?.('Exportando…', '')}>
            <Icon name="download" size={13}/>Exportar
          </button>
          <button className="btn accent" onClick={() => pushToast?.('Redirigiendo a Clientes…', '')}>
            <Icon name="plus" size={13}/>Nuevo miembro
          </button>
        </div>
      </div>

      <div className="tabs" style={{marginBottom:20}}>
        {[
          { id:'resumen',    label:'Resumen' },
          { id:'clientes',   label:'Clientes' },
          { id:'movimientos',label:'Movimientos' },
          { id:'config',     label:'Configuración' },
        ].map(t => (
          <button key={t.id} className={`tab ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── RESUMEN ──────────────────────────────────────────────────────── */}
      {tab === 'resumen' && (
        <div>
          <div className="stat-grid" style={{marginBottom:20}}>
            <div className="stat">
              <div className="label">Total miembros</div>
              <div className="val">{totalMembers}</div>
              <div className="delta up">{activeThisMonth} activos este mes</div>
            </div>
            <div className="stat">
              <div className="label">Puntos vigentes</div>
              <div className="val">{totalPoints.toLocaleString('es-GT')}</div>
              <div className="delta up">≈ {Q(totalPoints * CONFIG.valorPunto)} en circulación</div>
            </div>
            <div className="stat">
              <div className="label">Puntos canjeados (total)</div>
              <div className="val">{totalRedeemed.toLocaleString('es-GT')}</div>
              <div className="delta up">{Q(totalRedeemed * CONFIG.valorPunto)} en descuentos</div>
            </div>
            <div className="stat">
              <div className="label">Tasa de canje</div>
              <div className="val">{MEMBERS.reduce((s,m)=>s+m.earned,0) > 0 ? ((totalRedeemed/MEMBERS.reduce((s,m)=>s+m.earned,0))*100).toFixed(1) : 0}%</div>
              <div className="delta">Pts canjeados / emitidos</div>
            </div>
          </div>

          {/* Distribución por tier */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20}}>
            <div className="card" style={{padding:16}}>
              <div style={{fontWeight:600, fontSize:13, marginBottom:14}}>Distribución por nivel</div>
              {TIERS.map(t => {
                const count = MEMBERS.filter(m => tierOf(m.points).id === t.id).length;
                const pct   = totalMembers > 0 ? (count / totalMembers) * 100 : 0;
                return (
                  <div key={t.id} style={{marginBottom:10}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4}}>
                      <span style={{display:'flex', alignItems:'center', gap:6}}>
                        <span className={`pill ${t.pill}`} style={{fontSize:10}}>{t.icon} {t.nombre}</span>
                      </span>
                      <span className="muted" style={{fontFamily:'var(--font-mono)', fontSize:11}}>{count} miembros · {pct.toFixed(0)}%</span>
                    </div>
                    <div style={{height:5, background:'var(--border)', borderRadius:3}}>
                      <div style={{height:'100%', width:`${pct}%`, background:'var(--accent)', borderRadius:3}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card" style={{padding:16}}>
              <div style={{fontWeight:600, fontSize:13, marginBottom:14}}>Actividad reciente</div>
              {TXNS.slice(0, 7).map(tx => {
                const meta = TYPE_META[tx.type];
                return (
                  <div key={tx.id} style={{display:'flex', alignItems:'center', gap:10, marginBottom:10, fontSize:12}}>
                    <span className={`pill ${meta.pill}`} style={{fontSize:10, minWidth:72, justifyContent:'center'}}>
                      {meta.icon} {meta.label}
                    </span>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{tx.nombre}</div>
                      <div className="muted" style={{fontSize:10.5, fontFamily:'var(--font-mono)'}}>{tx.ref} · {tx.date}</div>
                    </div>
                    <div style={{fontFamily:'var(--font-mono)', fontSize:12, fontWeight:600,
                      color: tx.points > 0 ? 'var(--success)' : 'var(--danger)'}}>
                      {tx.points > 0 ? '+' : ''}{tx.points} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENTES ─────────────────────────────────────────────────────── */}
      {tab === 'clientes' && (
        <div>
          <div style={{display:'flex', gap:8, marginBottom:14, flexWrap:'wrap'}}>
            <div style={{position:'relative', flex:1, minWidth:200}}>
              <Icon name="search" size={13} style={{position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--muted)'}}/>
              <input
                style={{width:'100%', paddingLeft:30, border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'6px 10px 6px 30px', background:'var(--surface)', color:'var(--text)', fontSize:13}}
                placeholder="Buscar por nombre o NIT…"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{display:'flex', gap:4}}>
              {[{v:'todos',l:'Todos'},...TIERS.map(t=>({v:t.id,l:t.nombre}))].map(o => (
                <button key={o.v} className={`btn ${tierFiltro===o.v?'accent':''}`} style={{fontSize:11}}
                  onClick={() => setTierFiltro(o.v)}>{o.l}</button>
              ))}
            </div>
          </div>

          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Nivel</th>
                  <th className="num">Puntos actuales</th>
                  <th className="num">Total acumulado</th>
                  <th className="num">Total gastado</th>
                  <th>Último movimiento</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(m => {
                  const tier = tierOf(m.points);
                  const next = TIERS.find(t => t.min > tier.min);
                  const pctNext = next ? Math.min((m.points / next.min) * 100, 100) : 100;
                  return (
                    <tr key={m.id} className="clickable" onClick={() => setDrawer(m)}>
                      <td>
                        <div style={{fontWeight:500}}>{m.nombre}</div>
                        <div className="code">{m.nit}</div>
                      </td>
                      <td>
                        <span className={`pill ${tier.pill}`} style={{fontSize:10}}>
                          {tier.icon} {tier.nombre}
                        </span>
                        {next && (
                          <div style={{marginTop:4, width:80}}>
                            <div style={{height:3, background:'var(--border)', borderRadius:2}}>
                              <div style={{height:'100%', width:`${pctNext}%`, background:'var(--accent)', borderRadius:2}}/>
                            </div>
                            <div style={{fontSize:9, color:'var(--muted)', marginTop:1}}>{next.min - m.points} pts para {next.nombre}</div>
                          </div>
                        )}
                      </td>
                      <td className="num" style={{fontWeight:700, color:'var(--accent)'}}>{pts(m.points)}</td>
                      <td className="num">{pts(m.earned)}</td>
                      <td className="num">{Qs(m.totalSpent)}</td>
                      <td style={{fontSize:11, color:'var(--muted)'}}>{m.lastPurchase}</td>
                      <td>
                        <button className="btn sm ghost" onClick={e => { e.stopPropagation(); setShowAjuste(m); setAjustePts(''); setAjusteNota(''); }}>
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredMembers.length === 0 && (
                  <tr><td colSpan={7} className="empty">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MOVIMIENTOS ──────────────────────────────────────────────────── */}
      {tab === 'movimientos' && (
        <div>
          <div style={{display:'flex', gap:4, marginBottom:14}}>
            {[{v:'todos',l:'Todos'},...Object.entries(TYPE_META).map(([v,m])=>({v,l:m.label}))].map(o => (
              <button key={o.v} className={`btn ${txnFiltro===o.v?'accent':''}`} style={{fontSize:11}}
                onClick={() => setTxnFiltro(o.v)}>{o.l}</button>
            ))}
          </div>

          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th className="num">Puntos</th>
                  <th className="num">Valor Q</th>
                  <th>Referencia</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxns.map(tx => {
                  const meta = TYPE_META[tx.type];
                  return (
                    <tr key={tx.id}>
                      <td className="code">{tx.id}</td>
                      <td style={{fontWeight:500}}>{tx.nombre}</td>
                      <td><span className={`pill ${meta.pill}`} style={{fontSize:10}}>{meta.icon} {meta.label}</span></td>
                      <td className="num" style={{fontWeight:600, color: tx.points > 0 ? 'var(--success)' : 'var(--danger)'}}>
                        {tx.points > 0 ? '+' : ''}{tx.points}
                      </td>
                      <td className="num" style={{color:'var(--muted)'}}>
                        {tx.monto !== 0 ? Q(Math.abs(tx.monto)) : '—'}
                      </td>
                      <td className="code">{tx.ref}</td>
                      <td style={{fontSize:11, color:'var(--muted)'}}>{tx.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CONFIGURACIÓN ────────────────────────────────────────────────── */}
      {tab === 'config' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div className="card" style={{padding:20}}>
            <div style={{fontWeight:600, fontSize:13, marginBottom:16}}>Reglas de acumulación</div>
            <div className="field" style={{marginBottom:12}}>
              <label>Puntos por cada Q10 gastados</label>
              <input type="number" defaultValue={CONFIG.puntosXQ10} style={{fontFamily:'var(--font-mono)'}}/>
            </div>
            <div className="field" style={{marginBottom:12}}>
              <label>Valor de 1 punto al canjear (Q)</label>
              <input type="number" defaultValue={CONFIG.valorPunto} step="0.01" style={{fontFamily:'var(--font-mono)'}}/>
            </div>
            <div className="field" style={{marginBottom:16}}>
              <label>Expiración por inactividad (meses)</label>
              <input type="number" defaultValue={CONFIG.expiracionMeses} style={{fontFamily:'var(--font-mono)'}}/>
            </div>
            <button className="btn accent" style={{width:'100%'}} onClick={() => pushToast?.('Configuración guardada', 'success')}>
              <Icon name="check" size={13}/>Guardar cambios
            </button>
          </div>

          <div className="card" style={{padding:20}}>
            <div style={{fontWeight:600, fontSize:13, marginBottom:16}}>Niveles de fidelización</div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th className="num">Desde</th>
                  <th className="num">Hasta</th>
                  <th className="num">Multiplicador</th>
                </tr>
              </thead>
              <tbody>
                {TIERS.map(t => (
                  <tr key={t.id}>
                    <td><span className={`pill ${t.pill}`} style={{fontSize:10}}>{t.icon} {t.nombre}</span></td>
                    <td className="num">{t.min.toLocaleString('es-GT')} pts</td>
                    <td className="num">{t.max === Infinity ? '∞' : t.max.toLocaleString('es-GT') + ' pts'}</td>
                    <td className="num" style={{fontWeight:600}}>{t.bonus}×</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:12, padding:'10px 12px', background:'var(--surface-2)', borderRadius:'var(--r-md)', fontSize:11, color:'var(--muted)'}}>
              El multiplicador se aplica sobre los puntos base al momento de la compra.
              Ejemplo: Oro compra Q200 → 20 pts base × 1.5 = <strong>30 pts</strong>.
            </div>
          </div>

          <div className="card" style={{padding:20, gridColumn:'1/-1'}}>
            <div style={{fontWeight:600, fontSize:13, marginBottom:14}}>Bonificaciones especiales</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
              {[
                { label:'Doble puntos fin de semana', activo:true,  desc:'Sáb y Dom — 2× sobre base' },
                { label:'Cumpleaños del cliente',      activo:true,  desc:'3× el día del cumpleaños' },
                { label:'Primera compra del mes',      activo:false, desc:'1.5× en la primera compra mensual' },
              ].map((b, i) => (
                <div key={i} className="card" style={{padding:14, display:'flex', gap:12, alignItems:'flex-start'}}>
                  <div style={{marginTop:2}}>
                    <div style={{width:14, height:14, borderRadius:3,
                      background: b.activo ? 'var(--success)' : 'var(--border)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff'}}>
                      {b.activo ? '✓' : ''}
                    </div>
                  </div>
                  <div>
                    <div style={{fontWeight:500, fontSize:12}}>{b.label}</div>
                    <div style={{fontSize:11, color:'var(--muted)', marginTop:2}}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DRAWER: detalle de cliente ────────────────────────────────────── */}
      {drawer && (
        <div className="drawer-overlay" onClick={() => setDrawer(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()} style={{width:420}}>
            <div className="drawer-head">
              <div>
                <div style={{fontWeight:700, fontSize:15}}>{drawer.nombre}</div>
                <div className="muted" style={{fontSize:11}}>NIT {drawer.nit} · Desde {drawer.joinDate}</div>
              </div>
              <button className="icon-btn" onClick={() => setDrawer(null)}><Icon name="x"/></button>
            </div>
            <div className="drawer-body" style={{padding:20}}>
              {(() => {
                const tier = tierOf(drawer.points);
                const next = TIERS.find(t => t.min > tier.min);
                const pctNext = next ? Math.min((drawer.points / next.min) * 100, 100) : 100;
                const memberTxns = TXNS.filter(t => t.memberId === drawer.id);
                return (
                  <>
                    <div style={{textAlign:'center', marginBottom:20}}>
                      <span className={`pill ${tier.pill}`} style={{fontSize:14, padding:'4px 14px'}}>
                        {tier.icon} {tier.nombre}
                      </span>
                      <div style={{fontFamily:'var(--font-mono)', fontWeight:700, fontSize:28, marginTop:10, color:'var(--accent)'}}>
                        {drawer.points.toLocaleString('es-GT')} pts
                      </div>
                      <div style={{fontSize:12, color:'var(--muted)'}}>
                        ≈ {Q(drawer.points * CONFIG.valorPunto)} disponibles para canje
                      </div>
                    </div>

                    {next && (
                      <div className="card" style={{padding:12, marginBottom:16}}>
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:6}}>
                          <span>Progreso a <strong>{next.nombre}</strong></span>
                          <span className="muted">{next.min - drawer.points} pts restantes</span>
                        </div>
                        <div style={{height:7, background:'var(--border)', borderRadius:4}}>
                          <div style={{height:'100%', width:`${pctNext}%`, background:'var(--accent)', borderRadius:4}}/>
                        </div>
                      </div>
                    )}

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20}}>
                      {[
                        { label:'Acumulados', val:pts(drawer.earned) },
                        { label:'Canjeados',  val:pts(drawer.redeemed) },
                        { label:'Total gastado', val:Qs(drawer.totalSpent) },
                      ].map(s => (
                        <div key={s.label} className="card" style={{padding:10, textAlign:'center'}}>
                          <div style={{fontSize:10, color:'var(--muted)', marginBottom:4}}>{s.label}</div>
                          <div style={{fontFamily:'var(--font-mono)', fontWeight:600, fontSize:12}}>{s.val}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, fontFamily:'var(--font-mono)'}}>
                      Últimos movimientos
                    </div>
                    {memberTxns.length === 0 && <div className="muted" style={{fontSize:12}}>Sin movimientos registrados.</div>}
                    {memberTxns.slice(0,5).map(tx => {
                      const meta = TYPE_META[tx.type];
                      return (
                        <div key={tx.id} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)'}}>
                          <span className={`pill ${meta.pill}`} style={{fontSize:10}}>{meta.label}</span>
                          <div style={{flex:1}}>
                            <div className="code" style={{fontSize:11}}>{tx.ref}</div>
                            <div style={{fontSize:10.5, color:'var(--muted)'}}>{tx.date}</div>
                          </div>
                          <div style={{fontFamily:'var(--font-mono)', fontWeight:700, fontSize:13,
                            color: tx.points > 0 ? 'var(--success)' : 'var(--danger)'}}>
                            {tx.points > 0 ? '+' : ''}{tx.points} pts
                          </div>
                        </div>
                      );
                    })}

                    <button className="btn" style={{width:'100%', marginTop:16}}
                      onClick={() => { setDrawer(null); setShowAjuste(drawer); setAjustePts(''); setAjusteNota(''); }}>
                      Ajustar puntos manualmente
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ajuste de puntos ───────────────────────────────────────── */}
      {showAjuste && (
        <div className="modal-overlay" onClick={() => setShowAjuste(null)}>
          <div className="modal" style={{width:420}} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Ajuste de puntos</h3>
              <button className="icon-btn" onClick={() => setShowAjuste(null)}><Icon name="x"/></button>
            </div>
            <div className="modal-body">
              <div style={{padding:'10px 14px', background:'var(--surface-2)', borderRadius:'var(--r-md)', marginBottom:14, fontSize:12}}>
                <strong>{showAjuste.nombre}</strong>
                <span className="muted" style={{marginLeft:8}}>Saldo actual: <strong>{pts(showAjuste.points)}</strong></span>
              </div>
              <div className="field" style={{marginBottom:12}}>
                <label>Puntos (positivo = agregar, negativo = descontar)</label>
                <input
                  type="number"
                  value={ajustePts}
                  onChange={e => setAjustePts(e.target.value)}
                  placeholder="Ej. +50 o -20"
                  style={{fontFamily:'var(--font-mono)'}}
                />
              </div>
              <div className="field">
                <label>Motivo del ajuste</label>
                <input type="text" value={ajusteNota} onChange={e => setAjusteNota(e.target.value)}
                  placeholder="Ej. Compensación por error en caja"/>
              </div>
              {ajustePts && (
                <div style={{marginTop:12, padding:'10px 14px', background:'var(--surface-2)', borderRadius:'var(--r-md)', fontSize:12}}>
                  Nuevo saldo: <strong style={{fontFamily:'var(--font-mono)'}}>
                    {pts(Math.max(0, showAjuste.points + (parseInt(ajustePts) || 0)))}
                  </strong>
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setShowAjuste(null)}>Cancelar</button>
              <button className="btn accent" onClick={() => {
                pushToast?.(`Ajuste de ${ajustePts} pts aplicado a ${showAjuste.nombre}`, 'success');
                setShowAjuste(null);
              }}>
                <Icon name="check" size={13}/>Aplicar ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
