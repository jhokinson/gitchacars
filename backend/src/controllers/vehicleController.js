const vehicleModel = require('../models/vehicleModel');
const { uploadImage } = require('../services/firebaseService');
const { success, error } = require('../utils/response');

function formatVehicle(row) {
  return {
    id: row.id,
    userId: row.user_id,
    make: row.make,
    model: row.model,
    year: row.year,
    mileage: row.mileage,
    price: row.price,
    zipCode: row.zip_code,
    description: row.description,
    images: row.images,
    transmission: row.transmission,
    drivetrain: row.drivetrain,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function uploadVehicleImage(req, res, next) {
  try {
    if (!req.file) {
      return error(res, 'No image file provided', 400);
    }

    const { mimetype, size } = req.file;
    if (!['image/jpeg', 'image/png'].includes(mimetype)) {
      return error(res, 'Only JPEG and PNG images are allowed', 400);
    }
    if (size > 5 * 1024 * 1024) {
      return error(res, 'Image must be 5MB or less', 400);
    }

    const url = await uploadImage(req.file, req.user.userId);
    success(res, { url });
  } catch (err) {
    next(err);
  }
}

async function createVehicle(req, res, next) {
  try {
    const { make, model, year, mileage, price, zipCode, description, images, transmission, drivetrain } = req.body;

    const fields = {};
    if (!make) fields.make = 'Make is required';
    if (!model) fields.model = 'Model is required';
    if (year === undefined) fields.year = 'Year is required';
    if (mileage === undefined) fields.mileage = 'Mileage is required';
    if (price === undefined) fields.price = 'Price is required';
    if (!zipCode) fields.zipCode = 'Zip code is required';
    if (!description) fields.description = 'Description is required';
    if (!images || !Array.isArray(images) || images.length < 3 || images.length > 5) {
      fields.images = 'Images must be an array of 3-5 URLs';
    }

    if (transmission && !['automatic', 'manual'].includes(transmission)) {
      fields.transmission = 'Must be automatic or manual';
    }
    if (drivetrain && !['fwd', 'rwd', 'awd', '4wd'].includes(drivetrain)) {
      fields.drivetrain = 'Must be fwd, rwd, awd, or 4wd';
    }

    if (Object.keys(fields).length > 0) {
      return error(res, 'Validation failed', 400, fields);
    }

    const vehicle = await vehicleModel.create(req.user.userId, req.body);
    success(res, formatVehicle(vehicle), 201);
  } catch (err) {
    next(err);
  }
}

async function updateVehicle(req, res, next) {
  try {
    const vehicle = await vehicleModel.findById(req.params.id);
    if (!vehicle) return error(res, 'Vehicle not found', 404);
    if (vehicle.user_id !== req.user.userId) return error(res, 'Forbidden', 403);

    const { images, transmission, drivetrain } = req.body;
    const fields = {};

    if (images !== undefined && (!Array.isArray(images) || images.length < 3 || images.length > 5)) {
      fields.images = 'Images must be an array of 3-5 URLs';
    }
    if (transmission && !['automatic', 'manual'].includes(transmission)) {
      fields.transmission = 'Must be automatic or manual';
    }
    if (drivetrain && !['fwd', 'rwd', 'awd', '4wd'].includes(drivetrain)) {
      fields.drivetrain = 'Must be fwd, rwd, awd, or 4wd';
    }

    if (Object.keys(fields).length > 0) {
      return error(res, 'Validation failed', 400, fields);
    }

    const updated = await vehicleModel.update(req.params.id, req.body);
    success(res, formatVehicle(updated));
  } catch (err) {
    next(err);
  }
}

async function myVehicles(req, res, next) {
  try {
    const vehicles = await vehicleModel.listByUser(req.user.userId);
    success(res, vehicles.map(formatVehicle));
  } catch (err) {
    next(err);
  }
}

async function getVehicle(req, res, next) {
  try {
    const vehicle = await vehicleModel.findById(req.params.id);
    if (!vehicle) return error(res, 'Vehicle not found', 404);
    success(res, formatVehicle(vehicle));
  } catch (err) {
    next(err);
  }
}

async function getMatches(req, res, next) {
  try {
    const vehicle = await vehicleModel.findById(req.params.id);
    if (!vehicle) return error(res, 'Vehicle not found', 404);
    if (vehicle.user_id !== req.user.userId) return error(res, 'Forbidden', 403);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await vehicleModel.findMatches(vehicle, { page, limit });

    const formatWantListing = (row) => ({
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
      status: row.status,
      createdAt: row.created_at,
      buyer: { id: row.user_id, firstName: row.buyer_first_name },
    });

    success(res, {
      listings: result.listings.map(formatWantListing),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadVehicleImage, createVehicle, updateVehicle, myVehicles, getVehicle, getMatches };
