// ERP MAYA — BillingModule (ES module)
import Icon from '../components/Icon.jsx';
import * as MAYA from '../data/mock.js';
// ERP MAYA — Billing / Tickets module
import React, { useState as useStateBill, useMemo as useMemoBill } from 'react';
function BillingModule({ pushToast }) {
  const { Q, Qs, TICKETS, BRANCHES } = MAYA;
  const [search, setSearch] = useStateBill('');
  const [status, setStatus] = useStateBill('all');
  const [pay, setPay] = useStateBill('all');
  const [selected, setSelected] = useStateBill(null);

  const filtered = TICKETS.filter(t => {
    if (search && !t.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (status !== 'all' && t.status !== status) return false;
    if (pay !== 'all' && t.pay !== pay) return false;
    return true;
  });

  const totalDay = TICKETS.filter(t => t.status === 'paid').reduce((s,t) => s+t.total, 0);
  const totalRefund = TICKETS.filter(t => t.status === 'refunded').reduce((s,t) => s+t.total, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Facturación · Tickets de venta</h1>
          <div className="page-subtitle">Documentos emitidos hoy · Facturas digitales SAT-FEL · Sucursales activas</div>
        </div>
        <div className="page-head-actions">
          <button className="btn"><Icon name="download"/>Exportar libro IVA</button>
          <button className="btn"><Icon name="print"/>Imprimir lote</button>
          <button className="btn accent"><Icon name="receipt"/>Anular factura</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="label"><Icon name="receipt" size={11}/>Facturas emitidas hoy</div>
          <div className="val mono">{TICKETS.filter(t => t.status === 'paid').length}</div>
          <div className="delta muted">{TICKETS.length} en total</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="cash" size={11}/>Total facturado</div>
          <div className="val mono">{Qs(totalDay)}</div>
          <div className="delta up"><Icon name="arrowUp" size={11}/>IVA Q{Qs(totalDay*0.12/1.12)}</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="return" size={11}/>Anuladas / Devoluciones</div>
          <div className="val mono" style={{color:'var(--danger)'}}>−{Qs(totalRefund)}</div>
          <div className="delta dn">{TICKETS.filter(t=>t.status==='refunded').length} documentos</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="shield" size={11}/>Estado SAT-FEL</div>
          <div className="val mono" style={{color:'var(--success)', fontSize:16, marginTop:8}}>
            <span style={{display:'inline-block', width:9, height:9, borderRadius:'50%', background:'var(--success)', marginRight:6, verticalAlign:'middle'}}/>
            Conectado
          </div>
          <div className="delta muted">Sincronizado · hace 12s</div>
        </div>
      </div>

      <div className="filterbar">
        <div style={{position:'relative', width:240}}>
          <Icon name="search" size={12} style={{position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'var(--muted)'}}/>
          <input className="input" style={{width:'100%', paddingLeft:26}} placeholder="No. de factura, NIT…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="input">
          <option>Todas las sucursales</option>
          {BRANCHES.map(b => <option key={b.id}>{b.name}</option>)}
        </select>
        <div className="row gap-6">
          {[['all','Todos'],['paid','Pagadas'],['refunded','Anuladas']].map(([id, lbl]) => (
            <button key={id} className={`chip ${status===id?'active':''}`} onClick={()=>setStatus(id)}>{lbl}</button>
          ))}
        </div>
        <div className="row gap-6">
          {[['all','Pago'],['Efectivo','Efectivo'],['Tarjeta','Tarjeta'],['Transferencia','Transferencia']].map(([id, lbl]) => (
            <button key={id} className={`chip ${pay===id?'active':''}`} onClick={()=>setPay(id)}>{lbl}</button>
          ))}
        </div>
        <div className="grow"></div>
        <button className="btn sm"><Icon name="calendar" size={12}/>21 May 2026</button>
      </div>

      <div className="card">
        <div className="tbl-wrap" style={{maxHeight:'60vh'}}>
          <table className="tbl">
            <thead>
              <tr>
                <th><input type="checkbox"/></th>
                <th>No. Factura</th>
                <th>Fecha &amp; hora</th>
                <th>Sucursal</th>
                <th>Cajero</th>
                <th>Cliente · NIT</th>
                <th className="num">Items</th>
                <th>Pago</th>
                <th className="num">Subtotal</th>
                <th className="num">IVA</th>
                <th className="num">Total</th>
                <th>Estado</th>
                <th>FEL</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const sub = t.total / 1.12;
                const iva = t.total - sub;
                return (
                  <tr key={t.id} onClick={() => setSelected(t)} style={{cursor:'pointer'}}>
                    <td><input type="checkbox" onClick={e=>e.stopPropagation()}/></td>
                    <td className="code" style={{fontWeight:600, color:'var(--accent)'}}>{t.id}</td>
                    <td className="code">{t.date}</td>
                    <td>{t.branch}</td>
                    <td>{t.cashier}</td>
                    <td>
                      <div>CF · Cliente Final</div>
                      <div className="muted code" style={{fontSize:10.5}}>NIT CF</div>
                    </td>
                    <td className="num">{t.items}</td>
                    <td>
                      <span className="pill">
                        <Icon name={t.pay === 'Efectivo' ? 'cash' : t.pay === 'Tarjeta' ? 'card' : 'transfer'} size={10}/>
                        {t.pay}
                      </span>
                    </td>
                    <td className="num">{Q(sub)}</td>
                    <td className="num muted">{Q(iva)}</td>
                    <td className="num" style={{fontWeight:600}}>{Q(t.total)}</td>
                    <td>
                      {t.status === 'paid' && <span className="pill success"><span className="dot"/>Pagada</span>}
                      {t.status === 'refunded' && <span className="pill danger"><span className="dot"/>Anulada</span>}
                    </td>
                    <td>
                      <span className="pill info" title="Certificada SAT">
                        <Icon name="shield" size={9}/>OK
                      </span>
                    </td>
                    <td>
                      <button className="icon-btn" onClick={e=>e.stopPropagation()}><Icon name="print" size={13}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:'10px 14px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12}}>
          <div className="muted">Mostrando {filtered.length} de {TICKETS.length} documentos</div>
          <div className="row gap-6">
            <button className="btn sm ghost"><Icon name="chevronLeft" size={11}/></button>
            <span className="mono muted">1 / 14</span>
            <button className="btn sm ghost"><Icon name="chevronRight" size={11}/></button>
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div className="drawer-overlay" onClick={() => setSelected(null)}/>
          <div className="drawer" style={{width:560}}>
            <div className="drawer-head">
              <div>
                <div className="code muted" style={{fontSize:11}}>FACTURA</div>
                <h3 style={{margin:0, marginTop:2, fontSize:15, color:'var(--accent)'}}>{selected.id}</h3>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)}><Icon name="x"/></button>
            </div>
            <div className="drawer-body" style={{display:'flex', gap:16}}>
              <Ticket data={{
                id: selected.id,
                items: [
                  { sku:'7501031125678', name:'Coca-Cola 600ml', price:8.50, qty:2, unit:'unid' },
                  { sku:'7501055309856', name:'Arroz Blanco Premium 1kg', price:12.50, qty:1, unit:'unid' },
                  { sku:'7501055312987', name:'Sal Refinada 1kg', price:6.50, qty:1, unit:'unid' },
                  { sku:'7501073400025', name:'Galletas María Gamesa', price:5.00, qty:2, unit:'unid' },
                ],
                subtotal: selected.total,
                descTotal: 0,
                netGravable: selected.total / 1.12,
                iva: selected.total - selected.total/1.12,
                total: selected.total,
                pay: selected.pay.toLowerCase(),
                cashGiven: selected.total,
                change: 0,
                client: { name:'CF', nit:'CF' },
                date: new Date(selected.date),
              }}/>
              <div style={{flex:1, display:'flex', flexDirection:'column', gap:10}}>
                <div className="card">
                  <div className="card-head"><h3>Información SAT-FEL</h3></div>
                  <div className="card-body" style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'4px 10px', fontSize:12}}>
                    <div className="muted">UUID</div><div className="code">0E5F4C9A-26A2-4C7D-A8B1-{selected.id.slice(-12)}</div>
                    <div className="muted">Serie</div><div className="code">A</div>
                    <div className="muted">No. autorización</div><div className="code">{selected.id.replace('T','FEL')}</div>
                    <div className="muted">Fecha certif.</div><div className="code">{selected.date}</div>
                    <div className="muted">Régimen</div><div>General</div>
                    <div className="muted">Estado</div><div><span className="pill success"><span className="dot"/>Certificada</span></div>
                  </div>
                </div>
                <div className="row gap-6">
                  <button className="btn primary" style={{flex:1}}><Icon name="print"/>Reimprimir</button>
                  <button className="btn" style={{flex:1}}><Icon name="download"/>PDF</button>
                </div>
                <div className="row gap-6">
                  <button className="btn" style={{flex:1}}><Icon name="transfer"/>Enviar correo</button>
                  <button className="btn danger" style={{flex:1}}><Icon name="x"/>Anular</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BillingModule;
