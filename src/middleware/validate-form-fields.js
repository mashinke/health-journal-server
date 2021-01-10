function validateFormFields(req, res, next) {
  const { fields } = req.body;
  if (fields === undefined)
    return next();

  for (const field of fields) {
    if (!['string', 'number', 'boolean', 'range'].includes(field.type)) {

      return res.status(400).json({
        error: `'${field.type}' is not a valid field type`
      })
    }
    for (const key of Object.keys(field)) {
      if (!['id', 'label', 'type', 'min', 'max'].includes(key)) {
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
  next();
}

module.exports = validateFormFields;