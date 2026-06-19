// ERP MAYA — Mayor General + Balance de Comprobación
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { ACCOUNTS, JOURNAL_ENTRIES, ACCOUNTING_PERIODS } from '../data/mock.js';

const Q  = v => `Q ${Math.abs(v).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const Qn = v => v === 0 ? '—' : Q(v);

// ── Saldos iniciales al 01-mayo-2026 (acumulado ene–abr) ─────────────────────
// Positivo = saldo deudor, Negativo = saldo acreedor
const OPENING = {
  '110101':  12000,
  '110102': 180000,
  '110103':  45000,
  '110201':  65000,
  '110301': 280000,
  '1105':    8200,
  '120101':  85000,
  '210101': -42000,
  '210201':  -6800,
  '210401':      0,
  '3101':  -400000,
  '3103':  -180000,
  '3104':   -46400,
  '410101':      0,
  '410102':      0,
  '510101':      0,
  '520101':      0,
  '530103':      0,
  '530104':      0,
  '540102':      0,
};

// Normaliza el saldo: si la cuenta es de naturaleza deudora el signo es positivo,
// si es acreedora el signo es negativo. Ya viene así en OPENING.
function normalSign(account) {
  return account?.normalBalance === 'credit' ? -1 : 1;
}

// ── Hook: movimientos del período por cuenta ──────────────────────────────────
function useLedger(periodId) {
  return useMemo(() => {
    const accountMap = {};
    ACCOUNTS.forEach(a => { accountMap[a.code] = a; });

    // Recopilar todas las líneas del período
    const lines = JOURNAL_ENTRIES
      .filter(e => e.periodId === periodId && e.status === 'posted')
      .flatMap(entry =>
        entry.lines.map(line => ({
          ...line,
          date: entry.date,
          entryId: entry.id,
          reference: entry.reference,
          description: entry.description,
          entryType: entry.type,
        }))
      )
      .sort((a, b) => a.date.localeCompare(b.date) || a.entryId - b.entryId);

    // Agrupar por cuenta
    const byAccount = {};
    lines.forEach(l => {
      if (!byAccount[l.accountCode]) byAccount[l.accountCode] = [];
      byAccount[l.accountCode].push(l);
    });

    return { lines, byAccount, accountMap };
  }, [periodId]);
}

// ── Balance de comprobación ───────────────────────────────────────────────────
function useTrialBalance(periodId) {
  const { byAccount, accountMap } = useLedger(periodId);

  return useMemo(() => {
    const rows = [];
    const allCodes = new Set([
      ...Object.keys(OPENING).filter(c => OPENING[c] !== 0),
      ...Object.keys(byAccount),
    ]);

    allCodes.forEach(code => {
      const account = accountMap[code];
      if (!account) return;

      const openSaldo = OPENING[code] || 0;
      const openDb = openSaldo > 0 ? openSaldo : 0;
      const openCr = openSaldo < 0 ? Math.abs(openSaldo) : 0;

      const movs = byAccount[code] || [];
      const movDb = movs.reduce((s, l) => s + (l.debit || 0), 0);
      const movCr = movs.reduce((s, l) => s + (l.credit || 0), 0);

      // Saldo final = saldo inicial + movimientos (en términos netos)
      const finalSaldo = openSaldo + movDb - movCr;
      const finalDb = finalSaldo > 0 ? finalSaldo : 0;
      const finalCr = finalSaldo < 0 ? Math.abs(finalSaldo) : 0;

      rows.push({ code, account, openDb, openCr, movDb, movCr, finalDb, finalCr, finalSaldo });
    });

    rows.sort((a, b) => a.code.localeCompare(b.code));

    const totals = rows.reduce((t, r) => ({
      openDb:  t.openDb  + r.openDb,
      openCr:  t.openCr  + r.openCr,
      movDb:   t.movDb   + r.movDb,
      movCr:   t.movCr   + r.movCr,
      finalDb: t.finalDb + r.finalDb,
      finalCr: t.finalCr + r.finalCr,
    }), { openDb: 0, openCr: 0, movDb: 0, movCr: 0, finalDb: 0, finalCr: 0 });

    const balanced = Math.abs(totals.finalDb - totals.finalCr) < 0.01;
    return { rows, totals, balanced };
  }, [byAccount, accountMap]);
}

// ── Módulo principal ──────────────────────────────────────────────────────────
export default function Ledger() {
  const [tab,           setTab]           = useState('trial');
  const [periodId,      setPeriodId]      = useState(5);
  const [selectedCode,  setSelectedCode]  = useState('110101');
  const [showZero,      setShowZero]      = useState(false);

  const period     = ACCOUNTING_PERIODS.find(p => p.id === periodId);
  const { lines, byAccount, accountMap } = useLedger(periodId);
  const { rows, totals, balanced }       = useTrialBalance(periodId);

  // Cuentas con movimientos + saldo inicial (para el selector del mayor)
  const selectableAccounts = useMemo(() =>
    ACCOUNTS.filter(a => a.allowsEntries && (byAccount[a.code]?.length || OPENING[a.code]))
  , [byAccount]);

  // Mayor de la cuenta seleccionada
  const ledgerAccount = accountMap[selectedCode];
  const ledgerMovs    = byAccount[selectedCode] || [];
  const openSaldo     = OPENING[selectedCode] || 0;
  const ledgerRows    = useMemo(() => {
    let saldo = openSaldo;
    return ledgerMovs.map(l => {
      saldo += (l.debit || 0) - (l.credit || 0);
      return { ...l, saldo };
    });
  }, [ledgerMovs, openSaldo]);

  const totalMovDb = ledgerMovs.reduce((s, l) => s + (l.debit || 0), 0);
  const totalMovCr = ledgerMovs.reduce((s, l) => s + (l.credit || 0), 0);
  const closingSaldo = openSaldo + totalMovDb - totalMovCr;

  // Stats
  const accountsWithMovs  = Object.keys(byAccount).length;
  const totalEntries      = JOURNAL_ENTRIES.filter(e => e.periodId === periodId).length;
  const diff              = Math.abs(totals.finalDb - totals.finalCr);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Mayor General · Balance de Comprobación</h1>
          <div className="page-subtitle">Movimientos por cuenta · saldos · verificación contable</div>
        </div>
        <div className="page-head-actions">
          <select
            className="field-input"
            value={periodId}
            onChange={e => setPeriodId(Number(e.target.value))}
          >
            {ACCOUNTING_PERIODS.map(p => (
              <option key={p.id} value={p.id}>{p.name} {p.status === 'open' ? '● Abierto' : '✓ Cerrado'}</option>
            ))}
          </select>
          <button className="btn"><Icon name="download" size={12} /> Exportar</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat">
          <div className="label"><Icon name="receipt" size={11} />Período</div>
          <div className="val" style={{ fontSize: 18 }}>{period?.name}</div>
          <div className="delta muted">
            <span className={`pill ${period?.status === 'open' ? 'success' : 'neutral'}`} style={{ fontSize: 9 }}>
              {period?.status === 'open' ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="chart" size={11} />Cuentas con movimiento</div>
          <div className="val mono">{accountsWithMovs}</div>
          <div className="delta muted">{totalEntries} partidas registradas</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="check" size={11} />Balance de comprobación</div>
          <div className="val" style={{ fontSize: 16, color: balanced ? 'var(--success)' : 'var(--danger)' }}>
            {balanced ? '✓ Cuadrado' : '✗ Descuadre'}
          </div>
          <div className="delta muted" style={{ color: balanced ? undefined : 'var(--danger)' }}>
            {balanced ? 'Débitos = Créditos' : `Diferencia ${Q(diff)}`}
          </div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="cash" size={11} />Total movilizado</div>
          <div className="val mono">{Q(totals.movDb)}</div>
          <div className="delta muted">En {period?.name}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'trial' ? 'active' : ''}`} onClick={() => setTab('trial')}>
          Balance de Comprobación
        </button>
        <button className={`tab ${tab === 'ledger' ? 'active' : ''}`} onClick={() => setTab('ledger')}>
          Mayor General
        </button>
      </div>

      {/* ── Balance de Comprobación ── */}
      {tab === 'trial' && (
        <>
          <div className="filterbar">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showZero}
                onChange={e => setShowZero(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              Mostrar cuentas sin movimiento
            </label>
            <div style={{ marginLeft: 'auto' }}>
              <span className={`pill ${balanced ? 'success' : 'danger'}`} style={{ fontSize: 10 }}>
                {balanced ? '✓ Balanceado' : '✗ Descuadre'}
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="tbl-wrap"><table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Código</th>
                  <th>Cuenta</th>
                  <th style={{ textAlign: 'right' }}>Saldo Ini. Db</th>
                  <th style={{ textAlign: 'right' }}>Saldo Ini. Cr</th>
                  <th style={{ textAlign: 'right' }}>Movim. Db</th>
                  <th style={{ textAlign: 'right' }}>Movim. Cr</th>
                  <th style={{ textAlign: 'right', background: 'rgba(var(--accent-rgb,20,184,166),.06)' }}>Saldo Final Db</th>
                  <th style={{ textAlign: 'right', background: 'rgba(var(--accent-rgb,20,184,166),.06)' }}>Saldo Final Cr</th>
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter(r => showZero || r.movDb > 0 || r.movCr > 0 || r.openDb > 0 || r.openCr > 0)
                  .map(r => (
                    <tr
                      key={r.code}
                      style={{ cursor: 'pointer' }}
                      onClick={() => { setSelectedCode(r.code); setTab('ledger'); }}
                      title="Ver en Mayor General"
                    >
                      <td>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{r.code}</span>
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {r.account.level > 1 && (
                          <span style={{ display: 'inline-block', width: (r.account.level - 1) * 12 }} />
                        )}
                        {r.account.name}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {r.openDb > 0 ? Q(r.openDb) : <span className="muted">—</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {r.openCr > 0 ? Q(r.openCr) : <span className="muted">—</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {r.movDb > 0 ? Q(r.movDb) : <span className="muted">—</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {r.movCr > 0 ? Q(r.movCr) : <span className="muted">—</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: r.finalDb > 0 ? 700 : 400, background: 'rgba(var(--accent-rgb,20,184,166),.04)' }}>
                        {r.finalDb > 0.005 ? Q(r.finalDb) : <span className="muted">—</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: r.finalCr > 0 ? 700 : 400, background: 'rgba(var(--accent-rgb,20,184,166),.04)' }}>
                        {r.finalCr > 0.005 ? Q(r.finalCr) : <span className="muted">—</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--surface-2)', borderTop: '2px solid var(--border)' }}>
                  <td colSpan={2} style={{ padding: '10px 12px', fontWeight: 700, fontSize: 12 }}>TOTALES</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, padding: '10px 12px' }}>{Q(totals.openDb)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, padding: '10px 12px' }}>{Q(totals.openCr)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, padding: '10px 12px' }}>{Q(totals.movDb)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, padding: '10px 12px' }}>{Q(totals.movCr)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, padding: '10px 12px', background: 'rgba(var(--accent-rgb,20,184,166),.06)', color: balanced ? 'var(--success)' : 'var(--danger)' }}>
                    {Q(totals.finalDb)}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, padding: '10px 12px', background: 'rgba(var(--accent-rgb,20,184,166),.06)', color: balanced ? 'var(--success)' : 'var(--danger)' }}>
                    {Q(totals.finalCr)}
                  </td>
                </tr>
              </tfoot>
            </table></div>
          </div>
        </>
      )}

      {/* ── Mayor General ── */}
      {tab === 'ledger' && (
        <>
          <div className="filterbar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <label className="field-label">Cuenta</label>
              <select
                className="input"
                value={selectedCode}
                onChange={e => setSelectedCode(e.target.value)}
                style={{ minWidth: 340 }}
              >
                {selectableAccounts.map(a => (
                  <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Encabezado de la cuenta */}
          <div className="card" style={{ padding: '14px 18px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{ledgerAccount?.name}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                Código: <span className="mono">{selectedCode}</span> ·
                Naturaleza: {ledgerAccount?.normalBalance === 'debit' ? 'Deudora' : 'Acreedora'} ·
                {period?.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="muted" style={{ fontSize: 11 }}>Saldo final</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: closingSaldo >= 0 ? 'var(--text)' : 'var(--danger)' }}>
                {Q(closingSaldo)} <span className="muted" style={{ fontSize: 11 }}>{closingSaldo >= 0 ? 'Db' : 'Cr'}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="tbl-wrap"><table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Fecha</th>
                  <th style={{ width: 120 }}>Referencia</th>
                  <th>Descripción</th>
                  <th style={{ textAlign: 'right' }}>Débito</th>
                  <th style={{ textAlign: 'right' }}>Crédito</th>
                  <th style={{ textAlign: 'right', background: 'rgba(var(--accent-rgb,20,184,166),.06)' }}>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {/* Saldo inicial */}
                <tr style={{ background: 'var(--surface-2)' }}>
                  <td colSpan={3} style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontStyle: 'italic' }}>
                    — Saldo inicial al {period?.startDate} —
                  </td>
                  <td />
                  <td />
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '8px 12px', background: 'rgba(var(--accent-rgb,20,184,166),.04)', color: openSaldo >= 0 ? 'var(--text)' : 'var(--danger)' }}>
                    {Q(openSaldo)} <span style={{ fontSize: 10, fontWeight: 400 }}>{openSaldo >= 0 ? 'Db' : 'Cr'}</span>
                  </td>
                </tr>

                {ledgerRows.length === 0 ? (
                  <tr><td colSpan={6} className="empty">Sin movimientos en este período</td></tr>
                ) : ledgerRows.map((l, i) => (
                  <tr key={i}>
                    <td className="muted" style={{ fontSize: 12 }}>{l.date}</td>
                    <td>
                      <span className="mono" style={{ fontSize: 11 }}>{l.reference || `P${l.entryId}`}</span>
                    </td>
                    <td style={{ fontSize: 12 }}>{l.description}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {l.debit > 0 ? Q(l.debit) : <span className="muted">—</span>}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {l.credit > 0 ? Q(l.credit) : <span className="muted">—</span>}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12, background: 'rgba(var(--accent-rgb,20,184,166),.04)', color: l.saldo >= 0 ? 'var(--text)' : 'var(--danger)' }}>
                      {Q(l.saldo)} <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--muted)' }}>{l.saldo >= 0 ? 'Db' : 'Cr'}</span>
                    </td>
                  </tr>
                ))}

                {/* Saldo final */}
                <tr style={{ background: 'var(--surface-2)', borderTop: '2px solid var(--border)' }}>
                  <td colSpan={3} style={{ padding: '9px 12px', fontWeight: 700, fontSize: 12 }}>
                    Saldo final al {period?.endDate}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, padding: '9px 12px' }}>
                    {totalMovDb > 0 ? Q(totalMovDb) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, padding: '9px 12px' }}>
                    {totalMovCr > 0 ? Q(totalMovCr) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, padding: '9px 12px', background: 'rgba(var(--accent-rgb,20,184,166),.06)', color: closingSaldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {Q(closingSaldo)} <span style={{ fontSize: 10 }}>{closingSaldo >= 0 ? 'Db' : 'Cr'}</span>
                  </td>
                </tr>
              </tbody>
            </table></div>
          </div>
        </>
      )}
    </div>
  );
}
