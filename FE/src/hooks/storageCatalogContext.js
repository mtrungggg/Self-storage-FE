import { createContext, useContext } from 'react';

export const CatalogContext = createContext({ records: undefined, loading: false, loadError: '' });
export function useStorageCatalog() { return useContext(CatalogContext); }
