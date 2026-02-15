const wantListingModel = require('../models/wantListingModel');
const { success, error } = require('../utils/response');

function formatListing(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    make: row.make,
    model: row.model,
    yearMin: row.year_min,
    yearMax: row.year_max,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    zipCode: row.zip_code,
    radiusMiles: row.radius_miles,
    mileageMax: row.mileage_max,
    description: row.description,
    transmission: row.transmission,
    drivetrain: row.drivetrain,
    condition: row.condition,
    features: row.features || [],
    vehicleType: row.vehicle_type || null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.buyer_first_name ? { buyer: { id: row.user_id, firstName: row.buyer_first_name } } : {}),
    ...(row.intro_count !== undefined ? { introCount: parseInt(row.intro_count) } : {}),
    ...(row.is_favorited !== undefined ? { isFavorited: row.is_favorited } : {}),
  };
}

async function createListing(req, res, next) {
  try {
    const { title, make, model, yearMin, yearMax, budgetMin, budgetMax, zipCode, radiusMiles, mileageMax, description, transmission, drivetrain, condition, features } = req.body;

    const fields = {};
    if (!title) fields.title = 'Title is required';
    if (!make) fields.make = 'Make is required';
    if (!model) fields.model = 'Model is required';
    if (yearMin === undefined) fields.yearMin = 'Year min is required';
    if (yearMax === undefined) fields.yearMax = 'Year max is required';
    if (budgetMin === undefined) fields.budgetMin = 'Budget min is required';
    if (budgetMax === undefined) fields.budgetMax = 'Budget max is required';
    if (!zipCode) fields.zipCode = 'Zip code is required';
    if (radiusMiles === undefined) fields.radiusMiles = 'Radius miles is required';
    if (mileageMax === undefined) fields.mileageMax = 'Mileage max is required';
    if (!description) fields.description = 'Description is required';

    if (yearMin !== undefined && yearMax !== undefined && yearMin > yearMax) {
      fields.yearMin = 'Year min must be <= year max';
    }
    if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
      fields.budgetMin = 'Budget min must be <= budget max';
    }

    if (transmission && !['automatic', 'manual'].includes(transmission)) {
      fields.transmission = 'Must be automatic or manual';
    }
    if (drivetrain && !['fwd', 'rwd', 'awd', '4wd'].includes(drivetrain)) {
      fields.drivetrain = 'Must be fwd, rwd, awd, or 4wd';
    }
    if (condition && !['new', 'used'].includes(condition)) {
      fields.condition = 'Must be new or used';
    }

    if (Object.keys(fields).length > 0) {
      return error(res, 'Validation failed', 400, fields);
    }

    const listing = await wantListingModel.create(req.user.userId, req.body);
    success(res, formatListing(listing), 201);
  } catch (err) {
    next(err);
  }
}

async function updateListing(req, res, next) {
  try {
    const listing = await wantListingModel.findById(req.params.id);
    if (!listing) return error(res, 'Listing not found', 404);
    if (listing.user_id !== req.user.userId) return error(res, 'Forbidden', 403);

    const { yearMin, yearMax, budgetMin, budgetMax, transmission, drivetrain, condition } = req.body;
    const fields = {};

    const effectiveYearMin = yearMin !== undefined ? yearMin : listing.year_min;
    const effectiveYearMax = yearMax !== undefined ? yearMax : listing.year_max;
    if (effectiveYearMin > effectiveYearMax) fields.yearMin = 'Year min must be <= year max';

    const effectiveBudgetMin = budgetMin !== undefined ? budgetMin : listing.budget_min;
    const effectiveBudgetMax = budgetMax !== undefined ? budgetMax : listing.budget_max;
    if (effectiveBudgetMin > effectiveBudgetMax) fields.budgetMin = 'Budget min must be <= budget max';

    if (transmission && !['automatic', 'manual'].includes(transmission)) fields.transmission = 'Must be automatic or manual';
    if (drivetrain && !['fwd', 'rwd', 'awd', '4wd'].includes(drivetrain)) fields.drivetrain = 'Must be fwd, rwd, awd, or 4wd';
    if (condition && !['new', 'used'].includes(condition)) fields.condition = 'Must be new or used';

    if (Object.keys(fields).length > 0) {
      return error(res, 'Validation failed', 400, fields);
    }

    const updated = await wantListingModel.update(req.params.id, req.body);
    success(res, formatListing(updated));
  } catch (err) {
    next(err);
  }
}

async function archiveListing(req, res, next) {
  try {
    const listing = await wantListingModel.findById(req.params.id);
    if (!listing) return error(res, 'Listing not found', 404);
    if (listing.user_id !== req.user.userId) return error(res, 'Forbidden', 403);

    const updated = await wantListingModel.archive(req.params.id);
    success(res, formatListing(updated));
  } catch (err) {
    next(err);
  }
}

async function listListings(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { make, model, yearMin, yearMax, budgetMin, budgetMax, mileageMax, transmission, drivetrain, zipCode, radius, keyword, vehicleTypes: vehicleTypesParam, sort } = req.query;
    const vehicleTypes = vehicleTypesParam ? vehicleTypesParam.split(',').filter(Boolean) : undefined;
    const userId = req.user?.userId || null;
    const result = await wantListingModel.listActive({ page, limit, make, model, yearMin, yearMax, budgetMin, budgetMax, mileageMax, transmission, drivetrain, zipCode, radius, keyword, vehicleTypes, sort, userId });
    success(res, {
      listings: result.listings.map(formatListing),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
}

async function myListings(req, res, next) {
  try {
    const listings = await wantListingModel.listByUser(req.user.userId);
    success(res, listings.map(formatListing));
  } catch (err) {
    next(err);
  }
}

async function getListing(req, res, next) {
  try {
    const listing = await wantListingModel.findByIdWithBuyer(req.params.id);
    if (!listing) return error(res, 'Listing not found', 404);

    const isOwner = req.user && req.user.userId === listing.user_id;
    if (listing.status === 'archived' && !isOwner) {
      return error(res, 'Listing not found', 404);
    }

    success(res, formatListing(listing));
  } catch (err) {
    next(err);
  }
}

module.exports = { createListing, updateListing, archiveListing, listListings, myListings, getListing };
