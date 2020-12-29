const express = require('express');
const path = require('path');
const RecordService = require('./record-service');
const FormService = require('../form/form-service');
const { requireAuth } = require('../middleware/jwt-auth');

const recordRouter = express.Router();
const jsonBodyParser = express.json();

recordRouter
  .use(requireAuth);

recordRouter
  .post('/', jsonBodyParser, async (req, res, next) => {
    const { formId, body } = req.body;
    try {
      for (const key of ['formId', 'body']) {
        const value = req.body[key];
        if (value == null) {
          return res.status(400).json({
            error: `Missing '${key}' in request body`

          });
        }
      }

      const db = req.app.get('db');

      // validate formId
      const userForm = await FormService.getUserForm(db, req.user.id, formId);

      if (!userForm)
        return res.status(400).json({
          error: `Form ID ${formId} not found for user ${req.user.username}`
        });

      const {
        name,
        description,
        body: formFields
      } = userForm

      // validate body format
      for (const field of formFields) {
        const { label, type } = field;
        if (
          !(body[label] === undefined)
          && !(
            type === 'range'
            && body[label] <= field.max
            && body[label] >= field.min
          )
          && !(typeof body[label] === type)
        )
          return res.status(400).json({
            error: 'Malformed request, record body does not match form specifications'
          });
      }
      const {
        id,
        created
      } = await RecordService.postNewRecord(db, formId, body);
      // don't forget xss

      const payload = {
        id,
        created,
        name,
        description,
        body
      }

      return res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${id}`))
        .json(payload);
    } catch (error) {
      next(error);
    }
  });

recordRouter
  .get('/', async (req, res, next) => {
    const db = req.app.get('db');
    try {
      const userRecords = await RecordService.getUserRecords(db, req.user.id)
      return res.status(200).send(userRecords);
    } catch (error) {
      next(error);
    }
  });

module.exports = recordRouter;