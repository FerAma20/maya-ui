import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { useTranslation } from 'react-i18next';

const Qf = (n) => 'Q ' + Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const USDf = (n) => '$ ' + Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt = (a) => (a.moneda === 'USD' ? USDf(a.saldo) : Qf(a.saldo));

const BANKS_CAT = [
  { id: 'BI',       nombre: 'Banco Industrial',  swift: 'INDLGTGC', pais: 'Guatemala', activo: true  },
  { id: 'BANRURAL', nombre: 'Banrural',           swift: 'BANRGTGC', pais: 'Guatemala', activo: true  },
  { id: 'BAC',      nombre: 'BAC Credomatic',     swift: 'BRACGTGC', pais: 'Guatemala', activo: true  },
  { id: 'GYT',      nombre: 'G&T Continental',   swift: 'GTCBGTGC', pais: 'Guatemala', activo: true  },
  { id: 'AGRO',     nombre: 'Bancoagrícola',      swift: 'BAGTGCGC', pais: 'Guatemala', activo: false },
  { id: 'MULTI',    nombre: 'Multivalores',       swift: 'MULVGTGC', pais: 'Guatemala', activo: true  },
];

const ACCOUNTS = [
  { id:'CTA-001', banco:'BI',       tipo:'monetaria', moneda:'GTQ', numero:'0124521-4', alias:'Cuenta Principal Quetzales', saldo:285420.50, saldoContable:283150.00, estado:'activa',   fechaApertura:'2019-03-01', ultimoMov:'2026-05-22' },
  { id:'CTA-002', banco:'BI',       tipo:'monetaria', moneda:'USD', numero:'0128834-7', alias:'Cuenta Dólares BI',           saldo:15200.00,  saldoContable:15200.00,  estado:'activa',   fechaApertura:'2020-07-15', ultimoMov:'2026-05-20' },
  { id:'CTA-003', banco:'BANRURAL', tipo:'ahorro',    moneda:'GTQ', numero:'4882210-1', alias:'Cuenta Ahorro Banrural',      saldo:42800.75,  saldoContable:42800.75,  estado:'activa',   fechaApertura:'2021-01-10', ultimoMov:'2026-05-18' },
  { id:'CTA-004', banco:'BAC',      tipo:'monetaria', moneda:'GTQ', numero:'3306677-2', alias:'BAC Operaciones',             saldo:98500.00,  saldoContable:97200.00,  estado:'activa',   fechaApertura:'2022-04-05', ultimoMov:'2026-05-21' },
  { id:'CTA-005', banco:'GYT',      tipo:'monetaria', moneda:'GTQ', numero:'7001234-5', alias:'G&T Fondo Reserva',          saldo:120000.00, saldoContable:120000.00, estado:'inactiva', fechaApertura:'2018-06-20', ultimoMov:'2025-12-31' },
];

