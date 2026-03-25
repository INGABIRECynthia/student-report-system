const router = require('express').Router();
const ctrl = require('../controllers/subjectController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// Classes
router.get('/classes',          ctrl.getAllClasses);
router.post('/classes',         requireRole('admin'), ctrl.createClass);
router.delete('/classes/:id',   requireRole('admin'), ctrl.deleteClass);

// Subjects
router.get('/',          ctrl.getAllSubjects);
router.post('/',         requireRole('admin', 'teacher'), ctrl.createSubject);
router.put('/:id',       requireRole('admin', 'teacher'), ctrl.updateSubject);
router.delete('/:id',    requireRole('admin'), ctrl.deleteSubject);

module.exports = router;
