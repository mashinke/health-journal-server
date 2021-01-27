function validateFormFields(req, res, next) {
  const { fields } = req.body;
  if (fields === undefined) return next();

  const fieldTypes = ['string', 'number', 'boolean', 'range', 'time'];
  const fieldProperties = ['id', 'label', 'type', 'min', 'max'];
  const requiredKeys = ['id', 'label', 'type'];

  let error = null;
  fields.every((field) => {
    const fieldKeys = Object.keys(field);
    if (!fieldTypes.includes(field.type)) {
      error = `'${field.type}' is not a valid field type`;
      return false;
    }
    return (
      fieldKeys.every((key) => {
        if (!fieldProperties.includes(key)) {
          error = `'${key}' is not a valid field key`;
          return false;
        }
        return true;
      })
      && requiredKeys.every((requiredKey) => {
        if (!fieldKeys.includes(requiredKey)) {
          error = `'${requiredKey}' is missing from field`;
          return false;
        }
        return true;
      })
    );
  });

  if (error) return res.status(400).json({ error });
  next();
}

module.exports = validateFormFields;
