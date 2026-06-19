// ERP MAYA — MaintenanceModule (ES module)
import Icon from '../components/Icon.jsx';
import * as MAYA from '../data/mock.js';
// ERP MAYA — Maintenance module (catálogos / mantenimientos)
import React, { useState as useStateMt } from 'react';

const MODULOS_PERM = ['Punto de venta','Facturación','Inventario','Compras','Reportes','Mantenimientos','Cierre de caja','Clientes','Contabilidad','Configuración'];
const ACCIONES     = ['ver','crear','editar','eliminar'];
const initPerms    = () => Object.fromEntries(MODULOS_PERM.map(m => [m, {ver:false,crear:false,editar:false,eliminar:false}]));

// Mapea los perms cortos del mock a la matriz de checkboxes
const PERM_MAP = {
  'pos':     [['Punto de venta',  ['ver','crear']]],
  'pos:r':   [['Punto de venta',  ['ver']]],
  'inv':     [['Inventario',      ['ver','crear','editar']]],
  'inv:r':   [['Inventario',      ['ver']]],
  'rpt':     [['Reportes',        ['ver']]],
  'rpt:com': [['Reportes',        ['ver']], ['Compras', ['ver']]],
  'tkt':     [['Facturación',     ['ver','crear']]],
  'tkt:r':   [['Facturación',     ['ver']]],
};
const permsToMatrix = (perms) => {
  const m = initPerms();
  if (perms.includes('*')) {
    MODULOS_PERM.forEach(mod => ACCIONES.forEach(acc => { m[mod][acc] = true; }));
    return m;
  }
  perms.forEach(p => (PERM_MAP[p] || []).forEach(([mod, accs]) =>
    accs.forEach(acc => { if (m[mod]) m[mod][acc] = true; })
  ));
  return m;
};

