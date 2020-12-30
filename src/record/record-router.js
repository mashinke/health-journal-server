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
          !(body[label] === undefined) // no required fields atm
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
      const newRecord = await RecordService.postNewRecord(db, formId, body);

      // postNewRecord() doesn't join with form, so we add the properties here
      Object.assign(newRecord, { name, description });
      const payload = RecordService.prepareRecord(newRecord);
      return res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${newRecord.id}`))
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
      const payload = userRecords.map(RecordService.prepareRecord);

      return res.status(200).send(payload);
    } catch (error) {
      next(error);
    }
  });

module.exports = recordRouter;