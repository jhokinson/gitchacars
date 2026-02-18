const { Router } = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const wantListingController = require('../controllers/wantListingController');

const router = Router();

router.get('/', optionalAuth, wantListingController.listListings);
router.get('/mine', authenticate, wantListingController.myListings);
router.get('/price-distribution', wantListingController.priceDistribution);
router.get('/:id', optionalAuth, wantListingController.getListing);
router.post('/', authenticate, wantListingController.createListing);
router.put('/:id', authenticate, wantListingController.updateListing);
router.patch('/:id/archive', authenticate, wantListingController.archiveListing);

module.exports = router;
