const express = require('express');
const FormService = require('./form-service');
const { requireAuth } = require('../middleware/jwt-auth');

const formRouter = express.Router();
const jsonBodyParser = express.json();

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
  });

formRouter
  .post('/', jsonBodyParser, async (req, res, next) => {
    const db = req.app.get('db');
    try {
      const { name, description, fields } = req.body;

      for (const key of ['name', 'fields']) {
        const value = req.body[key];
        if (value == null) {
          return res.status(400).json({
            error: `Missing '${key}' in request body`
          });
        }
      }

      for (const field of fields) {
        if (!['string', 'number', 'boolean', 'range'].includes(field.type)) {

          return res.status(400).json({
            error: `'${field.type}' is not a valid field type`
          })
        }
        for (const key of Object.keys(field)) {
          if (!['id', 'label', 'type'].includes(key)) {
            return res.status(400).json({
              error: `'${key}' is not a valid field key`
            })
          }
        }
        for (const requiredKey of ['id', 'label', 'type']) {
          if (!Object.keys(field).includes(requiredKey)) {
            return res.status(400).json({
              error: `'${requiredKey}' is missing from field`
            })
          }
        }
      }

      const newForm = await FormService.postNewForm(
        db,
        req.user.id,
        {
          name,
          description,
          fields
        })
      const payload = FormService.prepareForm(newForm);
      return res
        .status(201)
        .json(payload);
    } catch (error) {
      next(error)
    }
  })

module.exports = formRouter;