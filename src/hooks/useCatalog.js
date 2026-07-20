// Hooks del módulo Catálogo. Traen datos del backend y, si no está disponible,
// caen al mock para que el front siga funcionando sin el servicio corriendo.
import { useState, useEffect, useCallback } from 'react';
import { listProducts, listCategories } from '../api/catalog.js';
import { listStock } from '../api/inventory.js';
import { PRODUCTS as MOCK_PRODUCTS, CATEGORIES as MOCK_CATEGORIES } from '../data/mock.js';

// Mapea un ProductResponse del backend a la forma que usan los componentes.
// Nota: `stock` aún no viene de /api/products (vive en product_stock — bloque
// de Inventario); por ahora se deja en 0 hasta cablear ese endpoint.
function mapProduct(p) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    cat: p.categoryId,
    catName: p.categoryName,
    price: p.price,
    cost: p.cost,
    avgCost: p.avgCost,
    stock: p.stock ?? 0,
    min: p.minStock ?? 0,
    unit: p.unit,
    status: p.status,
  };
}

export function useProducts({ search = '' } = {}) {
  // Inicia con el mock para que no haya parpadeo mientras responde la API.
  const [state, setState] = useState({ items: MOCK_PRODUCTS, loading: true, error: null, source: 'mock' });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const page = await listProducts({ search });
      const rows = Array.isArray(page) ? page : (page.content ?? []);
      // Existencias reales: suma de product_stock por producto (todas las sucursales/lotes).
      const stockByProduct = {};
      try {
        const stock = await listStock();
        for (const s of stock) {
          stockByProduct[s.productId] = (stockByProduct[s.productId] ?? 0) + Number(s.quantity ?? 0);
        }
      } catch { /* sin endpoint de stock → queda en 0 */ }
      const items = rows.map((p) => ({ ...mapProduct(p), stock: stockByProduct[p.id] ?? 0 }));
      setState({ items, loading: false, error: null, source: 'api' });
    } catch (err) {
      // Fallback: backend apagado o sin datos → usar el mock local.
      setState({ items: MOCK_PRODUCTS, loading: false, error: err, source: 'mock' });
    }
  }, [search]);

  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
}

export function useCategories() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  useEffect(() => {
    listCategories()
      .then((rows) => { if (rows?.length) setCategories(rows); })
      .catch(() => { /* backend no disponible → se queda el mock */ });
  }, []);
  return categories;
}
