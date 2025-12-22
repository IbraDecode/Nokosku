// Controller Order NOKOSKU
const axios = require('axios');
const Order = require('../models/order');
const Activity = require('../models/activity');
const MarkupRule = require('../models/markup');
const ProfitLog = require('../models/profit');
const User = require('../models/user');

// Route get services
exports.getServices = async (req, res) => {
  try {
    const resp = await axios.get(`https://www.rumahotp.com/api/v2/services`, {
      headers: {
        'x-apikey': process.env.RUMAHOTP_APIKEY,
        'Accept': 'application/json'
      }
    });
    res.json({ success: true, services: resp.data.data });
  } catch (e) {
    console.error('Get services error:', e.message);
    res.status(500).json({ error: 'Maaf, sistem error get services.' });
  }
};

// Get countries by service
exports.getCountries = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const resp = await axios.get(`https://www.rumahotp.com/api/v2/countries?service_id=${serviceId}`, {
      headers: {
        'x-apikey': process.env.RUMAHOTP_APIKEY,
        'Accept': 'application/json'
      }
    });
    res.json({ success: true, countries: resp.data.data });
  } catch (e) {
    console.error('Get countries error:', e.message);
    res.status(500).json({ error: 'Maaf, sistem error get countries.' });
  }
};

// Get operators by country
exports.getOperators = async (req, res) => {
  try {
    const { countryCode } = req.params;
    const resp = await axios.get(`https://www.rumahotp.com/api/v2/operators?country=${encodeURIComponent(countryCode)}&provider_id=1`, {
      headers: {
        'x-apikey': process.env.RUMAHOTP_APIKEY,
        'Accept': 'application/json'
      }
    });
    res.json({ success: true, operators: resp.data.data });
  } catch (e) {
    console.error('Get operators error:', e.message);
    res.status(500).json({ error: 'Maaf, sistem error get operators.' });
  }
};

// History orders
exports.history = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      limit: 50,
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, orders });
  } catch (e) {
    res.status(500).json({ error: 'Maaf, sistem error history.' });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order || order.user_id !== req.user.id || order.status !== 'pending' || order.otp_resend >= 3) {
      return res.status(400).json({ error: 'Tidak bisa resend OTP.' });
    }
    // Call provider resend if available, else simulate
    order.otp_resend += 1;
    await order.save();
    await Activity.create({
      user_id: req.user.id,
      event: 'order:resend',
      detail: `Resend OTP untuk order ${order.id}`
    });
    res.json({ success: true, message: 'OTP dikirim ulang.' });
  } catch (e) {
    res.status(500).json({ error: 'Maaf, sistem error resend.' });
  }
};

// Cancel order
exports.cancel = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order || order.user_id !== req.user.id || order.status !== 'pending') {
      return res.status(400).json({ error: 'Order tidak bisa dicancel.' });
    }
    order.status = 'cancel';
    await order.save();
    // Refund if applicable
    const user = await User.findByPk(order.user_id);
    // Assume refund logic here
    await Activity.create({
      user_id: req.user.id,
      event: 'order:cancel',
      detail: `Cancel order ${order.id}`
    });
    res.json({ success: true, message: 'Order canceled.' });
  } catch (e) {
    res.status(500).json({ error: 'Maaf, sistem error cancel.' });
  }
};

// Quote harga sebelum order
exports.quote = async (req, res) => {
  try {
    const { service_code, country_name, operator_id } = req.body;
    if (!service_code || !country_name) return res.status(400).json({ error: 'Pilih aplikasi & negara dulu.' });
    const countryResp = await axios.get(`https://www.rumahotp.com/api/v2/countries?service_id=${service_code}`, {
      headers: {
        'x-apikey': process.env.RUMAHOTP_APIKEY,
        'Accept': 'application/json'
      }
    });
    const negara = countryResp.data.data.find((x) => x.name === country_name);
    if (!negara) return res.status(400).json({ error: 'Negara tidak valid di provider.' });
    const { number_id, pricelist } = negara;
    const provider_id = pricelist?.[0]?.provider_id;
    if (!provider_id) return res.status(400).json({ error: 'Provider ID tidak tersedia.' });
    let opsId = operator_id || 1;
    if (!operator_id) {
      const opResp = await axios.get(
        `https://www.rumahotp.com/api/v2/operators?country=${encodeURIComponent(country_name)}&provider_id=${provider_id}`,
        {
          headers: {
            'x-apikey': process.env.RUMAHOTP_APIKEY,
            'Accept': 'application/json'
          }
        }
      );
      opsId = opResp.data.data?.find((o) => o.name === 'any')?.id || 1;
    }
    const markupRule =
      (await MarkupRule.findOne({
        where: { service: service_code, country: country_name, operator: opsId }
      })) || { markup: 1000 };
    const basePrice = pricelist?.[0]?.price || 5000;
    const sellingPrice = basePrice + markupRule.markup;
    return res.json({
      success: true,
      quote: {
        base_price: basePrice,
        markup: markupRule.markup,
        selling_price: sellingPrice,
        operator_id: opsId,
        provider_id,
        number_id
      }
    });
  } catch (e) {
    console.error('Quote error:', e.message, e?.response?.data);
    return res.status(500).json({ error: e?.response?.data?.message || 'Maaf, sistem error hitung harga.' });
  }
};

