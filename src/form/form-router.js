const express = require('express');
const FormService = require('./form-service');
const { requireAuth } = require('../middleware/jwt-auth');

const formRouter = express.Router();

formRouter
  .use(requireAuth);

formRouter
  .get('/', async (req, res, next) => {
    const db = req.app.get('db');
    try {
      const userForms = await FormService.getUserForms(db, req.user.id);
      const payload = userForms.map(form => FormService.prepareForm(form));

      return res.status(200).send(payload);
    } catch (error) {
      next(error);
    }
  })

module.exports = formRouter;