// ERP MAYA — Centros de Costo
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { ACCOUNTING_PERIODS } from '../data/mock.js';

const Q       = v  => `Q ${Number(v).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = d  => new Date(d + 'T00:00').toLocaleDateString('es-GT', { day: '2-digit', month: 'short' });
const pctBar  = (spent, budget) => budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
const barClass = pct => pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'success';

// ── Catálogo de centros ───────────────────────────────────────────────────

const INIT_CENTERS = [
  { code: 'CC-001', name: 'Ventas Zona 10',          group: 'Sucursales',     type: 'profit', responsible: 'Carlos Méndez',  budget: 35000, active: true  },
  { code: 'CC-002', name: 'Ventas Mixco',             group: 'Sucursales',     type: 'profit', responsible: 'Ana López',       budget: 28000, active: true  },
  { code: 'CC-003', name: 'Ventas Centro',            group: 'Sucursales',     type: 'profit', responsible: 'José Ramírez',    budget: 25000, active: true  },
  { code: 'CC-010', name: 'Administración General',   group: 'Administración', type: 'cost',   responsible: 'María Herrera',   budget: 12000, active: true  },
  { code: 'CC-011', name: 'Recursos Humanos',         group: 'Administración', type: 'cost',   responsible: 'Pedro García',    budget: 8000,  active: true  },
  { code: 'CC-020', name: 'Logística y Distribución', group: 'Operación',      type: 'cost',   responsible: 'Lucía Castillo',  budget: 10000, active: true  },
  { code: 'CC-021', name: 'Sistemas y TI',            group: 'Operación',      type: 'cost',   responsible: 'Roberto Silva',   budget: 5000,  active: false },
];

const GROUPS = ['Sucursales', 'Administración', 'Operación'];
const TYPE_LABEL = { profit: 'Centro de Utilidad', cost: 'Centro de Costo' };
const TYPE_CLASS = { profit: 'success', cost: '' };

// ── Líneas de gasto por período ───────────────────────────────────────────

const EXPENSE_LINES = [
  // CC-001 Ventas Zona 10
  { id: 1,  date: '2026-05-20', desc: 'Sueldos y Salarios (60%)',  account: '520101', accountName: 'Sueldos y Salarios',        ccCode: 'CC-001', periodId: 5, amount: 11160.00, distributed: true  },
  { id: 2,  date: '2026-05-15', desc: 'Arrendamiento Zona 10',     account: '530103', accountName: 'Arrendamientos',            ccCode: 'CC-001', periodId: 5, amount: 8500.00,  distributed: false },
  { id: 3,  date: '2026-05-20', desc: 'Energía Eléctrica (60%)',   account: '530104', accountName: 'Energía Eléctrica',         ccCode: 'CC-001', periodId: 5, amount: 3720.00,  distributed: true  },
  { id: 4,  date: '2026-05-10', desc: 'Material POP y exhibición', account: '530201', accountName: 'Material Publicitario',     ccCode: 'CC-001', periodId: 5, amount: 1850.00,  distributed: false },
  // CC-002 Ventas Mixco
  { id: 5,  date: '2026-05-20', desc: 'Sueldos y Salarios (25%)',  account: '520101', accountName: 'Sueldos y Salarios',        ccCode: 'CC-002', periodId: 5, amount: 4650.00,  distributed: true  },
  { id: 6,  date: '2026-05-18', desc: 'Arrendamiento Mixco',       account: '530103', accountName: 'Arrendamientos',            ccCode: 'CC-002', periodId: 5, amount: 6200.00,  distributed: false },
  { id: 7,  date: '2026-05-20', desc: 'Energía Eléctrica Mixco',   account: '530104', accountName: 'Energía Eléctrica',         ccCode: 'CC-002', periodId: 5, amount: 2800.00,  distributed: false },
  { id: 8,  date: '2026-05-14', desc: 'Suministros de oficina',    account: '530201', accountName: 'Suministros',               ccCode: 'CC-002', periodId: 5, amount: 920.00,   distributed: false },
  // CC-003 Ventas Centro
  { id: 9,  date: '2026-05-20', desc: 'Sueldos y Salarios (15%)',  account: '520101', accountName: 'Sueldos y Salarios',        ccCode: 'CC-003', periodId: 5, amount: 2790.00,  distributed: true  },
  { id: 10, date: '2026-05-18', desc: 'Arrendamiento Centro',      account: '530103', accountName: 'Arrendamientos',            ccCode: 'CC-003', periodId: 5, amount: 5800.00,  distributed: false },
  { id: 11, date: '2026-05-20', desc: 'Energía Eléctrica (20%)',   account: '530104', accountName: 'Energía Eléctrica',         ccCode: 'CC-003', periodId: 5, amount: 1240.00,  distributed: true  },
  { id: 12, date: '2026-05-08', desc: 'Transporte y encomiendas',  account: '530401', accountName: 'Transporte',                ccCode: 'CC-003', periodId: 5, amount: 1500.00,  distributed: false },
  // CC-010 Administración General
  { id: 13, date: '2026-05-15', desc: 'Comisiones Bancarias',      account: '540102', accountName: 'Comisiones Bancarias',      ccCode: 'CC-010', periodId: 5, amount: 2850.00,  distributed: false },
  { id: 14, date: '2026-05-10', desc: 'Papelería y útiles',        account: '530201', accountName: 'Suministros',               ccCode: 'CC-010', periodId: 5, amount: 650.00,   distributed: false },
  { id: 15, date: '2026-05-05', desc: 'Seguro empresa mayo',       account: '530501', accountName: 'Seguros',                   ccCode: 'CC-010', periodId: 5, amount: 2400.00,  distributed: false },
  // CC-011 Recursos Humanos
  { id: 16, date: '2026-05-20', desc: 'Capacitación personal',     account: '530601', accountName: 'Capacitación',              ccCode: 'CC-011', periodId: 5, amount: 3200.00,  distributed: false },
  { id: 17, date: '2026-05-12', desc: 'Uniformes personal',        account: '530701', accountName: 'Uniformes',                 ccCode: 'CC-011', periodId: 5, amount: 1800.00,  distributed: false },
  // CC-020 Logística
  { id: 18, date: '2026-05-16', desc: 'Combustible flota vehicular', account: '530801', accountName: 'Combustible',             ccCode: 'CC-020', periodId: 5, amount: 4800.00,  distributed: false },
  { id: 19, date: '2026-05-20', desc: 'Mantenimiento vehículos',   account: '530901', accountName: 'Mantenimiento',             ccCode: 'CC-020', periodId: 5, amount: 2200.00,  distributed: false },
  { id: 20, date: '2026-05-10', desc: 'Peajes y parqueo',          account: '530401', accountName: 'Transporte',                ccCode: 'CC-020', periodId: 5, amount: 380.00,   distributed: false },
];

// ── Modal: crear / editar centro ──────────────────────────────────────────

function CenterModal({ center, onSave, onClose }) {
  const [form, setForm] = useState(center || {
    code: '', name: '', group: GROUPS[0], type: 'cost', responsible: '', budget: '', active: true,
  });
  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.code.trim() && form.name.trim() && form.responsible.trim() && Number(form.budget) > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{center ? 'Editar centro' : 'Nuevo centro de costo'}</span>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field-group">
              <label className="field-label">Código</label>
              <input className="field-input" placeholder="CC-XXX" value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())} disabled={!!center} />
            </div>
            <div className="field-group">
              <label className="field-label">Tipo</label>
              <select className="field-input" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="cost">Centro de Costo</option>
                <option value="profit">Centro de Utilidad</option>
              </select>
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Nombre</label>
            <input className="field-input" placeholder="Nombre del centro" value={form.name}
              onChange={e => set('name', e.target.value)} />
          </div>
          <div className="field-group">
            <label className="field-label">Grupo</label>
            <select className="field-input" value={form.group} onChange={e => set('group', e.target.value)}>
              {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Responsable</label>
            <input className="field-input" placeholder="Nombre del responsable" value={form.responsible}
              onChange={e => set('responsible', e.target.value)} />
          </div>
          <div className="field-group">
            <label className="field-label">Presupuesto mensual (Q)</label>
            <input className="field-input" type="number" min="0" step="100" placeholder="0.00" value={form.budget}
              onChange={e => set('budget', e.target.value)} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn" disabled={!valid}
            onClick={() => onSave({ ...form, budget: Number(form.budget) })}>
            {center ? 'Guardar cambios' : 'Crear centro'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────

export default function CostCenters({ pushToast }) {
  const [tab, setTab]         = useState('catalog');
  const [centers, setCenters] = useState(INIT_CENTERS);
  const [periodId, setPeriodId] = useState(5);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [showModal, setShowModal]   = useState(false);

  const period = ACCOUNTING_PERIODS.find(p => p.id === periodId);

  // Gastos del período por centro
  const expByCenter = useMemo(() => {
    const lines = EXPENSE_LINES.filter(e => e.periodId === periodId);
    return lines.reduce((acc, e) => {
      if (!acc[e.ccCode]) acc[e.ccCode] = [];
      acc[e.ccCode].push(e);
      return acc;
    }, {});
  }, [periodId]);

  const totalSpent  = Object.values(expByCenter).flat().reduce((s, e) => s + e.amount, 0);
  const totalBudget = centers.filter(c => c.active).reduce((s, c) => s + c.budget, 0);
  const overCount   = centers.filter(c => {
    const spent = (expByCenter[c.code] || []).reduce((s, e) => s + e.amount, 0);
    return c.active && spent / c.budget >= 0.9;
  }).length;

  const openEdit = c => { setEditTarget(c); setShowModal(true); };
  const openNew  = ()  => { setEditTarget(null); setShowModal(true); };

  const saveCenter = form => {
    if (editTarget) {
      setCenters(prev => prev.map(c => c.code === form.code ? form : c));
      pushToast(`Centro "${form.name}" actualizado`, 'success');
    } else {
      setCenters(prev => [...prev, form]);
      pushToast(`Centro "${form.name}" creado`, 'success');
    }
    setShowModal(false);
  };

  const toggleActive = code => {
    setCenters(prev => prev.map(c => c.code === code ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Centros de Costo</div>
          <div className="page-sub">Seguimiento de gastos por área y sucursal</div>
        </div>
        <div className="page-head-actions">
          {tab === 'analysis' && (
            <select className="field-input" value={periodId} onChange={e => setPeriodId(Number(e.target.value))}>
              {ACCOUNTING_PERIODS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button className="btn" onClick={openNew}>
            <Icon name="plus" size={12} /> Nuevo centro
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="label">Centros activos</div>
          <div className="value">{centers.filter(c => c.active).length}</div>
          <div className="sub muted">{centers.length} en total</div>
        </div>
        <div className="stat-card">
          <div className="label">Gasto total período</div>
          <div className="value">{Q(totalSpent)}</div>
          <div className="sub muted">{period?.name}</div>
        </div>
        <div className="stat-card">
          <div className="label">Presupuesto total</div>
          <div className="value">{Q(totalBudget)}</div>
          <div className={`sub ${totalSpent / totalBudget > 0.9 ? 'danger' : 'muted'}`}>
            {((totalSpent / totalBudget) * 100).toFixed(1)}% utilizado
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Centros en alerta</div>
          <div className={`value ${overCount > 0 ? 'danger' : 'success'}`}>{overCount}</div>
          <div className="sub muted">≥ 90% del presupuesto</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 0 }}>
        <button className={`tab ${tab === 'catalog'  ? 'active' : ''}`} onClick={() => setTab('catalog')}>
          Catálogo
        </button>
        <button className={`tab ${tab === 'analysis' ? 'active' : ''}`} onClick={() => setTab('analysis')}>
          Análisis de Gastos
        </button>
      </div>

      {/* ── Tab: Catálogo ─────────────────────────────────────────────── */}
      {tab === 'catalog' && (
        <div className="card" style={{ borderTopLeftRadius: 0 }}>
          <div className="table-wrap" style={{ border: 'none', margin: 0, borderRadius: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Grupo</th>
                  <th>Tipo</th>
                  <th>Responsable</th>
                  <th style={{ textAlign: 'right' }}>Presupuesto / mes</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {GROUPS.map(grp => {
                  const rows = centers.filter(c => c.group === grp);
                  return (
                    <React.Fragment key={grp}>
                      <tr className="fs-section-hdr">
                        <td colSpan={8}>{grp.toUpperCase()}</td>
                      </tr>
                      {rows.map(c => (
                        <tr key={c.code} style={{ opacity: c.active ? 1 : 0.55 }}>
                          <td><span className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{c.code}</span></td>
                          <td style={{ fontWeight: 500 }}>{c.name}</td>
                          <td className="muted">{c.group}</td>
                          <td><span className={`pill ${TYPE_CLASS[c.type]}`}>{TYPE_LABEL[c.type]}</span></td>
                          <td style={{ fontSize: 12.5 }}>{c.responsible}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{Q(c.budget)}</td>
                          <td><span className={`pill ${c.active ? 'success' : ''}`}>{c.active ? 'Activo' : 'Inactivo'}</span></td>
                          <td style={{ display: 'flex', gap: 4 }}>
                            <button className="btn-ghost" onClick={() => openEdit(c)}>Editar</button>
                            <button className="btn-ghost" onClick={() => toggleActive(c.code)}>
                              {c.active ? 'Desactivar' : 'Activar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Análisis ─────────────────────────────────────────────── */}
      {tab === 'analysis' && (
        <div className="card" style={{ borderTopLeftRadius: 0 }}>
          <div className="table-wrap" style={{ border: 'none', margin: 0, borderRadius: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Centro</th>
                  <th>Responsable</th>
                  <th style={{ textAlign: 'right' }}>Gastado</th>
                  <th style={{ textAlign: 'right' }}>Presupuesto</th>
                  <th style={{ minWidth: 160 }}>Utilización</th>
                  <th style={{ textAlign: 'right' }}>Variación</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {GROUPS.map(grp => {
                  const rows = centers.filter(c => c.group === grp && c.active);
                  if (!rows.length) return null;
                  return (
                    <React.Fragment key={grp}>
                      <tr className="fs-section-hdr">
                        <td colSpan={7}>{grp.toUpperCase()}</td>
                      </tr>
                      {rows.map(c => {
                        const lines  = expByCenter[c.code] || [];
                        const spent  = lines.reduce((s, e) => s + e.amount, 0);
                        const pct    = pctBar(spent, c.budget);
                        const bc     = barClass(pct);
                        const varAmt = c.budget - spent;
                        return (
                          <tr key={c.code} onClick={() => setSelected({ center: c, lines })} style={{ cursor: 'pointer' }}>
                            <td>
                              <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginRight: 8 }}>{c.code}</span>
                              <strong style={{ fontSize: 13 }}>{c.name}</strong>
                            </td>
                            <td style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{c.responsible}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                              {Q(spent)}
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>
                              {Q(c.budget)}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{
                                    width: `${pct}%`, height: '100%', borderRadius: 3,
                                    background: bc === 'danger' ? 'var(--danger)' : bc === 'warning' ? 'var(--warning)' : 'var(--success)',
                                    transition: 'width 0.4s ease',
                                  }} />
                                </div>
                                <span style={{ fontSize: 11.5, color: 'var(--text-2)', minWidth: 38, textAlign: 'right' }}>
                                  {pct.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: varAmt >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                              {varAmt >= 0 ? '+' : ''}{Q(varAmt)}
                            </td>
                            <td>
                              <button className="btn-ghost" onClick={e => { e.stopPropagation(); setSelected({ center: c, lines }); }}>
                                Detalle
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Drawer: detalle de centro ──────────────────────────────────── */}
      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <div className="drawer" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{selected.center.name}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {selected.center.code} · {selected.center.group}
                </div>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)}><Icon name="close" /></button>
            </div>

            <div className="drawer-body">
              {/* Info rápida */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span className={`pill ${TYPE_CLASS[selected.center.type]}`}>{TYPE_LABEL[selected.center.type]}</span>
                <span className="pill neutral">Responsable: {selected.center.responsible}</span>
                <span className="pill neutral">{period?.name}</span>
              </div>

              {/* Gauge de presupuesto */}
              {(() => {
                const spent  = selected.lines.reduce((s, e) => s + e.amount, 0);
                const pct    = pctBar(spent, selected.center.budget);
                const bc     = barClass(pct);
                const varAmt = selected.center.budget - spent;
                return (
                  <div className="card" style={{ padding: '14px 16px', marginBottom: 16, background: 'var(--surface-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>GASTO DEL PERÍODO</div>
                        <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-mono)' }}>{Q(spent)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>PRESUPUESTO</div>
                        <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-mono)' }}>{Q(selected.center.budget)}</div>
                      </div>
                    </div>
                    <div style={{ height: 10, background: 'var(--surface-3)', borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', borderRadius: 5,
                        background: bc === 'danger' ? 'var(--danger)' : bc === 'warning' ? 'var(--warning)' : 'var(--success)',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: bc === 'danger' ? 'var(--danger)' : bc === 'warning' ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                        {pct.toFixed(1)}% utilizado
                      </span>
                      <span style={{ color: varAmt >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {varAmt >= 0 ? 'Disponible: ' : 'Excedido: '}{Q(Math.abs(varAmt))}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Detalle de gastos */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 8 }}>
                DESGLOSE DE GASTOS
              </div>
              {selected.lines.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
                  Sin gastos registrados en este período
                </div>
              ) : (
                <table className="tbl" style={{ marginBottom: 4 }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Descripción</th>
                      <th>Cuenta</th>
                      <th style={{ textAlign: 'right' }}>Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lines.map(e => (
                      <tr key={e.id}>
                        <td className="mono muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{fmtDate(e.date)}</td>
                        <td style={{ fontSize: 12.5 }}>
                          {e.desc}
                          {e.distributed && <span className="pill" style={{ marginLeft: 6, fontSize: 10 }}>Prorrateo</span>}
                        </td>
                        <td className="muted" style={{ fontSize: 11 }}>{e.accountName}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{Q(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, padding: '8px 16px' }}>Total</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '8px 16px' }}>
                        {Q(selected.lines.reduce((s, e) => s + e.amount, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            <div className="drawer-foot">
              <button className="btn-ghost" onClick={() => setSelected(null)}>Cerrar</button>
              <button className="btn-outline" onClick={() => { setSelected(null); openEdit(selected.center); }}>
                Editar centro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {showModal && (
        <CenterModal center={editTarget} onSave={saveCenter} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
