// ERP MAYA — App shell (ES module)
import React, { useState, useEffect } from 'react';
import Icon from './components/Icon.jsx';
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRadio,
  TweakButton,
} from './components/TweaksPanel.jsx';

import { useNotifications, NotificationsPanel } from './components/NotificationsPanel.jsx';
import Login from './modules/Login.jsx';
import Dashboard from './modules/Dashboard.jsx';
import POS from './modules/POS.jsx';
import Billing from './modules/Billing.jsx';
import Inventory from './modules/Inventory.jsx';
import Reports from './modules/Reports.jsx';
import Maintenance from './modules/Maintenance.jsx';
import Clients from './modules/Clients.jsx';
import Purchases from './modules/Purchases.jsx';
import CashRegister from './modules/CashRegister.jsx';
import Config from './modules/Config.jsx';
import Accounting from './modules/Accounting.jsx';
import Transfers from './modules/Transfers.jsx';
import CxC from './modules/CxC.jsx';
import CxP from './modules/CxP.jsx';
import Audit from './modules/Audit.jsx';
import Returns from './modules/Returns.jsx';
import Variants from './modules/Variants.jsx';
import StockCount from './modules/StockCount.jsx';
import Ledger from './modules/Ledger.jsx';
import FinancialStatements from './modules/FinancialStatements.jsx';
import BankReconciliation from './modules/BankReconciliation.jsx';
import Banks from './modules/Banks.jsx';
import UOM from './modules/UOM.jsx';
import CostCenters from './modules/CostCenters.jsx';
import Quotes from './modules/Quotes.jsx';
import Payroll from './modules/Payroll.jsx';
import FixedAssets from './modules/FixedAssets.jsx';
import Promotions from './modules/Promotions.jsx';
import Presupuestos from './modules/Presupuestos.jsx';
import Loyalty from './modules/Loyalty.jsx';
import FEL from './modules/FEL.jsx';

const NAV = [
  {
    section: 'OPERACIÓN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'pos', label: 'Punto de venta', icon: 'pos', kbd: '⌘P' },
      { id: 'billing',  label: 'Facturación',          icon: 'receipt', badge: 142 },
      { id: 'fel',      label: 'FEL · SAT',            icon: 'check'              },
      { id: 'returns',  label: 'Devoluciones',          icon: 'return',  badge: 1   },
      { id: 'cash', label: 'Caja &amp; Cortes', icon: 'cash' },
    ],
  },
  {
    section: 'INVENTARIO',
    items: [
      { id: 'inventory',  label: 'Productos &amp; stock', icon: 'box',      alert: 5 },
      { id: 'variants',    label: 'Variantes',              icon: 'settings'          },
      { id: 'stockcount', label: 'Conteo físico',          icon: 'check'             },
      { id: 'uom',        label: 'Unidades de Medida',     icon: 'settings'          },
      { id: 'purchases',  label: 'Compras y OCs',          icon: 'truck',    badge: 2 },
      { id: 'transfers',  label: 'Transferencias',        icon: 'transfer', badge: 1 },
    ],
  },
  {
    section: 'ANÁLISIS',
    items: [
      { id: 'reports', label: 'Reportería',  icon: 'chart'    },
      { id: 'quotes',      label: 'Cotizaciones', icon: 'receipt', badge: 2 },
      { id: 'promotions',  label: 'Promociones',  icon: 'tag'              },
    ],
  },
  {
    section: 'CRM',
    items: [
      { id: 'clients', label: 'Clientes',     icon: 'user' },
      { id: 'loyalty', label: 'Fidelización', icon: 'tag'  },
      { id: 'cxc',     label: 'Cuentas por Cobrar', icon: 'card', alert: 3 },
      { id: 'cxp',     label: 'Cuentas por Pagar',  icon: 'receipt', alert: 2 },
    ],
  },
  {
    section: 'CONTABILIDAD',
    items: [
      { id: 'accounting',    label: 'Contabilidad',          icon: 'receipt' },
      { id: 'costcenters',  label: 'Centros de Costo',      icon: 'chart'   },
      { id: 'presupuestos', label: 'Presupuestos',          icon: 'chart'   },
      { id: 'ledger',       label: 'Mayor General',         icon: 'chart'   },
      { id: 'financials',   label: 'Estados Financieros',   icon: 'receipt' },
      { id: 'banks',        label: 'Bancos &amp; Cuentas',  icon: 'card'    },
      { id: 'bankrec',      label: 'Conciliación Bancaria', icon: 'card'    },
    ],
  },
  {
    section: 'ADMINISTRACIÓN',
    items: [
      { id: 'maintenance', label: 'Mantenimientos', icon: 'settings' },
      { id: 'users',       label: 'Usuarios &amp; roles', icon: 'users' },
      { id: 'payroll',      label: 'Planilla',        icon: 'users'    },
      { id: 'fixedassets',  label: 'Activos Fijos',  icon: 'box'      },
      { id: 'audit',       label: 'Auditoría',      icon: 'clock' },
      { id: 'config',      label: 'Configuración',  icon: 'bolt' },
    ],
  },
];

