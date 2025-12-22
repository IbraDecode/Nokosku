import { http } from './http';

export type ServiceItem = {
  id: number | string;
  name: string;
  code?: string;
  label?: string;
};

export type CountryItem = {
  name: string;
  code?: string;
  number_id?: number;
  pricelist?: { provider_id: number; price: number }[];
};

export type OperatorItem = {
  id: number | string;
  name: string;
};

export async function getServices() {
  const { data } = await http.get<{ success: boolean; services: ServiceItem[] }>('/api/v1/orders/services');
  return data.services;
}

export async function getCountries(serviceId: string | number) {
  const { data } = await http.get<{ success: boolean; countries: CountryItem[] }>(
    `/api/v1/orders/countries/${serviceId}`
  );
  return data.countries;
}

export async function getOperators(countryCode: string) {
  const { data } = await http.get<{ success: boolean; operators: OperatorItem[] }>(
    `/api/v1/orders/operators/${encodeURIComponent(countryCode)}`
  );
  return data.operators;
}
