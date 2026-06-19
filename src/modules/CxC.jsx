// ERP MAYA — Cuentas por Cobrar (CxC)
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { CLIENTS, CLIENT_PAYMENTS, Q } from '../data/mock.js';
import { useTranslation } from 'react-i18next';

// Simulated invoices per client (aging buckets: current, 1-30, 31-60, 61-90, 90+)
const CXC_INVOICES = [
  { id: 'F-2026-0841', clientId: 1, date: '2026-05-10', due: '2026-06-09', amount: 5200.00,  paid: 0,     status: 'open',      ref: 'T-2026-00142' },
  { id: 'F-2026-0798', clientId: 1, date: '2026-04-25', due: '2026-05-25', amount: 7200.00,  paid: 0,     status: 'overdue',   ref: 'T-2026-00110' },
  { id: 'F-2026-0822', clientId: 4, date: '2026-05-01', due: '2026-05-31', amount: 4800.00,  paid: 2000,  status: 'partial',   ref: 'T-2026-00128' },
  { id: 'F-2026-0691', clientId: 4, date: '2026-03-20', due: '2026-04-19', amount: 4000.00,  paid: 0,     status: 'overdue',   ref: 'T-2026-00081' },
  { id: 'F-2026-0840', clientId: 6, date: '2026-05-18', due: '2026-07-02', amount: 23900.00, paid: 15000, status: 'partial',   ref: 'T-2026-00141' },
  { id: 'F-2026-0712', clientId: 6, date: '2026-03-01', due: '2026-04-15', amount: 35000.00, paid: 12500, status: 'overdue',   ref: 'T-2026-00088' },
  { id: 'F-2026-0836', clientId: 7, date: '2026-05-12', due: '2026-06-11', amount: 8200.00,  paid: 0,     status: 'open',      ref: 'T-2026-00138' },
  { id: 'F-2026-0817', clientId: 7, date: '2026-04-30', due: '2026-05-30', amount: 6000.00,  paid: 0,     status: 'overdue',   ref: 'T-2026-00125' },
  { id: 'F-2026-0802', clientId: 2, date: '2026-05-05', due: '2026-05-20', amount: 2150.50,  paid: 0,     status: 'overdue',   ref: 'T-2026-00118' },
  { id: 'F-2026-0845', clientId: 8, date: '2026-05-20', due: '2026-06-04', amount: 450.00,   paid: 0,     status: 'open',      ref: 'T-2026-00145' },
  { id: 'F-2026-0801', clientId: 9, date: '2026-05-04', due: '2026-06-03', amount: 3200.00,  paid: 0,     status: 'open',      ref: 'T-2026-00117' },
  { id: 'F-2026-0776', clientId: 10,date: '2026-04-15', due: '2026-04-30', amount: 1850.00,  paid: 0,     status: 'overdue',   ref: 'T-2026-00101' },
];

const TODAY = new Date('2026-05-23');

function daysDue(dueStr) {
  const due = new Date(dueStr);
  return Math.floor((TODAY - due) / 86400000);
}

function agingBucket(inv) {
  if (inv.status === 'open' || inv.status === 'partial') {
    const d = daysDue(inv.due);
    if (d < 0) return 'current';
    if (d <= 30) return '1-30';
    if (d <= 60) return '31-60';
    return '61+';
  }
  const d = daysDue(inv.due);
  if (d <= 0) return 'current';
  if (d <= 30) return '1-30';
  if (d <= 60) return '31-60';
  if (d <= 90) return '61-90';
  return '90+';
}

const BUCKET_ORDER = ['current', '1-30', '31-60', '61-90', '90+'];
const BUCKET_CLASS = { current: 'success', '1-30': 'warning', '31-60': 'warning', '61-90': 'danger', '90+': 'danger' };
const STATUS_LABEL = { open: 'Abierta', partial: 'Parcial', overdue: 'Vencida', paid: 'Pagada' };
const STATUS_CLASS = { open: 'info', partial: 'warning', overdue: 'danger', paid: 'success' };
const PAY_METHODS = ['efectivo', 'transferencia', 'cheque', 'tarjeta'];

