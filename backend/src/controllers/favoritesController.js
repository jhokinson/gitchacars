const favoritesModel = require('../models/favoritesModel');
const { success, error } = require('../utils/response');

async function addFavorite(req, res, next) {
  try {
    const { wantListingId } = req.body;
    if (!wantListingId) return error(res, 'wantListingId is required', 400);

    await favoritesModel.add(req.user.userId, wantListingId);
    success(res, { favorited: true }, 201);
  } catch (err) {
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    await favoritesModel.remove(req.user.userId, req.params.wantListingId);
    success(res, { favorited: false });
  } catch (err) {
    next(err);
  }
}

async function listFavorites(req, res, next) {
  try {
    const ids = await favoritesModel.listByUser(req.user.userId);
    success(res, ids);
  } catch (err) {
    next(err);
  }
}

module.exports = { addFavorite, removeFavorite, listFavorites };
