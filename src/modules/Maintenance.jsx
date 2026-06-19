// ERP MAYA — MaintenanceModule (ES module)
import Icon from '../components/Icon.jsx';
import * as MAYA from '../data/mock.js';
// ERP MAYA — Maintenance module (catálogos / mantenimientos)
import React, { useState as useStateMt } from 'react';
import { useTranslation } from 'react-i18next';

function MaintenanceModule() {
  const { t } = useTranslation();
  const { Q, Qs, BRANCHES, SUPPLIERS, USERS, CATEGORIES } = MAYA;
  const [tab, setTab] = useStateMt('sucursales');

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('maintenance.title', 'Mantenimientos')}</h1>
          <div className="page-subtitle">{t('maintenance.subtitle', 'Catálogos maestros · Configuración de entidades del sistema')}</div>
        </div>
        <div className="page-head-actions">
          <button className="btn"><Icon name="download"/>{t('common.export', 'Exportar')}</button>
          <button className="btn accent">
            <Icon name="plus"/>{t('maintenance.newRecord', 'Nuevo registro')}
          </button>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${tab==='sucursales'?'active':''}`} onClick={()=>setTab('sucursales')}>{t('maintenance.tabs.branches', 'Sucursales')} <span className="count">{BRANCHES.length}</span></div>
        <div className={`tab ${tab==='proveedores'?'active':''}`} onClick={()=>setTab('proveedores')}>{t('maintenance.tabs.suppliers', 'Proveedores')} <span className="count">{SUPPLIERS.length}</span></div>
        <div className={`tab ${tab==='categorias'?'active':''}`} onClick={()=>setTab('categorias')}>{t('maintenance.tabs.categories', 'Categorías')} <span className="count">{CATEGORIES.length - 1}</span></div>
        <div className={`tab ${tab==='impuestos'?'active':''}`} onClick={()=>setTab('impuestos')}>{t('maintenance.tabs.taxes', 'Impuestos & SAT')}</div>
      </div>

      {tab === 'sucursales' && (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('common.code', 'Código')}</th><th>{t('common.name', 'Nombre')}</th><th>{t('common.address', 'Dirección')}</th><th>{t('maintenance.manager', 'Encargado')}</th>
                <th className="num">{t('maintenance.salesToday', 'Ventas hoy')}</th><th className="center">{t('maintenance.registers', 'Cajas')}</th><th>{t('common.status', 'Estado')}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {BRANCHES.map((b, i) => (
                <tr key={b.id}>
                  <td className="code">{b.id.toUpperCase()}</td>
                  <td><div style={{fontWeight:500}}>{b.name}</div></td>
                  <td>{b.addr}</td>
                  <td>{USERS.filter(u => u.role === 'Encargado')[i] ? USERS.filter(u => u.role === 'Encargado')[i].name : USERS[0].name}</td>
                  <td className="num" style={{fontWeight:600}}>{Q(b.sales)}</td>
                  <td className="center mono">{[3,4,3,2,2][i]}</td>
                  <td>
                    {b.status === 'active' ? <span className="pill success"><span className="dot"/>{t('maintenance.branchActive', 'Activa')}</span> : <span className="pill warning"><span className="dot"/>{t('maintenance.branchPaused', 'Pausada')}</span>}
                  </td>
                  <td>
                    <button className="icon-btn"><Icon name="edit"/></button>
                    <button className="icon-btn"><Icon name="dots"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'proveedores' && (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('common.code', 'Código')}</th><th>{t('maintenance.legalName', 'Razón social')}</th><th>NIT</th><th>{t('maintenance.contact', 'Contacto')}</th><th>{t('common.phone', 'Teléfono')}</th>
                <th>{t('maintenance.terms', 'Términos')}</th><th className="num">{t('maintenance.cxpBalance', 'Saldo CxP')}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {SUPPLIERS.map(s => (
                <tr key={s.id}>
                  <td className="code">{s.id.toUpperCase()}</td>
                  <td><div style={{fontWeight:500}}>{s.name}</div></td>
                  <td className="code">{s.nit}</td>
                  <td>{s.contact}</td>
                  <td className="code">{s.phone}</td>
                  <td>
                    <span className="pill">{s.terms}</span>
                  </td>
                  <td className="num" style={{fontWeight:600, color: s.balance > 0 ? 'var(--warning)' : 'var(--muted)'}}>{Q(s.balance)}</td>
                  <td>
                    <button className="icon-btn"><Icon name="edit"/></button>
                    <button className="icon-btn"><Icon name="dots"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'categorias' && (
        <div className="grid-3">
          {CATEGORIES.filter(c=>c.id!=='todos').map(c => (
            <div key={c.id} className="card">
              <div className="card-body" style={{display:'flex', alignItems:'center', gap:12}}>
                <div style={{width:42, height:42, borderRadius:'var(--r-md)', background:'var(--surface-3)', display:'grid', placeItems:'center', fontSize:22}}>{c.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600, fontSize:13.5}}>{c.name}</div>
                  <div className="muted mono" style={{fontSize:11}}>{c.count} SKUs · {c.id.toUpperCase()}</div>
                </div>
                <button className="icon-btn"><Icon name="edit"/></button>
              </div>
            </div>
          ))}
        </div>
      )}


      {tab === 'impuestos' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-head"><h3>{t('maintenance.taxpayerData', 'Datos fiscales del contribuyente')}</h3><button className="btn sm ghost"><Icon name="edit" size={11}/>{t('common.edit', 'Editar')}</button></div>
            <div className="card-body" style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'8px 14px', fontSize:12.5}}>
              <div className="muted">{t('maintenance.legalName', 'Razón social')}</div><div>ERP Maya Distribuidora, S.A.</div>
              <div className="muted">{t('maintenance.tradeName', 'Nombre comercial')}</div><div>ERP Maya · Tienda</div>
              <div className="muted">NIT</div><div className="code">8745619-2</div>
              <div className="muted">{t('maintenance.regime', 'Régimen')}</div><div>General sobre Utilidades</div>
              <div className="muted">{t('maintenance.satCategory', 'Categoría SAT')}</div><div>Definitivo IVA</div>
              <div className="muted">{t('maintenance.felResolution', 'Resol. FEL')}</div><div className="code">2026-43-XX-0042</div>
              <div className="muted">{t('maintenance.establishment', 'Establecimiento')}</div><div>Comercio al por menor</div>
              <div className="muted">{t('maintenance.fiscalAddress', 'Dirección fiscal')}</div><div>5a Av. 10-25, Zona 10, Guatemala</div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3>{t('maintenance.taxConfig', 'Configuración de impuestos')}</h3></div>
            <div className="card-body flush">
              <table className="tbl">
                <thead><tr><th>{t('common.code', 'Código')}</th><th>{t('common.name', 'Nombre')}</th><th className="num">{t('maintenance.rate', 'Tasa')}</th><th>{t('maintenance.applies', 'Aplica')}</th><th>{t('common.status', 'Estado')}</th></tr></thead>
                <tbody>
                  <tr><td className="code">IVA</td><td>Impuesto al Valor Agregado</td><td className="num" style={{fontWeight:600}}>12%</td><td>{t('maintenance.allSales', 'Todas las ventas')}</td><td><span className="pill success"><span className="dot"/>{t('common.active', 'Activo')}</span></td></tr>
                  <tr><td className="code">ISO</td><td>ISO sobre Productos</td><td className="num">1%</td><td>{t('maintenance.selectProducts', 'Productos selectos')}</td><td><span className="pill"><span className="dot" style={{background:'var(--muted)'}}/>{t('common.inactive', 'Inactivo')}</span></td></tr>
                  <tr><td className="code">IDP</td><td>Impuesto Distribución Petróleo</td><td className="num">—</td><td>—</td><td><span className="pill"><span className="dot" style={{background:'var(--muted)'}}/>N/A</span></td></tr>
                  <tr><td className="code">IBA</td><td>Impuesto Bebidas Alcohólicas</td><td className="num">8.5%</td><td>{t('maintenance.beerLiquors', 'Cerveza, licores')}</td><td><span className="pill success"><span className="dot"/>{t('common.active', 'Activo')}</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaintenanceModule;
