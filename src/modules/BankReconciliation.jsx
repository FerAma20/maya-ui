// ERP MAYA — Conciliación Bancaria
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { ACCOUNTING_PERIODS } from '../data/mock.js';
import { useTranslation } from 'react-i18next';

const Q       = v  => `Q ${Math.abs(v).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = d  => new Date(d + 'T00:00').toLocaleDateString('es-GT', { day: '2-digit', month: 'short' });

const BANK_ACCOUNTS = [
  { code: '110102', name: 'Banco Industrial CTA 001', bookBalance: 176500.00 },
  { code: '110103', name: 'Banco G&T Continental',    bookBalance: 45000.00  },
];

// ── Datos mock por cuenta_periodo ─────────────────────────────────────────

const STATEMENTS = {
  '110102_5': {
    openingBalance: 183000.00,
    stmtBalance:    185000.00,
    bankItems: [
      { id: 'BS1', date: '2026-05-02', desc: 'Comisión mantenimiento cuenta',    ref: 'CMN-052026', type: 'debit',  amount: 2500.00 },
      { id: 'BS2', date: '2026-05-08', desc: 'Comisión por transferencias',      ref: 'CMT-052026', type: 'debit',  amount: 350.00  },
      { id: 'BS3', date: '2026-05-10', desc: 'Cobro automático — Dist. XYZ',     ref: 'CAU-48201',  type: 'credit', amount: 7459.50 },
      { id: 'BS4', date: '2026-05-15', desc: 'Pago arrendamiento Zona 10',       ref: 'ARR-MAY26',  type: 'debit',  amount: 8500.00 },
      { id: 'BS5', date: '2026-05-22', desc: 'Transferencia recibida El Ahorro', ref: 'TRF-48821',  type: 'credit', amount: 5000.00 },
      { id: 'BS6', date: '2026-05-23', desc: 'Interés acreditado mayo 2026',     ref: 'INT-052026', type: 'credit', amount: 890.50  },
    ],
    bookItems: [
      { id: 'BK1', date: '2026-05-15', desc: 'Pago arrendamiento ARR-MAY26',        ref: 'ARR-MAY26', type: 'credit', amount: 8500.00 },
      { id: 'BK2', date: '2026-05-22', desc: 'Cobro cliente CxC — El Ahorro',       ref: 'TRF-48821', type: 'debit',  amount: 5000.00 },
      { id: 'BK3', date: '2026-05-23', desc: 'Depósito ventas efectivo — Turno 1',  ref: 'DEP-0523',  type: 'debit',  amount: 3200.00 },
      { id: 'BK4', date: '2026-05-24', desc: 'Depósito ventas efectivo — Turno 2',  ref: 'DEP-0524',  type: 'debit',  amount: 2050.00 },
      { id: 'BK5', date: '2026-05-20', desc: 'Cheque #0421 — Alimentos Maravilla',  ref: 'CHQ-0421',  type: 'credit', amount: 5200.00 },
      { id: 'BK6', date: '2026-05-23', desc: 'Cheque #0422 — Servicios Generales',  ref: 'CHQ-0422',  type: 'credit', amount: 3050.00 },
    ],
    initBank: ['BS4', 'BS5'],
    initBook: ['BK1', 'BK2'],
    // Adjusted balance target: 182,000.00
    // Bank: 185,000 + 5,250 (deposits in transit) - 8,250 (outstanding checks) = 182,000
    // Book: 176,500 + 8,350 (credits not in books) - 2,850 (charges not in books) = 182,000
  },
  '110103_5': {
    openingBalance: 45000.00,
    stmtBalance:    44250.00,
    bankItems: [
      { id: 'GBS1', date: '2026-05-05', desc: 'Comisión mantenimiento cuenta', ref: 'CMN-GT-052026', type: 'debit', amount: 750.00 },
    ],
    bookItems: [],
    initBank: [],
    initBook: [],
    // Adjusted balance target: 44,250
    // Bank: 44,250 (no book items unmatched)
    // Book: 45,000 - 750 (commission not in books) = 44,250
  },
};

// ── Fila de conciliación ──────────────────────────────────────────────────

function RecLine({ label, amount, bold, indent, section, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      gap: 8, padding: '4px 0', paddingLeft: indent ? 14 : 0,
    }}>
      <span style={{
        fontSize: section ? 11 : 12.5,
        color: section ? 'var(--muted)' : 'var(--text-1)',
        fontWeight: bold ? 700 : 400,
        fontStyle: section ? 'italic' : 'normal',
      }}>
        {label}
      </span>
      {amount != null && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: bold ? 700 : 400,
          color: amount < 0 ? 'var(--danger)' : 'var(--text-1)',
          whiteSpace: 'nowrap',
        }}>
          {amount < 0 ? `(${Q(amount)})` : Q(amount)}
        </span>
      )}
    </div>
  );
}

// ── Panel de ítems ─────────────────────────────────────────────────────────

function ItemPanel({ title, badge, items, matched, onToggle, emptyMsg }) {
  const { t } = useTranslation();
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{title}</span>
        <span className="pill neutral">{badge}</span>
      </div>
      <div className="table-wrap" style={{ border: 'none', margin: 0, borderRadius: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 32 }}></th>
              <th>{t('common.date', 'Fecha')}</th>
              <th>{t('bankrec.descRef', 'Descripción / Ref.')}</th>
              <th style={{ textAlign: 'right' }}>{t('bankrec.debit', 'Débito')}</th>
              <th style={{ textAlign: 'right' }}>{t('bankrec.credit', 'Crédito')}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 12.5 }}>
                  {emptyMsg}
                </td>
              </tr>
            )}
            {items.map(it => {
              const ok = matched.has(it.id);
              return (
                <tr
                  key={it.id}
                  className={ok ? 'rec-matched' : ''}
                  onClick={() => onToggle(it.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={ok} onChange={() => onToggle(it.id)} />
                  </td>
                  <td className="mono muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{fmtDate(it.date)}</td>
                  <td style={{ fontSize: 12.5 }}>
                    {it.desc}
                    <div className="mono muted" style={{ fontSize: 10 }}>{it.ref}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {it.type === 'debit'  ? <span className="danger">{Q(it.amount)}</span> : <span className="muted">—</span>}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {it.type === 'credit' ? <span className="success">{Q(it.amount)}</span> : <span className="muted">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────

export default function BankReconciliation() {
  const { t } = useTranslation();
  const [accountCode, setAccountCode] = useState('110102');
  const [periodId,    setPeriodId]    = useState(5);
  const [matchedBank, setMatchedBank] = useState(() => new Set(STATEMENTS['110102_5'].initBank));
  const [matchedBook, setMatchedBook] = useState(() => new Set(STATEMENTS['110102_5'].initBook));

  const key     = `${accountCode}_${periodId}`;
  const data    = STATEMENTS[key];
  const account = BANK_ACCOUNTS.find(a => a.code === accountCode);
  const period  = ACCOUNTING_PERIODS.find(p => p.id === periodId);

  const changeAccount = code => {
    setAccountCode(code);
    const d = STATEMENTS[`${code}_${periodId}`];
    setMatchedBank(new Set(d?.initBank ?? []));
    setMatchedBook(new Set(d?.initBook ?? []));
  };

  const toggleBank = id => setMatchedBank(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleBook = id => setMatchedBook(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const rec = useMemo(() => {
    if (!data) return null;

    const unmBankCredits = data.bankItems.filter(i => !matchedBank.has(i.id) && i.type === 'credit');
    const unmBankDebits  = data.bankItems.filter(i => !matchedBank.has(i.id) && i.type === 'debit');
    const unmBookDebits  = data.bookItems.filter(i => !matchedBook.has(i.id) && i.type === 'debit');
    const unmBookCredits = data.bookItems.filter(i => !matchedBook.has(i.id) && i.type === 'credit');

    const depositTransit   = unmBookDebits.reduce((s, i)  => s + i.amount, 0);
    const outstandingChecks = unmBookCredits.reduce((s, i) => s + i.amount, 0);
    const bankCreditsUnrec = unmBankCredits.reduce((s, i)  => s + i.amount, 0);
    const bankDebitsUnrec  = unmBankDebits.reduce((s, i)   => s + i.amount, 0);

    const adjBank = data.stmtBalance + depositTransit - outstandingChecks;
    const adjBook = account.bookBalance + bankCreditsUnrec - bankDebitsUnrec;
    const diff    = adjBank - adjBook;

    return {
      unmBankCredits, unmBankDebits, unmBookDebits, unmBookCredits,
      depositTransit, outstandingChecks, bankCreditsUnrec, bankDebitsUnrec,
      adjBank, adjBook, diff,
      balanced: Math.abs(diff) < 0.01,
    };
  }, [data, matchedBank, matchedBook, account]);

  const totalItems   = (data?.bankItems.length ?? 0) + (data?.bookItems.length ?? 0);
  const matchedTotal = matchedBank.size + matchedBook.size;

  if (!data) {
    return (
      <div className="page">
        <div className="page-head"><div className="page-title">{t('bankrec.title', 'Conciliación Bancaria')}</div></div>
        <p style={{ padding: 24, color: 'var(--muted)' }}>{t('bankrec.noData', 'No hay datos para este período.')}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">{t('bankrec.title', 'Conciliación Bancaria')}</div>
          <div className="page-sub">{account?.name} · {period?.name}</div>
        </div>
        <div className="page-head-actions">
          <select className="field-input" value={accountCode} onChange={e => changeAccount(e.target.value)}>
            {BANK_ACCOUNTS.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
          </select>
          <select className="field-input" value={periodId} onChange={e => setPeriodId(Number(e.target.value))}>
            {ACCOUNTING_PERIODS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className="btn-outline">
            <Icon name="receipt" size={13} /> {t('common.print', 'Imprimir')}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="label">{t('bankrec.stmtBalance', 'Saldo extracto')}</div>
          <div className="value">{Q(data.stmtBalance)}</div>
          <div className="sub muted">{t('bankrec.periodClose', 'Cierre de período')}</div>
        </div>
        <div className="stat-card">
          <div className="label">{t('bankrec.bookBalance', 'Saldo en libros')}</div>
          <div className="value">{Q(account.bookBalance)}</div>
          <div className="sub muted">{t('bankrec.account', 'Cuenta')} {accountCode}</div>
        </div>
        <div className="stat-card">
          <div className="label">{t('bankrec.adjustedDiff', 'Diferencia ajustada')}</div>
          <div className={`value ${rec?.balanced ? 'success' : 'danger'}`}>
            {rec ? Q(rec.diff) : '—'}
          </div>
          <div className={`sub ${rec?.balanced ? 'success' : 'danger'}`}>
            {rec?.balanced ? t('bankrec.balanced', '✓ Balance cuadrado') : t('bankrec.pendingAdjustment', '⚠ Pendiente de ajuste')}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">{t('bankrec.reconciledItems', 'Ítems conciliados')}</div>
          <div className="value">{matchedTotal} / {totalItems}</div>
          <div className="sub muted">{matchedBank.size} {t('bankrec.statement', 'extracto')} · {matchedBook.size} {t('bankrec.books', 'libros')}</div>
        </div>
      </div>

      {/* Dos paneles: extracto | libros */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <ItemPanel
          title={t('bankrec.bankStatement', 'Extracto Bancario')}
          badge={`${t('bankrec.opening', 'Apertura')} ${Q(data.openingBalance)}`}
          items={data.bankItems}
          matched={matchedBank}
          onToggle={toggleBank}
          emptyMsg={t('bankrec.noStatementMovements', 'Sin movimientos en extracto')}
        />
        <ItemPanel
          title={t('bankrec.bookMovements', 'Movimientos en Libros')}
          badge={`${t('bankrec.balance', 'Saldo')} ${Q(account.bookBalance)}`}
          items={data.bookItems}
          matched={matchedBook}
          onToggle={toggleBook}
          emptyMsg={t('bankrec.noBookMovements', 'Sin movimientos registrados en este período')}
        />
      </div>

      {/* Resumen de conciliación */}
      <div className="card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{t('bankrec.summary', 'Resumen de Conciliación')}</span>
          {rec?.balanced && <span className="pill success">{t('bankrec.balanced2', 'Cuadrado')}</span>}
          {rec && !rec.balanced && <span className="pill danger">{t('bankrec.difference', 'Diferencia')} {Q(rec.diff)}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {/* Columna banco */}
          <div style={{ padding: '16px 20px', borderRight: '1px solid var(--border)' }}>
            <div className="rec-side-label">{t('bankrec.fromStatement', 'DESDE EL EXTRACTO BANCARIO')}</div>
            <RecLine label={t('bankrec.balancePerStatement', 'Saldo según extracto bancario')} amount={data.stmtBalance} bold />

            {rec?.unmBookDebits.length > 0 && (
              <>
                <RecLine label={t('bankrec.plusDepositsInTransit', 'Más: Depósitos en tránsito')} section />
                {rec.unmBookDebits.map(i => <RecLine key={i.id} label={i.desc} amount={i.amount} indent />)}
              </>
            )}
            {rec?.unmBookCredits.length > 0 && (
              <>
                <RecLine label={t('bankrec.lessOutstandingChecks', 'Menos: Cheques pendientes')} section />
                {rec.unmBookCredits.map(i => <RecLine key={i.id} label={i.desc} amount={-i.amount} indent />)}
              </>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
            <RecLine label={t('bankrec.adjustedBankBalance', 'Saldo ajustado del banco')} amount={rec?.adjBank} bold />
          </div>

          {/* Columna libros */}
          <div style={{ padding: '16px 20px' }}>
            <div className="rec-side-label">{t('bankrec.fromBooks', 'DESDE LOS LIBROS CONTABLES')}</div>
            <RecLine label={t('bankrec.balancePerBooks', 'Saldo según libros contables')} amount={account.bookBalance} bold />

            {rec?.unmBankCredits.length > 0 && (
              <>
                <RecLine label={t('bankrec.plusUnrecordedCredits', 'Más: Créditos bancarios no registrados')} section />
                {rec.unmBankCredits.map(i => <RecLine key={i.id} label={i.desc} amount={i.amount} indent />)}
              </>
            )}
            {rec?.unmBankDebits.length > 0 && (
              <>
                <RecLine label={t('bankrec.lessUnrecordedCharges', 'Menos: Cargos bancarios no registrados')} section />
                {rec.unmBankDebits.map(i => <RecLine key={i.id} label={i.desc} amount={-i.amount} indent />)}
              </>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
            <RecLine label={t('bankrec.adjustedBookBalance', 'Saldo ajustado en libros')} amount={rec?.adjBook} bold />
          </div>
        </div>

        {/* Diferencia final */}
        <div className={`rec-diff-row ${rec?.balanced ? 'balanced' : 'unbalanced'}`}>
          <span>{t('bankrec.difference', 'DIFERENCIA')}</span>
          <span className="mono">
            {rec
              ? rec.balanced
                ? `${Q(0)} ✓`
                : `(${Q(rec.diff)}) ⚠`
              : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