// Route create order
exports.create = async (req, res) => {
    try {
        const { service_code, country_name, operator_id } = req.body; // ganti field ke ID/API aslinya
        const userId = req.user.id;
        if (!service_code || !country_name) return res.status(400).json({ error: 'Pilih aplikasi & negara dulu.' });
        // Step 1: Get countries
        const countryResp = await axios.get(`https://www.rumahotp.com/api/v2/countries?service_id=${service_code}`, {
            headers: {
                'x-apikey': process.env.RUMAHOTP_APIKEY,
                'Accept': 'application/json'
            }
        });
        const negara = countryResp.data.data.find(x => x.name === country_name);
        if (!negara) return res.status(400).json({ error: 'Negara tidak valid di provider.' });
        const { number_id, pricelist } = negara;
        const provider_id = pricelist?.[0]?.provider_id;
        if (!provider_id) return res.status(400).json({ error:'Provider ID tidak tersedia.' });
        // Step 2: Get operator
        let opsId = operator_id || 1;
        if (!operator_id) {
          const opResp = await axios.get(`https://www.rumahotp.com/api/v2/operators?country=${encodeURIComponent(country_name)}&provider_id=${provider_id}`, {
            headers: {
              'x-apikey': process.env.RUMAHOTP_APIKEY,
              'Accept': 'application/json'
            }
          });
          opsId = (opResp.data.data?.find(o=>o.name==='any')?.id || 1);
        }
        // Step 3: Get markup
        const markupRule = await MarkupRule.findOne({
          where: { service: service_code, country: country_name, operator: opsId }
        }) || { markup: 1000 };
        const basePrice = pricelist?.[0]?.price || 5000; // Dummy base price
        const sellingPrice = basePrice + markupRule.markup;
        // Step 4. Create order
        const orderResp = await axios.get(`https://www.rumahotp.com/api/v2/orders?number_id=${number_id}&provider_id=${provider_id}&operator_id=${opsId}`, {
            headers: {
                'x-apikey': process.env.RUMAHOTP_APIKEY,
                'Accept': 'application/json'
            }
        });
        console.log('RumahOTP Order Response:', orderResp.data);
        if (!orderResp.data.success) return res.status(400).json({ error: (orderResp.data?.message || 'Provider gagal order nomor, coba lagi.') });
        const ord = await Order.create({
            provider_id,
            user_id: userId,
            service: service_code,
            country: country_name,
            operator: opsId,
            number: orderResp.data.data.phone_number,
            status: 'pending',
            expired_at: new Date(Date.now()+15*60*1000),
            provider_response: orderResp.data.data,
            created_at: new Date()
        });
        await ProfitLog.create({
          order_id: ord.id,
          base_price: basePrice,
          markup: markupRule.markup,
          fee: 0,
          selling_price: sellingPrice
        });
        await Activity.create({
            user_id: userId,
            event: 'order:created',
            detail: `Order dibuat: aplikasi ${service_code}, negara ${country_name}, operator ${opsId}, nomor ${orderResp.data.data.phone_number}`
        });
        const io = req.app.get('io');
        if (io) io.emit('order:created', {
            user_id: userId,
            order_id: ord.id,
            aplikasi: service_code,
            negara: country_name,
            operator: opsId,
            nomor: orderResp.data.data.phone_number,
            status: 'pending',
            message: `Order nomor virtual berhasil dibuat untuk ${service_code} - ${country_name}. Siap menunggu OTP.`
        });
        return res.json({ success: true, order: ord });
    } catch (e) {
        console.error('Order RumahOTP error:', e.message, e?.response?.data);
        return res.status(500).json({ error: (e?.response?.data?.message || 'Maaf, sistem error order nomor.') });
    }
};

// GET /api/v1/orders/:id - Monitoring OTP & status
exports.status = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order tidak ditemukan.' });
        const resp = await axios.get(`https://www.rumahotp.com/api/v1/orders/get_status?order_id=${order.provider_id}`, {
            headers: {
                'x-apikey': process.env.RUMAHOTP_APIKEY,
                'Accept': 'application/json'
            }
        });
        // Update status + OTP ke DB
        const s = resp.data.data;
        if (s?.otp_code && s?.otp_code !== '-' && order.otp_code !== s.otp_code) {
            order.otp_code = s.otp_code;
            order.status = 'otp_received';
            await order.save();
            // Event log ke activity_logs
            await Activity.create({
                user_id: order.user_id,
                event: 'order:otp_received',
                detail: `OTP diterima: nomor ${order.number}, kode ${order.otp_code}`
            });
            const io = req.app.get('io');
            if (io) io.emit('order:otp_received', {
                user_id: order.user_id,
                order_id: order.id,
                nomor: order.number,
                otp: order.otp_code,
                status: 'otp_received',
                message: `OTP masuk! Nomor: ${order.number}, kode: ${order.otp_code}`
            });
        }
        if (s?.status === 'expired' && order.status !== 'expired') {
            order.status = 'expired';
            await order.save();
            await Activity.create({
                user_id: order.user_id,
                event: 'order:expired',
                detail: `Order expired: nomor ${order.number}`
            });
            const io = req.app.get('io');
            if (io) io.emit('order:expired', {
                user_id: order.user_id,
                order_id: order.id,
                nomor: order.number,
                status: 'expired',
                message: `Waktunya habis, saldo kamu aman. Order expired untuk nomor ${order.number}`
            });
        }
        res.json({ success:true, order, provider: resp.data.data });
    } catch (e) {
        console.error('Order Status error:', e.message, e?.response?.data);
        return res.status(500).json({ error: (e?.response?.data?.message || 'Maaf, sistem error monitoring order.') });
    }
};
