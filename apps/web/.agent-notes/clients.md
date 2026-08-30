# Clients

- Client create and update forms share `client-form-fields.tsx` and submit the nullable invoicing/customer fields.
- `client-types.ts` uses the generated OpenAPI client types for the invoicing fields and normalizes form strings into nullable API values.
- Client detail displays company/person, VAT, address, registration, bank, and discount information when present.
- Client forms can search `/api/v1/clients/justice-search` and prefill company name and IČO from the Czech justice registry.
