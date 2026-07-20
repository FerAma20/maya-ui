// Hooks de los catálogos maestros. Traen del backend con fallback al mock.
import { useState, useEffect, useCallback } from 'react';
import { listClients, listSuppliers } from '../api/partners.js';
import { CLIENTS as MOCK_CLIENTS, SUPPLIERS as MOCK_SUPPLIERS } from '../data/mock.js';

function pageRows(page) {
  return Array.isArray(page) ? page : (page?.content ?? []);
}

export function useClients({ search = '' } = {}) {
  const [state, setState] = useState({ items: MOCK_CLIENTS, loading: true, error: null, source: 'mock' });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const rows = pageRows(await listClients({ search }));
      setState({ items: rows, loading: false, error: null, source: 'api' });
    } catch (err) {
      setState({ items: MOCK_CLIENTS, loading: false, error: err, source: 'mock' });
    }
  }, [search]);

  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
}

export function useSuppliers({ search = '' } = {}) {
  const [state, setState] = useState({ items: MOCK_SUPPLIERS, loading: true, error: null, source: 'mock' });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const rows = pageRows(await listSuppliers({ search }));
      setState({ items: rows, loading: false, error: null, source: 'api' });
    } catch (err) {
      setState({ items: MOCK_SUPPLIERS, loading: false, error: err, source: 'mock' });
    }
  }, [search]);

  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
}
