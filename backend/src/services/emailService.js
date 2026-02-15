// Lazy-load SendGrid to avoid blocking server startup
let _sgMail = null;
function getSgMail() {
  if (!_sgMail) {
    _sgMail = require('@sendgrid/mail');
    if (process.env.SENDGRID_API_KEY) {
      _sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }
  return _sgMail;
}

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not set — emails will not be sent');
}

const from = process.env.SENDGRID_FROM_EMAIL || 'noreply@gitchacars.com';

async function sendEmail(to, subject, text) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('Skipping email (no API key):', subject);
    return;
  }
  try {
    await getSgMail().send({ to, from, subject, text });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

async function sendWelcomeEmail(user) {
  await sendEmail(
    user.email,
    'Welcome to GitchaCars!',
    `Hi ${user.first_name},\n\nWelcome to GitchaCars! Your account has been created successfully.\n\nBest,\nThe GitchaCars Team`
  );
}

async function sendNewIntroEmail(buyer, vehicle, seller) {
  await sendEmail(
    buyer.email,
    'New Vehicle Introduction on GitchaCars',
    `Hi ${buyer.first_name},\n\nA seller has introduced a ${vehicle.year} ${vehicle.make} ${vehicle.model} to one of your want listings.\n\nLog in to review the introduction.\n\nBest,\nThe GitchaCars Team`
  );
}

async function sendIntroAcceptedEmail(seller, buyer, wantListing) {
  await sendEmail(
    seller.email,
    'Your Introduction Was Accepted!',
    `Hi ${seller.first_name},\n\n${buyer.first_name} has accepted your vehicle introduction for their "${wantListing.title}" listing.\n\nLog in to see the details.\n\nBest,\nThe GitchaCars Team`
  );
}

module.exports = { sendWelcomeEmail, sendNewIntroEmail, sendIntroAcceptedEmail };
