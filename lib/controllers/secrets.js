const authenticate = require('../middleware/authenticate');
const Secret = require('../models/Secret');

const { Router } = require('express');

module.exports = Router()

  .get('/', authenticate, async (req, res, next) => {
    try {
      const allSecrets = await Secret.getAll();
      res.json(allSecrets);
    } catch (error) {
      next (error);
    }
  });
