import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getOperators, getServices } from '../api/services';
import type { ServiceItem, CountryItem, OperatorItem } from '../api/services';
import { createOrder, quoteOrder } from '../api/orders';
import { Page } from '../ui/layouts/Page';
import { Input } from '../ui/components/Input';
import { useToast } from '../ui/components/Toast';
import { CatLottie } from '../ui/components/CatLottie';
import { formatMoney } from '../utils/formatMoney';

export function Buy() {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedService, setService] = useState<ServiceItem | null>(null);
  const [selectedCountry, setCountry] = useState<CountryItem | null>(null);
  const [selectedOperator, setOperator] = useState<OperatorItem | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: getServices
  });

  const { data: countries, isLoading: loadingCountries } = useQuery({
    queryKey: ['countries', selectedService?.id],
    queryFn: () => getCountries(String(selectedService?.id)),
    enabled: !!selectedService
  });

  const { data: operators, isLoading: loadingOperators } = useQuery({
    queryKey: ['operators', selectedCountry?.name],
    queryFn: () => getOperators(String(selectedCountry?.name)),
    enabled: !!selectedCountry
  });

  const filteredServices = useMemo(() => {
    if (!services) return [];
    return services.filter(s => (s.name || s.code || '').toLowerCase().includes(search.toLowerCase()));
  }, [services, search]);

  const goQuote = async (operator?: OperatorItem | null) => {
    if (!selectedService || !selectedCountry) return;
    setLoading(true);
    try {
      const q = await quoteOrder({
        service_code: selectedService.id as string,
        country_name: selectedCountry.name,
        operator_id: operator ? Number(operator.id) : undefined
      });
      setQuote(q);
      setStep(4);
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Gagal cek harga.';
      toast.push({ type: 'error', title: message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedService || !selectedCountry) return;
    setLoading(true);
    try {
      const order = await createOrder({
        service_code: selectedService.id as string,
        country_name: selectedCountry.name,
        operator_id: selectedOperator ? Number(selectedOperator.id) : undefined
      });
      toast.push({ type: 'hint', title: 'Nomor udah keluar, nunggu OTP ya.' });
      navigate(`/orders/${order.id}`);
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Maaf, gagal bikin order.';
      toast.push({ type: 'error', title: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Beli nomor OTP" showBack>
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            placeholder="Cari aplikasi"
            icon="bi-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {loadingServices && <CatLottie variant="loading" size="md" />}
          <div className="card-plain" style={{ maxHeight: 480, overflow: 'auto' }}>
            {filteredServices.map(s => (
              <div
                key={s.id}
                className="list-row"
                onClick={() => {
                  setService(s);
                  setStep(2);
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{s.name || s.code}</div>
                  {s.label && <div className="muted">{s.label}</div>}
                </div>
                <i className="bi bi-chevron-right" />
              </div>
            ))}
            {!loadingServices && filteredServices.length === 0 && <div className="muted">Belum ada data.</div>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="muted">Pilih negara untuk {selectedService?.name}</div>
          {loadingCountries && <CatLottie variant="loading" size="md" />}
          <div className="card-plain" style={{ maxHeight: 480, overflow: 'auto' }}>
            {countries?.map(c => (
              <div
                key={c.name}
                className="list-row"
                onClick={() => {
                  setCountry(c);
                  setStep(3);
                }}
              >
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <i className="bi bi-chevron-right" />
              </div>
            ))}
            {!loadingCountries && !countries?.length && <div className="muted">Belum ada negara.</div>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="muted">Operator (boleh pilih any)</div>
          {loadingOperators && <CatLottie variant="loading" size="md" />}
          <div className="card-plain" style={{ maxHeight: 420, overflow: 'auto' }}>
            {operators?.map(op => (
              <div
                key={op.id}
                className="list-row"
                onClick={() => {
                  setOperator(op);
                  goQuote(op);
                }}
              >
                <div style={{ fontWeight: 700 }}>{op.name}</div>
                <i className="bi bi-chevron-right" />
              </div>
            ))}
            {!loadingOperators && (!operators || operators.length === 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="muted">Operator belum disediakan provider. Pakai default aja.</div>
                <button
                  className="primary-btn"
                  type="button"
                  onClick={() => {
                    setOperator(null);
                    goQuote(null);
                  }}
                >
                  Lanjut dengan operator default
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card-plain" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div className="muted">Aplikasi</div>
              <div style={{ fontWeight: 700 }}>{selectedService?.name}</div>
            </div>
            <div>
              <div className="muted">Negara</div>
              <div style={{ fontWeight: 700 }}>{selectedCountry?.name}</div>
            </div>
            <div>
              <div className="muted">Operator</div>
              <div style={{ fontWeight: 700 }}>{selectedOperator?.name || 'any'}</div>
            </div>
            <div className="divider" />
            {quote ? (
              <div>
                <div className="muted">Harga sudah termasuk biaya sistem & layanan otomatis.</div>
                <div style={{ fontWeight: 800, fontSize: 22 }}>{formatMoney(quote.selling_price)}</div>
              </div>
            ) : (
              <CatLottie variant="loading" size="sm" />
            )}
          </div>
          <button className="primary-btn" disabled={loading} onClick={handleCreate}>
            {loading ? 'Sebentar...' : 'Beli sekarang'}
          </button>
        </div>
      )}
    </Page>
  );
}
