import type { components } from "@/lib/api.d";

export type ClientWithBilling = components["schemas"]["ClientRead"];
export type ClientPayload = components["schemas"]["ClientCreate"];

export function clientPayload(values: {
  name: string;
  is_company: boolean;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  ico: string;
  dic: string;
  vat_payer: boolean;
  bank_account: string;
  iban: string;
  hourly_rate: string;
  currency: string;
  discount_percentage: string;
}): ClientPayload {
  const numberOrNull = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  };
  const textOrNull = (value: string) => value.trim() || null;

  return {
    name: values.name.trim(),
    is_company: values.is_company,
    street: textOrNull(values.street),
    city: textOrNull(values.city),
    postal_code: textOrNull(values.postal_code),
    country: textOrNull(values.country),
    ico: textOrNull(values.ico),
    dic: textOrNull(values.dic),
    vat_payer: values.vat_payer,
    bank_account: textOrNull(values.bank_account),
    iban: textOrNull(values.iban),
    hourly_rate: numberOrNull(values.hourly_rate),
    currency: textOrNull(values.currency)?.toUpperCase() ?? null,
    discount_percentage: numberOrNull(values.discount_percentage),
  };
}
