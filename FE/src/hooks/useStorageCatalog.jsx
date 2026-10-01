import { useEffect, useState } from 'react';
import { CatalogContext } from './storageCatalogContext';
import { parseCustomerFacilities } from '../data/customerFacilities';
import { parseCustomerUnitTypes } from '../data/customerUnitTypes';

const required = ['facilities', 'facility_areas', 'storage_units', 'unit_types', 'facility_rates'];

export function StorageCatalogProvider({ children }) {
  const [catalog, setCatalog] = useState({ records: undefined, loading: Boolean(import.meta.env.VITE_STORAGE_CATALOG_URL || import.meta.env.VITE_CUSTOMER_FACILITIES_URL), loadError: '' });
  useEffect(() => {
    const facilitiesUrl = import.meta.env.VITE_CUSTOMER_FACILITIES_URL;
    const url = facilitiesUrl || import.meta.env.VITE_STORAGE_CATALOG_URL;
    if (!url) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Không tải được dữ liệu kho.');
        const payload = await response.json();
        if (facilitiesUrl) {
          const records = { facilities: parseCustomerFacilities(payload) };
          let unitTypesError = '';
          if (import.meta.env.VITE_CUSTOMER_UNIT_TYPES_URL) {
            try {
              const typesResponse = await fetch(import.meta.env.VITE_CUSTOMER_UNIT_TYPES_URL, { signal: controller.signal, headers: { Accept: 'application/json' } });
              if (!typesResponse.ok) throw new Error('Không tải được loại kho.');
              records.unit_types = parseCustomerUnitTypes(await typesResponse.json());
            } catch {
              unitTypesError = 'Không tải được danh sách loại kho. Vui lòng tải lại trang để thử lại.';
            }
          }
          if (!controller.signal.aborted) setCatalog({ records, unitTypesError, loading: false, loadError: '' });
          return;
        }
        const records = payload;
        if (!records || required.some((key) => !Array.isArray(records[key]))) throw new Error('Dữ liệu kho không đúng cấu trúc.');
        for (const key of ['price_ranges', 'fee_rules', 'policy_versions', 'promotions', 'promotion_rules', 'reservations', 'rental_agreements']) {
          if (records[key] != null && !Array.isArray(records[key])) throw new Error('Dữ liệu kho không đúng cấu trúc.');
        }
        setCatalog({ records, loading: false, loadError: '' });
      } catch (error) {
        if (!controller.signal.aborted) setCatalog({ records: undefined, loading: false, loadError: error.message });
      }
    }
    load();
    return () => controller.abort();
  }, []);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