export default function CxC({ pushToast }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState('aging');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [invoices, setInvoices] = useState(CXC_INVOICES);
  const [payments, setPayments] = useState(CLIENT_PAYMENTS);
  const [payModal, setPayModal] = useState(null);  // invoice object
  const [selectedInv, setSelectedInv] = useState(null);

  const clients = useMemo(() => {
    const map = {};
    CLIENTS.forEach(c => { map[c.id] = c; });
    return map;
  }, []);

  // Enrich invoices with outstanding amount
  const enriched = useMemo(() => invoices.map(inv => ({
    ...inv,
    outstanding: +(inv.amount - inv.paid).toFixed(2),
    daysOverdue: daysDue(inv.due),
    bucket: agingBucket(inv),
    clientName: clients[inv.clientId]?.name || 'Desconocido',
  })), [invoices, clients]);

  // Stats
  const totalCxC = enriched.reduce((s, i) => s + i.outstanding, 0);
  const overdueAmt = enriched.filter(i => i.daysOverdue > 0 && i.outstanding > 0).reduce((s, i) => s + i.outstanding, 0);
  const openCount = enriched.filter(i => i.outstanding > 0).length;
  const criticalCount = enriched.filter(i => i.daysOverdue > 60 && i.outstanding > 0).length;

  // Aging summary by bucket
  const agingSummary = useMemo(() => {
    const buckets = {};
    BUCKET_ORDER.forEach(b => { buckets[b] = { count: 0, total: 0 }; });
    enriched.forEach(i => {
      if (i.outstanding <= 0) return;
      const b = i.bucket;
      if (!buckets[b]) buckets[b] = { count: 0, total: 0 };
      buckets[b].count++;
      buckets[b].total += i.outstanding;
    });
    return buckets;
  }, [enriched]);

  // Filtered invoices
  const filtered = useMemo(() => enriched.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (search && !i.clientName.toLowerCase().includes(search.toLowerCase()) && !i.id.includes(search)) return false;
    if (i.outstanding <= 0 && filterStatus === 'all') return false;
    return true;
  }), [enriched, search, filterStatus]);

  // Client aging view
  const clientAging = useMemo(() => {
    const map = {};
    enriched.forEach(i => {
      if (i.outstanding <= 0) return;
      if (!map[i.clientId]) map[i.clientId] = { client: clients[i.clientId], buckets: {}, total: 0 };
      const b = i.bucket;
      map[i.clientId].buckets[b] = (map[i.clientId].buckets[b] || 0) + i.outstanding;
      map[i.clientId].total += i.outstanding;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [enriched, clients]);

  function handlePayment({ invoiceId, amount, method, reference }) {
    const amt = parseFloat(amount);
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newPaid = Math.min(inv.paid + amt, inv.amount);
      return { ...inv, paid: newPaid, status: newPaid >= inv.amount ? 'paid' : 'partial' };
    }));
    const newPayment = {
      id: Date.now(),
      clientId: payModal.clientId,
      saleId: payModal.ref,
      amount: amt,
      date: '2026-05-23',
      paymentMethod: method,
      reference: reference || null,
      notes: `Abono a ${invoiceId}`,
    };
    setPayments(prev => [newPayment, ...prev]);
    setPayModal(null);
    pushToast(`Pago de ${Q(amt)} registrado — ${invoiceId}`, 'success');
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('cxc.title', 'Cuentas por Cobrar')}</h1>
          <div className="page-subtitle">Cartera de crédito · antigüedad · cobros</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat">
          <div className="label"><Icon name="card" size={11} />Total CxC</div>
          <div className="val mono">{Q(totalCxC)}</div>
          <div className="delta muted">{openCount} documentos abiertos</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="alert" size={11} />Cartera vencida</div>
          <div className="val mono" style={{ color: 'var(--danger)' }}>{Q(overdueAmt)}</div>
          <div className="delta muted">Saldo con plazo expirado</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="clock" size={11} />Crítico (+60 días)</div>
          <div className="val mono" style={{ color: criticalCount > 0 ? 'var(--danger)' : undefined }}>{criticalCount}</div>
          <div className="delta muted">Documentos en riesgo</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="cash" size={11} />Cobrado mayo</div>
          <div className="val mono" style={{ color: 'var(--success)' }}>{Q(payments.filter(p => p.date?.startsWith('2026-05')).reduce((s, p) => s + p.amount, 0))}</div>
          <div className="delta muted">Pagos recibidos en mayo</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['aging', 'Antigüedad por cliente'], ['invoices', 'Documentos'], ['payments', 'Cobros registrados']].map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'aging' && (
        <>
          {/* Aging buckets summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 24 }}>
            {BUCKET_ORDER.map(b => (
              <div key={b} className="card" style={{ padding: '14px 16px', borderTop: `3px solid var(--${BUCKET_CLASS[b]})` }}>
                <div className="muted" style={{ fontSize: 11, marginBottom: 4 }}>
                  {b === 'current' ? 'Por vencer' : `${b} días`}
                </div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{Q(agingSummary[b]?.total || 0)}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{agingSummary[b]?.count || 0} doc.</div>
              </div>
            ))}
          </div>

          {/* Client aging table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="tbl-wrap"><table className="tbl">
              <thead>
                <tr>
                  <th>{t('common.client', 'Cliente')}</th>
                  <th style={{ textAlign: 'right' }}>Por vencer</th>
                  <th style={{ textAlign: 'right' }}>1–30 días</th>
                  <th style={{ textAlign: 'right' }}>31–60 días</th>
                  <th style={{ textAlign: 'right' }}>61–90 días</th>
                  <th style={{ textAlign: 'right' }}>90+ días</th>
                  <th style={{ textAlign: 'right' }}>{t('common.total', 'Total')}</th>
                  <th>Límite</th>
                </tr>
              </thead>
              <tbody>
                {clientAging.map(row => {
                  const c = row.client;
                  const utilPct = c ? Math.min(100, (row.total / c.creditLimit) * 100) : 0;
                  return (
                    <tr key={c?.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c?.name}</div>
                        <div className="muted mono" style={{ fontSize: 10 }}>{c?.nit}</div>
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
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{Q(row.total)}</td>
                      <td>
                        {c?.creditLimit > 0 ? (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                              <span className="muted">{Math.round(utilPct)}%</span>
                              <span className="muted">{Q(c.creditLimit)}</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 2, background: 'var(--border)' }}>
                              <div style={{ height: '100%', borderRadius: 2, width: `${utilPct}%`, background: utilPct > 80 ? 'var(--danger)' : 'var(--accent)' }} />
                            </div>
                          </div>
                        ) : <span className="muted" style={{ fontSize: 11 }}>Sin crédito</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          </div>
        </>
      )}

      {tab === 'invoices' && (
        <>
          <div className="filterbar">
            <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
              <Icon name="search" className="icon" size={13} />
              <input className="search-input" placeholder={t('cxc.searchPlaceholder', 'Buscar cliente o documento…')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">{t('common.all', 'Todos')} los estados</option>
              <option value="open">Abiertos</option>
              <option value="partial">Parciales</option>
              <option value="overdue">Vencidos</option>
              <option value="paid">{t('common.completed', 'Pagados')}</option>
            </select>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="tbl-wrap"><table className="tbl">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>{t('common.client', 'Cliente')}</th>
                  <th>{t('common.date', 'Fecha')}</th>
                  <th>Vencimiento</th>
                  <th style={{ textAlign: 'right' }}>{t('common.amount', 'Monto')}</th>
                  <th style={{ textAlign: 'right' }}>Pendiente</th>
                  <th>Antigüedad</th>
                  <th>{t('common.status', 'Estado')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="empty">Sin documentos</td></tr>
                ) : filtered.map(inv => (
                  <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedInv(inv)}>
                    <td><span className="mono" style={{ fontSize: 12 }}>{inv.id}</span></td>
                    <td style={{ fontSize: 13 }}>{inv.clientName}</td>
                    <td className="muted" style={{ fontSize: 12 }}>{inv.date}</td>
                    <td style={{ fontSize: 12, color: inv.daysOverdue > 0 ? 'var(--danger)' : 'inherit' }}>{inv.due}</td>
                    <td style={{ textAlign: 'right', fontSize: 13 }}>{Q(inv.amount)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{Q(inv.outstanding)}</td>
                    <td>
                      {inv.outstanding > 0 && (
                        <span className={`pill ${BUCKET_CLASS[inv.bucket]}`} style={{ fontSize: 9 }}>
                          {inv.bucket === 'current' ? 'Al día' : `${inv.bucket} días`}
                        </span>
                      )}
                    </td>
                    <td><span className={`pill ${STATUS_CLASS[inv.status]}`} style={{ fontSize: 9 }}>{STATUS_LABEL[inv.status]}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      {inv.outstanding > 0 && (
                        <button className="btn" style={{ fontSize: 11, padding: '3px 10px' }}
                          onClick={() => setPayModal(inv)}>
                          Cobrar
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
                <th>{t('common.date', 'Fecha')}</th>
                <th>{t('common.client', 'Cliente')}</th>
                <th>{t('common.reference', 'Referencia')}</th>
                <th>Método</th>
                <th style={{ textAlign: 'right' }}>{t('common.amount', 'Monto')}</th>
                <th>{t('common.notes', 'Notas')}</th>
              </tr>
            </thead>
            <tbody>
              {[...payments].sort((a, b) => b.date?.localeCompare(a.date)).map(p => (
                <tr key={p.id}>
                  <td className="muted" style={{ fontSize: 12 }}>{p.date}</td>
                  <td style={{ fontSize: 13 }}>{clients[p.clientId]?.name || '—'}</td>
                  <td><span className="mono" style={{ fontSize: 11 }}>{p.reference || p.saleId || '—'}</span></td>
                  <td><span className={`pill info`} style={{ fontSize: 9, textTransform: 'capitalize' }}>{p.paymentMethod}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{Q(p.amount)}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{p.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {/* Invoice detail drawer */}
      {selectedInv && (
        <div className="drawer-overlay" onClick={() => setSelectedInv(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <div className="drawer-title">{selectedInv.id}</div>
                <div className="muted" style={{ fontSize: 12 }}>{selectedInv.clientName}</div>
              </div>
              <button className="icon-btn" onClick={() => setSelectedInv(null)}><Icon name="close" /></button>
            </div>
            <div className="drawer-body detail-grid">
              <Row label={t('common.client', 'Cliente')} value={selectedInv.clientName} />
              <Row label="Ticket de origen" value={selectedInv.ref} mono />
              <Row label="Fecha emisión" value={selectedInv.date} />
              <Row label="Fecha vencimiento" value={selectedInv.due} />
              <Row label={t('common.amount', 'Monto total')} value={Q(selectedInv.amount)} />
              <Row label="Pagado" value={Q(selectedInv.paid)} />
              <Row label="Pendiente" value={Q(selectedInv.outstanding)} bold />
              <Row label="Antigüedad" value={selectedInv.daysOverdue > 0 ? `${selectedInv.daysOverdue} días vencido` : 'Al día'} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                <span className={`pill ${STATUS_CLASS[selectedInv.status]}`}>{STATUS_LABEL[selectedInv.status]}</span>
                {selectedInv.outstanding > 0 && (
                  <button className="btn" onClick={() => { setSelectedInv(null); setPayModal(selectedInv); }}>
                    <Icon name="cash" size={13} /> Registrar cobro
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {payModal && (
        <PayModal
          invoice={payModal}
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

function PayModal({ invoice, onClose, onSave }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(invoice.outstanding.toString());
  const [method, setMethod] = useState('efectivo');
  const [reference, setReference] = useState('');

  const valid = parseFloat(amount) > 0 && parseFloat(amount) <= invoice.outstanding;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Registrar cobro</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label className="field-label">Documento</label>
            <div className="mono" style={{ fontSize: 13, padding: '6px 0' }}>{invoice.id} — {invoice.clientName}</div>
          </div>
          <div className="field">
            <label className="field-label">{t('clients.payment.pendingBalance', 'Saldo pendiente')}</label>
            <div style={{ fontWeight: 700, color: 'var(--danger)', padding: '6px 0' }}>{Q(invoice.outstanding)}</div>
          </div>
          <div className="field">
            <label className="field-label">Monto a cobrar (Q)</label>
            <input type="number" className="field-input mono" value={amount}
              min="0.01" max={invoice.outstanding} step="0.01"
              onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">{t('clients.payment.method', 'Método de pago')}</label>
            <select className="field-input" value={method} onChange={e => setMethod(e.target.value)}>
              {PAY_METHODS.map(m => <option key={m} value={m} style={{ textTransform: 'capitalize' }}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
          </div>
          {method !== 'efectivo' && (
            <div className="field">
              <label className="field-label">{t('clients.payment.reference', 'Referencia / No. cheque / transferencia')}</label>
              <input className="field-input" value={reference} onChange={e => setReference(e.target.value)} placeholder="Ej. TRF-48912" />
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>{t('common.cancel', 'Cancelar')}</button>
          <button
            className="btn"
            disabled={!valid}
            onClick={() => onSave({ invoiceId: invoice.id, amount, method, reference })}
          >
            <Icon name="check" size={13} /> Registrar cobro
          </button>
        </div>
      </div>
    </div>
  );
}
