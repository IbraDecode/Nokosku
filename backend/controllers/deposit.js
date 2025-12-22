// Controller Deposit NOKOSKU
const axios = require('axios');
const Deposit = require('../models/deposit');
const Activity = require('../models/activity');
const Transaction = require('../models/transaction');
const User = require('../models/user');

// Route create deposit
exports.create = async (req, res) => {
    try {
        // Ambil data dari request
        const { nominal, metode } = req.body;
        const userId = req.user.id;
        if (!nominal || nominal < 5000) return res.status(400).json({ error: 'Nominal minimal 5.000' });
        // Generate reff_id unik (timestamp + user)
        const reff_id = 'NK_'+userId+'_'+Date.now();
        let response = {};
        if (metode === 'atlantic') {
            // Call Atlantic API
            response = await axios.post('https://atlantich2h.com/deposit/create', new URLSearchParams({
                api_key: process.env.ATLANTIC_APIKEY,
                reff_id,
                nominal,
                type: 'ewallet',
                metode: 'qris'
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            if (!response.data.status) return res.status(400).json({ error: response.data.message });
            // Simpan deposit ke DB
            const dep = await Deposit.create({
                provider_id: response.data.data.id,
                user_id: userId,
                nominal,
                amount: nominal,
                total_amount: nominal,
                metode,
                status: response.data.data.status || 'pending',
                expired_at: new Date(response.data.data.expired_at),
                expires_at: new Date(response.data.data.expired_at),
                provider_response: response.data.data,
                updated_at: new Date()
            });
            await Activity.create({
                user_id: userId,
                event: 'deposit:created',
                detail: `User buat deposit QRIS Rp${nominal} via Atlantic, status: ${dep.status}`
            });
            const io = req.app.get('io');
            if (io) io.emit('deposit:created', {
                user_id: userId,
                deposit_id: dep.id,
                nominal,
                metode,
                status: dep.status,
                expired_at: dep.expired_at,
                message: `Deposit QRIS Atlantic Rp${nominal} dibuat, scan QR untuk bayar.`
            });
            return res.json({ success: true, deposit: dep });
        }
        // Implementasi RumahOTP v1/v2 bisa ditambah dengan pola serupa
        // ...
        return res.status(400).json({ error: 'Metode deposit belum didukung.' });
    } catch (e) {
        console.error('Deposit Atlantic error:', e.message, e?.response?.data);
        return res.status(500).json({ error: (e?.response?.data?.message || 'Maaf, sistem error.') });
    }
};

// Route cek status deposit
exports.status = async (req, res) => {
    try {
        const depositId = req.params.id;
        const deposit = await Deposit.findByPk(depositId);
        if (!deposit) return res.status(404).json({ error: 'Deposit tidak ditemukan.' });
        // Ambil status real dari provider Atlantic jika metode = atlantic
        let providerStatus = deposit.status;
        let apiResult = deposit.provider_response || {};
        if (deposit.metode === 'atlantic') {
            const resp = await axios.post('https://atlantich2h.com/deposit/status', new URLSearchParams({
                api_key: process.env.ATLANTIC_APIKEY,
                id: deposit.provider_id
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            apiResult = resp.data.data || {};
            providerStatus = apiResult.status || 'pending';
        }
        // Jika status = success, update saldo otomatis & catat transaksi
        if (providerStatus === 'success' && deposit.status !== 'success') {
            const user = await User.findByPk(deposit.user_id);
            if (user) {
                user.balance += (apiResult.get_balance || deposit.nominal);
                await user.save();
                deposit.status = 'success';
                await deposit.save();
                await Activity.create({
                    user_id: deposit.user_id,
                    event: 'deposit:paid',
                    detail: `Deposit sukses: Rp${deposit.nominal} (Atlantic), saldo bertambah.`
                });
                await Transaction.create({
                    user_id: deposit.user_id,
                    type: 'deposit',
                    related_id: deposit.id,
                    amount: deposit.nominal,
                    profit: 0
                });
                const io = req.app.get('io');
                if (io) io.emit('deposit:paid', {
                    user_id: deposit.user_id,
                    deposit_id: deposit.id,
                    nominal: deposit.nominal,
                    metode: deposit.metode,
                    status: 'success',
                    message: `Deposit berhasil: Saldo bertambah Rp${deposit.nominal}.`
                });
            }
        }
        // Response data deposit + API real
        res.json({ success:true, deposit, status:providerStatus, provider: apiResult });
    } catch (e) {
        console.error('Deposit status error:', e.message, e?.response?.data);
        res.status(500).json({ error: (e?.response?.data?.message || 'Maaf, sistem error cek deposit.') });
    }
};

// History deposit
exports.history = async (req, res) => {
  try {
    const deposits = await Deposit.findAll({
      where: { user_id: req.user.id },
      limit: 50,
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, deposits });
  } catch (e) {
    res.status(500).json({ error: 'Maaf, sistem error history.' });
  }
};

// Cancel deposit
exports.cancel = async (req, res) => {
  try {
    const deposit = await Deposit.findByPk(req.params.id);
    if (!deposit || deposit.user_id !== req.user.id || deposit.status !== 'pending') {
      return res.status(400).json({ error: 'Deposit tidak bisa dicancel.' });
    }
    deposit.status = 'cancel';
    await deposit.save();
    res.json({ success: true, message: 'Deposit canceled.' });
  } catch (e) {
    res.status(500).json({ error: 'Maaf, sistem error cancel.' });
  }
};

// List deposit methods untuk frontend
exports.methods = async (_req, res) => {
  res.json({
    success: true,
    methods: [
      {
        code: 'atlantic',
        name: 'Atlantic QRIS',
        description: 'QRIS otomatis via Atlantic H2H',
        min: 5000,
        status: 'active'
      }
    ]
  });
};
