import { http } from './http';

export type Deposit = {
  id: number;
  provider_id: string;
  user_id: number;
  nominal: number;
  amount: number;
  total_amount: number;
  metode: string;
  status: 'pending' | 'processing' | 'success' | 'expired' | 'cancel';
  expired_at?: string;
  expires_at?: string;
  paid_at?: string;
  provider_response?: Record<string, any>;
  created_at?: string;
};

export type DepositMethod = {
  code: string;
  name: string;
  description?: string;
  min?: number;
  status?: 'active' | 'disabled';
};

export async function getDepositMethods() {
  const { data } = await http.get<{ success: boolean; methods: DepositMethod[] }>('/api/v1/deposit/methods');
  return data.methods;
}

export async function createDeposit(payload: { nominal: number; metode: string }) {
  const { data } = await http.post<{ success: boolean; deposit: Deposit }>('/api/v1/deposit/create', payload);
  return data.deposit;
}

export async function getDeposit(id: string | number) {
  const { data } = await http.get<{ success: boolean; deposit: Deposit; status: string; provider?: any }>(
    `/api/v1/deposit/${id}`
  );
  return data;
}

export async function cancelDeposit(id: string | number) {
  const { data } = await http.post(`/api/v1/deposit/${id}/cancel`, {});
  return data;
}

export async function getDepositHistory() {
  const { data } = await http.get<{ success: boolean; deposits: Deposit[] }>('/api/v1/deposit/history');
  return data.deposits;
}
