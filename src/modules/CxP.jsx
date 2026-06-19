// ERP MAYA — Cuentas por Pagar (CxP)
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { SUPPLIERS } from '../data/mock.js';

const Q = v => `Q ${v.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const TODAY = new Date('2026-05-24');

// Facturas de proveedor pendientes de pago
const CXP_BILLS = [
  // Al corriente
  { id: 'FP-2026-0142', supplierId: 'pv01', ocId: 'OC-2026-0142', date: '2026-05-20', dueDate: '2026-06-19', amount: 8420.00,  paid: 0,      status: 'open'    },
  { id: 'FP-2026-0140', supplierId: 'pv05', ocId: 'OC-2026-0140', date: '2026-05-19', dueDate: '2026-06-03', amount: 3680.50,  paid: 0,      status: 'open'    },
  { id: 'FP-2026-0138', supplierId: 'pv04', ocId: 'OC-2026-0138', date: '2026-05-18', dueDate: '2026-07-02', amount: 6840.00,  paid: 0,      status: 'open'    },
  { id: 'FP-2026-0137', supplierId: 'pv06', ocId: 'OC-2026-0137', date: '2026-05-17', dueDate: '2026-06-16', amount: 5320.00,  paid: 0,      status: 'open'    },
  { id: 'FP-2026-0136', supplierId: 'pv01', ocId: 'OC-2026-0136', date: '2026-05-16', dueDate: '2026-06-15', amount: 9840.50,  paid: 0,      status: 'open'    },
  // Parcial, próxima a vencer
  { id: 'FP-2026-0133', supplierId: 'pv05', ocId: 'OC-2026-0133', date: '2026-05-14', dueDate: '2026-05-29', amount: 2840.00,  paid: 1000,   status: 'partial' },
  // Vencidas 1-30 días
  { id: 'FP-2026-0120', supplierId: 'pv01', ocId: null,            date: '2026-04-20', dueDate: '2026-05-20', amount: 6300.00,  paid: 0,      status: 'open'    },
  { id: 'FP-2026-0105', supplierId: 'pv04', ocId: null,            date: '2026-03-20', dueDate: '2026-05-04', amount: 7850.00,  paid: 3500,   status: 'partial' },
  // Vencida 31-60 días
  { id: 'FP-2026-0095', supplierId: 'pv02', ocId: null,            date: '2026-04-08', dueDate: '2026-04-23', amount: 3200.00,  paid: 0,      status: 'open'    },
  // Vencida 61-90 días
  { id: 'FP-2026-0060', supplierId: 'pv06', ocId: null,            date: '2026-02-20', dueDate: '2026-03-21', amount: 4100.00,  paid: 0,      status: 'open'    },
  // Vencida +90 días
  { id: 'FP-2026-0040', supplierId: 'pv01', ocId: null,            date: '2026-01-10', dueDate: '2026-02-09', amount: 12100.00, paid: 0,      status: 'open'    },
  // Pagada (historial)
  { id: 'FP-2026-0134', supplierId: 'pv03', ocId: 'OC-2026-0134', date: '2026-05-15', dueDate: '2026-05-15', amount: 14400.00, paid: 14400,  status: 'paid'    },
];

const INIT_PAYMENTS = [
  { id: 1, billId: 'FP-2026-0134', supplierId: 'pv03', amount: 14400.00, date: '2026-05-15', method: 'efectivo',      reference: null,        notes: 'Pago contado — Cervecería' },
  { id: 2, billId: 'FP-2026-0133', supplierId: 'pv05', amount: 1000.00,  date: '2026-05-16', method: 'transferencia',  reference: 'TRF-49001', notes: 'Abono parcial' },
  { id: 3, billId: 'FP-2026-0105', supplierId: 'pv04', amount: 3500.00,  date: '2026-04-15', method: 'cheque',         reference: 'CHQ-00298', notes: 'Abono Quaker' },
];

function daysDue(dueDateStr) {
  return Math.floor((TODAY - new Date(dueDateStr)) / 86400000);
}

function agingBucket(bill) {
  const balance = bill.amount - bill.paid;
  if (balance <= 0) return 'paid';
  const d = daysDue(bill.dueDate);
  if (d <= 0)  return 'current';
  if (d <= 30) return '1-30';
  if (d <= 60) return '31-60';
  if (d <= 90) return '61-90';
  return '90+';
}

const BUCKET_ORDER = ['current', '1-30', '31-60', '61-90', '90+'];
const BUCKET_LABEL = { current: 'Por vencer', '1-30': '1-30 días', '31-60': '31-60 días', '61-90': '61-90 días', '90+': '+90 días' };
const BUCKET_CLASS = { current: 'success', '1-30': 'warning', '31-60': 'warning', '61-90': 'danger', '90+': 'danger' };
const STATUS_LABEL = { open: 'Abierta', partial: 'Parcial', paid: 'Pagada' };
const STATUS_CLASS = { open: 'info', partial: 'warning', paid: 'success' };
const PAY_METHODS  = ['efectivo', 'transferencia', 'cheque', 'tarjeta'];

export default function CxP({ pushToast }) {
  const [tab, setTab]               = useState('aging');
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [bills, setBills]           = useState(CXP_BILLS);
  const [payments, setPayments]     = useState(INIT_PAYMENTS);
  const [payModal, setPayModal]     = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);

  const suppliers = useMemo(() => {
    const map = {};
    SUPPLIERS.forEach(s => { map[s.id] = s; });
    return map;
  }, []);

  const enriched = useMemo(() => bills.map(b => ({
    ...b,
    balance:      +(b.amount - b.paid).toFixed(2),
    daysOverdue:  daysDue(b.dueDate),
    bucket:       agingBucket(b),
    supplierName: suppliers[b.supplierId]?.name || 'Desconocido',
  })), [bills, suppliers]);

  // Stats
  const totalCxP   = enriched.reduce((s, b) => s + b.balance, 0);
  const overdueAmt  = enriched.filter(b => b.daysOverdue > 0 && b.balance > 0).reduce((s, b) => s + b.balance, 0);
  const openCount   = enriched.filter(b => b.balance > 0).length;
  const criticalCount = enriched.filter(b => b.daysOverdue > 60 && b.balance > 0).length;
  const paidMayo    = payments.filter(p => p.date?.startsWith('2026-05')).reduce((s, p) => s + p.amount, 0);

  const agingSummary = useMemo(() => {
    const buckets = {};
    BUCKET_ORDER.forEach(b => { buckets[b] = { count: 0, total: 0 }; });
    enriched.forEach(b => {
      if (b.balance <= 0) return;
      const bk = b.bucket;
      if (!buckets[bk]) buckets[bk] = { count: 0, total: 0 };
      buckets[bk].count++;
      buckets[bk].total += b.balance;
    });
    return buckets;
  }, [enriched]);

  const filtered = useMemo(() => enriched.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (filterStatus === 'all' && b.balance <= 0) return false;
    if (search && !b.supplierName.toLowerCase().includes(search.toLowerCase()) && !b.id.includes(search)) return false;
    return true;
  }), [enriched, search, filterStatus]);

  const supplierAging = useMemo(() => {
    const map = {};
    enriched.forEach(b => {
      if (b.balance <= 0) return;
      if (!map[b.supplierId]) map[b.supplierId] = { supplier: suppliers[b.supplierId], buckets: {}, total: 0 };
      map[b.supplierId].buckets[b.bucket] = (map[b.supplierId].buckets[b.bucket] || 0) + b.balance;
      map[b.supplierId].total += b.balance;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [enriched, suppliers]);

  function handlePayment({ billId, amount, method, reference }) {
    const amt = parseFloat(amount);
    setBills(prev => prev.map(b => {
      if (b.id !== billId) return b;
      const newPaid = Math.min(b.paid + amt, b.amount);
      return { ...b, paid: newPaid, status: newPaid >= b.amount ? 'paid' : 'partial' };
    }));
    setPayments(prev => [{
      id: Date.now(),
      billId,
      supplierId: payModal.supplierId,
      amount: amt,
      date: '2026-05-24',
      method,
      reference: reference || null,
      notes: `Pago a ${billId}`,
    }, ...prev]);
    setPayModal(null);
    pushToast(`Pago de ${Q(amt)} registrado — ${billId}`, 'success');
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Cuentas por Pagar</h1>
          <div className="page-subtitle">Obligaciones con proveedores · antigüedad · pagos</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat">
          <div className="label"><Icon name="receipt" size={11} />Total CxP</div>
          <div className="val mono">{Q(totalCxP)}</div>
          <div className="delta muted">{openCount} documentos pendientes</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="alert" size={11} />Obligaciones vencidas</div>
          <div className="val mono" style={{ color: 'var(--danger)' }}>{Q(overdueAmt)}</div>
          <div className="delta muted">Saldo con plazo expirado</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="clock" size={11} />Crítico (+60 días)</div>
          <div className="val mono" style={{ color: criticalCount > 0 ? 'var(--danger)' : undefined }}>{criticalCount}</div>
          <div className="delta muted">Facturas en mora crítica</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="cash" size={11} />Pagado en mayo</div>
          <div className="val mono" style={{ color: 'var(--success)' }}>{Q(paidMayo)}</div>
          <div className="delta muted">Pagos realizados en mayo</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['aging', 'Antigüedad por proveedor'], ['bills', 'Documentos'], ['payments', 'Pagos realizados']].map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'aging' && (
        <>
          {/* Aging bucket summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 24 }}>
            {BUCKET_ORDER.map(b => (
              <div key={b} className="card" style={{ padding: '14px 16px', borderTop: `3px solid var(--${BUCKET_CLASS[b]})` }}>
                <div className="muted" style={{ fontSize: 11, marginBottom: 4 }}>{BUCKET_LABEL[b]}</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{Q(agingSummary[b]?.total || 0)}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{agingSummary[b]?.count || 0} doc.</div>
              </div>
            ))}
          </div>

          {/* Aging by supplier table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="tbl-wrap"><table className="tbl">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th style={{ textAlign: 'right' }}>Por vencer</th>
                  <th style={{ textAlign: 'right' }}>1–30 días</th>
                  <th style={{ textAlign: 'right' }}>31–60 días</th>
                  <th style={{ textAlign: 'right' }}>61–90 días</th>
                  <th style={{ textAlign: 'right' }}>+90 días</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Plazo</th>
                </tr>
              </thead>
              <tbody>
                {supplierAging.length === 0 ? (
                  <tr><td colSpan={8} className="empty">Sin obligaciones pendientes</td></tr>
                ) : supplierAging.map(row => {
                  const s = row.supplier;
                  const hasOverdue = BUCKET_ORDER.slice(1).some(b => row.buckets[b] > 0);
                  return (
                    <tr key={s?.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s?.name}</div>
                        <div className="muted mono" style={{ fontSize: 10 }}>{s?.nit}</div>
                      </td>
                      {BUCKET_ORDER.map(b => (
                        <td key={b} style={{ textAlign: 'right', fontSize: 13 }}>
                          {row.buckets[b] ? (
                            <span style={{ color: b === 'current' ? 'inherit' : `var(--${BUCKET_CLASS[b]})`, fontWeight: b !== 'current' ? 600 : 400 }}>
                              {Q(row.buckets[b])}
                            </span>
                          ) : <span className="muted">—</span>}
                        </td>
                      ))}
                      <td style={{ textAlign: 'right', fontWeight: 700, color: hasOverdue ? 'var(--danger)' : 'inherit' }}>
                        {Q(row.total)}
                      </td>
                      <td>
                        <span className={`pill ${hasOverdue ? 'danger' : 'success'}`} style={{ fontSize: 9 }}>
                          {s?.terms || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          </div>
        </>
      )}

      {tab === 'bills' && (
        <>
          <div className="filterbar">
            <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
              <Icon name="search" className="icon" size={13} />
              <input className="search-input" placeholder="Buscar proveedor o documento…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">Todos los estados</option>
              <option value="open">Abiertos</option>
              <option value="partial">Parciales</option>
              <option value="paid">Pagados</option>
            </select>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="tbl-wrap"><table className="tbl">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Proveedor</th>
                  <th>OC</th>
                  <th>Emisión</th>
                  <th>Vencimiento</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                  <th style={{ textAlign: 'right' }}>Pendiente</th>
                  <th>Antigüedad</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="empty">Sin documentos</td></tr>
                ) : filtered.map(b => (
                  <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedBill(b)}>
                    <td><span className="mono" style={{ fontSize: 12 }}>{b.id}</span></td>
                    <td style={{ fontSize: 13 }}>{b.supplierName}</td>
                    <td><span className="mono muted" style={{ fontSize: 11 }}>{b.ocId || '—'}</span></td>
                    <td className="muted" style={{ fontSize: 12 }}>{b.date}</td>
                    <td style={{ fontSize: 12, color: b.daysOverdue > 0 ? 'var(--danger)' : 'inherit' }}>{b.dueDate}</td>
                    <td style={{ textAlign: 'right', fontSize: 13 }}>{Q(b.amount)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{Q(b.balance)}</td>
                    <td>
                      {b.balance > 0 && (
                        <span className={`pill ${BUCKET_CLASS[b.bucket]}`} style={{ fontSize: 9 }}>
                          {b.bucket === 'current' ? 'Al día' : `${b.bucket} días`}
                        </span>
                      )}
                    </td>
                    <td><span className={`pill ${STATUS_CLASS[b.status]}`} style={{ fontSize: 9 }}>{STATUS_LABEL[b.status]}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      {b.balance > 0 && (
                        <button className="btn" style={{ fontSize: 11, padding: '3px 10px' }}
                          onClick={() => setPayModal(b)}>
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </>
      )}

      {tab === 'payments' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="tbl-wrap"><table className="tbl">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Documento</th>
                <th>Referencia</th>
                <th>Método</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {[...payments].sort((a, b) => b.date?.localeCompare(a.date)).map(p => (
                <tr key={p.id}>
                  <td className="muted" style={{ fontSize: 12 }}>{p.date}</td>
                  <td style={{ fontSize: 13 }}>{suppliers[p.supplierId]?.name || '—'}</td>
                  <td><span className="mono" style={{ fontSize: 11 }}>{p.billId}</span></td>
                  <td><span className="mono" style={{ fontSize: 11 }}>{p.reference || '—'}</span></td>
                  <td><span className="pill info" style={{ fontSize: 9, textTransform: 'capitalize' }}>{p.method}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>{Q(p.amount)}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{p.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {/* Drawer detalle de factura */}
      {selectedBill && (
        <div className="drawer-overlay" onClick={() => setSelectedBill(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <div className="drawer-title">{selectedBill.id}</div>
                <div className="muted" style={{ fontSize: 12 }}>{selectedBill.supplierName}</div>
              </div>
              <button className="icon-btn" onClick={() => setSelectedBill(null)}><Icon name="close" /></button>
            </div>
            <div className="drawer-body detail-grid">
              <Row label="Proveedor"     value={selectedBill.supplierName} />
              <Row label="OC relacionada" value={selectedBill.ocId || '—'} mono />
              <Row label="Fecha emisión"  value={selectedBill.date} />
              <Row label="Vencimiento"    value={selectedBill.dueDate} />
              <Row label="Monto total"    value={Q(selectedBill.amount)} />
              <Row label="Pagado"         value={Q(selectedBill.paid)} />
              <Row label="Saldo pendiente" value={Q(selectedBill.balance)} bold />
              <Row label="Antigüedad"
                value={selectedBill.daysOverdue > 0
                  ? `${selectedBill.daysOverdue} días vencida`
                  : `Vence en ${Math.abs(selectedBill.daysOverdue)} días`}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                <span className={`pill ${STATUS_CLASS[selectedBill.status]}`}>{STATUS_LABEL[selectedBill.status]}</span>
                {selectedBill.balance > 0 && (
                  <button className="btn" onClick={() => { setSelectedBill(null); setPayModal(selectedBill); }}>
                    <Icon name="cash" size={13} /> Registrar pago
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago */}
      {payModal && (
        <PayModal
          bill={payModal}
          onClose={() => setPayModal(null)}
          onSave={handlePayment}
        />
      )}
    </div>
  );
}

function Row({ label, value, mono, bold }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={mono ? 'mono' : ''} style={{ fontSize: 13, fontWeight: bold ? 700 : 400, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function PayModal({ bill, onClose, onSave }) {
  const [amount, setAmount]       = useState(bill.balance.toString());
  const [method, setMethod]       = useState('efectivo');
  const [reference, setReference] = useState('');

  const valid = parseFloat(amount) > 0 && parseFloat(amount) <= bill.balance;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Registrar pago</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label className="field-label">Documento</label>
            <div className="mono" style={{ fontSize: 13, padding: '6px 0' }}>{bill.id} — {bill.supplierName}</div>
          </div>
          <div className="field">
            <label className="field-label">Saldo pendiente</label>
            <div style={{ fontWeight: 700, color: 'var(--danger)', padding: '6px 0' }}>{Q(bill.balance)}</div>
          </div>
          <div className="field">
            <label className="field-label">Monto a pagar (Q)</label>
            <input type="number" className="field-input mono" value={amount}
              min="0.01" max={bill.balance} step="0.01"
              onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Método de pago</label>
            <select className="field-input" value={method} onChange={e => setMethod(e.target.value)}>
              {PAY_METHODS.map(m => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </div>
          {method !== 'efectivo' && (
            <div className="field">
              <label className="field-label">Referencia / No. cheque / transferencia</label>
              <input className="field-input" value={reference} onChange={e => setReference(e.target.value)} placeholder="Ej. TRF-49102" />
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn"
            disabled={!valid}
            onClick={() => onSave({ billId: bill.id, amount, method, reference })}
          >
            <Icon name="check" size={13} /> Registrar pago
          </button>
        </div>
      </div>
    </div>
  );
}
