// Hook de promociones. Trae del backend con fallback al mock.
import { useState, useEffect, useCallback } from 'react';
import { listPromotions } from '../api/marketing.js';
import { PROMOS as MOCK_PROMOS } from '../data/mock.js';

// El backend expone `promoType`; los componentes usan `type`.
function mapPromo(p) {
  return { id: p.id, name: p.name, type: p.promoType, target: p.target, valid: p.valid, status: p.status };
}

export function usePromotions() {
  const [state, setState] = useState({ items: MOCK_PROMOS, loading: true, error: null, source: 'mock' });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const rows = await listPromotions();
      setState({ items: rows.map(mapPromo), loading: false, error: null, source: 'api' });
    } catch (err) {
      setState({ items: MOCK_PROMOS, loading: false, error: err, source: 'mock' });
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
}
