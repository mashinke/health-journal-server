const express = require('express');
const path = require('path');
const FormService = require('./form-service');
const { requireAuth } = require('../middleware/jwt-auth');
const validateFormFields = require('../middleware/validate-form-fields');

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
  .post('/',
    jsonBodyParser,
    validateFormFields,
    async (req, res, next) => {
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
          .location(path.posix.join(req.originalUrl, `/${newForm.id}`))
          .json(payload);
      } catch (error) {
        next(error);
      }
    });
formRouter
  .patch('/:formId',
    jsonBodyParser,
    validateFormFields,
    async (req, res, next) => {
      const db = req.app.get('db');
      try {
        let { formId } = req.params;
        formId = Number(formId);

        if (!formId) {
          return res
            .status(400)
            .json({
              error: 'Invalid form id'
            })
        }

        const latestFormVersion =
          await FormService.getUserFormLatest(db, req.user.id, formId);

        if (!latestFormVersion)
          return res
            .status(404)
            .json({
              error: `Form id ${formId} not found`
            })

        for ([key, value] of Object.entries(latestFormVersion)) {
          if (req.body[key] === undefined) {
            req.body[key] = value;
          }
        }

        const { name, description, fields } = req.body;
        const updatedForm = await FormService.updateForm(db,
          formId,
          {
            name,
            description,
            fields
          }
        );

        const payload = FormService.prepareForm(updatedForm);
        return res
          .status(200)
          .json(payload);
      } catch (error) {
        next(error);
      }
    });

module.exports = formRouter;