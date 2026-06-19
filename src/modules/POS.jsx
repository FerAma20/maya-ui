// ERP MAYA — POSModule (ES module)
import Icon from '../components/Icon.jsx';
import * as MAYA from '../data/mock.js';
import { applyPromotions } from '../data/promotions.js';
// ERP MAYA — POS module (touch-friendly)
import React, { useState as useStatePOS, useMemo as useMemoPOS, useRef as useRefPOS, useEffect as useEffectPOS } from 'react';
function POSModule({ pushToast }) {
  const { Q, Qs, CATEGORIES, PRODUCTS } = MAYA;
  const [cat, setCat] = useStatePOS('todos');
  const [query, setQuery] = useStatePOS('');
  const [cart, setCart] = useStatePOS([]);
  const [discount, setDiscount] = useStatePOS(0);
  const [discountType, setDiscountType] = useStatePOS('%');
  const [showCharge, setShowCharge] = useStatePOS(false);
  const [showReceipt, setShowReceipt] = useStatePOS(null);
  const [pay, setPay] = useStatePOS('efectivo');
  const [cashGiven, setCashGiven] = useStatePOS('');
  const [client, setClient] = useStatePOS({ name: 'CF', nit: 'CF', type: 'Consumidor final' });

  const filtered = useMemoPOS(() => {
    let p = PRODUCTS;
    if (cat !== 'todos') p = p.filter(x => x.cat === cat);
    if (query) {
      const q = query.toLowerCase();
      p = p.filter(x => x.name.toLowerCase().includes(q) || x.sku.includes(query));
    }
    return p;
  }, [cat, query]);

  const addToCart = (p) => {
    setCart(c => {
      const found = c.find(i => i.sku === p.sku);
      if (found) return c.map(i => i.sku === p.sku ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { sku: p.sku, name: p.name, price: p.price, cat: p.cat, qty: 1, unit: p.unit }];
    });
  };
  const changeQty = (sku, delta) => {
    setCart(c => c.map(i => i.sku === sku ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };
  const removeItem = (sku) => setCart(c => c.filter(i => i.sku !== sku));

  const { appliedPromos, totalPromoDiscount, cartWithPromos } = useMemoPOS(
    () => applyPromotions(cart, client.type),
    [cart, client.type]
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const descManual = discountType === '%' ? subtotal * (discount / 100) : discount;
  const descTotal = descManual + totalPromoDiscount;
  const netGravable = (subtotal - descTotal) / 1.12;
  const iva = (subtotal - descTotal) - netGravable;
  const total = subtotal - descTotal;
  const change = parseFloat(cashGiven || 0) - total;

  const handleCharge = () => {
    if (!cart.length) return;
    if (pay === 'efectivo' && (cashGiven === '' || parseFloat(cashGiven) < total)) {
      pushToast && pushToast('Efectivo insuficiente', 'danger');
      return;
    }
    const ticketId = 'T-2026-' + String(4824 + Math.floor(Math.random()*100)).padStart(5, '0');
    setShowReceipt({
      id: ticketId,
      items: cartWithPromos,
      subtotal, descManual, totalPromoDiscount, descTotal, iva, netGravable, total,
      appliedPromos,
      pay, cashGiven: parseFloat(cashGiven||0), change,
      client,
      date: new Date()
    });
    setShowCharge(false);
    setCart([]);
    setDiscount(0);
    setCashGiven('');
    pushToast && pushToast('Venta registrada · ' + ticketId, 'success');
  };

  return (
    <div className="pos-layout">
      {/* Products panel */}
      <div className="pos-products">
        <div className="pos-search-bar">
          <Icon name="search" size={14} style={{color:'var(--muted)'}}/>
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button className="btn"><Icon name="barcode" size={14}/>Escanear</button>
        </div>
        <div className="pos-cats">
          {CATEGORIES.map(c => (
            <button key={c.id} className={`pos-cat ${cat === c.id ? 'active' : ''}`} onClick={() => setCat(c.id)}>
              {c.icon && <span style={{marginRight:5}}>{c.icon}</span>}
              {c.name}
              <span className="mono" style={{opacity:0.6, marginLeft:6, fontSize:10}}>{c.count}</span>
            </button>
          ))}
        </div>
        <div className="pos-grid">
          {filtered.slice(0, 80).map(p => (
            <button key={p.sku} className="pos-prod" onClick={() => addToCart(p)}>
              <div className="img">{p.initials}</div>
              <div>
                <div className="nm">{p.name}</div>
                <div className="sk">{p.sku.slice(-6)}</div>
              </div>
              <div className="pr">{Q(p.price)}</div>
              {p.stock < p.min && <span className="stock-low">{p.stock}u</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="pos-cart">
        <div className="pos-cart-head">
          <div>
            <div style={{fontSize:13, fontWeight:600}}>Venta actual</div>
            <div className="mono" style={{fontSize:10.5, color:'var(--muted)'}}>Caja #03 · Carlos Méndez</div>
          </div>
          <div className="row gap-6">
            <button className="icon-btn" title="Limpiar" onClick={() => setCart([])}><Icon name="trash"/></button>
            <button className="icon-btn" title="Buscar cliente"><Icon name="user"/></button>
          </div>
        </div>

        {/* Client mini */}
        <div style={{padding:'8px 12px', borderBottom:'1px solid var(--border)', display:'flex', gap:8, alignItems:'center'}}>
          <Icon name="user" size={12} style={{color:'var(--muted)'}}/>
          <div style={{flex:1, fontSize:12}}>
            <span style={{color:'var(--muted)'}}>Cliente:</span>{' '}
            <span style={{fontWeight:500}}>{client.name}</span>
            <span className="mono" style={{color:'var(--muted)', marginLeft:6}}>NIT {client.nit}</span>
          </div>
          <select
            value={client.type}
            onChange={e => setClient(c => ({ ...c, type: e.target.value }))}
            style={{fontSize:10, border:'1px solid var(--border)', background:'var(--surface)', borderRadius:4, color:'var(--text)', padding:'2px 4px'}}
          >
            <option>Consumidor final</option>
            <option>Minorista</option>
            <option>Mayorista</option>
            <option>Exento</option>
          </select>
          <button className="btn sm ghost">Cambiar</button>
        </div>

        {cart.length === 0 ? (
          <div className="pos-cart-empty">
            <div className="big">∅</div>
            <div>Sin productos en el carrito</div>
            <div style={{fontSize:11, marginTop:4}}>Toca un producto o escanea</div>
          </div>
        ) : (
          <div className="pos-cart-items">
            {cartWithPromos.map(i => {
              const hasPromo = i.promoTag !== null;
              const effPrice = i.promoPrice ?? i.price;
              const lineTotal = effPrice * (i.qty - (i.freeQty || 0));
              return (
                <div key={i.sku} className="pos-cart-item" style={hasPromo ? {background:'var(--success-soft)'} : {}}>
                  <div style={{flex:1, minWidth:0}}>
                    <div className="nm" style={{display:'flex', alignItems:'center', gap:6}}>
                      {i.name}
                      {hasPromo && (
                        <span style={{fontSize:9, fontWeight:700, background:'var(--success)', color:'#fff', borderRadius:3, padding:'1px 5px', letterSpacing:'0.04em'}}>
                          PROMO
                        </span>
                      )}
                    </div>
                    <div className="meta" style={{display:'flex', gap:8, alignItems:'center'}}>
                      {i.promoPrice !== null ? (
                        <>
                          <span style={{textDecoration:'line-through', color:'var(--muted)'}}>{Q(i.price)}</span>
                          <span style={{color:'var(--success)', fontWeight:600}}>{Q(i.promoPrice)}</span>
                        </>
                      ) : (
                        <span>{Q(i.price)}</span>
                      )}
                      <span style={{color:'var(--muted)'}}>· {i.unit}</span>
                      {i.freeQty > 0 && (
                        <span style={{fontSize:9, fontWeight:700, background:'var(--success)', color:'#fff', borderRadius:3, padding:'1px 5px'}}>
                          +{i.freeQty} GRATIS
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pr" style={hasPromo ? {color:'var(--success)'} : {}}>{Q(lineTotal)}</div>
                  <div className="qty">
                    <button onClick={() => changeQty(i.sku, -1)}>−</button>
                    <span className="n">{i.qty}</span>
                    <button onClick={() => changeQty(i.sku, +1)}>+</button>
                  </div>
                  <button className="remove" onClick={() => removeItem(i.sku)}>✕</button>
                </div>
              );
            })}
          </div>
        )}

        <div className="pos-totals">
          <div className="row"><span>Subtotal ({cart.reduce((s,i) => s + i.qty, 0)} items)</span><span className="v">{Q(subtotal)}</span></div>

          {/* Descuentos por promociones */}
          {appliedPromos.map((ap, idx) => (
            <div key={idx} className="row" style={{color:'var(--success)', fontSize:11}}>
              <span style={{display:'flex', alignItems:'center', gap:5}}>
                <span style={{fontSize:9, fontWeight:700, background:'var(--success)', color:'#fff', borderRadius:3, padding:'1px 5px'}}>PROMO</span>
                {ap.label}
              </span>
              <span className="v">−{Q(ap.discount)}</span>
            </div>
          ))}

          <div className="row" style={{opacity:0.4, pointerEvents:'none'}}>
            <span style={{display:'flex', alignItems:'center', gap:6}}>
              Descuento manual
              <select value={discountType} style={{border:'1px solid var(--border)', background:'var(--surface)', borderRadius:4, fontSize:11, color:'var(--text)'}}>
                <option value="%">%</option>
                <option value="Q">Q</option>
              </select>
              <input
                type="number" value={discount} min="0"
                style={{width:50, border:'1px solid var(--border)', borderRadius:4, padding:'1px 4px', fontFamily:'var(--font-mono)', fontSize:11, background:'var(--surface)', color:'var(--text)'}}
                readOnly
              />
            </span>
            <span className="v" style={{color:'var(--danger)'}}>−{Q(descManual)}</span>
          </div>
          <div className="row" style={{color:'var(--muted)'}}><span>IVA incluido (12%)</span><span className="v">{Q(iva)}</span></div>
          <div className="row total"><span>TOTAL</span><span className="v">{Q(total)}</span></div>
        </div>

        <button
          className="pos-charge"
          disabled={!cart.length}
          onClick={() => setShowCharge(true)}
        >
          <span>Cobrar</span>
          <span className="amt">{Q(total)}</span>
        </button>
      </div>

      {/* Charge modal */}
      {showCharge && (
        <div className="modal-overlay" onClick={() => setShowCharge(false)}>
          <div className="modal" style={{width:520}} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Cobrar venta · {Q(total)}</h3>
              <button className="icon-btn" onClick={() => setShowCharge(false)}><Icon name="x"/></button>
            </div>
            <div className="modal-body">
              <div style={{fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6, fontFamily:'var(--font-mono)'}}>Método de pago</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16}}>
                {[
                  { id:'efectivo', label:'Efectivo', icon:'cash' },
                  { id:'tarjeta', label:'Tarjeta', icon:'card' },
                  { id:'transferencia', label:'Transferencia', icon:'transfer' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPay(m.id)}
                    style={{
                      padding:'12px 8px',
                      border: pay === m.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: pay === m.id ? 'var(--accent-soft)' : 'var(--surface)',
                      color: pay === m.id ? 'var(--accent-ink)' : 'var(--text)',
                      borderRadius:'var(--r-md)',
                      cursor:'pointer',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                      fontFamily:'inherit', fontSize:13, fontWeight: pay === m.id ? 600 : 500
                    }}
                  >
                    <Icon name={m.icon} size={20}/>
                    {m.label}
                  </button>
                ))}
              </div>

              {pay === 'efectivo' && (
                <div>
                  <div style={{fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6, fontFamily:'var(--font-mono)'}}>Monto recibido</div>
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={e => setCashGiven(e.target.value)}
                    placeholder={total.toFixed(2)}
                    style={{
                      width:'100%', fontSize:26, fontFamily:'var(--font-mono)',
                      padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'var(--r-md)',
                      textAlign:'right', background:'var(--surface-2)', color:'var(--text)'
                    }}
                    autoFocus
                  />
                  <div style={{display:'flex', gap:6, marginTop:8}}>
                    {[total, Math.ceil(total/50)*50, Math.ceil(total/100)*100, Math.ceil(total/100)*100 + 100].map((v, i) => (
                      <button key={i} className="btn" style={{flex:1}} onClick={() => setCashGiven(v.toFixed(2))}>{Q(v)}</button>
                    ))}
                  </div>
                  {cashGiven && parseFloat(cashGiven) >= total && (
                    <div style={{
                      marginTop:14, padding:'10px 14px',
                      background:'var(--success-soft)', color:'var(--success)',
                      borderRadius:'var(--r-md)',
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                    }}>
                      <span style={{fontWeight:600}}>Cambio</span>
                      <span className="mono" style={{fontSize:22, fontWeight:700}}>{Q(change)}</span>
                    </div>
                  )}
                </div>
              )}

              {pay === 'tarjeta' && (
                <div style={{padding:24, textAlign:'center', border:'2px dashed var(--border)', borderRadius:'var(--r-md)'}}>
                  <Icon name="card" size={32}/>
                  <div style={{marginTop:8, fontSize:13}}>Esperando lectura del POS bancario…</div>
                  <div className="mono muted" style={{fontSize:11, marginTop:4}}>Insertar / acercar tarjeta</div>
                </div>
              )}

              {pay === 'transferencia' && (
                <div style={{padding:'16px'}}>
                  <div className="field">
                    <label>No. autorización / boleta</label>
                    <input type="text" placeholder="Ej. 8472395"/>
                  </div>
                  <div className="field" style={{marginTop:10}}>
                    <label>Banco</label>
                    <select>
                      <option>Banco Industrial</option>
                      <option>BAC Credomatic</option>
                      <option>G&amp;T Continental</option>
                      <option>Banrural</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setShowCharge(false)}>Cancelar</button>
              <button className="btn accent lg" onClick={handleCharge}>
                <Icon name="check"/>Confirmar cobro · {Q(total)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt modal */}
      {showReceipt && (
        <div className="modal-overlay" onClick={() => setShowReceipt(null)}>
          <div style={{display:'flex', gap:24, alignItems:'flex-start'}} onClick={e => e.stopPropagation()}>
            <Ticket data={showReceipt}/>
            <div style={{display:'flex', flexDirection:'column', gap:8, paddingTop:24}}>
              <button className="btn primary"><Icon name="print"/>Imprimir</button>
              <button className="btn"><Icon name="download"/>Descargar PDF</button>
              <button className="btn"><Icon name="transfer"/>Enviar por correo</button>
              <button className="btn ghost" onClick={() => setShowReceipt(null)}><Icon name="x"/>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Ticket({ data }) {
  const { Q } = MAYA;
  return (
    <div className="ticket">
      <div className="center">
        <div className="biz-name">ERP MAYA · TIENDA</div>
        <div className="biz-info">
          Sucursal Zona 10<br/>
          5a Av. 10-25, Z.10, Guatemala<br/>
          NIT 8745619-2 · Tel +502 2235-4400
        </div>
      </div>
      <div className="sep"></div>
      <div className="row"><span>FACTURA</span><span>{data.id}</span></div>
      <div className="row"><span>Fecha</span><span>{data.date.toLocaleDateString('es-GT')} {data.date.toLocaleTimeString('es-GT', {hour:'2-digit', minute:'2-digit'})}</span></div>
      <div className="row"><span>Cajero</span><span>Carlos M.</span></div>
      <div className="row"><span>Cliente</span><span>{data.client.name}</span></div>
      <div className="row"><span>NIT</span><span>{data.client.nit}</span></div>
      <div className="sep"></div>
      <div className="row" style={{fontWeight:700}}>
        <span>DESCRIPCIÓN</span><span>TOTAL</span>
      </div>
      <div className="sep" style={{borderTopStyle:'solid', borderWidth:'0.5px'}}></div>
      {data.items.map(i => {
        const effPrice = i.promoPrice ?? i.price;
        const payQty = i.qty - (i.freeQty || 0);
        return (
          <div key={i.sku} className="item-row">
            <div>{i.name}{i.promoTag ? ' *' : ''}</div>
            <div>{Q(effPrice * payQty)}</div>
            <div className="meta">  {i.qty} {i.unit || 'u'} x {Q(effPrice)}{i.freeQty > 0 ? ` (+${i.freeQty} gratis)` : ''}</div>
          </div>
        );
      })}
      <div className="sep"></div>
      <div className="row"><span>Subtotal</span><span>{Q(data.subtotal)}</span></div>
      {(data.appliedPromos || []).map((ap, i) => (
        <div key={i} className="row"><span>* {ap.label}</span><span>−{Q(ap.discount)}</span></div>
      ))}
      {data.descManual > 0 && <div className="row"><span>Desc. manual</span><span>−{Q(data.descManual)}</span></div>}
      <div className="row"><span>Gravable</span><span>{Q(data.netGravable)}</span></div>
      <div className="row"><span>IVA 12%</span><span>{Q(data.iva)}</span></div>
      <div className="sep"></div>
      <div className="row" style={{fontWeight:700, fontSize:13}}><span>TOTAL Q</span><span>{Q(data.total)}</span></div>
      <div className="sep"></div>
      <div className="row"><span>Pago: {data.pay.toUpperCase()}</span><span>{Q(data.pay === 'efectivo' ? data.cashGiven : data.total)}</span></div>
      {data.pay === 'efectivo' && <div className="row"><span>Cambio</span><span>{Q(data.change)}</span></div>}
      <div className="sep"></div>
      <div className="center" style={{fontSize:9}}>
        DTE-FEL · Serie A · No. {data.id.slice(-5)}<br/>
        Autorización SAT: 0E5F4C9A-2026<br/>
        Resol. SAT 2026-43-XX-0042
      </div>
      <div className="barcode"></div>
      <div className="center" style={{fontSize:9, marginTop:6}}>
        ¡GRACIAS POR SU COMPRA!<br/>
        www.erpmaya.gt
      </div>
    </div>
  );
}

export default POSModule;
export { Ticket };
