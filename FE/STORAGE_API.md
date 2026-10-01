# Storage catalog integration

During development, Vite proxies `/backend` to `VITE_BACKEND_ORIGIN`. The current customer endpoints are configured through `VITE_CUSTOMER_FACILITIES_URL`, `VITE_CUSTOMER_UNIT_TYPES_URL`, `VITE_AVAILABLE_STORAGE_UNITS_URL`, and `VITE_PRICING_CALCULATE_URL`. Restart Vite after changing `.env`. No sample data is used as a fallback.

Customer checkout is configured through `VITE_PAYMENT_CREATE_CHECKOUT_URL`. The frontend sends `{ reservationId, paymentMethod }`, uses same-origin credentials, and displays the payment/VietQR response. The SePay webhook is backend-only and must never be called by the browser.

Customer payment history is configured through `VITE_PAYMENT_HISTORY_URL`. It uses same-origin credentials and displays only the authenticated customer's payments.

Customer rentals are configured through `VITE_CUSTOMER_RENTALS_URL`. The dashboard displays agreements returned for the authenticated customer; access credentials remain a separate protected request.

Access credentials use `GET {VITE_CUSTOMER_RENTALS_URL}/{agreementId}/access-credentials`. PIN and gate QR tokens stay in component memory and are not persisted to browser storage.

PIN changes use `PUT {VITE_CUSTOMER_RENTALS_URL}/{agreementId}/change-pin` with `{ currentPin, newPin }`. Both values are kept only in controlled password inputs and cleared after success.

Handover details use `GET {VITE_CUSTOMER_RENTALS_URL}/{agreementId}/handover` and display signatures, notes, inspection results, photos, and item charges.

The frontend currently expects one JSON object with arrays named after the supplied tables:

- Required: `facilities`, `facility_areas`, `storage_units`, `unit_types`, `facility_rates`.
- Optional: `price_ranges`, `fee_rules`, `policy_versions`, `promotions`, `promotion_rules`, `reservations`, `rental_agreements`.

Use the supplied snake_case column names. Missing optional arrays are not evidence of availability or zero charges. The backend must enforce authorization and return only the fields required by this public catalog; do not expose customer details or full reservation/agreement records. The reservation and agreement comparison uses IDs, facility/type links and rental dates only.

This is a frontend integration contract, not an implemented backend endpoint. Adapt the loader in `src/hooks/useStorageCatalog.jsx` when actual API routes, pagination, authentication, response envelopes and status values are provided.

Current conventions awaiting business confirmation:

- `AVAILABLE` and `ACTIVE` comparisons ignore case. Boolean flags use JSON booleans or database 0/1 values.
- Money is displayed in VND. Only monthly prices are present in the schema.
- Rate/policy validity includes the end date; null end is open-ended.
- Rental overlap excludes the end date. Status, hold expiry and unit allocation rules remain unspecified, so overlaps never establish specific-unit availability.
- Fee rules are displayed without calculating totals or adding deposits twice.
- Policies are not scoped to facilities without a relationship in the schema.
- Promotions are not automatically applied without confirmed eligibility semantics.

`/storage-detail/:unitId` loads the same catalog as `/home`, including on a direct visit or page refresh. Query parameters `startDate` and `endDate` carry the requested rental period.
