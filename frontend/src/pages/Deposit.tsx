import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createDeposit, getDepositMethods } from '../api/deposit';
import { Page } from '../ui/layouts/Page';
import { Input } from '../ui/components/Input';
import { useToast } from '../ui/components/Toast';
import { formatMoney } from '../utils/formatMoney';

export function Deposit() {
  const [nominal, setNominal] = useState<string>('50000');
  const [method, setMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const { data: methods } = useQuery({
    queryKey: ['deposit-methods'],
    queryFn: getDepositMethods
  });

  const quickNominals = useMemo(() => [10000, 20000, 50000, 100000, 300000, 500000], []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amount = parseInt(nominal || '0', 10);
    if (!method) {
      toast.push({ type: 'hint', title: 'Pilih metode dulu.' });
      return;
    }
    setLoading(true);
    try {
      const dep = await createDeposit({ nominal: amount, metode: method });
      toast.push({ type: 'hint', title: 'QR siap, scan ya.' });
      navigate(`/deposit/${dep.id}`);
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Maaf, gagal bikin deposit.';
      toast.push({ type: 'error', title: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Topup Saldo" showBack>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input
          label="Nominal"
          icon="bi-cash-stack"
          type="number"
          min={5000}
          placeholder="Contoh 50000"
          value={nominal}
          onChange={e => setNominal(e.target.value)}
          required
        />
        <div className="chip-row">
          {quickNominals.map(n => (
            <button
              type="button"
              key={n}
              className={`chip ${parseInt(nominal) === n ? 'active' : ''}`}
              onClick={() => setNominal(String(n))}
            >
              {formatMoney(n)}
            </button>
          ))}
        </div>

        <div className="section">
          <div className="section-title">Pilih metode</div>
          <div className="card-plain" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {methods?.map(m => (
              <label
                key={m.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                <input
                  type="radio"
                  name="metode"
                  value={m.code}
                  checked={method === m.code}
                  onChange={e => setMethod(e.target.value)}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>{m.name}</div>
                  <div className="muted" style={{ fontSize: '0.9rem' }}>
                    {m.description || 'Pembayaran otomatis.'}
                  </div>
                </div>
                {m.min && (
                  <div className="muted" style={{ marginLeft: 'auto', fontSize: '0.9rem' }}>
                    min {formatMoney(m.min)}
                  </div>
                )}
              </label>
            ))}
            {!methods?.length && <div className="muted">Metode belum tersedia.</div>}
          </div>
        </div>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? 'Bikin deposit...' : 'Lanjutkan'}
        </button>
      </form>
    </Page>
  );
}
