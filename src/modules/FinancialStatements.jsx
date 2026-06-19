// ERP MAYA — Estados Financieros (Estado de Resultados + Balance General)
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { ACCOUNTS, JOURNAL_ENTRIES, ACCOUNTING_PERIODS } from '../data/mock.js';

const Q   = v => `Q ${Math.abs(v).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const Qn  = v => v === 0 ? '—' : Q(v);
const pct = (n, d) => d === 0 ? '' : ` (${((Math.abs(n) / Math.abs(d)) * 100).toFixed(1)}%)`;

// Saldos iniciales al 01-mayo-2026 (positivo = deudor, negativo = acreedor)
const OPENING = {
  '110101':  12000, '110102': 180000, '110103':  45000,
  '110201':  65000, '110301': 280000, '1105':     8200,
  '120101':  85000, '210101': -42000, '210201':  -6800,
  '210401':      0, '3101':  -400000, '3103':  -180000,
  '3104':   -46400, '410101':      0, '410102':      0,
  '510101':      0, '520101':      0, '530103':      0,
  '530104':      0, '540102':      0,
};

// Período anterior — Abril 2026 (mock de comparación)
const PREV = {
  '110101':  12000, '110102': 183000, '110103':  45000,
  '110201':  70000, '110301': 275000, '1105':     6500,
  '120101':  85000, '210101': -38000, '210201':  -5900,
  '210401':  -4200, '3101':  -400000, '3103':  -180000,
  '3104':   -46400, '410101': -42800, '410102': -18600,
  '510101':  31200, '520101':  18600, '530103':   8500,
  '530104':   6200, '540102':    450,
};

function computeBalances(periodId) {
  const bal = { ...OPENING };
  JOURNAL_ENTRIES
    .filter(e => e.periodId === periodId && e.status === 'posted')
    .forEach(e => e.lines.forEach(l => {
      if (!(l.accountCode in bal)) bal[l.accountCode] = 0;
      bal[l.accountCode] += (l.debit - l.credit);
    }));
  return bal;
}

function buildIncome(b) {
  const venContado   = Math.abs(b['410101'] || 0);
  const venCredito   = Math.abs(b['410102'] || 0);
  const totalIngresos = venContado + venCredito;
  const cmv          = Math.abs(b['510101'] || 0);
  const utilBruta    = totalIngresos - cmv;
  const sueldos      = Math.abs(b['520101'] || 0);
  const arrend       = Math.abs(b['530103'] || 0);
  const energia      = Math.abs(b['530104'] || 0);
  const comisiones   = Math.abs(b['540102'] || 0);
  const totalGastos  = sueldos + arrend + energia + comisiones;
  const utilNeta     = utilBruta - totalGastos;
  return { venContado, venCredito, totalIngresos, cmv, utilBruta, sueldos, arrend, energia, comisiones, totalGastos, utilNeta };
}

function buildBS(b, utilNeta) {
  const cajaGral   = b['110101'] || 0;
  const bancoInd   = b['110102'] || 0;
  const bancoGT    = b['110103'] || 0;
  const clientes   = b['110201'] || 0;
  const inventario = b['110301'] || 0;
  const ivaCredito = b['1105']   || 0;
  const totalAC    = cajaGral + bancoInd + bancoGT + clientes + inventario + ivaCredito;
  const mobEquipo  = b['120101'] || 0;
  const totalANC   = mobEquipo;
  const totalActivo = totalAC + totalANC;

  const proveedores = Math.abs(b['210101'] || 0);
  const ivaPagar    = Math.abs(b['210201'] || 0);
  const sueldosPag  = Math.abs(b['210401'] || 0);
  const totalPC     = proveedores + ivaPagar + sueldosPag;

  const capitalSocial = Math.abs(b['3101'] || 0);
  const utilRetened   = Math.abs(b['3103'] || 0);
  const resultAnt     = Math.abs(b['3104'] || 0);
  const resultPer     = utilNeta;
  const totalCap      = capitalSocial + utilRetened + resultAnt + resultPer;
  const totalPasCap   = totalPC + totalCap;

  return {
    cajaGral, bancoInd, bancoGT, clientes, inventario, ivaCredito, totalAC,
    mobEquipo, totalANC, totalActivo,
    proveedores, ivaPagar, sueldosPag, totalPC,
    capitalSocial, utilRetened, resultAnt, resultPer, totalCap, totalPasCap,
    balanced: Math.abs(totalActivo - totalPasCap) < 0.05,
  };
}

// ── Row components ─────────────────────────────────────────────────────────

function SectionHdr({ label, colSpan }) {
  return (
    <tr className="fs-section-hdr">
      <td colSpan={colSpan}>{label}</td>
    </tr>
  );
}

function Spacer({ colSpan }) {
  return <tr><td colSpan={colSpan} style={{ height: 10 }}></td></tr>;
}

function Row({ label, value, prevValue, indent = 0, bold, total, grand, loss, showPct, pctBase, cmp }) {
  const isLoss = loss || (value != null && value < 0);
  const cell = (v, muted) => {
    if (v == null) return <td />;
    return (
      <td className={`fs-amt ${isLoss ? 'danger' : ''} ${muted ? 'muted' : ''}`}>
        {bold || total || grand
          ? <strong>{v < 0 ? '(' : ''}{Qn(v)}{v < 0 ? ')' : ''}{showPct && pctBase ? pct(v, pctBase) : ''}</strong>
          : <>{v < 0 ? '(' : ''}{Qn(v)}{v < 0 ? ')' : ''}{showPct && pctBase ? <span className="muted">{pct(v, pctBase)}</span> : null}</>
        }
      </td>
    );
  };
  return (
    <tr className={grand ? 'fs-grand' : total ? 'fs-total' : 'fs-row'}>
      <td style={{ paddingLeft: 16 + indent * 18 }}>
        {bold || total || grand ? <strong>{label}</strong> : label}
      </td>
      {cell(value, false)}
      {cmp && cell(prevValue, true)}
    </tr>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function FinancialStatements() {
  const [tab, setTab]         = useState('income');
  const [periodId, setPeriodId] = useState(5);
  const [cmp, setCmp]         = useState(false);

  const bal  = useMemo(() => computeBalances(periodId), [periodId]);
  const inc  = useMemo(() => buildIncome(bal), [bal]);
  const bs   = useMemo(() => buildBS(bal, inc.utilNeta), [bal, inc.utilNeta]);
  const pInc = useMemo(() => buildIncome(PREV), []);
  const pBS  = useMemo(() => buildBS(PREV, pInc.utilNeta), [pInc]);

  const period     = ACCOUNTING_PERIODS.find(p => p.id === periodId);
  const prevPeriod = ACCOUNTING_PERIODS.find(p => p.id === periodId - 1);
  const cols       = cmp ? 3 : 2;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Estados Financieros</div>
          <div className="page-sub">{period?.name} · Sucursal Zona 10</div>
        </div>
        <div className="page-head-actions">
          <label className="fs-cmp-label">
            <input type="checkbox" checked={cmp} onChange={e => setCmp(e.target.checked)} />
            Comparativo
          </label>
          <select
            className="field-input"
            value={periodId}
            onChange={e => setPeriodId(Number(e.target.value))}
          >
            {ACCOUNTING_PERIODS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button className="btn-outline" onClick={() => window.print()}>
            <Icon name="receipt" size={13} />
            Imprimir
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="label">Ingresos del período</div>
          <div className="value">{Q(inc.totalIngresos)}</div>
          <div className="sub muted">{period?.name}</div>
        </div>
        <div className="stat-card">
          <div className="label">Utilidad Bruta</div>
          <div className={`value ${inc.utilBruta < 0 ? 'danger' : 'success'}`}>
            {inc.utilBruta < 0 ? '(' : ''}{Q(inc.utilBruta)}{inc.utilBruta < 0 ? ')' : ''}
          </div>
          <div className="sub muted">
            Margen {inc.totalIngresos > 0 ? ((inc.utilBruta / inc.totalIngresos) * 100).toFixed(1) : '0.0'}%
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Utilidad / Pérdida Neta</div>
          <div className={`value ${inc.utilNeta < 0 ? 'danger' : 'success'}`}>
            {inc.utilNeta < 0 ? '(' : ''}{Q(inc.utilNeta)}{inc.utilNeta < 0 ? ')' : ''}
          </div>
          <div className="sub muted">{inc.utilNeta < 0 ? 'Pérdida' : 'Utilidad'} del período</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Activo</div>
          <div className="value">{Q(bs.totalActivo)}</div>
          <div className={`sub ${bs.balanced ? 'success' : 'danger'}`}>
            {bs.balanced ? '✓ Balance cuadra' : '⚠ Revisar balance'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 0 }}>
        <button className={`tab ${tab === 'income' ? 'active' : ''}`} onClick={() => setTab('income')}>
          Estado de Resultados
        </button>
        <button className={`tab ${tab === 'bs' ? 'active' : ''}`} onClick={() => setTab('bs')}>
          Balance General
        </button>
      </div>

      <div className="card" style={{ borderTopLeftRadius: 0, overflow: 'hidden' }}>
        {/* Column headers */}
        <div className="fs-col-heads">
          <div style={{ flex: 1 }} />
          {cmp && prevPeriod && (
            <div className="fs-col-head muted">{prevPeriod.name.toUpperCase()}</div>
          )}
          <div className="fs-col-head">{period?.name.toUpperCase()}</div>
        </div>

        <div className="table-wrap" style={{ border: 'none', borderRadius: 0, margin: 0 }}>
          {tab === 'income' && (
            <table className="tbl">
              <colgroup>
                <col />
                {cmp && <col style={{ width: 180 }} />}
                <col style={{ width: 180 }} />
              </colgroup>
              <tbody>
                <SectionHdr label="INGRESOS OPERACIONALES" colSpan={cols} />
                <Row label="Ventas al Contado" value={inc.venContado} prevValue={pInc.venContado} indent={1} showPct pctBase={inc.totalIngresos} cmp={cmp} />
                <Row label="Ventas a Crédito"  value={inc.venCredito} prevValue={pInc.venCredito} indent={1} showPct pctBase={inc.totalIngresos} cmp={cmp} />
                <Row label="Total Ingresos"    value={inc.totalIngresos} prevValue={pInc.totalIngresos} bold total cmp={cmp} />
                <Spacer colSpan={cols} />

                <SectionHdr label="COSTO DE VENTAS" colSpan={cols} />
                <Row label="Costo de Mercadería Vendida" value={inc.cmv} prevValue={pInc.cmv} indent={1} showPct pctBase={inc.totalIngresos} cmp={cmp} />
                <Row label="Total Costo de Ventas"       value={inc.cmv} prevValue={pInc.cmv} bold total cmp={cmp} />
                <Spacer colSpan={cols} />

                <Row label="UTILIDAD BRUTA"
                  value={inc.utilBruta} prevValue={pInc.utilBruta}
                  bold total loss={inc.utilBruta < 0} showPct pctBase={inc.totalIngresos} cmp={cmp} />
                <Spacer colSpan={cols} />

                <SectionHdr label="GASTOS DE OPERACIÓN" colSpan={cols} />
                <Row label="Sueldos y Salarios"  value={inc.sueldos}    prevValue={pInc.sueldos}    indent={1} showPct pctBase={inc.totalIngresos} cmp={cmp} />
                <Row label="Arrendamientos"       value={inc.arrend}     prevValue={pInc.arrend}     indent={1} showPct pctBase={inc.totalIngresos} cmp={cmp} />
                <Row label="Energía Eléctrica"    value={inc.energia}    prevValue={pInc.energia}    indent={1} showPct pctBase={inc.totalIngresos} cmp={cmp} />
                <Row label="Comisiones Bancarias" value={inc.comisiones} prevValue={pInc.comisiones} indent={1} showPct pctBase={inc.totalIngresos} cmp={cmp} />
                <Row label="Total Gastos Operación" value={inc.totalGastos} prevValue={pInc.totalGastos} bold total cmp={cmp} />
                <Spacer colSpan={cols} />

                <Row label="UTILIDAD DE OPERACIÓN"
                  value={inc.utilNeta} prevValue={pInc.utilNeta}
                  grand loss={inc.utilNeta < 0} showPct pctBase={inc.totalIngresos} cmp={cmp} />
                <Spacer colSpan={cols} />

                <tr className={`fs-net ${inc.utilNeta < 0 ? 'loss' : 'profit'}`}>
                  <td><strong>UTILIDAD (PÉRDIDA) NETA DEL PERÍODO</strong></td>
                  <td className="fs-amt">
                    <strong>{inc.utilNeta < 0 ? '(' : ''}{Q(inc.utilNeta)}{inc.utilNeta < 0 ? ')' : ''}</strong>
                  </td>
                  {cmp && (
                    <td className="fs-amt muted">
                      <strong>{pInc.utilNeta < 0 ? '(' : ''}{Q(pInc.utilNeta)}{pInc.utilNeta < 0 ? ')' : ''}</strong>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          )}

          {tab === 'bs' && (
            <table className="tbl">
              <colgroup>
                <col />
                {cmp && <col style={{ width: 180 }} />}
                <col style={{ width: 180 }} />
              </colgroup>
              <tbody>
                {/* ACTIVO */}
                <SectionHdr label="ACTIVO" colSpan={cols} />
                <Row label="Activo Corriente" value={null} indent={0} bold cmp={cmp} />
                <Row label="Caja General"                value={bs.cajaGral}   prevValue={pBS.cajaGral}   indent={2} cmp={cmp} />
                <Row label="Banco Industrial CTA 001"    value={bs.bancoInd}   prevValue={pBS.bancoInd}   indent={2} cmp={cmp} />
                <Row label="Banco G&T Continental"       value={bs.bancoGT}    prevValue={pBS.bancoGT}    indent={2} cmp={cmp} />
                <Row label="Clientes Nacionales"         value={bs.clientes}   prevValue={pBS.clientes}   indent={2} cmp={cmp} />
                <Row label="Inventario de Mercaderías"   value={bs.inventario} prevValue={pBS.inventario} indent={2} cmp={cmp} />
                <Row label="IVA Crédito Fiscal"          value={bs.ivaCredito} prevValue={pBS.ivaCredito} indent={2} cmp={cmp} />
                <Row label="Total Activo Corriente"      value={bs.totalAC}    prevValue={pBS.totalAC}    bold total cmp={cmp} />
                <Spacer colSpan={cols} />

                <Row label="Activo No Corriente" value={null} indent={0} bold cmp={cmp} />
                <Row label="Mobiliario y Equipo"       value={bs.mobEquipo} prevValue={pBS.mobEquipo} indent={2} cmp={cmp} />
                <Row label="Total Activo No Corriente" value={bs.totalANC}  prevValue={pBS.totalANC}  bold total cmp={cmp} />
                <Spacer colSpan={cols} />

                <Row label="TOTAL ACTIVO" value={bs.totalActivo} prevValue={pBS.totalActivo} grand cmp={cmp} />
                <Spacer colSpan={cols} /><Spacer colSpan={cols} />

                {/* PASIVO */}
                <SectionHdr label="PASIVO" colSpan={cols} />
                <Row label="Pasivo Corriente" value={null} indent={0} bold cmp={cmp} />
                <Row label="Proveedores Nacionales"       value={bs.proveedores} prevValue={pBS.proveedores} indent={2} cmp={cmp} />
                <Row label="IVA por Pagar (Débito Fiscal)" value={bs.ivaPagar}  prevValue={pBS.ivaPagar}   indent={2} cmp={cmp} />
                <Row label="Sueldos por Pagar"             value={bs.sueldosPag} prevValue={pBS.sueldosPag} indent={2} cmp={cmp} />
                <Row label="Total Pasivo Corriente"        value={bs.totalPC}    prevValue={pBS.totalPC}    bold total cmp={cmp} />
                <Spacer colSpan={cols} />
                <Row label="TOTAL PASIVO" value={bs.totalPasivo ?? bs.totalPC} prevValue={pBS.totalPC} grand cmp={cmp} />
                <Spacer colSpan={cols} /><Spacer colSpan={cols} />

                {/* CAPITAL */}
                <SectionHdr label="CAPITAL Y RESERVAS" colSpan={cols} />
                <Row label="Capital Social Pagado"        value={bs.capitalSocial} prevValue={pBS.capitalSocial} indent={1} cmp={cmp} />
                <Row label="Utilidades Retenidas"         value={bs.utilRetened}   prevValue={pBS.utilRetened}   indent={1} cmp={cmp} />
                <Row label="Resultado Ejercicio Anterior" value={bs.resultAnt}     prevValue={pBS.resultAnt}     indent={1} cmp={cmp} />
                <Row label="Resultado del Período"        value={bs.resultPer}     prevValue={pBS.resultPer}
                  indent={1} loss={bs.resultPer < 0} cmp={cmp} />
                <Row label="Total Capital y Reservas" value={bs.totalCap} prevValue={pBS.totalCap} bold total cmp={cmp} />
                <Spacer colSpan={cols} />

                <Row label="TOTAL PASIVO + CAPITAL" value={bs.totalPasCap} prevValue={pBS.totalPasCap} grand cmp={cmp} />

                {!bs.balanced && (
                  <tr>
                    <td colSpan={cols} style={{ paddingTop: 12 }}>
                      <span className="pill danger">⚠ El balance no cuadra — verificar partidas</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
