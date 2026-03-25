const router = require('express').Router();
const ctrl = require('../controllers/studentController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getById);
router.post('/',    requireRole('admin', 'teacher'), ctrl.create);
router.put('/:id',  requireRole('admin', 'teacher'), ctrl.update);
router.delete('/:id', requireRole('admin'), ctrl.remove);

module.exports = router;
