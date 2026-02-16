const { Router } = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const vehicleController = require('../controllers/vehicleController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

// Public routes (no auth) — must be BEFORE /:id to avoid parameter capture
router.get('/makes', vehicleController.getVehicleMakes);
router.get('/models/:make', vehicleController.getVehicleModels);

// Authenticated routes
router.post('/upload-image', authenticate, upload.single('image'), vehicleController.uploadVehicleImage);
router.post('/', authenticate, vehicleController.createVehicle);
router.put('/:id', authenticate, vehicleController.updateVehicle);
router.get('/mine', authenticate, vehicleController.myVehicles);
router.get('/:id/matches', authenticate, vehicleController.getMatches);
router.get('/:id', authenticate, vehicleController.getVehicle);

module.exports = router;
