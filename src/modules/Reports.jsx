// ERP MAYA — ReportsModule (ES module)
import { AreaChart } from './Dashboard.jsx';
import Icon from '../components/Icon.jsx';
import * as MAYA from '../data/mock.js';
// ERP MAYA — Reports module
import React, { useState as useStateRpt } from 'react';
import { useTranslation } from 'react-i18next';
function ReportsModule() {
  const { t } = useTranslation();
  const { Q, Qs, SALES_TREND, SALES_BY_CAT, TOP_PRODUCTS, PURCHASE_ORDERS, SUPPLIERS, BRANCHES, TICKETS } = MAYA;
  const [section, setSection] = useStateRpt('ventas');
  const [range, setRange] = useStateRpt('14d');

  const totalSales = SALES_TREND.reduce((s, d) => s + d.total, 0);
  const totalTickets = SALES_TREND.reduce((s, d) => s + d.tickets, 0);
  const totalPurchases = PURCHASE_ORDERS.filter(p => p.status !== 'cancelled').reduce((s, p) => s + p.total, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('reports.title', 'Reportería')}</h1>
          <div className="page-subtitle">Análisis de ventas, compras y rentabilidad · 21 May 2026</div>
        </div>
        <div className="page-head-actions">
          <div className="filterbar" style={{margin:0, padding:'4px 6px'}}>
            {['Hoy','7d','14d','30d','90d','MTD','YTD'].map(r => (
              <button key={r} className={`chip ${range === r.toLowerCase() ? 'active' : ''}`} onClick={() => setRange(r.toLowerCase())}>{r}</button>
            ))}
          </div>
          <button className="btn"><Icon name="download"/>{t('reports.export', 'Excel')}</button>
          <button className="btn"><Icon name="print"/>{t('reports.print', 'PDF')}</button>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${section==='ventas'?'active':''}`} onClick={() => setSection('ventas')}>{t('reports.tabs.sales', 'Reportes de ventas')}</div>
        <div className={`tab ${section==='compras'?'active':''}`} onClick={() => setSection('compras')}>Reportes de compras</div>
        <div className={`tab ${section==='rentabilidad'?'active':''}`} onClick={() => setSection('rentabilidad')}>Rentabilidad &amp; márgenes</div>
        <div className={`tab ${section==='caja'?'active':''}`} onClick={() => setSection('caja')}>Cierres de caja</div>
        <div className={`tab ${section==='fiscal'?'active':''}`} onClick={() => setSection('fiscal')}>Reportes fiscales (SAT)</div>
      </div>

      {section === 'ventas' && (
        <>
          <div className="stat-grid">
            <div className="stat">
              <div className="label"><Icon name="cash" size={11}/>Ventas totales</div>
              <div className="val mono">{Qs(totalSales)}</div>
              <div className="delta up"><Icon name="arrowUp" size={11}/>14.2% vs período ant.</div>
            </div>
            <div className="stat">
              <div className="label"><Icon name="receipt" size={11}/>Tickets emitidos</div>
              <div className="val mono">{totalTickets.toLocaleString()}</div>
              <div className="delta up"><Icon name="arrowUp" size={11}/>8.6%</div>
            </div>
            <div className="stat">
              <div className="label"><Icon name="chart" size={11}/>{t('dashboard.kpis.avgTicket', 'Ticket promedio')}</div>
              <div className="val mono">{Q(totalSales/totalTickets)}</div>
              <div className="delta up"><Icon name="arrowUp" size={11}/>5.1%</div>
            </div>
            <div className="stat">
              <div className="label"><Icon name="users" size={11}/>Clientes únicos</div>
              <div className="val mono">1,842</div>
              <div className="delta up"><Icon name="arrowUp" size={11}/>12.4%</div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <h3>Tendencia de ventas</h3>
                <div className="meta">Q en miles · diario</div>
              </div>
              <div className="row gap-6">
                <button className="btn sm ghost">Por sucursal</button>
                <button className="btn sm ghost">Por cajero</button>
                <button className="btn sm ghost">Por hora</button>
              </div>
            </div>
            <div className="card-body">
              <AreaChart data={SALES_TREND}/>
            </div>
          </div>

          <div className="grid-2 mt-12">
            <div className="card">
              <div className="card-head"><h3>Ventas por sucursal</h3><span className="meta">MTD</span></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>{t('common.branch', 'Sucursal')}</th>
                      <th className="num">Tickets</th>
                      <th className="num">Ventas</th>
                      <th className="num">Promedio</th>
                      <th className="num">% Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {BRANCHES.map(b => {
                      const monthly = b.sales * 22;
                      const pct = (monthly / BRANCHES.reduce((s, x) => s + x.sales * 22, 0)) * 100;
                      const tk = Math.round(monthly / 145);
                      return (
                        <tr key={b.id}>
                          <td>
                            <div style={{fontWeight:500}}>{b.name}</div>
                            <div className="muted" style={{fontSize:10.5}}>{b.addr}</div>
                          </td>
                          <td className="num">{tk.toLocaleString()}</td>
                          <td className="num" style={{fontWeight:600}}>{Qs(monthly)}</td>
                          <td className="num">{Q(monthly/tk)}</td>
                          <td className="num">{pct.toFixed(1)}%</td>
                          <td>
                            <div className="bar" style={{width:60}}><div style={{width: pct + '%'}}/></div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3>Ranking de cajeros</h3><span className="meta">MTD</span></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cajero</th>
                      <th>{t('common.branch', 'Sucursal')}</th>
                      <th className="num">Tickets</th>
                      <th className="num">Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { rk:1, name:'Carlos Méndez', br:'Zona 10', tk:842, sales:124800 },
                      { rk:2, name:'José Ramírez',   br:'Mixco',   tk:782, sales:118400 },
                      { rk:3, name:'María Hernández',br:'Centro',  tk:728, sales:96800 },
                      { rk:4, name:'Pedro Morales',  br:'Antigua', tk:512, sales:64200 },
                      { rk:5, name:'Lucía Castillo', br:'Zona 10', tk:384, sales:48600 },
                      { rk:6, name:'Sofía Aguilar',  br:'Centro',  tk:268, sales:32400 },
                    ].map(c => (
                      <tr key={c.rk}>
                        <td className="code">{String(c.rk).padStart(2,'0')}</td>
                        <td style={{fontWeight:500}}>{c.name}</td>
                        <td>{c.br}</td>
                        <td className="num">{c.tk.toLocaleString()}</td>
                        <td className="num" style={{fontWeight:600}}>{Qs(c.sales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid-2 mt-12">
            <div className="card">
              <div className="card-head"><h3>{t('dashboard.charts.topProducts', 'Top 10 productos vendidos')}</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('common.product', 'Producto')}</th>
                      <th className="num">{t('common.quantity', 'Unidades')}</th>
                      <th className="num">Ventas</th>
                      <th className="num">∆</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOP_PRODUCTS.map((p, i) => (
                      <tr key={p.sku}>
                        <td className="code">{String(i+1).padStart(2,'0')}</td>
                        <td><div style={{fontWeight:500}}>{p.name}</div><div className="code muted" style={{fontSize:10.5}}>{p.sku.slice(-7)}</div></td>
                        <td className="num">{p.qty}</td>
                        <td className="num" style={{fontWeight:600}}>{Q(p.total)}</td>
                        <td className="num" style={{color: p.trend.startsWith('+') ? 'var(--success)':'var(--danger)'}}>{p.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3>Ventas por método de pago</h3></div>
              <div className="card-body">
                {[
                  { m:'Efectivo',      v:124800, pct:42, c:'var(--success)' },
                  { m:'Tarjeta',       v:142200, pct:48, c:'var(--info)' },
                  { m:'Transferencia', v:29800,  pct:10, c:'var(--accent)' },
                ].map(r => (
                  <div key={r.m} style={{marginBottom:14}}>
                    <div className="row" style={{justifyContent:'space-between', marginBottom:4, fontSize:12.5}}>
                      <span style={{fontWeight:500}}>{r.m}</span>
                      <span><span className="mono" style={{fontWeight:600}}>{Qs(r.v)}</span> <span className="muted mono">({r.pct}%)</span></span>
                    </div>
                    <div className="bar"><div style={{width: r.pct + '%', background: r.c}}/></div>
                  </div>
                ))}
                <div className="hr"></div>
                <div className="row" style={{justifyContent:'space-between', fontSize:12.5}}>
                  <span className="muted">Total facturado MTD</span>
                  <span className="mono" style={{fontWeight:700, fontSize:15}}>{Qs(296800)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {section === 'compras' && (
        <>
          <div className="stat-grid">
            <div className="stat">
              <div className="label"><Icon name="truck" size={11}/>Compras MTD</div>
              <div className="val mono">{Qs(totalPurchases)}</div>
              <div className="delta up"><Icon name="arrowUp" size={11}/>6.8% vs mes ant.</div>
            </div>
            <div className="stat">
              <div className="label"><Icon name="receipt" size={11}/>Órdenes emitidas</div>
              <div className="val mono">{PURCHASE_ORDERS.length}</div>
              <div className="delta muted">{PURCHASE_ORDERS.filter(p => p.status==='pending').length} {t('common.pending', 'pendientes')}</div>
            </div>
            <div className="stat">
              <div className="label"><Icon name="supplier" size={11}/>Proveedores activos</div>
              <div className="val mono">{SUPPLIERS.length}</div>
              <div className="delta muted">2 nuevos este mes</div>
            </div>
            <div className="stat">
              <div className="label"><Icon name="cash" size={11}/>Cuentas por pagar</div>
              <div className="val mono" style={{color:'var(--warning)'}}>{Qs(SUPPLIERS.reduce((s,sp)=>s+sp.balance,0))}</div>
              <div className="delta dn"><Icon name="alert" size={11}/>3 facturas vencen esta sem.</div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Órdenes de compra recientes</h3><button className="btn sm accent"><Icon name="plus"/>Nueva OC</button></div>
            <div className="card-body flush">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>No. OC</th>
                    <th>{t('common.date', 'Fecha')}</th>
                    <th>{t('common.supplier', 'Proveedor')}</th>
                    <th>{t('common.branch', 'Sucursal')}</th>
                    <th className="num">Items</th>
                    <th className="num">{t('common.total', 'Total')}</th>
                    <th>{t('common.status', 'Estado')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {PURCHASE_ORDERS.map(po => (
                    <tr key={po.id}>
                      <td className="code" style={{color:'var(--accent)', fontWeight:600}}>{po.id}</td>
                      <td className="code">{po.date}</td>
                      <td>{po.supplier}</td>
                      <td>{po.branch}</td>
                      <td className="num">{po.items}</td>
                      <td className="num" style={{fontWeight:600}}>{Q(po.total)}</td>
                      <td>
                        {po.status === 'received' && <span className="pill success"><span className="dot"/>Recibida</span>}
                        {po.status === 'pending' && <span className="pill warning"><span className="dot"/>{t('common.pending', 'Pendiente')}</span>}
                        {po.status === 'partial' && <span className="pill info"><span className="dot"/>Parcial</span>}
                        {po.status === 'cancelled' && <span className="pill danger"><span className="dot"/>{t('common.cancelled', 'Anulada')}</span>}
                      </td>
                      <td><button className="icon-btn"><Icon name="dots"/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid-2 mt-12">
            <div className="card">
              <div className="card-head"><h3>Top proveedores por monto</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('common.supplier', 'Proveedor')}</th>
                      <th>NIT</th>
                      <th className="num">OCs</th>
                      <th className="num">Comprado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUPPLIERS.slice(0,6).map((s, i) => (
                      <tr key={s.id}>
                        <td className="code">{String(i+1).padStart(2,'0')}</td>
                        <td><div style={{fontWeight:500}}>{s.name}</div><div className="muted" style={{fontSize:10.5}}>{s.contact}</div></td>
                        <td className="code">{s.nit}</td>
                        <td className="num">{Math.floor(Math.random()*15)+3}</td>
                        <td className="num" style={{fontWeight:600}}>{Qs(s.balance * (3 + Math.random()*4))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3>Cuentas por pagar &amp; vencimientos</h3></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>{t('common.supplier', 'Proveedor')}</th>
                      <th>Términos</th>
                      <th className="num">Saldo</th>
                      <th>Vence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUPPLIERS.filter(s => s.balance > 0).map((s, i) => {
                      const days = [3, 12, 28, 45][i % 4];
                      return (
                        <tr key={s.id}>
                          <td>
                            <div style={{fontWeight:500}}>{s.name.split(',')[0]}</div>
                            <div className="muted code" style={{fontSize:10.5}}>{s.nit}</div>
                          </td>
                          <td>{s.terms}</td>
                          <td className="num" style={{fontWeight:600}}>{Q(s.balance)}</td>
                          <td>
                            {days < 7 && <span className="pill danger"><span className="dot"/>{days}d</span>}
                            {days >= 7 && days < 30 && <span className="pill warning"><span className="dot"/>{days}d</span>}
                            {days >= 30 && <span className="pill"><span className="dot"/>{days}d</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {section === 'rentabilidad' && (
        <>
          <div className="stat-grid">
            <div className="stat">
              <div className="label">Ingresos brutos</div>
              <div className="val mono">{Qs(totalSales)}</div>
              <div className="delta up">+14.2%</div>
            </div>
            <div className="stat">
              <div className="label">Costo de ventas</div>
              <div className="val mono">{Qs(totalSales*0.68)}</div>
              <div className="delta muted">68% sobre ventas</div>
            </div>
            <div className="stat">
              <div className="label">{t('dashboard.kpis.gross', 'Margen bruto')}</div>
              <div className="val mono" style={{color:'var(--success)'}}>{Qs(totalSales*0.32)}</div>
              <div className="delta up">32.0% promedio</div>
            </div>
            <div className="stat">
              <div className="label">Productos no rentables</div>
              <div className="val mono" style={{color:'var(--warning)'}}>14</div>
              <div className="delta dn">{t('common.margin', 'Margen')} &lt;10%</div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Análisis de margen por categoría</h3></div>
            <div className="card-body flush">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{t('common.category', 'Categoría')}</th>
                    <th className="num">Ventas</th>
                    <th className="num">{t('common.cost', 'Costo')}</th>
                    <th className="num">Utilidad</th>
                    <th className="num">{t('common.margin', 'Margen')} %</th>
                    <th>Distribución</th>
                  </tr>
                </thead>
                <tbody>
                  {SALES_BY_CAT.map((c, i) => {
                    const cost = c.sales * (0.60 + Math.random()*0.20);
                    const util = c.sales - cost;
                    const margin = util / c.sales * 100;
                    return (
                      <tr key={c.cat}>
                        <td style={{fontWeight:500}}>{c.cat}</td>
                        <td className="num">{Qs(c.sales)}</td>
                        <td className="num muted">{Qs(cost)}</td>
                        <td className="num" style={{fontWeight:600, color:'var(--success)'}}>{Qs(util)}</td>
                        <td className="num" style={{fontWeight:600, color: margin > 35 ? 'var(--success)' : margin > 20 ? 'var(--text-2)' : 'var(--warning)'}}>{margin.toFixed(1)}%</td>
                        <td><div className="bar" style={{width:120}}><div style={{width: margin*2 + '%'}}/></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {section === 'caja' && (
        <>
          <div className="alert" style={{marginBottom:12, background:'var(--success-soft)', color:'var(--success)', borderColor:'transparent'}}>
            <Icon name="check" size={14}/>
            <span>Última caja cerrada · Caja #03 · Zona 10 · 20 May 2026 23:48 por Carlos Méndez · diferencia <strong>Q 0.00</strong></span>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Historial de cierres de caja</h3>
              <button className="btn sm accent"><Icon name="cash"/>Realizar cierre</button>
            </div>
            <div className="card-body flush">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Fecha cierre</th>
                    <th>Caja</th>
                    <th>Cajero</th>
                    <th>{t('common.branch', 'Sucursal')}</th>
                    <th className="num">Apertura</th>
                    <th className="num">Ventas efec.</th>
                    <th className="num">Egresos</th>
                    <th className="num">Esperado</th>
                    <th className="num">Contado</th>
                    <th className="num">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { d:'2026-05-20 23:48', cj:'03', us:'Carlos Méndez', br:'Zona 10', op:500, vt:18420, eg:0, esp:18920, ct:18920, df:0 },
                    { d:'2026-05-20 23:42', cj:'02', us:'María Hernández', br:'Centro', op:500, vt:9840, eg:200, esp:10140, ct:10130, df:-10 },
                    { d:'2026-05-20 23:30', cj:'04', us:'José Ramírez', br:'Mixco', op:500, vt:14300, eg:0, esp:14800, ct:14800, df:0 },
                    { d:'2026-05-20 23:18', cj:'05', us:'Pedro Morales', br:'Antigua', op:500, vt:6840, eg:50, esp:7290, ct:7295, df:5 },
                    { d:'2026-05-19 23:52', cj:'03', us:'Carlos Méndez', br:'Zona 10', op:500, vt:21200, eg:0, esp:21700, ct:21700, df:0 },
                    { d:'2026-05-19 23:46', cj:'02', us:'María Hernández', br:'Centro', op:500, vt:8420, eg:120, esp:8800, ct:8780, df:-20 },
                    { d:'2026-05-19 23:32', cj:'04', us:'José Ramírez', br:'Mixco', op:500, vt:12600, eg:0, esp:13100, ct:13100, df:0 },
                  ].map((c, i) => (
                    <tr key={i}>
                      <td className="code">{c.d}</td>
                      <td className="code">#{c.cj}</td>
                      <td>{c.us}</td>
                      <td>{c.br}</td>
                      <td className="num">{Q(c.op)}</td>
                      <td className="num">{Q(c.vt)}</td>
                      <td className="num">{Q(c.eg)}</td>
                      <td className="num">{Q(c.esp)}</td>
                      <td className="num" style={{fontWeight:600}}>{Q(c.ct)}</td>
                      <td className="num" style={{fontWeight:600, color: c.df === 0 ? 'var(--success)' : c.df > 0 ? 'var(--info)' : 'var(--danger)'}}>
                        {c.df > 0 ? '+' : ''}{Q(c.df)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {section === 'fiscal' && (
        <>
          <div className="grid-2">
            <div className="card">
              <div className="card-head"><h3>Libro de Ventas — Mayo 2026</h3><button className="btn sm"><Icon name="download"/>Excel SAT</button></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th className="num">Facturas</th>
                      <th className="num">Gravable</th>
                      <th className="num">IVA 12%</th>
                      <th className="num">{t('common.total', 'Total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SALES_TREND.slice(-10).map(d => (
                      <tr key={d.d}>
                        <td className="code">{d.d}</td>
                        <td className="num">{d.tickets}</td>
                        <td className="num">{Qs(d.total/1.12)}</td>
                        <td className="num muted">{Qs(d.total - d.total/1.12)}</td>
                        <td className="num" style={{fontWeight:600}}>{Qs(d.total)}</td>
                      </tr>
                    ))}
                    <tr style={{background:'var(--surface-2)'}}>
                      <td style={{fontWeight:700}}>{t('common.total', 'TOTAL')}</td>
                      <td className="num" style={{fontWeight:700}}>{SALES_TREND.slice(-10).reduce((s,d)=>s+d.tickets,0)}</td>
                      <td className="num" style={{fontWeight:700}}>{Qs(SALES_TREND.slice(-10).reduce((s,d)=>s+d.total/1.12,0))}</td>
                      <td className="num" style={{fontWeight:700}}>{Qs(SALES_TREND.slice(-10).reduce((s,d)=>s+(d.total-d.total/1.12),0))}</td>
                      <td className="num" style={{fontWeight:700}}>{Qs(SALES_TREND.slice(-10).reduce((s,d)=>s+d.total,0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3>Libro de Compras — Mayo 2026</h3><button className="btn sm"><Icon name="download"/>Excel SAT</button></div>
              <div className="card-body flush">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>{t('common.date', 'Fecha')}</th>
                      <th>NIT</th>
                      <th>Doc</th>
                      <th className="num">Gravable</th>
                      <th className="num">{t('common.iva', 'IVA')}</th>
                      <th className="num">{t('common.total', 'Total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PURCHASE_ORDERS.filter(p=>p.status!=='cancelled').map(po => (
                      <tr key={po.id}>
                        <td className="code">{po.date}</td>
                        <td className="code">{SUPPLIERS.find(s=>po.supplier.includes(s.name.split(',')[0]))?.nit || '—'}</td>
                        <td className="code">{po.id}</td>
                        <td className="num">{Q(po.total/1.12)}</td>
                        <td className="num muted">{Q(po.total-po.total/1.12)}</td>
                        <td className="num" style={{fontWeight:600}}>{Q(po.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ReportsModule;