function MaintenanceModule() {
  const { Q, Qs, BRANCHES, SUPPLIERS, USERS, ROLES, CATEGORIES } = MAYA;
  const [tab, setTab]           = useStateMt('sucursales');
  const [showNuevoRol, setShowNuevoRol] = useStateMt(false);
  const [rolEditando,  setRolEditando]  = useStateMt(null);
  const [rolNombre, setRolNombre] = useStateMt('');
  const [rolDesc,   setRolDesc]   = useStateMt('');
  const [rolPerms,  setRolPerms]  = useStateMt(initPerms);

  const openNuevoRol = () => { setRolEditando(null); setRolNombre(''); setRolDesc(''); setRolPerms(initPerms()); setShowNuevoRol(true); };
  const openEditRol  = (r) => { setRolEditando(r); setRolNombre(r.name); setRolDesc(r.desc); setRolPerms(permsToMatrix(r.perms)); setShowNuevoRol(true); };
  const togglePerm   = (mod, acc) => setRolPerms(p => ({ ...p, [mod]: { ...p[mod], [acc]: !p[mod][acc] } }));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Mantenimientos</h1>
          <div className="page-subtitle">Catálogos maestros · Configuración de entidades del sistema</div>
        </div>
        <div className="page-head-actions">
          <button className="btn"><Icon name="download"/>Exportar</button>
          <button className="btn accent" onClick={tab === 'roles' ? openNuevoRol : undefined}>
            <Icon name="plus"/>Nuevo registro
          </button>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${tab==='sucursales'?'active':''}`} onClick={()=>setTab('sucursales')}>Sucursales <span className="count">{BRANCHES.length}</span></div>
        <div className={`tab ${tab==='proveedores'?'active':''}`} onClick={()=>setTab('proveedores')}>Proveedores <span className="count">{SUPPLIERS.length}</span></div>
        <div className={`tab ${tab==='usuarios'?'active':''}`} onClick={()=>setTab('usuarios')}>Usuarios <span className="count">{USERS.length}</span></div>
        <div className={`tab ${tab==='roles'?'active':''}`} onClick={()=>setTab('roles')}>Roles &amp; permisos <span className="count">{ROLES.length}</span></div>
        <div className={`tab ${tab==='categorias'?'active':''}`} onClick={()=>setTab('categorias')}>Categorías <span className="count">{CATEGORIES.length - 1}</span></div>
        <div className={`tab ${tab==='impuestos'?'active':''}`} onClick={()=>setTab('impuestos')}>Impuestos &amp; SAT</div>
      </div>

      {tab === 'sucursales' && (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Código</th><th>Nombre</th><th>Dirección</th><th>Encargado</th>
                <th className="num">Ventas hoy</th><th className="center">Cajas</th><th>Estado</th><th></th>
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
                    {b.status === 'active' ? <span className="pill success"><span className="dot"/>Activa</span> : <span className="pill warning"><span className="dot"/>Pausada</span>}
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
                <th>Código</th><th>Razón social</th><th>NIT</th><th>Contacto</th><th>Teléfono</th>
                <th>Términos</th><th className="num">Saldo CxP</th><th></th>
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

      {tab === 'usuarios' && (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr><th><input type="checkbox"/></th><th>Usuario</th><th>Rol</th><th>Sucursal</th><th>Última actividad</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {USERS.map(u => (
                <tr key={u.id}>
                  <td><input type="checkbox"/></td>
                  <td>
                    <div className="row gap-8">
                      <div className="avatar" style={{width:24, height:24, fontSize:10}}>{u.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
                      <div>
                        <div style={{fontWeight:500}}>{u.name}</div>
                        <div className="muted code" style={{fontSize:10.5}}>{u.name.toLowerCase().replace(/[^a-z]/g,'').slice(0,8)}@erpmaya.gt</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="pill accent">{u.role}</span>
                  </td>
                  <td>{u.branch}</td>
                  <td className="muted">{u.last}</td>
                  <td>
                    {u.status === 'active'
                      ? <span className="pill success"><span className="dot"/>Activo</span>
                      : <span className="pill"><span className="dot" style={{background:'var(--muted)'}}/>Inactivo</span>}
                  </td>
                  <td>
                    <div style={{display:'flex'}}>
                      <button className="icon-btn"><Icon name="lock"/></button>
                      <button className="icon-btn"><Icon name="edit"/></button>
                      <button className="icon-btn"><Icon name="dots"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'roles' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-head"><h3>Roles definidos</h3><button className="btn sm accent" onClick={openNuevoRol}><Icon name="plus"/>Nuevo rol</button></div>
            <div className="card-body flush">
              <table className="tbl">
                <thead><tr><th>Rol</th><th>Descripción</th><th className="num">Usuarios</th><th>Permisos</th><th></th></tr></thead>
                <tbody>
                  {ROLES.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="row gap-8">
                          <Icon name="shield" size={14} style={{color:'var(--accent)'}}/>
                          <span style={{fontWeight:600}}>{r.name}</span>
                        </div>
                      </td>
                      <td className="muted">{r.desc}</td>
                      <td className="num"><span className="pill">{r.users}</span></td>
                      <td className="code">{r.perms.join(', ')}</td>
                      <td>
                        <button className="icon-btn" title="Editar rol" onClick={() => openEditRol(r)}>
                          <Icon name="edit"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3>Matriz de permisos · Cajero</h3></div>
            <div className="card-body flush">
              <table className="tbl">
                <thead><tr><th>Módulo</th><th className="center">Ver</th><th className="center">Crear</th><th className="center">Editar</th><th className="center">Eliminar</th></tr></thead>
                <tbody>
                  {[
                    ['Punto de venta',true,true,false,false],
                    ['Facturación',true,true,false,false],
                    ['Inventario',true,false,false,false],
                    ['Compras',false,false,false,false],
                    ['Reportes',true,false,false,false],
                    ['Mantenimientos',false,false,false,false],
                    ['Cierre de caja',true,true,false,false],
                  ].map(([m,...p]) => (
                    <tr key={m}>
                      <td>{m}</td>
                      {p.map((v, i) => (
                        <td key={i} className="center">
                          {v ? <Icon name="check" size={13} style={{color:'var(--success)'}}/> : <Icon name="x" size={11} style={{color:'var(--border-strong)'}}/>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
            <div className="card-head"><h3>Datos fiscales del contribuyente</h3><button className="btn sm ghost"><Icon name="edit" size={11}/>Editar</button></div>
            <div className="card-body" style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'8px 14px', fontSize:12.5}}>
              <div className="muted">Razón social</div><div>ERP Maya Distribuidora, S.A.</div>
              <div className="muted">Nombre comercial</div><div>ERP Maya · Tienda</div>
              <div className="muted">NIT</div><div className="code">8745619-2</div>
              <div className="muted">Régimen</div><div>General sobre Utilidades</div>
              <div className="muted">Categoría SAT</div><div>Definitivo IVA</div>
              <div className="muted">Resol. FEL</div><div className="code">2026-43-XX-0042</div>
              <div className="muted">Establecimiento</div><div>Comercio al por menor</div>
              <div className="muted">Dirección fiscal</div><div>5a Av. 10-25, Zona 10, Guatemala</div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3>Configuración de impuestos</h3></div>
            <div className="card-body flush">
              <table className="tbl">
                <thead><tr><th>Código</th><th>Nombre</th><th className="num">Tasa</th><th>Aplica</th><th>Estado</th></tr></thead>
                <tbody>
                  <tr><td className="code">IVA</td><td>Impuesto al Valor Agregado</td><td className="num" style={{fontWeight:600}}>12%</td><td>Todas las ventas</td><td><span className="pill success"><span className="dot"/>Activo</span></td></tr>
                  <tr><td className="code">ISO</td><td>ISO sobre Productos</td><td className="num">1%</td><td>Productos selectos</td><td><span className="pill"><span className="dot" style={{background:'var(--muted)'}}/>Inactivo</span></td></tr>
                  <tr><td className="code">IDP</td><td>Impuesto Distribución Petróleo</td><td className="num">—</td><td>—</td><td><span className="pill"><span className="dot" style={{background:'var(--muted)'}}/>N/A</span></td></tr>
                  <tr><td className="code">IBA</td><td>Impuesto Bebidas Alcohólicas</td><td className="num">8.5%</td><td>Cerveza, licores</td><td><span className="pill success"><span className="dot"/>Activo</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* ── MODAL: Nuevo Rol ─────────────────────────────────────────────── */}
      {showNuevoRol && (
        <div className="modal-overlay" onClick={() => setShowNuevoRol(false)}>
          <div className="modal" style={{width:580}} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{rolEditando ? `Editar rol · ${rolEditando.name}` : 'Nuevo rol'}</h3>
              <button className="icon-btn" onClick={() => setShowNuevoRol(false)}><Icon name="x"/></button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16}}>
                <div className="field">
                  <label>Nombre del rol *</label>
                  <input
                    type="text"
                    value={rolNombre}
                    onChange={e => setRolNombre(e.target.value)}
                    placeholder="Ej. Supervisor de ventas"
                    autoFocus
                  />
                </div>
                <div className="field">
                  <label>Descripción</label>
                  <input
                    type="text"
                    value={rolDesc}
                    onChange={e => setRolDesc(e.target.value)}
                    placeholder="Resumen de responsabilidades"
                  />
                </div>
              </div>

              <div style={{fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10, fontFamily:'var(--font-mono)'}}>
                Matriz de permisos
              </div>
              <div style={{overflowX:'auto'}}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{minWidth:160}}>Módulo</th>
                      {ACCIONES.map(a => (
                        <th key={a} className="center" style={{textTransform:'capitalize'}}>{a}</th>
                      ))}
                      <th className="center" style={{fontSize:10}}>Todo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULOS_PERM.map(mod => {
                      const p = rolPerms[mod];
                      const allOn = ACCIONES.every(a => p[a]);
                      return (
                        <tr key={mod}>
                          <td style={{fontWeight:500, fontSize:12}}>{mod}</td>
                          {ACCIONES.map(acc => (
                            <td key={acc} className="center">
                              <input
                                type="checkbox"
                                checked={p[acc]}
                                onChange={() => togglePerm(mod, acc)}
                                style={{accentColor:'var(--accent)', width:14, height:14, cursor:'pointer'}}
                              />
                            </td>
                          ))}
                          <td className="center">
                            <input
                              type="checkbox"
                              checked={allOn}
                              onChange={() => {
                                const val = !allOn;
                                setRolPerms(prev => ({ ...prev, [mod]: Object.fromEntries(ACCIONES.map(a => [a, val])) }));
                              }}
                              style={{accentColor:'var(--accent)', width:14, height:14, cursor:'pointer'}}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setShowNuevoRol(false)}>Cancelar</button>
              <button
                className="btn accent"
                disabled={!rolNombre.trim()}
                onClick={() => setShowNuevoRol(false)}
              >
                <Icon name="check" size={13}/>{rolEditando ? 'Guardar cambios' : 'Crear rol'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaintenanceModule;
