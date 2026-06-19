// ERP MAYA — Payroll / Planilla module (Guatemala)
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';

const Q = (n) => `Q ${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Constantes Guatemala ────────────────────────────────────────────────────
const IGSS_EMP   = 0.0483;   // Decreto 295 — cuota empleado
const IGSS_PAT   = 0.1067;   // Decreto 295 — cuota patronal
const BON_INC    = 250;      // Decreto 78-89 — bonificación incentivo mensual
const EXENTO_ISR = 48000;    // Q48,000 anuales exentos
const DED_GMED   = 12000;    // Gastos médicos deducibles anuales
const TASA_ISR_1 = 0.05;     // 5% hasta Q300,000
const TASA_ISR_2 = 0.07;     // 7% sobre exceso de Q300,000
const UMBRAL_ISR = 300000;

const DEPARTAMENTOS = ['Operaciones', 'Administración', 'Bodega', 'Ventas', 'Contabilidad'];
const PUESTOS_BY_DEPT = {
  Operaciones:   ['Cajero', 'Supervisor de caja', 'Asistente operativo'],
  Administración:['Gerente administrativo', 'Asistente administrativo', 'Recepcionista'],
  Bodega:        ['Bodeguero', 'Auxiliar de bodega', 'Jefe de bodega'],
  Ventas:        ['Vendedor', 'Supervisor de ventas', 'Ejecutivo de cuenta'],
  Contabilidad:  ['Contador', 'Auxiliar contable', 'Jefe de finanzas'],
};

const EMPLOYEES = [
  { id:'EMP-001', name:'Carlos Méndez López',     dept:'Operaciones',    pos:'Cajero',               salary:4500,  status:'active', hired:'2023-01-15', dpi:'2456789012345', nit:'1234567-8', banco:'Industrial',  cuenta:'4120-xxxxx' },
  { id:'EMP-002', name:'María García Pérez',       dept:'Operaciones',    pos:'Supervisor de caja',   salary:6800,  status:'active', hired:'2021-06-01', dpi:'3456789012346', nit:'2345678-9', banco:'BAC',         cuenta:'0102-xxxxx' },
  { id:'EMP-003', name:'José Ramírez Fuentes',     dept:'Bodega',         pos:'Jefe de bodega',       salary:5200,  status:'active', hired:'2022-03-10', dpi:'1234567890123', nit:'3456789-0', banco:'Industrial',  cuenta:'4131-xxxxx' },
  { id:'EMP-004', name:'Ana López Castillo',       dept:'Administración', pos:'Asistente administrativo', salary:5500, status:'active', hired:'2020-08-22', dpi:'9876543210987', nit:'4567890-1', banco:'G&T',      cuenta:'0201-xxxxx' },
  { id:'EMP-005', name:'Pedro Morales Cifuentes',  dept:'Ventas',         pos:'Ejecutivo de cuenta',  salary:4800,  status:'active', hired:'2023-04-05', dpi:'5678901234567', nit:'5678901-2', banco:'Banrural',    cuenta:'1301-xxxxx' },
  { id:'EMP-006', name:'Lucía Herrera Vásquez',    dept:'Contabilidad',   pos:'Auxiliar contable',    salary:5000,  status:'active', hired:'2022-11-01', dpi:'6789012345678', nit:'6789012-3', banco:'BAC',         cuenta:'0108-xxxxx' },
  { id:'EMP-007', name:'Roberto Juárez Pérez',     dept:'Bodega',         pos:'Auxiliar de bodega',   salary:3500,  status:'active', hired:'2024-01-08', dpi:'7890123456789', nit:'7890123-4', banco:'Industrial',  cuenta:'4145-xxxxx' },
  { id:'EMP-008', name:'Carmen Solís Armas',       dept:'Ventas',         pos:'Vendedor',             salary:4200,  status:'inactive', hired:'2021-09-14', dpi:'8901234567890', nit:'8901234-5', banco:'G&T',       cuenta:'0215-xxxxx' },
];

// ── Cálculo de planilla Guatemala ──────────────────────────────────────────
function calcPayroll(emp) {
  const base   = emp.salary;
  const bon    = BON_INC;
  const igssE  = base * IGSS_EMP;
  const igssP  = base * IGSS_PAT;

  // ISR en relación de dependencia (régimen general)
  const salAnual   = base * 12;
  const igssAnual  = igssE * 12;
  const rentaGraba = Math.max(0, salAnual - EXENTO_ISR - igssAnual - DED_GMED);
  let isrAnual = 0;
  if (rentaGraba <= UMBRAL_ISR) {
    isrAnual = rentaGraba * TASA_ISR_1;
  } else {
    isrAnual = UMBRAL_ISR * TASA_ISR_1 + (rentaGraba - UMBRAL_ISR) * TASA_ISR_2;
  }
  const isrM = isrAnual / 12;

  const deducc  = igssE + isrM;
  const neto    = base + bon - deducc;
  const totalEmp = base + bon + igssP;

  return { base, bon, igssE, igssP, isrM, deducc, neto, totalEmp,
           isrAnual, rentaGraba };
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const PAYROLL_HISTORY = [
  { id:'PL-2026-04', month:3,  year:2026, period:'Abril 2026',     status:'cerrada', total:45820.50, employees:7 },
  { id:'PL-2026-03', month:2,  year:2026, period:'Marzo 2026',     status:'cerrada', total:45820.50, employees:7 },
  { id:'PL-2026-02', month:1,  year:2026, period:'Febrero 2026',   status:'cerrada', total:45820.50, employees:7 },
  { id:'PL-2026-01', month:0,  year:2026, period:'Enero 2026',     status:'cerrada', total:45820.50, employees:7 },
];

// ══════════════════════════════════════════════════════════════════════════════
export default function Payroll({ pushToast }) {
  const [tab, setTab] = useState('planilla');
  const [selEmp, setSelEmp] = useState(null);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showRecibo, setShowRecibo] = useState(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('todos');

  const now = new Date();
  const curMonth = now.getMonth();
  const curYear  = now.getFullYear();
  const periodLabel = `${MONTHS[curMonth]} ${curYear}`;

  const activeEmps = EMPLOYEES.filter(e => e.status === 'active');

  const rows = useMemo(() =>
    activeEmps.map(e => ({ ...e, calc: calcPayroll(e) })),
    []
  );

  const summary = useMemo(() => ({
    totalBase:    rows.reduce((s, r) => s + r.calc.base,    0),
    totalBon:     rows.reduce((s, r) => s + r.calc.bon,     0),
    totalIgssE:   rows.reduce((s, r) => s + r.calc.igssE,   0),
    totalIgssP:   rows.reduce((s, r) => s + r.calc.igssP,   0),
    totalIsr:     rows.reduce((s, r) => s + r.calc.isrM,    0),
    totalNeto:    rows.reduce((s, r) => s + r.calc.neto,    0),
    totalEmpresa: rows.reduce((s, r) => s + r.calc.totalEmp,0),
  }), [rows]);

  const filteredEmps = EMPLOYEES.filter(e => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) &&
        !e.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (deptFilter !== 'todos' && e.dept !== deptFilter) return false;
    return true;
  });

  const handleCerrarPlanilla = () => {
    pushToast && pushToast(`Planilla ${periodLabel} cerrada y enviada a contabilidad`, 'success');
    setShowGenModal(false);
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Planilla · Nómina</h1>
          <div className="page-subtitle">
            Período actual: {periodLabel} · {activeEmps.length} empleados activos · IGSS · ISR · Bonificación incentivo
          </div>
        </div>
        <div className="page-head-actions">
          <button className="btn" onClick={() => setShowEmpModal(true)}>
            <Icon name="plus" size={12} />Nuevo empleado
          </button>
          <button className="btn accent" onClick={() => setShowGenModal(true)}>
            <Icon name="receipt" size={12} />Generar planilla
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { id:'planilla',   label:'Planilla actual' },
          { id:'empleados',  label:`Empleados (${EMPLOYEES.length})` },
          { id:'historial',  label:'Historial' },
          { id:'calculo',    label:'Tabla ISR / IGSS' },
        ].map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ── TAB: PLANILLA ACTUAL ── */}
      {tab === 'planilla' && (
        <>
          {/* KPIs */}
          <div className="stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:16 }}>
            <div className="stat">
              <div className="label"><Icon name="cash" size={11}/>Salarios base</div>
              <div className="val mono" style={{fontSize:20}}>{Q(summary.totalBase)}</div>
              <div className="delta up"><Icon name="users" size={11}/>{activeEmps.length} empleados</div>
            </div>
            <div className="stat">
              <div className="label"><Icon name="shield" size={11}/>IGSS patronal</div>
              <div className="val mono" style={{fontSize:20}}>{Q(summary.totalIgssP)}</div>
              <div className="delta" style={{color:'var(--muted)'}}>10.67% · cuota empresa</div>
            </div>
            <div className="stat">
              <div className="label"><Icon name="receipt" size={11}/>ISR retención</div>
              <div className="val mono" style={{fontSize:20}}>{Q(summary.totalIsr)}</div>
              <div className="delta" style={{color:'var(--muted)'}}>Retención mensual empleados</div>
            </div>
            <div className="stat">
              <div className="label"><Icon name="cash" size={11}/>Costo total empresa</div>
              <div className="val mono" style={{fontSize:20, color:'var(--accent)'}}>{Q(summary.totalEmpresa)}</div>
              <div className="delta" style={{color:'var(--muted)'}}>Base + Bon + IGSS pat.</div>
            </div>
          </div>

          {/* Tabla planilla */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Detalle de planilla — {periodLabel}</h3>
                <div className="meta">Todos los cálculos según Decreto 295 (IGSS) y Ley ISR Guatemala</div>
              </div>
              <div className="row gap-6">
                <button className="btn sm"><Icon name="download" size={12}/>Excel</button>
                <button className="btn sm"><Icon name="print" size={12}/>Imprimir</button>
              </div>
            </div>
            <div className="tbl-wrap">
              <table className="tbl" style={{fontSize:11.5}}>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Puesto</th>
                    <th className="num">Salario base</th>
                    <th className="num">Bon. incentivo</th>
                    <th className="num">IGSS emp. (4.83%)</th>
                    <th className="num">ISR mensual</th>
                    <th className="num">Total deducc.</th>
                    <th className="num" style={{color:'var(--success)'}}>Neto a pagar</th>
                    <th className="num" style={{color:'var(--muted)'}}>IGSS pat. (10.67%)</th>
                    <th className="num" style={{color:'var(--accent)'}}>Costo empresa</th>
                    <th className="center">Recibo</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{fontWeight:500}}>{r.name}</div>
                        <div className="code muted" style={{fontSize:10}}>{r.id}</div>
                      </td>
                      <td>
                        <div>{r.pos}</div>
                        <div className="muted" style={{fontSize:10.5}}>{r.dept}</div>
                      </td>
                      <td className="num">{Q(r.calc.base)}</td>
                      <td className="num" style={{color:'var(--success)'}}>{Q(r.calc.bon)}</td>
                      <td className="num" style={{color:'var(--danger)'}}>−{Q(r.calc.igssE)}</td>
                      <td className="num" style={{color:'var(--danger)'}}>−{Q(r.calc.isrM)}</td>
                      <td className="num" style={{color:'var(--danger)', fontWeight:600}}>−{Q(r.calc.deducc)}</td>
                      <td className="num" style={{color:'var(--success)', fontWeight:700}}>{Q(r.calc.neto)}</td>
                      <td className="num" style={{color:'var(--muted)'}}>{Q(r.calc.igssP)}</td>
                      <td className="num" style={{color:'var(--accent)', fontWeight:600}}>{Q(r.calc.totalEmp)}</td>
                      <td className="center">
                        <button className="btn sm ghost" onClick={() => setShowRecibo(r)}>
                          <Icon name="receipt" size={11}/>Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:'var(--surface-2)', fontWeight:700}}>
                    <td colSpan={2} style={{padding:'8px 12px', fontSize:12}}>TOTALES</td>
                    <td className="num" style={{padding:'8px 12px'}}>{Q(summary.totalBase)}</td>
                    <td className="num" style={{padding:'8px 12px', color:'var(--success)'}}>{Q(summary.totalBon)}</td>
                    <td className="num" style={{padding:'8px 12px', color:'var(--danger)'}}>−{Q(summary.totalIgssE)}</td>
                    <td className="num" style={{padding:'8px 12px', color:'var(--danger)'}}>−{Q(summary.totalIsr)}</td>
                    <td className="num" style={{padding:'8px 12px', color:'var(--danger)'}}>−{Q(summary.totalIgssE + summary.totalIsr)}</td>
                    <td className="num" style={{padding:'8px 12px', color:'var(--success)'}}>{Q(summary.totalNeto)}</td>
                    <td className="num" style={{padding:'8px 12px', color:'var(--muted)'}}>{Q(summary.totalIgssP)}</td>
                    <td className="num" style={{padding:'8px 12px', color:'var(--accent)'}}>{Q(summary.totalEmpresa)}</td>
                    <td/>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Resumen cuotas IGSS para pagar al estado */}
          <div className="grid-2 mt-12" style={{gridTemplateColumns:'1fr 1fr'}}>
            <div className="card">
              <div className="card-head"><h3>Liquidación IGSS del período</h3></div>
              <div className="card-body">
                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">Cuota empleados (4.83%)</span>
                    <span className="mono">{Q(summary.totalIgssE)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Cuota patronal (10.67%)</span>
                    <span className="mono">{Q(summary.totalIgssP)}</span>
                  </div>
                  <div className="detail-row" style={{fontWeight:700}}>
                    <span className="detail-label">Total a pagar al IGSS</span>
                    <span className="mono" style={{color:'var(--accent)'}}>{Q(summary.totalIgssE + summary.totalIgssP)}</span>
                  </div>
                </div>
                <button className="btn accent" style={{marginTop:12, width:'100%'}}>
                  <Icon name="receipt" size={12}/>Generar planilla IGSS
                </button>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h3>Retención ISR del período</h3></div>
              <div className="card-body">
                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">ISR retenido empleados</span>
                    <span className="mono">{Q(summary.totalIsr)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vencimiento declaración</span>
                    <span className="mono">10 del mes siguiente</span>
                  </div>
                  <div className="detail-row" style={{fontWeight:700}}>
                    <span className="detail-label">Total a pagar a la SAT</span>
                    <span className="mono" style={{color:'var(--accent)'}}>{Q(summary.totalIsr)}</span>
                  </div>
                </div>
                <button className="btn accent" style={{marginTop:12, width:'100%'}}>
                  <Icon name="receipt" size={12}/>Generar formulario SAT
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TAB: EMPLEADOS ── */}
      {tab === 'empleados' && (
        <>
          <div className="toolbar">
            <div className="search-wrap" style={{flex:1, maxWidth:320}}>
              <Icon name="search" size={13} className="icon"/>
              <input className="search-input" placeholder="Buscar empleado…"
                value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <select className="field-input" value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)} style={{width:'auto'}}>
              <option value="todos">Todos los departamentos</option>
              {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <span className="muted" style={{fontSize:11, marginLeft:'auto'}}>
              {filteredEmps.length} empleados
            </span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Departamento</th>
                  <th>Puesto</th>
                  <th className="num">Salario base</th>
                  <th className="num">Neto estimado</th>
                  <th>Banco</th>
                  <th>Estado</th>
                  <th>Ingreso</th>
                  <th/>
                </tr>
              </thead>
              <tbody>
                {filteredEmps.map(e => {
                  const c = calcPayroll(e);
                  return (
                    <tr key={e.id} className="clickable" onClick={() => setSelEmp(e)}>
                      <td className="mono">{e.id}</td>
                      <td style={{fontWeight:500}}>{e.name}</td>
                      <td>{e.dept}</td>
                      <td className="muted">{e.pos}</td>
                      <td className="num">{Q(e.salary)}</td>
                      <td className="num" style={{color:'var(--success)', fontWeight:600}}>{Q(c.neto)}</td>
                      <td className="muted" style={{fontSize:11}}>{e.banco}</td>
                      <td>
                        <span className={`pill ${e.status === 'active' ? 'success' : 'warning'}`}>
                          <span className="dot"/>
                          {e.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="mono muted" style={{fontSize:11}}>{e.hired}</td>
                      <td>
                        <button className="btn sm ghost" onClick={ev => { ev.stopPropagation(); setSelEmp(e); }}>
                          <Icon name="edit" size={11}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredEmps.length === 0 && (
                  <tr><td colSpan={10} className="empty">Sin empleados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── TAB: HISTORIAL ── */}
      {tab === 'historial' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Planilla</th>
                <th>Período</th>
                <th className="num">Empleados</th>
                <th className="num">Total nómina</th>
                <th>Estado</th>
                <th/>
              </tr>
            </thead>
            <tbody>
              {PAYROLL_HISTORY.map(p => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td style={{fontWeight:500}}>{p.period}</td>
                  <td className="num">{p.employees}</td>
                  <td className="num" style={{fontWeight:600}}>{Q(p.total)}</td>
                  <td><span className="pill success"><span className="dot"/>Cerrada</span></td>
                  <td>
                    <div className="row gap-6">
                      <button className="btn sm ghost"><Icon name="eye" size={11}/>Ver</button>
                      <button className="btn sm ghost"><Icon name="download" size={11}/>Excel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB: TABLA CÁLCULOS ── */}
      {tab === 'calculo' && (
        <div className="grid-2 mt-12" style={{gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div className="card">
            <div className="card-head"><h3>Tasas IGSS vigentes · Decreto 295</h3></div>
            <div className="card-body">
              <table className="tbl">
                <thead><tr><th>Concepto</th><th className="num">Tasa</th><th>Cargo a</th></tr></thead>
                <tbody>
                  <tr><td>Cuota empleado (IVS)</td><td className="num">4.83%</td><td>Empleado</td></tr>
                  <tr><td>Cuota patronal (IVS)</td><td className="num">10.67%</td><td>Empresa</td></tr>
                  <tr><td>Bonificación incentivo</td><td className="num">Q 250.00/mes</td><td>Empresa · Decreto 78-89</td></tr>
                </tbody>
              </table>
              <div className="alert" style={{marginTop:12}}>
                <Icon name="alert" size={13}/>
                Base de cálculo: salario ordinario mensual. Excluye horas extra y bonificaciones variables.
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>ISR en relación de dependencia · Ley ISR</h3></div>
            <div className="card-body">
              <table className="tbl">
                <thead><tr><th>Concepto</th><th className="num">Valor anual</th></tr></thead>
                <tbody>
                  <tr><td>Renta exenta</td><td className="num">Q 48,000</td></tr>
                  <tr><td>Ded. gastos médicos</td><td className="num">Q 12,000</td></tr>
                  <tr><td>Cuotas IGSS pagadas</td><td className="num">Variable</td></tr>
                  <tr><td style={{borderTop:'2px solid var(--border)', paddingTop:8}}>Tasa 1 (hasta Q300,000)</td><td className="num" style={{borderTop:'2px solid var(--border)', paddingTop:8}}>5%</td></tr>
                  <tr><td>Tasa 2 (sobre Q300,000)</td><td className="num">7%</td></tr>
                </tbody>
              </table>
              <div className="detail-row" style={{marginTop:12, padding:'8px 0', borderTop:'1px solid var(--border)'}}>
                <span className="detail-label">Fórmula neta mensual</span>
                <span style={{fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-2)'}}>
                  Base + Bon − IGSS emp − ISR
                </span>
              </div>
            </div>
          </div>

          {/* Simulador por empleado */}
          <div className="card" style={{gridColumn:'1 / -1'}}>
            <div className="card-head"><h3>Simulador de cálculo por salario</h3></div>
            <div className="card-body">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Salario base</th>
                    <th className="num">Bon. inc.</th>
                    <th className="num">IGSS emp.</th>
                    <th className="num">ISR mensual</th>
                    <th className="num">Neto empleado</th>
                    <th className="num">IGSS patronal</th>
                    <th className="num">Costo empresa</th>
                  </tr>
                </thead>
                <tbody>
                  {[3000,3500,4000,4500,5000,6000,7000,8000,10000,15000].map(sal => {
                    const c = calcPayroll({ salary: sal });
                    return (
                      <tr key={sal}>
                        <td className="num mono">{Q(sal)}</td>
                        <td className="num" style={{color:'var(--success)'}}>{Q(c.bon)}</td>
                        <td className="num" style={{color:'var(--danger)'}}>−{Q(c.igssE)}</td>
                        <td className="num" style={{color:'var(--danger)'}}>−{Q(c.isrM)}</td>
                        <td className="num" style={{color:'var(--success)', fontWeight:700}}>{Q(c.neto)}</td>
                        <td className="num" style={{color:'var(--muted)'}}>{Q(c.igssP)}</td>
                        <td className="num" style={{color:'var(--accent)', fontWeight:600}}>{Q(c.totalEmp)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── DRAWER: Detalle empleado ── */}
      {selEmp && (
        <>
          <div className="drawer-overlay" onClick={() => setSelEmp(null)}/>
          <div className="drawer" style={{width:520}}>
            <div className="drawer-head">
              <div>
                <div className="drawer-title">{selEmp.name}</div>
                <div className="muted" style={{fontSize:11, marginTop:2}}>{selEmp.id} · {selEmp.pos}</div>
              </div>
              <button className="icon-btn" onClick={() => setSelEmp(null)}><Icon name="x"/></button>
            </div>
            <div className="drawer-body">
              {/* Status */}
              <div className="row" style={{marginBottom:16, gap:8}}>
                <span className={`pill ${selEmp.status === 'active' ? 'success' : 'warning'}`}>
                  <span className="dot"/>{selEmp.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
                <span className="pill">{selEmp.dept}</span>
              </div>

              {/* Datos personales */}
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8}}>Datos personales</div>
              <div className="detail-grid" style={{marginBottom:20}}>
                {[
                  ['DPI', selEmp.dpi],
                  ['NIT', selEmp.nit],
                  ['Fecha de ingreso', selEmp.hired],
                  ['Banco', selEmp.banco],
                  ['No. cuenta', selEmp.cuenta],
                ].map(([l,v]) => (
                  <div className="detail-row" key={l}>
                    <span className="detail-label">{l}</span>
                    <span className="mono" style={{fontSize:12}}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Cálculo salarial */}
              {(() => {
                const c = calcPayroll(selEmp);
                return (
                  <>
                    <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8}}>Desglose salarial mensual</div>
                    <div className="card" style={{marginBottom:16}}>
                      <div className="card-body" style={{padding:0}}>
                        <table className="tbl" style={{fontSize:12}}>
                          <tbody>
                            <tr><td>Salario base</td><td className="num">{Q(c.base)}</td></tr>
                            <tr><td style={{color:'var(--success)'}}>+ Bonificación incentivo</td><td className="num" style={{color:'var(--success)'}}>{Q(c.bon)}</td></tr>
                            <tr><td style={{color:'var(--danger)'}}>− IGSS empleado (4.83%)</td><td className="num" style={{color:'var(--danger)'}}>−{Q(c.igssE)}</td></tr>
                            <tr><td style={{color:'var(--danger)'}}>− ISR mensual retenido</td><td className="num" style={{color:'var(--danger)'}}>−{Q(c.isrM)}</td></tr>
                            <tr style={{background:'var(--surface-2)', fontWeight:700}}>
                              <td style={{padding:'9px 12px'}}>Neto a pagar</td>
                              <td className="num" style={{padding:'9px 12px', color:'var(--success)', fontSize:15}}>{Q(c.neto)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8}}>Costo para la empresa</div>
                    <div className="detail-grid">
                      <div className="detail-row">
                        <span className="detail-label">Salario + bonificación</span>
                        <span className="mono">{Q(c.base + c.bon)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">IGSS patronal (10.67%)</span>
                        <span className="mono">{Q(c.igssP)}</span>
                      </div>
                      <div className="detail-row" style={{fontWeight:700}}>
                        <span className="detail-label">Costo total mensual</span>
                        <span className="mono" style={{color:'var(--accent)'}}>{Q(c.totalEmp)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Costo anual estimado</span>
                        <span className="mono">{Q(c.totalEmp * 14)}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="drawer-foot">
              <button className="btn ghost" onClick={() => setSelEmp(null)}>Cerrar</button>
              <button className="btn" onClick={() => { setShowRecibo({...selEmp, calc: calcPayroll(selEmp)}); setSelEmp(null); }}>
                <Icon name="receipt" size={12}/>Ver recibo
              </button>
              <button className="btn accent"><Icon name="edit" size={12}/>Editar</button>
            </div>
          </div>
        </>
      )}

      {/* ── MODAL: Generar planilla ── */}
      {showGenModal && (
        <div className="modal-overlay" onClick={() => setShowGenModal(false)}>
          <div className="modal" style={{width:480}} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Generar planilla — {periodLabel}</h3>
              <button className="icon-btn" onClick={() => setShowGenModal(false)}><Icon name="x"/></button>
            </div>
            <div className="modal-body">
              <div className="alert" style={{marginBottom:16}}>
                <Icon name="alert" size={13}/>
                Al cerrar la planilla se registrarán las partidas contables automáticamente.
              </div>
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Período</span>
                  <span className="mono">{periodLabel}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Empleados incluidos</span>
                  <span className="mono">{activeEmps.length}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total salarios base</span>
                  <span className="mono">{Q(summary.totalBase)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total bonificaciones</span>
                  <span className="mono" style={{color:'var(--success)'}}>{Q(summary.totalBon)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">IGSS empleados</span>
                  <span className="mono" style={{color:'var(--danger)'}}>−{Q(summary.totalIgssE)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">ISR retenido</span>
                  <span className="mono" style={{color:'var(--danger)'}}>−{Q(summary.totalIsr)}</span>
                </div>
                <div className="detail-row" style={{fontWeight:700, fontSize:13}}>
                  <span className="detail-label">Total neto a pagar</span>
                  <span className="mono" style={{color:'var(--success)'}}>{Q(summary.totalNeto)}</span>
                </div>
                <div className="detail-row" style={{fontWeight:700, fontSize:13}}>
                  <span className="detail-label">Costo total empresa</span>
                  <span className="mono" style={{color:'var(--accent)'}}>{Q(summary.totalEmpresa)}</span>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setShowGenModal(false)}>Cancelar</button>
              <button className="btn" onClick={() => { pushToast && pushToast('Planilla exportada a Excel', ''); setShowGenModal(false); }}>
                <Icon name="download" size={12}/>Exportar Excel
              </button>
              <button className="btn accent" onClick={handleCerrarPlanilla}>
                <Icon name="check" size={12}/>Cerrar planilla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Recibo de sueldo ── */}
      {showRecibo && (
        <div className="modal-overlay" onClick={() => setShowRecibo(null)}>
          <div style={{display:'flex', gap:20, alignItems:'flex-start'}} onClick={e => e.stopPropagation()}>
            <ReciboSueldo emp={showRecibo} period={periodLabel}/>
            <div style={{display:'flex', flexDirection:'column', gap:8, paddingTop:16}}>
              <button className="btn primary"><Icon name="print" size={12}/>Imprimir</button>
              <button className="btn"><Icon name="download" size={12}/>PDF</button>
              <button className="btn ghost" onClick={() => setShowRecibo(null)}><Icon name="x" size={12}/>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Recibo de sueldo ────────────────────────────────────────────────────────
function ReciboSueldo({ emp, period }) {
  const c = emp.calc || calcPayroll(emp);
  return (
    <div style={{
      width:360, background:'white', color:'#111',
      fontFamily:'var(--font-mono)', fontSize:11,
      padding:'20px 18px', borderRadius:8,
      boxShadow:'0 10px 40px rgba(0,0,0,0.18)',
    }}>
      <div style={{textAlign:'center', marginBottom:14}}>
        <div style={{fontWeight:700, fontSize:14, letterSpacing:'0.06em'}}>ERP MAYA · TIENDA</div>
        <div style={{fontSize:10, color:'#555', marginTop:2, lineHeight:1.5}}>
          NIT 8745619-2 · Guatemala<br/>
          RECIBO DE SUELDO
        </div>
      </div>
      <div style={{borderTop:'1px dashed #bbb', margin:'10px 0'}}/>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
        <span style={{color:'#666'}}>Período</span><span style={{fontWeight:600}}>{period}</span>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
        <span style={{color:'#666'}}>Empleado</span><span style={{fontWeight:600, maxWidth:200, textAlign:'right'}}>{emp.name}</span>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
        <span style={{color:'#666'}}>Puesto</span><span>{emp.pos}</span>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
        <span style={{color:'#666'}}>DPI</span><span>{emp.dpi}</span>
      </div>
      <div style={{borderTop:'1px dashed #bbb', margin:'10px 0'}}/>

      {/* Devengado */}
      <div style={{fontWeight:700, fontSize:10, letterSpacing:'0.08em', marginBottom:6}}>DEVENGADO</div>
      {[
        ['Salario base', c.base],
        ['Bonificación incentivo', c.bon],
      ].map(([l,v]) => (
        <div key={l} style={{display:'flex', justifyContent:'space-between', marginBottom:3}}>
          <span style={{color:'#444'}}>{l}</span>
          <span>{Q(v)}</span>
        </div>
      ))}
      <div style={{display:'flex', justifyContent:'space-between', fontWeight:700, borderTop:'1px solid #ddd', paddingTop:4, marginTop:4, marginBottom:10}}>
        <span>Total devengado</span><span>{Q(c.base + c.bon)}</span>
      </div>

      {/* Deducciones */}
      <div style={{fontWeight:700, fontSize:10, letterSpacing:'0.08em', marginBottom:6}}>DEDUCCIONES</div>
      {[
        [`IGSS empleado (4.83%)`, c.igssE],
        [`ISR mensual retenido`, c.isrM],
      ].map(([l,v]) => (
        <div key={l} style={{display:'flex', justifyContent:'space-between', marginBottom:3}}>
          <span style={{color:'#444'}}>{l}</span>
          <span style={{color:'#c00'}}>−{Q(v)}</span>
        </div>
      ))}
      <div style={{display:'flex', justifyContent:'space-between', fontWeight:700, borderTop:'1px solid #ddd', paddingTop:4, marginTop:4, marginBottom:10}}>
        <span>Total deducciones</span><span style={{color:'#c00'}}>−{Q(c.deducc)}</span>
      </div>

      <div style={{borderTop:'2px solid #111', margin:'10px 0'}}/>
      <div style={{display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:15}}>
        <span>LÍQUIDO A PAGAR</span><span style={{color:'#15803d'}}>{Q(c.neto)}</span>
      </div>
      <div style={{borderTop:'2px solid #111', margin:'10px 0'}}/>

      <div style={{fontSize:9, color:'#888', marginTop:10, lineHeight:1.6}}>
        Cuota patronal IGSS (10.67%): {Q(c.igssP)}<br/>
        Renta gravable anual estimada: {Q(c.rentaGraba)}<br/>
        ISR anual estimado: {Q(c.isrAnual)}<br/>
        <br/>
        Firma empleado: _________________________
      </div>
    </div>
  );
}
