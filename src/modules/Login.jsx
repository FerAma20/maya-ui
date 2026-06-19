// ERP MAYA — Login screen (ES module)
import React, { useState, useEffect, useRef } from 'react';

const DEMO_COMPANIES = {
  'FERRETERIA-01': { name: 'Ferretería El Constructor', type: 'Ferretería', tier: 'PRO' },
  'FARMACIA-GT':   { name: 'Farmacias del Valle',       type: 'Farmacia',   tier: 'PRO' },
  'SUPERMERCADO':  { name: 'Supermercado La Familia',   type: 'Retail',     tier: 'ENTERPRISE' },
  'TIENDA-DEMO':   { name: 'Tienda Demo ERP MAYA',      type: 'Demo',       tier: 'DEMO' },
};

function validate(form) {
  const errors = {};
  if (!form.companyCode.trim())
    errors.companyCode = 'Ingresa el código de tu empresa';
  if (!form.email.trim())
    errors.email = 'Ingresa tu correo electrónico';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Correo electrónico inválido';
  if (!form.password)
    errors.password = 'Ingresa tu contraseña';
  else if (form.password.length < 6)
    errors.password = 'Mínimo 6 caracteres';
  return errors;
}

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ companyCode: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [companyPreview, setCompanyPreview] = useState(null);
  const companyRef = useRef(null);

  useEffect(() => {
    companyRef.current?.focus();
  }, []);

  useEffect(() => {
    const code = form.companyCode.trim().toUpperCase();
    setCompanyPreview(DEMO_COMPANIES[code] || null);
  }, [form.companyCode]);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setLoginError('');

    // Simula latencia de red
    await new Promise(r => setTimeout(r, 820));

    const code = form.companyCode.trim().toUpperCase();
    const company = DEMO_COMPANIES[code];

    if (!company) {
      setErrors({ companyCode: 'Código de empresa no encontrado' });
      setLoading(false);
      return;
    }
    // Contraseña mock: cualquier contraseña válida funciona en demo
    if (form.password.length < 6) {
      setErrors({ password: 'Contraseña incorrecta' });
      setLoading(false);
      return;
    }

    const nameParts = form.email.split('@')[0].split('.');
    const displayName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    const initials = nameParts.map(p => p[0]?.toUpperCase() || '').join('').slice(0, 2);

    onLogin({
      user: {
        name: displayName || 'Usuario',
        initials: initials || 'US',
        email: form.email,
        role: 'Administrador',
        branch: 'Sucursal Central',
      },
      company: {
        code,
        name: company.name,
        type: company.type,
        tier: company.tier,
      },
    });
  };

  return (
    <div className="login-root">
      {/* Panel izquierdo — marca */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo">
            <div className="login-logo-mark">M</div>
            <div>
              <div className="login-logo-name">ERP MAYA</div>
              <div className="login-logo-tier">RETAIL · v3.2</div>
            </div>
          </div>

          <div className="login-headline">
            Sistema de gestión<br />para retail guatemalteco
          </div>
          <div className="login-subheadline">
            POS · Inventario · Contabilidad · SAT-FEL
          </div>

          <ul className="login-features">
            {[
              ['Facturación electrónica SAT-FEL', 'Emisión de DTE en tiempo real'],
              ['Multi-sucursal en tiempo real', 'Consolidado de todas tus tiendas'],
              ['Contabilidad integrada', 'Plan de cuentas Guatemala + IVA 12%'],
              ['Inventario inteligente', 'PEPS, promedio, lotes, vencimientos'],
            ].map(([title, desc]) => (
              <li key={title} className="login-feature-item">
                <span className="login-feature-dot" />
                <span>
                  <strong>{title}</strong>
                  <span className="login-feature-desc"> · {desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="login-brand-footer">
          <span className="login-brand-legal">
            © 2026 ERP MAYA · Guatemala · Todos los derechos reservados
          </span>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="login-form-panel">
        <div className="login-card">
          <div className="login-card-head">
            <h1 className="login-title">Iniciar sesión</h1>
            <p className="login-desc">
              Ingresa el código de tu empresa, correo y contraseña.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Código de empresa */}
            <div className={`login-field ${errors.companyCode ? 'has-error' : ''}`}>
              <label htmlFor="companyCode" className="login-label">
                Código de empresa
              </label>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <BuildingIcon />
                </span>
                <input
                  ref={companyRef}
                  id="companyCode"
                  type="text"
                  className="login-input mono-input"
                  placeholder="Ej. FERRETERIA-01"
                  value={form.companyCode}
                  onChange={e => set('companyCode', e.target.value)}
                  autoComplete="organization"
                  spellCheck={false}
                />
              </div>
              {errors.companyCode && (
                <span className="login-error">{errors.companyCode}</span>
              )}
              {companyPreview && !errors.companyCode && (
                <div className="login-company-preview">
                  <span className="login-company-dot" />
                  <span className="login-company-name">{companyPreview.name}</span>
                  <span className="login-company-type">{companyPreview.type}</span>
                  <span className="login-tier-badge">{companyPreview.tier}</span>
                </div>
              )}
            </div>

            {/* Correo */}
            <div className={`login-field ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="email" className="login-label">
                Correo electrónico
              </label>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <MailIcon />
                </span>
                <input
                  id="email"
                  type="email"
                  className="login-input"
                  placeholder="usuario@empresa.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className="login-error">{errors.email}</span>
              )}
            </div>

            {/* Contraseña */}
            <div className={`login-field ${errors.password ? 'has-error' : ''}`}>
              <div className="login-label-row">
                <label htmlFor="password" className="login-label">Contraseña</label>
                <button type="button" className="login-forgot">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPass(s => !s)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <span className="login-error">{errors.password}</span>
              )}
            </div>

            {loginError && (
              <div className="login-alert">{loginError}</div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Verificando…
                </>
              ) : (
                'Ingresar al sistema'
              )}
            </button>
          </form>

          <div className="login-demo-hint">
            <span className="login-demo-label">Accesos demo</span>
            <div className="login-demo-codes">
              {Object.entries(DEMO_COMPANIES).map(([code, co]) => (
                <button
                  key={code}
                  type="button"
                  className="login-demo-chip"
                  onClick={() => {
                    set('companyCode', code);
                    set('email', 'admin@' + code.toLowerCase().replace(/-/g, '') + '.com');
                    set('password', 'demo123');
                  }}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline SVG icons ────────────────────────────────────────────────────────

function BuildingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="12" rx="1"/>
      <path d="M6 15V9h4v6M1 7h14"/>
      <path d="M5 3V2M8 3V2M11 3V2"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="14" height="10" rx="1.5"/>
      <path d="M1 4l7 5 7-5"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="7" width="10" height="8" rx="1.5"/>
      <path d="M5 7V5a3 3 0 016 0v2"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
      <circle cx="8" cy="8" r="2"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0010 10M4.3 4.4C2.7 5.5 1 8 1 8s2.5 5 7 5c1.4 0 2.7-.4 3.7-1M8 3c4.5 0 7 5 7 5s-.7 1.3-1.9 2.6"/>
    </svg>
  );
}