const MOVEMENTS = [
  { id:'MOV-001', cuenta:'CTA-001', fecha:'2026-05-22', descripcion:'Depósito en efectivo',              referencia:'DEP-2026-441',  tipo:'deposito',      monto:15000.00,  saldo:285420.50 },
  { id:'MOV-002', cuenta:'CTA-001', fecha:'2026-05-21', descripcion:'Pago proveedor Distribuidora XYZ',  referencia:'CHQ-0088',      tipo:'retiro',        monto:-8250.00,  saldo:270420.50 },
  { id:'MOV-003', cuenta:'CTA-001', fecha:'2026-05-21', descripcion:'Transferencia recibida desde BAC',  referencia:'TRF-IN-0034',   tipo:'transferencia', monto:12000.00,  saldo:278670.50 },
  { id:'MOV-004', cuenta:'CTA-001', fecha:'2026-05-20', descripcion:'Débito automático servicios agua',  referencia:'DAU-0021',      tipo:'debito',        monto:-450.00,   saldo:266670.50 },
  { id:'MOV-005', cuenta:'CTA-001', fecha:'2026-05-19', descripcion:'Ingreso ventas POS',                referencia:'POS-20260519',  tipo:'deposito',      monto:32800.00,  saldo:267120.50 },
  { id:'MOV-006', cuenta:'CTA-001', fecha:'2026-05-18', descripcion:'Pago planilla quincenal',           referencia:'PLN-Q2-MAY',    tipo:'retiro',        monto:-45200.00, saldo:234320.50 },
  { id:'MOV-007', cuenta:'CTA-001', fecha:'2026-05-17', descripcion:'Ingreso ventas en línea',           referencia:'WEB-20260517',  tipo:'deposito',      monto:8900.00,   saldo:279520.50 },
  { id:'MOV-008', cuenta:'CTA-001', fecha:'2026-05-16', descripcion:'Pago impuesto ISR trimestral',      referencia:'ISR-Q1-2026',   tipo:'impuesto',      monto:-18500.00, saldo:270620.50 },
  { id:'MOV-009', cuenta:'CTA-002', fecha:'2026-05-20', descripcion:'Wire transfer recibido USA',        referencia:'WIRE-US-441',   tipo:'deposito',      monto:5000.00,   saldo:15200.00  },
  { id:'MOV-010', cuenta:'CTA-002', fecha:'2026-05-15', descripcion:'Pago importación proveedor US',     referencia:'IMP-0112',      tipo:'retiro',        monto:-2500.00,  saldo:10200.00  },
  { id:'MOV-011', cuenta:'CTA-003', fecha:'2026-05-18', descripcion:'Depósito reserva nómina',          referencia:'NOM-2026-05',   tipo:'deposito',      monto:18000.00,  saldo:42800.75  },
  { id:'MOV-012', cuenta:'CTA-003', fecha:'2026-05-10', descripcion:'Intereses ganados mes',             referencia:'INT-2026-05',   tipo:'interes',       monto:300.75,    saldo:24800.75  },
  { id:'MOV-013', cuenta:'CTA-004', fecha:'2026-05-21', descripcion:'Ingreso ventas sucursal norte',     referencia:'SUC-N-0441',    tipo:'deposito',      monto:25000.00,  saldo:98500.00  },
  { id:'MOV-014', cuenta:'CTA-004', fecha:'2026-05-20', descripcion:'Pago arrendamiento local',          referencia:'ARR-2026-05',   tipo:'retiro',        monto:-12000.00, saldo:73500.00  },
  { id:'MOV-015', cuenta:'CTA-004', fecha:'2026-05-19', descripcion:'Transferencia a cuenta principal',  referencia:'TRF-OUT-0034',  tipo:'transferencia', monto:-25000.00, saldo:48500.00  },
];

const TRANSFERS = [
  { id:'TRF-001', fecha:'2026-05-21', origen:'CTA-004', destino:'CTA-001', monto:12000.00, concepto:'Consolidación semanal',       referencia:'TRF-IN-0034',  estado:'completada' },
  { id:'TRF-002', fecha:'2026-05-19', origen:'CTA-004', destino:'CTA-001', monto:25000.00, concepto:'Transferencia sucursal norte', referencia:'TRF-OUT-0034', estado:'completada' },
  { id:'TRF-003', fecha:'2026-05-14', origen:'CTA-001', destino:'CTA-003', monto:18000.00, concepto:'Reserva nómina mayo',          referencia:'NOM-RES-05',   estado:'completada' },
  { id:'TRF-004', fecha:'2026-05-30', origen:'CTA-001', destino:'CTA-004', monto:30000.00, concepto:'Fondo operaciones junio',      referencia:'OP-JUN-001',   estado:'programada' },
];

const TIPO_PILL  = { deposito:'success', retiro:'danger', transferencia:'accent', debito:'warning', interes:'info', impuesto:'' };
const TIPO_LABEL = { deposito:'Depósito', retiro:'Retiro', transferencia:'Transferencia', debito:'Débito auto.', interes:'Interés', impuesto:'Impuesto' };

const EMPTY_CTA   = { banco:'', tipo:'monetaria', moneda:'GTQ', numero:'', alias:'', saldo:'' };
const EMPTY_TRF   = { origen:'', destino:'', monto:'', concepto:'', fecha:'' };
const EMPTY_BANCO = { id:'', nombre:'', swift:'', pais:'Guatemala', activo: true };

