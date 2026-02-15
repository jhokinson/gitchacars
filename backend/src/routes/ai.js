const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

const router = Router();

router.get('/status', aiController.status);
router.post('/chat', authenticate, aiController.chat);
router.post('/extract', authenticate, aiController.extract);
router.post('/extract-filters', authenticate, aiController.extractFilters);

module.exports = router;
