const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.patch('/read-all', authenticate, notificationController.markAllRead);
router.patch('/:id/read', authenticate, notificationController.markRead);

module.exports = router;
