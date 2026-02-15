const cron = require('node-cron');
const introductionModel = require('../models/introductionModel');

function startExpiryJob() {
  cron.schedule('0 * * * *', async () => {
    try {
      const count = await introductionModel.expirePending();
      console.log(`Expiry job: ${count} introduction(s) expired`);
    } catch (err) {
      console.error('Expiry job error:', err.message);
    }
  });
  console.log('Introduction expiry cron job started (runs every hour)');
}

module.exports = { startExpiryJob };
