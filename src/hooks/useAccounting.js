// Hooks de contabilidad y FEL. Traen del backend con fallback al mock.
import { useState, useEffect, useCallback } from 'react';
import { listAccounts, listJournalEntries } from '../api/accounting.js';
import { listFelDocuments } from '../api/fel.js';
import { ACCOUNTS as MOCK_ACCOUNTS, JOURNAL_ENTRIES as MOCK_JOURNAL } from '../data/mock.js';

function rows(page) {
  return Array.isArray(page) ? page : (page?.content ?? []);
}

function makeHook(fetcher, mock) {
  return function useList() {
    const [state, setState] = useState({ items: mock, loading: true, error: null, source: 'mock' });
    const reload = useCallback(async () => {
      setState((s) => ({ ...s, loading: true }));
      try {
        setState({ items: rows(await fetcher()), loading: false, error: null, source: 'api' });
      } catch (err) {
        setState({ items: mock, loading: false, error: err, source: 'mock' });
      }
    }, []);
    useEffect(() => { reload(); }, [reload]);
    return { ...state, reload };
  };
}

export const useAccounts = makeHook(listAccounts, MOCK_ACCOUNTS);
export const useJournalEntries = makeHook(listJournalEntries, MOCK_JOURNAL);
export const useFelDocuments = makeHook(listFelDocuments, []);
