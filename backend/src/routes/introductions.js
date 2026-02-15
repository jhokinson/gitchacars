const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const introductionController = require('../controllers/introductionController');

const router = Router();

router.post('/', authenticate, introductionController.createIntroduction);
router.get('/received', authenticate, introductionController.getReceived);
router.get('/sent', authenticate, introductionController.getSent);
router.patch('/:id/accept', authenticate, introductionController.acceptIntroduction);
router.patch('/:id/reject', authenticate, introductionController.rejectIntroduction);

module.exports = router;
