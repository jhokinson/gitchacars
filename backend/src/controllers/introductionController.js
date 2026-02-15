const introductionModel = require('../models/introductionModel');
const vehicleModel = require('../models/vehicleModel');
const wantListingModel = require('../models/wantListingModel');
const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');
const { sendNewIntroEmail, sendIntroAcceptedEmail } = require('../services/emailService');
const { success, error } = require('../utils/response');

function formatIntroduction(row) {
  const intro = {
    id: row.id,
    vehicleId: row.vehicle_id,
    wantListingId: row.want_listing_id,
    sellerId: row.seller_id,
    buyerId: row.buyer_id,
    message: row.message,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.seller_first_name) {
    intro.seller = { firstName: row.seller_first_name };
  }
  if (row.buyer_first_name) {
    intro.buyer = { firstName: row.buyer_first_name };
  }
  if (row.vehicle_make) {
    intro.vehicle = {
      make: row.vehicle_make,
      model: row.vehicle_model,
      year: row.vehicle_year,
      price: row.vehicle_price,
      image: row.vehicle_images ? row.vehicle_images[0] : null,
    };
  }
  if (row.want_listing_title) {
    intro.wantListing = {
      title: row.want_listing_title,
      ...(row.wl_make ? { make: row.wl_make, model: row.wl_model, yearMin: row.wl_year_min, yearMax: row.wl_year_max } : {}),
    };
  }

  return intro;
}

async function createIntroduction(req, res, next) {
  try {
    const { vehicleId, wantListingId, message } = req.body;

    const fields = {};
    if (!vehicleId) fields.vehicleId = 'Vehicle ID is required';
    if (!wantListingId) fields.wantListingId = 'Want listing ID is required';
    if (!message) fields.message = 'Message is required';
    if (message && message.length > 500) fields.message = 'Message must be 500 characters or less';

    if (Object.keys(fields).length > 0) {
      return error(res, 'Validation failed', 400, fields);
    }

    const vehicle = await vehicleModel.findById(vehicleId);
    if (!vehicle || vehicle.user_id !== req.user.userId) {
      return error(res, 'You do not own this vehicle', 403);
    }

    const wantListing = await wantListingModel.findById(wantListingId);
    if (!wantListing || wantListing.status !== 'active') {
      return error(res, 'Want listing not found or not active', 400);
    }

    const existing = await introductionModel.findByVehicleAndListing(vehicleId, wantListingId);
    if (existing) {
      return error(res, 'Introduction already exists for this vehicle and listing', 409);
    }

    const introduction = await introductionModel.create({
      vehicleId,
      wantListingId,
      sellerId: req.user.userId,
      buyerId: wantListing.user_id,
      message,
    });

    await notificationModel.createNotification({
      userId: wantListing.user_id,
      type: 'new_intro',
      message: `A seller introduced a ${vehicle.year} ${vehicle.make} ${vehicle.model} to your listing`,
      relatedId: introduction.id,
    });

    const buyer = await userModel.findById(wantListing.user_id);
    if (buyer) {
      sendNewIntroEmail(buyer, vehicle, { first_name: 'Seller' });
    }

    success(res, formatIntroduction(introduction), 201);
  } catch (err) {
    next(err);
  }
}

async function getReceived(req, res, next) {
  try {
    const statusFilter = req.query.status || null;
    const intros = await introductionModel.getReceivedByBuyer(req.user.userId, statusFilter);
    success(res, intros.map(formatIntroduction));
  } catch (err) {
    next(err);
  }
}

async function getSent(req, res, next) {
  try {
    const statusFilter = req.query.status || null;
    const intros = await introductionModel.getSentBySeller(req.user.userId, statusFilter);
    success(res, intros.map(formatIntroduction));
  } catch (err) {
    next(err);
  }
}

async function acceptIntroduction(req, res, next) {
  try {
    const intro = await introductionModel.findById(req.params.id);
    if (!intro) return error(res, 'Introduction not found', 404);
    if (intro.buyer_id !== req.user.userId) return error(res, 'Forbidden', 403);
    if (intro.status !== 'pending') return error(res, 'Only pending introductions can be accepted', 400);

    const updated = await introductionModel.updateStatus(intro.id, 'accepted');

    await notificationModel.createNotification({
      userId: intro.seller_id,
      type: 'intro_accepted',
      message: 'Your vehicle introduction was accepted!',
      relatedId: intro.id,
    });

    const seller = await userModel.findById(intro.seller_id);
    const buyer = await userModel.findById(intro.buyer_id);
    const wantListing = await wantListingModel.findById(intro.want_listing_id);
    if (seller && buyer && wantListing) {
      sendIntroAcceptedEmail(seller, buyer, wantListing);
    }

    success(res, formatIntroduction(updated));
  } catch (err) {
    next(err);
  }
}

async function rejectIntroduction(req, res, next) {
  try {
    const intro = await introductionModel.findById(req.params.id);
    if (!intro) return error(res, 'Introduction not found', 404);
    if (intro.buyer_id !== req.user.userId) return error(res, 'Forbidden', 403);
    if (intro.status !== 'pending') return error(res, 'Only pending introductions can be rejected', 400);

    const updated = await introductionModel.updateStatus(intro.id, 'rejected');
    success(res, formatIntroduction(updated));
  } catch (err) {
    next(err);
  }
}

module.exports = { createIntroduction, getReceived, getSent, acceptIntroduction, rejectIntroduction };
