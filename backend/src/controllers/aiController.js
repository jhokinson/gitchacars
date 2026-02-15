const aiService = require('../services/aiService');
const { success, error } = require('../utils/response');

async function status(req, res, next) {
  try {
    const available = !!process.env.ANTHROPIC_API_KEY;
    success(res, { available });
  } catch (err) {
    next(err);
  }
}

async function chat(req, res, next) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return error(res, 'Messages array is required', 400);
    }

    const reply = await aiService.chatForListing(messages);
    success(res, { reply });
  } catch (err) {
    if (err.name === 'AIServiceError') {
      return error(res, err.message, err.statusCode);
    }
    next(err);
  }
}

async function extract(req, res, next) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return error(res, 'Messages array is required', 400);
    }

    const listing = await aiService.extractListingFromChat(messages);
    success(res, listing);
  } catch (err) {
    if (err.name === 'AIServiceError') {
      return error(res, err.message, err.statusCode);
    }
    next(err);
  }
}

async function extractFilters(req, res, next) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return error(res, 'Message string is required', 400);
    }

    const filters = await aiService.extractFiltersFromVehicle(message);
    success(res, filters);
  } catch (err) {
    if (err.name === 'AIServiceError') {
      return error(res, err.message, err.statusCode);
    }
    next(err);
  }
}

module.exports = { status, chat, extract, extractFilters };
