// Controller Profile NOKOSKU
const User = require('../models/user');

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({
      success: true,
      profile: { email: user.email, name: user.name, balance: user.balance, is_admin: user.is_admin, is_banned: user.is_banned }
    });
  } catch (e) {
    res.status(500).json({ error: 'Maaf, sistem error profile.' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    await User.update({ name }, { where: { id: req.user.id } });
    res.json({ success: true, message: 'Profile updated.' });
  } catch (e) {
    res.status(500).json({ error: 'Maaf, sistem error update.' });
  }
};

// Get balance
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ success: true, balance: user.balance });
  } catch (e) {
    res.status(500).json({ error: 'Maaf, sistem error balance.' });
  }
};

// Get transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await require('../models/transaction').findAll({
      where: { user_id: req.user.id },
      limit: 50,
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, transactions });
  } catch (e) {
    res.status(500).json({ error: 'Maaf, sistem error transactions.' });
  }
};
