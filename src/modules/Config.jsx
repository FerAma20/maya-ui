// ERP MAYA — Módulo de Configuración del sistema
import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';

const MOCK_CONFIG = {
  legalName: 'Supermercado Maya, S.A.',
  tradeName: 'ERP Maya Retail',
  nit: '4521789-3',
  address: '5a Calle 12-34, Zona 1, Guatemala, Guatemala',
  phone: '+502 2238-1100',
  email: 'admin@mayaretail.gt',
  felProvider: 'infile',
  felUser: 'feluser@mayaretail.gt',
  hasFelKey: true,
  felEnvironment: 'sandbox',
  taxRegime: 'General',
  ivaRate: '0.12',
  ticketPrefix: 'T',
  ocPrefix: 'OC',
  transferPrefix: 'TR',
  valuationMethod: 'average',
  lowStockThreshold: '0.20',
  smtpFromEmail: 'facturas@mayaretail.gt',
  hasSmtp: true,
};

function Section({ title, icon, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
        <Icon name={icon} size={14} style={{ color: 'var(--accent)' }} />
        <span style={{ fontWeight: 700, fontSize: 13 }}>{title}</span>
      </div>
      <div className="form-grid">{children}</div>
    </div>
  );
}

function Field({ label, hint, span = 1, children }) {
  return (
    <div className={`field${span === 2 ? ' span-2' : ''}`}>
      <label className="field-label">{label}</label>
      {children}
      {hint && <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

export default function Config({ pushToast }) {
  const [tab, setTab] = useState('empresa');
  const [config, setConfig] = useState(MOCK_CONFIG);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => { setConfig(prev => ({ ...prev, [k]: v })); setSaved(false); };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    pushToast?.('Configuración guardada correctamente', 'success');
  };

  const TABS = [
    { id: 'empresa',    label: 'Empresa',      icon: 'settings' },
    { id: 'fel',        label: 'FEL / SAT',    icon: 'receipt'  },
    { id: 'impuestos',  label: 'Impuestos',    icon: 'tag'      },
    { id: 'inventario', label: 'Inventario',   icon: 'box'      },
    { id: 'smtp',       label: 'Correo SMTP',  icon: 'bell'     },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Configuración del sistema</h1>
          <div className="page-subtitle">Datos de la empresa, credenciales FEL, impuestos y parámetros globales</div>
        </div>
        <div className="page-head-actions">
          <button className="btn accent" onClick={handleSave}>
            <Icon name="check" size={12} />Guardar cambios
          </button>
        </div>
      </div>

      {saved && (
        <div className="toast success" style={{ position: 'relative', marginBottom: 16, animation: 'none' }}>
          <Icon name="check" size={14} />Configuración actualizada correctamente
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Nav lateral */}
        <div style={{ minWidth: 180, flexShrink: 0 }}>
          {TABS.map(t => (
            <div key={t.id}
              className={`nav-item ${tab === t.id ? 'active' : ''}`}
              style={{ marginBottom: 2 }}
              onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={13} className="icon" />
              {t.label}
            </div>
          ))}
        </div>

        {/* Contenido */}
        <form style={{ flex: 1 }} onSubmit={handleSave}>

          {tab === 'empresa' && (
            <div className="card" style={{ padding: 24 }}>
              <Section title="Datos de la empresa" icon="settings">
                <Field label="Razón social *" span={2}>
                  <input className="field-input" value={config.legalName} onChange={e => set('legalName', e.target.value)} required />
                </Field>
                <Field label="Nombre comercial">
                  <input className="field-input" value={config.tradeName} onChange={e => set('tradeName', e.target.value)} />
                </Field>
                <Field label="NIT *">
                  <input className="field-input mono" value={config.nit} onChange={e => set('nit', e.target.value)} required />
                </Field>
                <Field label="Dirección fiscal" span={2}>
                  <input className="field-input" value={config.address} onChange={e => set('address', e.target.value)} />
                </Field>
                <Field label="Teléfono">
                  <input className="field-input" value={config.phone} onChange={e => set('phone', e.target.value)} />
                </Field>
                <Field label="Correo de contacto">
                  <input className="field-input" type="email" value={config.email} onChange={e => set('email', e.target.value)} />
                </Field>
              </Section>

              <Section title="Series de documentos" icon="tag">
                <Field label="Prefijo tickets (POS)" hint="Ej: T → T-2026-00001">
                  <input className="field-input mono" value={config.ticketPrefix} onChange={e => set('ticketPrefix', e.target.value)} maxLength={5} />
                </Field>
                <Field label="Prefijo órdenes de compra" hint="Ej: OC → OC-2026-00001">
                  <input className="field-input mono" value={config.ocPrefix} onChange={e => set('ocPrefix', e.target.value)} maxLength={5} />
                </Field>
                <Field label="Prefijo transferencias" hint="Ej: TR → TR-00001">
                  <input className="field-input mono" value={config.transferPrefix} onChange={e => set('transferPrefix', e.target.value)} maxLength={5} />
                </Field>
              </Section>
            </div>
          )}

          {tab === 'fel' && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ background: 'rgba(var(--warning-rgb,245,158,11),.1)', border: '1px solid rgba(var(--warning-rgb,245,158,11),.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
                <Icon name="alert" size={13} style={{ color: 'var(--warning)', marginRight: 6 }} />
                Las credenciales FEL se almacenan cifradas. Contacta a tu certificador SAT para obtener tu clave de API.
              </div>
              <Section title="Certificador FEL (SAT Guatemala)" icon="receipt">
                <Field label="Certificador">
                  <select className="field-input" value={config.felProvider} onChange={e => set('felProvider', e.target.value)}>
                    <option value="">— Sin configurar —</option>
                    <option value="infile">Infile</option>
                    <option value="g4s">G4S</option>
                    <option value="ecofactura">Ecofactura</option>
                    <option value="digifact">Digifact</option>
                  </select>
                </Field>
                <Field label="Ambiente">
                  <select className="field-input" value={config.felEnvironment} onChange={e => set('felEnvironment', e.target.value)}>
                    <option value="sandbox">Pruebas (sandbox)</option>
                    <option value="produccion">Producción</option>
                  </select>
                </Field>
                <Field label="Usuario FEL" span={2}>
                  <input className="field-input" type="email" value={config.felUser} onChange={e => set('felUser', e.target.value)} />
                </Field>
                <Field label="Clave API / Token" span={2} hint={config.hasFelKey ? 'Ya hay una clave guardada. Déjalo vacío para no cambiarla.' : 'Ingresa la clave proporcionada por tu certificador.'}>
                  <input className="field-input mono" type="password" placeholder={config.hasFelKey ? '••••••••••••••••' : 'Pegar clave API aquí'}
                    onChange={e => set('felKey', e.target.value)} autoComplete="new-password" />
                </Field>
              </Section>
            </div>
          )}

          {tab === 'impuestos' && (
            <div className="card" style={{ padding: 24 }}>
              <Section title="Configuración de impuestos (Guatemala)" icon="tag">
                <Field label="Régimen fiscal">
                  <select className="field-input" value={config.taxRegime} onChange={e => set('taxRegime', e.target.value)}>
                    <option value="General">Régimen General (IVA 12%)</option>
                    <option value="PequenioContribuyente">Pequeño Contribuyente (5% sobre ventas)</option>
                    <option value="Exento">Exento de IVA</option>
                  </select>
                </Field>
                <Field label="Tasa IVA" hint="0.12 = 12% · 0.05 = 5%">
                  <input className="field-input mono" value={config.ivaRate}
                    onChange={e => set('ivaRate', e.target.value)}
                    placeholder="0.12" />
                </Field>
              </Section>

              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>Vista previa — desglose de IVA</div>
                {(() => {
                  const rate = parseFloat(config.ivaRate) || 0.12;
                  const salePrice = 100;
                  const base = salePrice / (1 + rate);
                  const tax = salePrice - base;
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                        <span className="muted">Precio de venta (ejemplo)</span>
                        <span className="mono">Q 100.00</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                        <span className="muted">Base imponible</span>
                        <span className="mono">Q {base.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span className="muted">IVA ({(rate * 100).toFixed(0)}%)</span>
                        <span className="mono" style={{ color: 'var(--accent)' }}>Q {tax.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {tab === 'inventario' && (
            <div className="card" style={{ padding: 24 }}>
              <Section title="Parámetros de inventario" icon="box">
                <Field label="Método de valoración de inventario" span={2} hint="Afecta el costo calculado para el kardex y los estados financieros.">
                  <select className="field-input" value={config.valuationMethod} onChange={e => set('valuationMethod', e.target.value)}>
                    <option value="average">Promedio Ponderado (recomendado)</option>
                    <option value="fifo">PEPS — Primero en Entrar, Primero en Salir</option>
                  </select>
                </Field>
                <Field label="Umbral de alerta de stock bajo" hint="Fracción del stock mínimo. 0.20 = alerta cuando stock ≤ 20% del mínimo.">
                  <input className="field-input mono" value={config.lowStockThreshold}
                    onChange={e => set('lowStockThreshold', e.target.value)} placeholder="0.20" />
                </Field>
              </Section>

              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>Diferencia entre métodos</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
                  <strong>Promedio Ponderado:</strong> el costo unitario se recalcula cada vez que entra mercancía nueva. Más simple y estable.<br />
                  <strong>PEPS:</strong> se vende primero el lote más antiguo. Refleja mejor el valor real en contextos inflacionarios. Requiere control de lotes.
                </div>
              </div>
            </div>
          )}

          {tab === 'smtp' && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ background: 'rgba(var(--accent-rgb,20,184,166),.08)', border: '1px solid rgba(var(--accent-rgb,20,184,166),.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
                <Icon name="bell" size={13} style={{ color: 'var(--accent)', marginRight: 6 }} />
                El correo SMTP se usa para enviar facturas en PDF al cliente al momento del cierre de venta.
              </div>
              <Section title="Servidor de correo saliente (SMTP)" icon="bell">
                <Field label="Host SMTP">
                  <input className="field-input mono" placeholder="smtp.ejemplo.com" onChange={e => set('smtpHost', e.target.value)} />
                </Field>
                <Field label="Puerto">
                  <input className="field-input mono" placeholder="587" onChange={e => set('smtpPort', e.target.value)} />
                </Field>
                <Field label="Usuario SMTP" span={2}>
                  <input className="field-input" type="email" onChange={e => set('smtpUser', e.target.value)} />
                </Field>
                <Field label="Contraseña SMTP" span={2} hint={config.hasSmtp ? 'Ya hay credenciales guardadas. Déjalo vacío para no cambiarlas.' : ''}>
                  <input className="field-input" type="password" placeholder={config.hasSmtp ? '••••••••' : ''} autoComplete="new-password" onChange={e => set('smtpPass', e.target.value)} />
                </Field>
                <Field label="Correo remitente (From)" hint="Ej: facturas@tuempresa.gt">
                  <input className="field-input" type="email" value={config.smtpFromEmail}
                    onChange={e => set('smtpFromEmail', e.target.value)} />
                </Field>
              </Section>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="submit" className="btn accent">
              <Icon name="check" size={12} />Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
