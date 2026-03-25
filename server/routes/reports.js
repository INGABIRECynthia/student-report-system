const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/dashboard',            ctrl.getDashboard);
router.get('/student/:studentId',   ctrl.getStudentReport);
router.get('/class/:classId',       ctrl.getClassReport);

module.exports = router;
