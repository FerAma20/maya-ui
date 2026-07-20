// Hooks de compras, traslados y CxC. Traen del backend con fallback al mock.
import { useState, useEffect, useCallback } from 'react';
import { listPurchaseOrders } from '../api/purchasing.js';
import { listTransfers } from '../api/transfers.js';
import { listPayments } from '../api/receivables.js';
import { PURCHASE_ORDERS as MOCK_POS, TRANSFERS as MOCK_TRANSFERS, CLIENT_PAYMENTS as MOCK_PAYMENTS } from '../data/mock.js';

function rows(page) {
  return Array.isArray(page) ? page : (page?.content ?? []);
}

function makeListHook(fetcher, mock) {
  return function useList(opts = {}) {
    const [state, setState] = useState({ items: mock, loading: true, error: null, source: 'mock' });
    const reload = useCallback(async () => {
      setState((s) => ({ ...s, loading: true }));
      try {
        setState({ items: rows(await fetcher(opts)), loading: false, error: null, source: 'api' });
      } catch (err) {
        setState({ items: mock, loading: false, error: err, source: 'mock' });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(opts)]);
    useEffect(() => { reload(); }, [reload]);
    return { ...state, reload };
  };
}

export const usePurchaseOrders = makeListHook(listPurchaseOrders, MOCK_POS);
export const useTransfers = makeListHook(listTransfers, MOCK_TRANSFERS);
export const usePayments = makeListHook(listPayments, MOCK_PAYMENTS);
