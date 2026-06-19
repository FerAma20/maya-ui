// ERP MAYA — Auditoría · Log de actividad
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { USERS } from '../data/mock.js';

const Q = v => `Q ${v.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Mock data ────────────────────────────────────────────────────────────────
const ACTIVITY_LOG = [
  // 2026-05-24
  { id: 1,  ts: '2026-05-24 14:32:18', userId: 'u2', user: 'Carlos Méndez',    role: 'Cajero',        module: 'pos',        action: 'sale_created',       severity: 'success', description: 'Venta T-2026-04823 por Q248.75',              entity: 'T-2026-04823', branch: 'Zona 10',  ip: '192.168.1.105' },
  { id: 2,  ts: '2026-05-24 14:28:04', userId: 'u2', user: 'Carlos Méndez',    role: 'Cajero',        module: 'pos',        action: 'sale_created',       severity: 'success', description: 'Venta T-2026-04822 por Q32.00',               entity: 'T-2026-04822', branch: 'Zona 10',  ip: '192.168.1.105' },
  { id: 3,  ts: '2026-05-24 14:15:00', userId: 'u4', user: 'José Ramírez',     role: 'Cajero',        module: 'auth',       action: 'login',              severity: 'info',    description: 'Inicio de sesión exitoso',                    entity: null,           branch: 'Mixco',    ip: '192.168.3.201' },
  { id: 4,  ts: '2026-05-24 14:02:11', userId: 'u4', user: 'José Ramírez',     role: 'Cajero',        module: 'pos',        action: 'sale_created',       severity: 'success', description: 'Venta T-2026-04818 por Q324.85',              entity: 'T-2026-04818', branch: 'Mixco',    ip: '192.168.3.201' },
  { id: 5,  ts: '2026-05-24 13:45:22', userId: 'u5', user: 'Lucía Castillo',   role: 'Inventario',    module: 'inventory',  action: 'stock_adjusted',     severity: 'info',    description: 'Ajuste +12 uds — Agua Pura Salvavidas 600ml', entity: '7501031145552',branch: 'Zona 10',  ip: '192.168.1.108' },
  { id: 6,  ts: '2026-05-24 13:30:09', userId: 'u3', user: 'María Hernández',  role: 'Encargado',     module: 'purchases',  action: 'purchase_received',  severity: 'success', description: 'Recepción parcial OC-2026-0141 — 96 uds recibidas', entity: 'OC-2026-0141', branch: 'Centro',   ip: '192.168.2.114' },
  { id: 7,  ts: '2026-05-24 13:15:44', userId: 'u8', user: 'Sofía Aguilar',    role: 'Contador',      module: 'accounting', action: 'journal_created',    severity: 'info',    description: 'Partida PL-2026-05-1 — Planilla mayo Q24,800', entity: 'PL-2026-05-1', branch: 'Centro',   ip: '192.168.2.120' },
  { id: 8,  ts: '2026-05-24 12:50:31', userId: 'u1', user: 'Ana López',        role: 'Administrador', module: 'config',     action: 'config_changed',     severity: 'warning', description: 'Cambió tasa IVA: 12% → 12% (sin cambio neto)', entity: 'config.tax',   branch: 'Zona 10',  ip: '192.168.1.100' },
  { id: 9,  ts: '2026-05-24 12:30:58', userId: 'u2', user: 'Carlos Méndez',    role: 'Cajero',        module: 'cxc',        action: 'cxc_payment',        severity: 'info',    description: 'Cobro Q1,000 — Restaurante Don Quijote · F-2026-0822', entity: 'F-2026-0822', branch: 'Zona 10',  ip: '192.168.1.105' },
  { id: 10, ts: '2026-05-24 12:10:17', userId: 'u1', user: 'Ana López',        role: 'Administrador', module: 'users',      action: 'user_updated',       severity: 'warning', description: 'Cambió rol de Pedro Morales: Cajero → Encargado', entity: 'u6',          branch: 'Zona 10',  ip: '192.168.1.100' },
  { id: 11, ts: '2026-05-24 11:45:00', userId: 'u6', user: 'Pedro Morales',    role: 'Cajero',        module: 'auth',       action: 'login',              severity: 'info',    description: 'Inicio de sesión exitoso',                    entity: null,           branch: 'Antigua',  ip: '192.168.4.88'  },
  { id: 12, ts: '2026-05-24 11:40:05', userId: 'u6', user: 'Pedro Morales',    role: 'Cajero',        module: 'cash',       action: 'cash_opened',        severity: 'success', description: 'Apertura caja #02 Antigua — fondo Q500',      entity: 'CAJA-02',      branch: 'Antigua',  ip: '192.168.4.88'  },
  { id: 13, ts: '2026-05-24 11:20:33', userId: 'u1', user: 'Ana López',        role: 'Administrador', module: 'clients',    action: 'client_created',     severity: 'success', description: 'Nuevo cliente: Ferretería La Unión NIT 9876541-2', entity: 'CLI-011',    branch: 'Zona 10',  ip: '192.168.1.100' },
  { id: 14, ts: '2026-05-24 10:55:12', userId: 'u5', user: 'Lucía Castillo',   role: 'Inventario',    module: 'inventory',  action: 'product_updated',    severity: 'info',    description: 'Precio Coca-Cola 600ml actualizado: Q8.50 → Q9.00', entity: '7501031125678', branch: 'Zona 10', ip: '192.168.1.108' },
  { id: 15, ts: '2026-05-24 10:30:44', userId: 'u8', user: 'Sofía Aguilar',    role: 'Contador',      module: 'cxp',        action: 'cxp_payment',        severity: 'info',    description: 'Pago Q1,000 — Lácteos Foremost · FP-2026-0133', entity: 'FP-2026-0133', branch: 'Centro',  ip: '192.168.2.120' },
  { id: 16, ts: '2026-05-24 10:00:00', userId: 'u2', user: 'Carlos Méndez',    role: 'Cajero',        module: 'cash',       action: 'cash_opened',        severity: 'success', description: 'Apertura caja #03 Zona 10 — fondo Q2,000',    entity: 'CAJA-03',      branch: 'Zona 10',  ip: '192.168.1.105' },
  { id: 17, ts: '2026-05-24 09:45:00', userId: 'u1', user: 'Ana López',        role: 'Administrador', module: 'auth',       action: 'login',              severity: 'info',    description: 'Inicio de sesión exitoso',                    entity: null,           branch: 'Zona 10',  ip: '192.168.1.100' },
  { id: 18, ts: '2026-05-24 09:30:00', userId: 'u3', user: 'María Hernández',  role: 'Encargado',     module: 'auth',       action: 'login',              severity: 'info',    description: 'Inicio de sesión exitoso',                    entity: null,           branch: 'Centro',   ip: '192.168.2.114' },
  // 2026-05-23
  { id: 19, ts: '2026-05-23 18:00:22', userId: 'u1', user: 'Ana López',        role: 'Administrador', module: 'transfers',  action: 'transfer_created',   severity: 'success', description: 'Traslado TR-48893 — Centro → Mixco (35 uds)',  entity: 'TR-48893',     branch: 'Zona 10',  ip: '192.168.1.100' },
  { id: 20, ts: '2026-05-23 17:30:11', userId: 'u8', user: 'Sofía Aguilar',    role: 'Contador',      module: 'accounting', action: 'journal_created',    severity: 'info',    description: 'Partida ARR-MAY26 — Arrendamiento Zona 10 Q8,500', entity: 'ARR-MAY26', branch: 'Centro',   ip: '192.168.2.120' },
  { id: 21, ts: '2026-05-23 16:45:08', userId: 'u2', user: 'Carlos Méndez',    role: 'Cajero',        module: 'billing',    action: 'sale_cancelled',     severity: 'danger',  description: 'Anulación T-2026-04815 — Q156.75 — motivo: devolución cliente', entity: 'T-2026-04815', branch: 'Zona 10', ip: '192.168.1.105' },
  { id: 22, ts: '2026-05-23 16:00:45', userId: 'u4', user: 'José Ramírez',     role: 'Cajero',        module: 'cash',       action: 'cash_closed',        severity: 'success', description: 'Cierre caja Mixco — ventas Q4,820 · diferencia Q0', entity: 'CAJA-04',   branch: 'Mixco',    ip: '192.168.3.201' },
  { id: 23, ts: '2026-05-23 14:20:33', userId: 'u5', user: 'Lucía Castillo',   role: 'Inventario',    module: 'purchases',  action: 'purchase_received',  severity: 'success', description: 'OC-2026-0140 recibida completa — Lácteos Foremost', entity: 'OC-2026-0140', branch: 'Zona 10', ip: '192.168.1.108' },
  { id: 24, ts: '2026-05-23 13:45:12', userId: null, user: 'Desconocido',      role: '—',             module: 'auth',       action: 'login_failed',       severity: 'danger',  description: 'Intento de acceso fallido — usuario: admin123',  entity: null,           branch: '—',        ip: '10.0.0.42'     },
  { id: 25, ts: '2026-05-23 11:30:00', userId: 'u1', user: 'Ana López',        role: 'Administrador', module: 'config',     action: 'config_changed',     severity: 'warning', description: 'Actualizó datos empresa: dirección fiscal',     entity: 'config.company', branch: 'Zona 10', ip: '192.168.1.100' },
  { id: 26, ts: '2026-05-23 09:15:00', userId: 'u3', user: 'María Hernández',  role: 'Encargado',     module: 'cash',       action: 'cash_opened',        severity: 'success', description: 'Apertura caja #01 Centro — fondo Q1,500',     entity: 'CAJA-01',      branch: 'Centro',   ip: '192.168.2.114' },
  // 2026-05-22
  { id: 27, ts: '2026-05-22 17:00:15', userId: 'u8', user: 'Sofía Aguilar',    role: 'Contador',      module: 'accounting', action: 'journal_created',    severity: 'info',    description: 'Partida automática — Recepción OC-2026-0139',  entity: 'OC-2026-0139', branch: 'Centro',   ip: '192.168.2.120' },
  { id: 28, ts: '2026-05-22 15:30:44', userId: 'u5', user: 'Lucía Castillo',   role: 'Inventario',    module: 'inventory',  action: 'stock_adjusted',     severity: 'warning', description: 'Ajuste -5 uds — Cerveza Gallo 350ml (merma)',  entity: '7501031165432',branch: 'Zona 10',  ip: '192.168.1.108' },
  { id: 29, ts: '2026-05-22 14:00:00', userId: 'u1', user: 'Ana López',        role: 'Administrador', module: 'users',      action: 'user_created',       severity: 'success', description: 'Nuevo usuario: Roberto Estrada — Cajero Escuintla', entity: 'u7',        branch: 'Zona 10',  ip: '192.168.1.100' },
  { id: 30, ts: '2026-05-22 11:00:38', userId: 'u6', user: 'Pedro Morales',    role: 'Cajero',        module: 'pos',        action: 'sale_created',       severity: 'success', description: 'Venta T-2026-04812 por Q142.00',              entity: 'T-2026-04812', branch: 'Antigua',  ip: '192.168.4.88'  },
];

// ── Display maps ─────────────────────────────────────────────────────────────
const MODULE_LABEL = {
  pos: 'Punto de Venta', billing: 'Facturación', inventory: 'Inventario',
  purchases: 'Compras', cash: 'Caja', clients: 'Clientes',
  users: 'Usuarios', config: 'Configuración', accounting: 'Contabilidad',
  transfers: 'Transferencias', cxc: 'CxC', cxp: 'CxP', auth: 'Sistema',
};
const MODULE_ICON = {
  pos: 'pos', billing: 'receipt', inventory: 'box', purchases: 'truck',
  cash: 'cash', clients: 'user', users: 'users', config: 'bolt',
  accounting: 'receipt', transfers: 'transfer', cxc: 'card', cxp: 'card', auth: 'lock',
};
const ACTION_LABEL = {
  login: 'Inicio de sesión', logout: 'Cierre de sesión', login_failed: 'Acceso fallido',
  sale_created: 'Venta registrada', sale_cancelled: 'Venta anulada',
  stock_adjusted: 'Ajuste de inventario', product_updated: 'Producto actualizado',
  purchase_received: 'OC recibida', cash_opened: 'Apertura de caja',
  cash_closed: 'Cierre de caja', client_created: 'Cliente creado',
  client_updated: 'Cliente actualizado', user_created: 'Usuario creado',
  user_updated: 'Usuario modificado', config_changed: 'Configuración modificada',
  transfer_created: 'Traslado creado', journal_created: 'Partida contable',
  cxc_payment: 'Cobro CxC', cxp_payment: 'Pago CxP',
};
const SEVERITY_CLASS = { info: 'info', success: 'success', warning: 'warning', danger: 'danger' };
const SEVERITY_LABEL = { info: 'Info', success: 'OK', warning: 'Aviso', danger: 'Crítico' };

const TODAY_DATE = '2026-05-24';

export default function Audit() {
  const [search,        setSearch]        = useState('');
  const [filterModule,  setFilterModule]  = useState('all');
  const [filterUser,    setFilterUser]    = useState('all');
  const [filterSeverity,setFilterSeverity]= useState('all');
  const [selected,      setSelected]      = useState(null);

  // Stats
  const todayEntries    = ACTIVITY_LOG.filter(e => e.ts.startsWith(TODAY_DATE));
  const todayCount      = todayEntries.length;
  const activeUsers     = new Set(todayEntries.filter(e => e.userId).map(e => e.userId)).size;
  const alertCount      = ACTIVITY_LOG.filter(e => e.severity === 'danger').length;
  const weekCount       = ACTIVITY_LOG.length;

  const moduleFreq = useMemo(() => {
    const freq = {};
    todayEntries.forEach(e => { freq[e.module] = (freq[e.module] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [todayEntries]);

  const filtered = useMemo(() => ACTIVITY_LOG.filter(e => {
    if (filterModule   !== 'all' && e.module   !== filterModule)   return false;
    if (filterUser     !== 'all' && e.userId    !== filterUser)     return false;
    if (filterSeverity !== 'all' && e.severity  !== filterSeverity) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.user.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q) && !(e.entity || '').toLowerCase().includes(q)) return false;
    }
    return true;
  }), [search, filterModule, filterUser, filterSeverity]);

  const uniqueUsers   = useMemo(() => [...new Set(ACTIVITY_LOG.filter(e => e.userId).map(e => ({ id: e.userId, name: e.user })).map(JSON.stringify))].map(JSON.parse), []);
  const uniqueModules = useMemo(() => [...new Set(ACTIVITY_LOG.map(e => e.module))], []);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Auditoría</h1>
          <div className="page-subtitle">Log de actividad del sistema · trazabilidad de acciones</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat">
          <div className="label"><Icon name="clock" size={11} />Acciones hoy</div>
          <div className="val mono">{todayCount}</div>
          <div className="delta muted">{weekCount} esta semana</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="users" size={11} />Usuarios activos</div>
          <div className="val mono">{activeUsers}</div>
          <div className="delta muted">Sesiones únicas hoy</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="alert" size={11} />Alertas / críticos</div>
          <div className="val mono" style={{ color: alertCount > 0 ? 'var(--danger)' : undefined }}>{alertCount}</div>
          <div className="delta muted">Acciones críticas esta semana</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="dashboard" size={11} />Módulo más activo</div>
          <div className="val" style={{ fontSize: 20 }}>{MODULE_LABEL[moduleFreq] || '—'}</div>
          <div className="delta muted">Mayor actividad hoy</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filterbar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <Icon name="search" className="icon" size={13} />
          <input
            className="search-input"
            placeholder="Buscar usuario, acción, entidad…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
          <option value="all">Todos los módulos</option>
          {uniqueModules.map(m => (
            <option key={m} value={m}>{MODULE_LABEL[m] || m}</option>
          ))}
        </select>
        <select className="input" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
          <option value="all">Todos los usuarios</option>
          {uniqueUsers.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <select className="input" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
          <option value="all">Toda la severidad</option>
          <option value="success">OK</option>
          <option value="info">Info</option>
          <option value="warning">Aviso</option>
          <option value="danger">Crítico</option>
        </select>
      </div>

      {/* Tabla de log */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tbl-wrap"><table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 140 }}>Fecha y hora</th>
              <th>Usuario</th>
              <th>Módulo</th>
              <th>Acción</th>
              <th>Descripción</th>
              <th>Sucursal</th>
              <th style={{ width: 70 }}>Severidad</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="empty">Sin registros con los filtros aplicados</td></tr>
            ) : filtered.map(entry => (
              <tr
                key={entry.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(entry)}
              >
                <td>
                  <div className="mono muted" style={{ fontSize: 11 }}>{entry.ts.split(' ')[0]}</div>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{entry.ts.split(' ')[1]}</div>
                </td>
                <td>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{entry.user}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{entry.role}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name={MODULE_ICON[entry.module] || 'dashboard'} size={12} style={{ color: 'var(--muted)' }} />
                    <span style={{ fontSize: 12 }}>{MODULE_LABEL[entry.module] || entry.module}</span>
                  </div>
                </td>
                <td style={{ fontSize: 12 }}>{ACTION_LABEL[entry.action] || entry.action}</td>
                <td className="muted" style={{ fontSize: 12, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.description}
                </td>
                <td style={{ fontSize: 12 }}>{entry.branch}</td>
                <td>
                  <span className={`pill ${SEVERITY_CLASS[entry.severity]}`} style={{ fontSize: 9 }}>
                    {SEVERITY_LABEL[entry.severity]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {/* Drawer de detalle */}
      {selected && (
        <div className="drawer-overlay" onClick={() => setSelected(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <div className="drawer-title">{ACTION_LABEL[selected.action] || selected.action}</div>
                <div className="muted" style={{ fontSize: 12 }}>{selected.ts}</div>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)}><Icon name="close" /></button>
            </div>
            <div className="drawer-body detail-grid">
              <Row label="Usuario"    value={`${selected.user} · ${selected.role}`} />
              <Row label="Módulo"     value={MODULE_LABEL[selected.module] || selected.module} />
              <Row label="Acción"     value={ACTION_LABEL[selected.action] || selected.action} />
              <Row label="Descripción" value={selected.description} />
              {selected.entity && <Row label="Entidad afectada" value={selected.entity} mono />}
              <Row label="Sucursal"   value={selected.branch} />
              <Row label="IP"         value={selected.ip} mono />
              <Row label="Fecha/hora" value={selected.ts} mono />
              <div style={{ paddingTop: 4 }}>
                <span className={`pill ${SEVERITY_CLASS[selected.severity]}`}>
                  {SEVERITY_LABEL[selected.severity]}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={mono ? 'mono' : ''} style={{ fontSize: 13, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
