const router = require('express').Router();
const { login, register, getMe } = require('../controllers/authController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', authMiddleware, requireRole('admin'), register);
router.get('/me', authMiddleware, getMe);

module.exports = router;
