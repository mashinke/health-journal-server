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
    try {
      const { formId, values } = req.body;
      const newRecordData = { formId, values };

      const [nullKey] = Object.entries(newRecordData)
        .find(([, value]) => value == null) || [];

      if (nullKey) {
        return res.status(400).json({
          error: `Missing '${nullKey}' in request body`,
        });
      }

      const db = req.app.get('db');

      // validate formId
      const latestUserForm = await FormService
        .getUserFormLatest(db, req.user.id, formId);

      if (!latestUserForm) {
        return res.status(400).json({
          error: `Form ID ${formId} not found for user ${req.user.username}`,
        });
      }

      const {
        name,
        description,
        fields,
      } = latestUserForm;

      // validate body format
      const fieldReference = fields.reduce((hash, {
        id, min, max, type,
      }) => Object.assign(hash, { [id]: { min, max, type } }), {});
      let error = null;

      Object.entries(values).every(([id, value]) => {
        if (fieldReference[id] === undefined) {
          error = 'Malformed request, record body does not match form specifications';
          return false;
        }
        const { type, min, max } = fieldReference[id];
        const valueType = typeof value;

        if (
          !(value === undefined) // no required fields atm
          && !(
            type === 'range'
            && value <= max
            && value >= min
          )
          && !(
            type === 'time'
            && value.match(/^\d{1,2}:\d{2}([ap]m)?$/) // time format h:m
          )
          && !(valueType === type)
        ) {
          error = 'Malformed request, record body does not match form specifications';
          return false;
        }
        return true;
      });

      if (error) return res.status(400).json({ error });

      const newRecord = await RecordService.postNewRecord(db, formId, values);
      // postNewRecord() doesn't join with form, so we add the properties here
      Object.assign(newRecord, {
        name, description, fields, id_form: formId,
      });
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
      const userRecords = await RecordService.getUserRecords(db, req.user.id);
      const payload = userRecords.map(RecordService.prepareRecord);

      return res.status(200).send(payload.reverse());
    } catch (error) {
      next(error);
    }
  });

recordRouter
  .delete('/:recordId', async (req, res, next) => {
    const db = req.app.get('db');
    const { recordId } = req.params;
    try {
      const deletedRows = await RecordService.deleteUserRecord(db, recordId);
      if (deletedRows === 0) return res.status(404).send();

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

module.exports = recordRouter;
