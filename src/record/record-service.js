const xss = require("xss");

const RecordService = {
  postNewRecord(db, id_form, values) {
    return db
      .into('record')
      .insert({ id_form, values })
      .returning('*')
      .then(rows => rows[0]);
  },
  getUserRecords(db, id_user) {
    return db
      .from('form')
      .where({ id_user })
      .select()
      .join('record', function () {
        this.on('form.id', 'record.id_form')
      })
  },
  prepareRecord(record) {
    const { id, created, id_form } = record;
    const name = xss(record.name);
    const description = xss(record.description);
    const fields = record.fields.map(field => {
      const { type, min, max } = field;
      const label = xss(field.label);
      return {
        type,
        label,
        min,
        max
      }
    });
    const values = {};
    Object.entries(record.values).forEach(([key, value]) => {
      values[xss(key)] = typeof value === 'string'
        ? xss(value)
        : value;
    })
    return {
      id,
      name,
      description: xss(description),
      values,
      fields,
      created,
      formId: id_form
    }
  }
}

module.exports = RecordService;