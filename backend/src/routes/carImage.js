const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  const { make, model, year, angle } = req.query;

  if (!make || !model) {
    return res.status(400).json({ error: { message: 'make and model query params are required' } });
  }

  const apiKey = process.env.IMAGIN_API_KEY || 'demo';

  const params = new URLSearchParams({
    customer: apiKey,
    make: make,
    modelFamily: model,
    modelYear: year || '',
    angle: angle || '01',
    width: '800',
  });

  const imageUrl = `https://cdn.imagin.studio/getImage?${params.toString()}`;

  res.redirect(302, imageUrl);
});

module.exports = router;