const TWEAK_DEFAULTS = {
  theme: 'light',
  accent: 'teal',
  style: 'editorial',
  density: 'high',
  showSparklines: true,
};

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem('maya_session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [route, setRoute] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [collapsed, setCollapsed] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [navTooltip, setNavTooltip] = useState(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  // Aplicar tema/accent/style al <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    document.documentElement.setAttribute('data-accent', tweaks.accent);
    document.documentElement.setAttribute('data-style', tweaks.style);
  }, [tweaks.theme, tweaks.accent, tweaks.style]);

  // Auto-expandir la sección que contiene la ruta activa
  useEffect(() => {
    const sec = NAV.find(s => s.items.some(i => i.id === route));
    if (sec) setCollapsed(prev => ({ ...prev, [sec.section]: false }));
  }, [route]);

  const handleLogin = (sess) => {
    sessionStorage.setItem('maya_session', JSON.stringify(sess));
    setSession(sess);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('maya_session');
    setSession(null);
    setRoute('dashboard');
  };

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  const branch = session.user.branch;

  const pushToast = (msg, kind = '') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  let module;
  if (route === 'dashboard') module = <Dashboard pushToast={pushToast} />;
  else if (route === 'pos') module = <POS pushToast={pushToast} />;
  else if (route === 'billing') module = <Billing pushToast={pushToast} />;
  else if (route === 'inventory') module = <Inventory pushToast={pushToast} />;
  else if (route === 'purchases') module = <Purchases pushToast={pushToast} />;
  else if (route === 'reports') module = <Reports />;
  else if (route === 'maintenance' || route === 'users') module = <Maintenance />;
  else if (route === 'cash') module = <CashRegister pushToast={pushToast} />;
  else if (route === 'config') module = <Config pushToast={pushToast} />;
  else if (route === 'accounting') module = <Accounting pushToast={pushToast} />;
  else if (route === 'transfers') module = <Transfers pushToast={pushToast} />;
  else if (route === 'clients') module = <Clients pushToast={pushToast} />;
  else if (route === 'cxc') module = <CxC pushToast={pushToast} />;
  else if (route === 'cxp')   module = <CxP pushToast={pushToast} />;
  else if (route === 'audit')   module = <Audit />;
  else if (route === 'returns')  module = <Returns pushToast={pushToast} />;
  else if (route === 'variants')   module = <Variants pushToast={pushToast} />;
  else if (route === 'stockcount') module = <StockCount pushToast={pushToast} />;
  else if (route === 'ledger')      module = <Ledger />;
  else if (route === 'financials')  module = <FinancialStatements />;
  else if (route === 'banks')        module = <Banks pushToast={pushToast} />;
  else if (route === 'bankrec')     module = <BankReconciliation />;
  else if (route === 'uom')          module = <UOM pushToast={pushToast} />;
  else if (route === 'costcenters')  module = <CostCenters pushToast={pushToast} />;
  else if (route === 'quotes')       module = <Quotes pushToast={pushToast} />;
  else if (route === 'payroll')      module = <Payroll pushToast={pushToast} />;
  else if (route === 'fixedassets')  module = <FixedAssets pushToast={pushToast} />;
  else if (route === 'promotions')    module = <Promotions pushToast={pushToast} />;
  else if (route === 'presupuestos')  module = <Presupuestos pushToast={pushToast} />;
  else if (route === 'loyalty')       module = <Loyalty pushToast={pushToast} />;
  else if (route === 'fel')           module = <FEL pushToast={pushToast} />;
  else module = <div className="page">Módulo en construcción</div>;

  const currentNav = NAV.flatMap((s) => s.items).find((i) => i.id === route);

  return (
    <div className="app" data-screen-label={`Module · ${currentNav?.label}`} data-sidebar={sidebarCollapsed ? 'collapsed' : 'expanded'}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="mark">M</div>
          <div className="sidebar-brand-text">
            <div className="name">ERP MAYA</div>
            <div className="tier">RETAIL · v3.2</div>
          </div>
          <button
            className="icon-btn sidebar-toggle"
            style={{ marginLeft: 'auto' }}
            title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            onClick={() => setSidebarCollapsed(v => !v)}
          >
            <Icon name="chevronDown" size={13} style={{ transform: sidebarCollapsed ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
          </button>
        </div>

        <div className="sidebar-org">
          <button className="sidebar-org-btn">
            <span className="sidebar-org-dot"></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-org-name">{session.company.name}</div>
              <div className="muted mono" style={{ fontSize: 9.5, marginTop: 1 }}>
                {session.company.code} · {session.company.tier}
              </div>
            </div>
            <Icon name="chevronDown" size={11} className="sidebar-org-arrow" />
          </button>
        </div>

        <div className="sidebar-nav">
          {NAV.map((sec) => {
            const isCollapsed = !!collapsed[sec.section];
            return (
              <div key={sec.section}>
                <div
                  className="nav-section"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setCollapsed(prev => ({ ...prev, [sec.section]: !prev[sec.section] }))}
                >
                  <span className="nav-section-label">{sec.section}</span>
                  <Icon
                    name="chevronDown"
                    size={10}
                    className="nav-section-label"
                    style={{ marginRight: 4, transition: 'transform 0.2s', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                  />
                </div>
                {!isCollapsed && sec.items.map((it) => (
                  <div
                    key={it.id}
                    className={`nav-item ${route === it.id ? 'active' : ''}`}
                    onClick={() => setRoute(it.id)}
                    onMouseEnter={sidebarCollapsed ? (e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setNavTooltip({ label: it.label.replace(/&amp;/g, '&'), y: r.top + r.height / 2 });
                    } : undefined}
                    onMouseLeave={sidebarCollapsed ? () => setNavTooltip(null) : undefined}
                  >
                    <Icon name={it.icon} size={14} className="icon" />
                    <span className="nav-item-label" dangerouslySetInnerHTML={{ __html: it.label }} />
                    {it.alert && <span className="badge alert">{it.alert}</span>}
                    {it.badge && !it.alert && <span className="badge">{it.badge}</span>}
                    {it.kbd && route !== it.id && <span className="badge mono">{it.kbd}</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="avatar">{session.user.initials}</div>
          <div className="user-info">
            <div className="nm">{session.user.name}</div>
            <div className="rl">{session.user.role} · {branch}</div>
          </div>
          <button className="icon-btn" title="Cerrar sesión" onClick={handleLogout}>
            <Icon name="lock" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <div className="crumbs">
            <Icon name="dashboard" size={12} style={{ color: 'var(--muted)' }} />
            <span>ERP Maya</span>
            <span className="sep">/</span>
            <span className="cur">
              {currentNav?.label.replace(/&amp;/g, '&') || 'Módulo'}
            </span>
          </div>
          <div className="topbar-search">
            <Icon name="search" className="icon" />
            <input placeholder="Buscar productos, tickets, clientes…" />
            <span className="kbd">⌘K</span>
          </div>
          <div className="topbar-spacer"></div>
          <div className="topbar-actions">
            <span className="pill success" style={{ marginRight: 4 }}>
              <span className="dot" />
              SAT-FEL en línea
            </span>
            <NotificationsPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
              onNavigate={setRoute}
            />
            <button
              className="icon-btn"
              title="Tema"
              onClick={() => setTweak('theme', tweaks.theme === 'dark' ? 'light' : 'dark')}
            >
              <Icon name={tweaks.theme === 'dark' ? 'eye' : 'moon'} />
            </button>
            <div className="topbar-divider"></div>
            <button className="btn">
              <Icon name="plus" size={12} />
              Crear
            </button>
          </div>
        </header>

        <div className="content" key={route}>
          {module}
        </div>
      </main>

      {/* Tooltip sidebar colapsado */}
      {sidebarCollapsed && navTooltip && (
        <div style={{
          position: 'fixed',
          left: 60,
          top: navTooltip.y,
          transform: 'translateY(-50%)',
          background: 'var(--text)',
          color: 'var(--surface)',
          padding: '5px 10px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,.2)',
        }}>
          {navTooltip.label}
        </div>
      )}

      {/* Toasts */}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.kind === 'success' && <Icon name="check" size={14} />}
            {t.kind === 'danger' && <Icon name="alert" size={14} />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Tweaks panel (sólo desarrollo) */}
      {import.meta.env.DEV && (
        <TweaksPanel title="Tweaks · ERP Maya">
          <TweakSection label="Tema">
            <TweakRadio
              label="Modo"
              value={tweaks.theme}
              onChange={(v) => setTweak('theme', v)}
              options={[
                { value: 'light', label: 'Claro' },
                { value: 'dark', label: 'Oscuro' },
              ]}
            />
            <TweakRadio
              label="Acento"
              value={tweaks.accent}
              onChange={(v) => setTweak('accent', v)}
              options={[
                { value: 'teal', label: 'Teal' },
                { value: 'indigo', label: 'Indigo' },
                { value: 'amber', label: 'Ámbar' },
              ]}
            />
          </TweakSection>
          <TweakSection label="Variaciones de estilo">
            <TweakRadio
              label="Estilo visual"
              value={tweaks.style || 'editorial'}
              onChange={(v) => setTweak('style', v)}
              options={[
                { value: 'editorial', label: 'Editorial denso' },
                { value: 'spacious', label: 'Espaciado' },
              ]}
            />
          </TweakSection>
          <TweakSection label="Atajos">
            <TweakButton label="→ Dashboard" onClick={() => setRoute('dashboard')} />
            <TweakButton label="→ Punto de venta" onClick={() => setRoute('pos')} />
            <TweakButton label="→ Inventario" onClick={() => setRoute('inventory')} />
            <TweakButton label="→ Reportería" onClick={() => setRoute('reports')} />
          </TweakSection>
        </TweaksPanel>
      )}
    </div>
  );
}
