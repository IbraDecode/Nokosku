import { http } from './http';

export type Order = {
  id: number;
  provider_id: string;
  user_id: number;
  service: string;
  country: string;
  operator?: string | number;
  number?: string;
  status: 'pending' | 'processing' | 'otp_received' | 'expired' | 'cancel';
  otp_code?: string;
  otp_resend?: number;
  expired_at?: string;
  provider_response?: Record<string, any>;
  created_at?: string;
};

export type PriceQuote = {
  base_price: number;
  markup: number;
  selling_price: number;
  operator_id: number | string;
  provider_id: number | string;
  number_id?: number;
};

export async function createOrder(payload: { service_code: string | number; country_name: string; operator_id?: number }) {
  const { data } = await http.post<{ success: boolean; order: Order }>('/api/v1/orders/create', payload);
  return data.order;
}

export async function getOrder(id: string | number) {
  const { data } = await http.get<{ success: boolean; order: Order; provider: any }>(`/api/v1/orders/${id}`);
  return data;
}

export async function resendOtp(id: string | number) {
  const { data } = await http.post(`/api/v1/orders/${id}/resend`, {});
  return data;
}

export async function cancelOrder(id: string | number) {
  const { data } = await http.post(`/api/v1/orders/${id}/cancel`, {});
  return data;
}

export async function getOrderHistory() {
  const { data } = await http.get<{ success: boolean; orders: Order[] }>('/api/v1/orders/history');
  return data.orders;
}

export async function quoteOrder(payload: { service_code: string | number; country_name: string; operator_id?: number }) {
  const { data } = await http.post<{ success: boolean; quote: PriceQuote }>('/api/v1/orders/quote', payload);
  return data.quote;
}
