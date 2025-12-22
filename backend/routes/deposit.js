// Router Deposit NOKOSKU
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../lib/auth');
const depositController = require('../controllers/deposit');

router.get('/methods', verifyToken, depositController.methods);
router.get('/history', verifyToken, depositController.history);
router.post('/create', verifyToken, depositController.create);
router.post('/:id/cancel', verifyToken, depositController.cancel);
router.get('/:id', verifyToken, depositController.status);
module.exports = router;
