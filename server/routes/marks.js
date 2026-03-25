const router = require('express').Router();
const ctrl = require('../controllers/markController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// Terms
router.get('/terms',         ctrl.getTerms);
router.post('/terms',        requireRole('admin'), ctrl.createTerm);

// Marks
router.get('/',              ctrl.getAll);
router.post('/',             requireRole('admin', 'teacher'), ctrl.upsert);
router.delete('/:id',        requireRole('admin'), ctrl.remove);

module.exports = router;
