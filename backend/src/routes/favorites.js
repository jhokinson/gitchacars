const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const favoritesController = require('../controllers/favoritesController');

const router = Router();

router.get('/', authenticate, favoritesController.listFavorites);
router.post('/', authenticate, favoritesController.addFavorite);
router.delete('/:wantListingId', authenticate, favoritesController.removeFavorite);

module.exports = router;