export default function Banks({ pushToast }) {
  const { t } = useTranslation();
  const [tab, setTab]   = useState('cuentas');
  const [search, setSearch]           = useState('');
  const [filterCuenta, setFilterCuenta] = useState('');
  const [filterTipo, setFilterTipo]     = useState('');
  const [drawerCuenta, setDrawerCuenta] = useState(null);
  const [showNuevaCuenta, setShowNuevaCuenta]               = useState(false);
  const [showNuevaTransferencia, setShowNuevaTransferencia] = useState(false);
  const [showNuevoBanco, setShowNuevoBanco]                 = useState(false);
  const [editBanco, setEditBanco]                           = useState(false);
  const [drawerBanco, setDrawerBanco]                       = useState(null);
  const [formCuenta, setFormCuenta] = useState(EMPTY_CTA);
  const [formTrf, setFormTrf]       = useState(EMPTY_TRF);
  const [formBanco, setFormBanco]   = useState(EMPTY_BANCO);

  const bankName = (id) => BANKS_CAT.find(b => b.id === id)?.nombre || id;

  const totalGTQ    = ACCOUNTS.filter(a => a.moneda === 'GTQ' && a.estado === 'activa').reduce((s, a) => s + a.saldo, 0);
  const totalUSD    = ACCOUNTS.filter(a => a.moneda === 'USD' && a.estado === 'activa').reduce((s, a) => s + a.saldo, 0);
  const diferencias = ACCOUNTS.filter(a => a.saldo !== a.saldoContable && a.estado === 'activa').length;
  const movsHoy     = MOVEMENTS.filter(m => m.fecha === '2026-05-22').length;

  const filteredMovs = useMemo(() => MOVEMENTS.filter(m => {
    if (filterCuenta && m.cuenta !== filterCuenta) return false;
    if (filterTipo   && m.tipo   !== filterTipo)   return false;
    const q = search.toLowerCase();
    if (q && !m.descripcion.toLowerCase().includes(q) && !m.referencia.toLowerCase().includes(q)) return false;
    return true;
  }), [search, filterCuenta, filterTipo]);

  const movsDeCuenta = drawerCuenta
    ? MOVEMENTS.filter(m => m.cuenta === drawerCuenta.id).slice(0, 8)
    : [];

  const canTransfer = formTrf.origen && formTrf.destino && formTrf.monto && formTrf.concepto;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('banks.title', 'Bancos & Cuentas')}</h1>
          <p className="page-sub">{t('banks.subtitle', 'Gestión de cuentas bancarias y movimientos')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost sm" onClick={() => setShowNuevaTransferencia(true)}>
            <Icon name="transfer" size={12} /> {t('banks.newTransfer', 'Transferencia')}
          </button>
          <button className="btn sm" onClick={() => { setFormCuenta(EMPTY_CTA); setShowNuevaCuenta(true); }}>
            <Icon name="plus" size={12} /> {t('banks.newAccount', 'Nueva cuenta')}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat">
          <div className="label">{t('banks.totalGTQ', 'Saldo total GTQ')}</div>
          <div className="val mono">{Qf(totalGTQ)}</div>
          <div className="delta up">
            {ACCOUNTS.filter(a => a.moneda === 'GTQ' && a.estado === 'activa').length} {t('banks.activeAccounts', 'cuentas activas')}
          </div>
        </div>
        <div className="stat">
          <div className="label">{t('banks.totalUSD', 'Saldo total USD')}</div>
          <div className="val mono">{USDf(totalUSD)}</div>
          <div className="delta up">
            {ACCOUNTS.filter(a => a.moneda === 'USD' && a.estado === 'activa').length} {t('banks.activeAccounts', 'cuentas activas')}
          </div>
        </div>
        <div className="stat">
          <div className="label">{t('banks.accountingDiffs', 'Diferencias contables')}</div>
          <div className="val mono">{diferencias}</div>
          <div className={`delta ${diferencias > 0 ? 'dn' : 'up'}`}>
            {diferencias > 0 ? t('banks.requireReconciliation', 'Requieren conciliación') : t('banks.allReconciled', 'Todo conciliado')}
          </div>
        </div>
        <div className="stat">
          <div className="label">{t('banks.movementsToday', 'Movimientos hoy')}</div>
          <div className="val mono">{movsHoy}</div>
          <div className="delta up">{t('banks.lastMovement', 'Último: hace 2 h')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${tab === 'cuentas'        ? 'active' : ''}`} onClick={() => setTab('cuentas')}>
          {t('banks.tabs.accounts', 'Cuentas')} <span className="count">{ACCOUNTS.filter(a => a.estado === 'activa').length}</span>
        </div>
        <div className={`tab ${tab === 'movimientos'    ? 'active' : ''}`} onClick={() => setTab('movimientos')}>
          {t('banks.tabs.movements', 'Movimientos')} <span className="count">{MOVEMENTS.length}</span>
        </div>
        <div className={`tab ${tab === 'transferencias' ? 'active' : ''}`} onClick={() => setTab('transferencias')}>
          {t('banks.tabs.transfers', 'Transferencias')} <span className="count">{TRANSFERS.length}</span>
        </div>
        <div className={`tab ${tab === 'bancos'         ? 'active' : ''}`} onClick={() => setTab('bancos')}>
          {t('banks.tabs.banks', 'Bancos')} <span className="count">{BANKS_CAT.length}</span>
        </div>
      </div>

      {/* ── Cuentas ────────────────────────────────────────────── */}
      {tab === 'cuentas' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {ACCOUNTS.map(a => {
            const bank = BANKS_CAT.find(b => b.id === a.banco);
            const diff = Math.abs(a.saldo - a.saldoContable);
            return (
              <div
                key={a.id}
                className="card"
                style={{ cursor: 'pointer', opacity: a.estado === 'inactiva' ? 0.55 : 1, padding: 16 }}
                onClick={() => setDrawerCuenta(a)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.alias}</div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                      {bank?.nombre} · {a.tipo} · {a.moneda}
                    </div>
                  </div>
                  {a.estado === 'inactiva'
                    ? <span className="pill">{t('common.inactive', 'Inactiva')}</span>
                    : <span className="pill success"><span className="dot" />{t('common.active', 'Activa')}</span>}
                </div>
                <div className="code" style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
                  {a.numero}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
                  {fmt(a)}
                </div>
                {diff > 0 && (
                  <div className="delta dn" style={{ marginTop: 6 }}>
                    {t('banks.accountingDiff', 'Diferencia contable')}: {Qf(diff)}
                  </div>
                )}
                <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>{t('banks.lastMov', 'Último mov.')}: {a.ultimoMov}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Movimientos ────────────────────────────────────────── */}
      {tab === 'movimientos' && (
        <div className="card">
          <div className="filterbar">
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Icon name="search" size={13} style={{ position: 'absolute', left: 9, color: 'var(--muted)', pointerEvents: 'none' }} />
              <input
                className="input"
                style={{ paddingLeft: 28, width: '100%' }}
                placeholder={t('banks.searchMovements', 'Buscar descripción o referencia…')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="input" value={filterCuenta} onChange={e => setFilterCuenta(e.target.value)}>
              <option value="">{t('banks.allAccounts', 'Todas las cuentas')}</option>
              {ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.alias}</option>)}
            </select>
            <select className="input" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
              <option value="">{t('banks.allTypes', 'Todos los tipos')}</option>
              {Object.entries(TIPO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button className="btn ghost sm"><Icon name="download" size={12} /> {t('common.export', 'Exportar')}</button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('common.date', 'Fecha')}</th>
                <th>{t('banks.account', 'Cuenta')}</th>
                <th>{t('common.description', 'Descripción')}</th>
                <th>{t('common.reference', 'Referencia')}</th>
                <th>{t('common.type', 'Tipo')}</th>
                <th className="num">{t('common.amount', 'Monto')}</th>
                <th className="num">{t('banks.balance', 'Saldo')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovs.map(m => {
                const cta = ACCOUNTS.find(a => a.id === m.cuenta);
                return (
                  <tr key={m.id}>
                    <td className="muted">{m.fecha}</td>
                    <td style={{ fontSize: 12 }}>{cta?.alias || m.cuenta}</td>
                    <td style={{ fontWeight: 500 }}>{m.descripcion}</td>
                    <td className="code muted">{m.referencia}</td>
                    <td><span className={`pill ${TIPO_PILL[m.tipo] || ''}`}>{TIPO_LABEL[m.tipo] || m.tipo}</span></td>
                    <td className="num" style={{ fontWeight: 600, color: m.monto >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {m.monto >= 0 ? '+' : ''}{Qf(Math.abs(m.monto))}
                    </td>
                    <td className="num mono">{Qf(m.saldo)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredMovs.length === 0 && (
            <div className="muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: 13 }}>
              {t('banks.noMovementsFilter', 'Sin movimientos para los filtros seleccionados.')}
            </div>
          )}
        </div>
      )}

      {/* ── Transferencias ─────────────────────────────────────── */}
      {tab === 'transferencias' && (
        <div className="card">
          <div className="card-head">
            <h3>{t('banks.transferHistory', 'Historial de transferencias')}</h3>
            <button className="btn sm" onClick={() => { setFormTrf(EMPTY_TRF); setShowNuevaTransferencia(true); }}>
              <Icon name="plus" size={12} /> {t('banks.newTransfer', 'Nueva transferencia')}
            </button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('common.date', 'Fecha')}</th>
                <th>{t('banks.origin', 'Origen')}</th>
                <th>{t('banks.destination', 'Destino')}</th>
                <th>{t('banks.concept', 'Concepto')}</th>
                <th className="num">{t('common.amount', 'Monto')}</th>
                <th>{t('common.status', 'Estado')}</th>
              </tr>
            </thead>
            <tbody>
              {TRANSFERS.map(t_ => {
                const orig = ACCOUNTS.find(a => a.id === t_.origen);
                const dest = ACCOUNTS.find(a => a.id === t_.destino);
                return (
                  <tr key={t_.id}>
                    <td className="code">{t_.id}</td>
                    <td className="muted">{t_.fecha}</td>
                    <td>{orig?.alias}</td>
                    <td>{dest?.alias}</td>
                    <td>{t_.concepto}</td>
                    <td className="num mono">{Qf(t_.monto)}</td>
                    <td>
                      {t_.estado === 'completada'
                        ? <span className="pill success"><span className="dot" />{t('banks.completed', 'Completada')}</span>
                        : <span className="pill accent"><span className="dot" />{t('banks.scheduled', 'Programada')}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Catálogo bancos ────────────────────────────────────── */}
      {tab === 'bancos' && (
        <div className="card">
          <div className="card-head">
            <h3>{t('banks.bankCatalog', 'Catálogo de bancos')}</h3>
            <button className="btn sm" onClick={() => { setFormBanco(EMPTY_BANCO); setEditBanco(false); setShowNuevoBanco(true); }}>
              <Icon name="plus" size={12} /> {t('banks.addBank', 'Agregar banco')}
            </button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('common.code', 'Código')}</th>
                <th>{t('common.name', 'Nombre')}</th>
                <th>SWIFT / BIC</th>
                <th>{t('banks.country', 'País')}</th>
                <th>{t('common.status', 'Estado')}</th>
                <th className="num">{t('banks.accounts', 'Cuentas')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {BANKS_CAT.map(b => {
                const ctas = ACCOUNTS.filter(a => a.banco === b.id).length;
                return (
                  <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setDrawerBanco(b)}>
                    <td className="code">{b.id}</td>
                    <td style={{ fontWeight: 500 }}>{b.nombre}</td>
                    <td className="code">{b.swift}</td>
                    <td>{b.pais}</td>
                    <td>
                      {b.activo
                        ? <span className="pill success"><span className="dot" />{t('common.active', 'Activo')}</span>
                        : <span className="pill"><span className="dot" style={{ background: 'var(--muted)' }} />{t('common.inactive', 'Inactivo')}</span>}
                    </td>
                    <td className="num">{ctas}</td>
                    <td>
                      <button className="icon-btn" onClick={e => { e.stopPropagation(); setFormBanco({ id: b.id, nombre: b.nombre, swift: b.swift, pais: b.pais, activo: b.activo }); setEditBanco(true); setShowNuevoBanco(true); }}>
                        <Icon name="edit" size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Drawer: Detalle de cuenta ─────────────────────────── */}
      {drawerCuenta && (
        <div className="drawer-overlay" onClick={() => setDrawerCuenta(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{drawerCuenta.alias}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>
                  {bankName(drawerCuenta.banco)} · {drawerCuenta.tipo} · {drawerCuenta.moneda}
                </div>
              </div>
              <button className="icon-btn" aria-label={t('common.close', 'Cerrar')} onClick={() => setDrawerCuenta(null)}><Icon name="close" /></button>
            </div>
            <div className="drawer-body">
              <div className="stat" style={{ marginBottom: 20 }}>
                <div className="label">{t('banks.currentBalance', 'Saldo actual')}</div>
                <div className="val mono" style={{ fontSize: 24 }}>{fmt(drawerCuenta)}</div>
                {drawerCuenta.saldo !== drawerCuenta.saldoContable && (
                  <div className="delta dn">{t('banks.bookBalance', 'Saldo contable')}: {Qf(drawerCuenta.saldoContable)}</div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontSize: 12.5, marginBottom: 20 }}>
                <div className="muted">{t('banks.accountNumber', 'N.° de cuenta')}</div>  <div className="code">{drawerCuenta.numero}</div>
                <div className="muted">{t('common.type', 'Tipo')}</div>            <div style={{ textTransform: 'capitalize' }}>{drawerCuenta.tipo}</div>
                <div className="muted">{t('banks.currency', 'Moneda')}</div>          <div>{drawerCuenta.moneda}</div>
                <div className="muted">{t('common.status', 'Estado')}</div>          <div style={{ textTransform: 'capitalize' }}>{drawerCuenta.estado}</div>
                <div className="muted">{t('banks.openingDate', 'Apertura')}</div>        <div>{drawerCuenta.fechaApertura}</div>
                <div className="muted">{t('banks.lastMov', 'Último mov.')}</div>     <div>{drawerCuenta.ultimoMov}</div>
              </div>

              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>{t('banks.recentMovements', 'Últimos movimientos')}</div>
              <table className="tbl" style={{ fontSize: 11.5 }}>
                <thead><tr><th>{t('common.date', 'Fecha')}</th><th>{t('common.description', 'Descripción')}</th><th className="num">{t('common.amount', 'Monto')}</th></tr></thead>
                <tbody>
                  {movsDeCuenta.map(m => (
                    <tr key={m.id}>
                      <td className="muted">{m.fecha}</td>
                      <td>{m.descripcion}</td>
                      <td className="num" style={{ fontWeight: 600, color: m.monto >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {m.monto >= 0 ? '+' : ''}{Qf(Math.abs(m.monto))}
                      </td>
                    </tr>
                  ))}
                  {movsDeCuenta.length === 0 && (
                    <tr><td colSpan={3} className="muted" style={{ textAlign: 'center', padding: '12px 0' }}>{t('banks.noMovements', 'Sin movimientos')}</td></tr>
                  )}
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button className="btn sm ghost" style={{ flex: 1 }}>
                  <Icon name="edit" size={12} /> {t('common.edit', 'Editar')}
                </button>
                <button
                  className="btn sm ghost"
                  style={{ flex: 1 }}
                  onClick={() => { setDrawerCuenta(null); setFormTrf({ ...EMPTY_TRF, origen: drawerCuenta.id }); setShowNuevaTransferencia(true); }}
                >
                  <Icon name="transfer" size={12} /> {t('banks.transfer', 'Transferir')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Nueva cuenta ───────────────────────────────── */}
      {showNuevaCuenta && (
        <div className="modal-overlay" onClick={() => setShowNuevaCuenta(false)}>
          <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span>{t('banks.newBankAccount', 'Nueva cuenta bancaria')}</span>
              <button className="icon-btn" aria-label={t('common.close', 'Cerrar')} onClick={() => setShowNuevaCuenta(false)}><Icon name="close" /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="field span-2">
                  <label>{t('banks.aliasName', 'Alias / Nombre')}</label>
                  <input
                    placeholder={t('banks.aliasPlaceholder', 'Ej. Cuenta Principal GTQ')}
                    value={formCuenta.alias}
                    onChange={e => setFormCuenta(f => ({ ...f, alias: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>{t('banks.bank', 'Banco')}</label>
                  <select value={formCuenta.banco} onChange={e => setFormCuenta(f => ({ ...f, banco: e.target.value }))}>
                    <option value="">{t('common.selectDots', 'Seleccionar…')}</option>
                    {BANKS_CAT.filter(b => b.activo).map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>{t('common.type', 'Tipo')}</label>
                  <select value={formCuenta.tipo} onChange={e => setFormCuenta(f => ({ ...f, tipo: e.target.value }))}>
                    <option value="monetaria">{t('banks.types.monetary', 'Monetaria')}</option>
                    <option value="ahorro">{t('banks.types.savings', 'Ahorro')}</option>
                    <option value="inversion">{t('banks.types.investment', 'Inversión')}</option>
                  </select>
                </div>
                <div className="field">
                  <label>{t('banks.accountNumber', 'N.° de cuenta')}</label>
                  <input
                    placeholder="0000000-0"
                    value={formCuenta.numero}
                    onChange={e => setFormCuenta(f => ({ ...f, numero: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>{t('banks.currency', 'Moneda')}</label>
                  <select value={formCuenta.moneda} onChange={e => setFormCuenta(f => ({ ...f, moneda: e.target.value }))}>
                    <option value="GTQ">GTQ — Quetzal</option>
                    <option value="USD">USD — Dólar</option>
                  </select>
                </div>
                <div className="field span-2">
                  <label>{t('banks.openingBalance', 'Saldo inicial')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formCuenta.saldo}
                    onChange={e => setFormCuenta(f => ({ ...f, saldo: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setShowNuevaCuenta(false)}>{t('common.cancel', 'Cancelar')}</button>
              <button
                className="btn"
                disabled={!formCuenta.alias || !formCuenta.banco || !formCuenta.numero}
                onClick={() => { pushToast(t('banks.accountCreated', 'Cuenta creada correctamente'), 'success'); setShowNuevaCuenta(false); }}
              >
                {t('banks.createAccount', 'Crear cuenta')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Nueva transferencia ────────────────────────── */}
      {showNuevaTransferencia && (
        <div className="modal-overlay" onClick={() => setShowNuevaTransferencia(false)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span>{t('banks.newTransfer', 'Nueva transferencia')}</span>
              <button className="icon-btn" aria-label={t('common.close', 'Cerrar')} onClick={() => setShowNuevaTransferencia(false)}><Icon name="close" /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="field span-2">
                  <label>{t('banks.originAccount', 'Cuenta origen')}</label>
                  <select value={formTrf.origen} onChange={e => setFormTrf(f => ({ ...f, origen: e.target.value }))}>
                    <option value="">{t('common.selectDots', 'Seleccionar…')}</option>
                    {ACCOUNTS.filter(a => a.estado === 'activa').map(a => (
                      <option key={a.id} value={a.id}>{a.alias} ({a.moneda})</option>
                    ))}
                  </select>
                </div>
                <div className="field span-2">
                  <label>{t('banks.destinationAccount', 'Cuenta destino')}</label>
                  <select value={formTrf.destino} onChange={e => setFormTrf(f => ({ ...f, destino: e.target.value }))}>
                    <option value="">{t('common.selectDots', 'Seleccionar…')}</option>
                    {ACCOUNTS.filter(a => a.estado === 'activa' && a.id !== formTrf.origen).map(a => (
                      <option key={a.id} value={a.id}>{a.alias} ({a.moneda})</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>{t('common.amount', 'Monto')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formTrf.monto}
                    onChange={e => setFormTrf(f => ({ ...f, monto: e.target.value }))}
                  />
                  {formTrf.origen && (
                    <div className="muted" style={{ fontSize: 11 }}>
                      {t('banks.available', 'Disponible')}: {fmt(ACCOUNTS.find(a => a.id === formTrf.origen))}
                    </div>
                  )}
                </div>
                <div className="field">
                  <label>{t('common.date', 'Fecha')}</label>
                  <input
                    type="date"
                    value={formTrf.fecha}
                    onChange={e => setFormTrf(f => ({ ...f, fecha: e.target.value }))}
                  />
                </div>
                <div className="field span-2">
                  <label>{t('banks.concept', 'Concepto')}</label>
                  <input
                    placeholder={t('banks.conceptPlaceholder', 'Descripción del traslado…')}
                    value={formTrf.concepto}
                    onChange={e => setFormTrf(f => ({ ...f, concepto: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setShowNuevaTransferencia(false)}>{t('common.cancel', 'Cancelar')}</button>
              <button
                className="btn"
                disabled={!canTransfer}
                onClick={() => { pushToast(t('banks.transferRegistered', 'Transferencia registrada'), 'success'); setShowNuevaTransferencia(false); }}
              >
                {t('banks.register', 'Registrar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Drawer: Detalle de banco ─────────────────────────── */}
      {drawerBanco && (
        <div className="drawer-overlay" onClick={() => setDrawerBanco(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{drawerBanco.nombre}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>{drawerBanco.pais} · SWIFT: {drawerBanco.swift}</div>
              </div>
              <button className="icon-btn" aria-label={t('common.close', 'Cerrar')} onClick={() => setDrawerBanco(null)}><Icon name="close" /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontSize: 12.5, marginBottom: 24 }}>
                <div className="muted">{t('common.code', 'Código')}</div>       <div className="code">{drawerBanco.id}</div>
                <div className="muted">SWIFT / BIC</div>  <div className="code">{drawerBanco.swift}</div>
                <div className="muted">{t('banks.country', 'País')}</div>          <div>{drawerBanco.pais}</div>
                <div className="muted">{t('common.status', 'Estado')}</div>
                <div>
                  {drawerBanco.activo
                    ? <span className="pill success"><span className="dot" />{t('common.active', 'Activo')}</span>
                    : <span className="pill"><span className="dot" style={{ background: 'var(--muted)' }} />{t('common.inactive', 'Inactivo')}</span>}
                </div>
                <div className="muted">{t('banks.linkedAccounts', 'Cuentas vinculadas')}</div>
                <div>{ACCOUNTS.filter(a => a.banco === drawerBanco.id).length}</div>
              </div>

              {ACCOUNTS.filter(a => a.banco === drawerBanco.id).length > 0 && (
                <>
                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>{t('banks.linkedAccounts', 'Cuentas vinculadas')}</div>
                  <table className="tbl" style={{ fontSize: 11.5, marginBottom: 24 }}>
                    <thead><tr><th>{t('banks.alias', 'Alias')}</th><th>{t('common.type', 'Tipo')}</th><th className="num">{t('banks.balance', 'Saldo')}</th></tr></thead>
                    <tbody>
                      {ACCOUNTS.filter(a => a.banco === drawerBanco.id).map(a => (
                        <tr key={a.id}>
                          <td>{a.alias}</td>
                          <td style={{ textTransform: 'capitalize' }}>{a.tipo}</td>
                          <td className="num mono">{fmt(a)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn ghost sm"
                  onClick={() => { setFormBanco({ id: drawerBanco.id, nombre: drawerBanco.nombre, swift: drawerBanco.swift, pais: drawerBanco.pais, activo: drawerBanco.activo }); setEditBanco(true); setShowNuevoBanco(true); setDrawerBanco(null); }}
                >
                  <Icon name="edit" size={12} /> {t('banks.editInfo', 'Editar información')}
                </button>
                <button
                  className="btn ghost sm"
                  onClick={() => { pushToast(`${t('banks.bank', 'Banco')} ${drawerBanco.activo ? t('banks.deactivated', 'desactivado') : t('banks.activated', 'activado')}`, 'success'); setDrawerBanco(null); }}
                >
                  <Icon name={drawerBanco.activo ? 'close' : 'check'} size={12} />
                  {drawerBanco.activo ? t('banks.deactivateBank', 'Desactivar banco') : t('banks.activateBank', 'Activar banco')}
                </button>
                <button
                  className="btn ghost sm"
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  disabled={ACCOUNTS.filter(a => a.banco === drawerBanco.id).length > 0}
                  title={ACCOUNTS.filter(a => a.banco === drawerBanco.id).length > 0 ? t('banks.cannotDeleteLinked', 'No se puede eliminar: tiene cuentas vinculadas') : ''}
                  onClick={() => { pushToast(t('banks.bankDeleted', 'Banco eliminado'), 'danger'); setDrawerBanco(null); }}
                >
                  <Icon name="alert" size={12} /> {t('banks.deleteBank', 'Eliminar banco')}
                </button>
                {ACCOUNTS.filter(a => a.banco === drawerBanco.id).length > 0 && (
                  <div className="muted" style={{ fontSize: 11 }}>
                    {t('banks.cannotDeleteLinked', 'No se puede eliminar')}: {t('banks.hasLinkedAccounts', 'tiene')} {ACCOUNTS.filter(a => a.banco === drawerBanco.id).length} {t('banks.linkedAccountsCount', 'cuenta(s) vinculada(s)')}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Nuevo banco ────────────────────────────────── */}
      {showNuevoBanco && (
        <div className="modal-overlay" onClick={() => setShowNuevoBanco(false)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span>{editBanco ? `${t('banks.editBank', 'Editar banco')} · ${formBanco.id}` : t('banks.addBank', 'Agregar banco')}</span>
              <button className="icon-btn" aria-label={t('common.close', 'Cerrar')} onClick={() => setShowNuevoBanco(false)}><Icon name="close" /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="field span-2">
                  <label>{t('banks.bankName', 'Nombre del banco')}</label>
                  <input
                    placeholder={t('banks.bankNamePlaceholder', 'Ej. Banco Industrial')}
                    value={formBanco.nombre}
                    onChange={e => setFormBanco(f => ({ ...f, nombre: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>{t('banks.codeId', 'Código / ID')}</label>
                  <input
                    placeholder={t('banks.codeIdPlaceholder', 'Ej. BI')}
                    value={formBanco.id}
                    readOnly={editBanco}
                    style={editBanco ? { opacity: 0.5 } : {}}
                    onChange={e => setFormBanco(f => ({ ...f, id: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="field">
                  <label>SWIFT / BIC</label>
                  <input
                    placeholder={t('banks.swiftPlaceholder', 'Ej. INDLGTGC')}
                    value={formBanco.swift}
                    onChange={e => setFormBanco(f => ({ ...f, swift: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="field">
                  <label>{t('banks.country', 'País')}</label>
                  <input
                    placeholder="Guatemala"
                    value={formBanco.pais}
                    onChange={e => setFormBanco(f => ({ ...f, pais: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>{t('common.status', 'Estado')}</label>
                  <select value={formBanco.activo ? 'activo' : 'inactivo'} onChange={e => setFormBanco(f => ({ ...f, activo: e.target.value === 'activo' }))}>
                    <option value="activo">{t('common.active', 'Activo')}</option>
                    <option value="inactivo">{t('common.inactive', 'Inactivo')}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setShowNuevoBanco(false)}>{t('common.cancel', 'Cancelar')}</button>
              <button
                className="btn"
                disabled={!formBanco.nombre || !formBanco.id}
                onClick={() => { pushToast(editBanco ? t('banks.bankUpdated', 'Banco actualizado') : t('banks.bankAdded', 'Banco agregado correctamente'), 'success'); setShowNuevoBanco(false); }}
              >
                {editBanco ? t('common.save', 'Guardar cambios') : t('banks.addBank', 'Agregar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
