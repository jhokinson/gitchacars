const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/want-listings', adminController.getWantListings);
router.delete('/want-listings/:id', adminController.deleteWantListing);
router.get('/vehicles', adminController.getVehicles);
router.delete('/vehicles/:id', adminController.deleteVehicle);

module.exports = router;
