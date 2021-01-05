const xss = require("xss");

const RecordService = {
  postNewRecord(db, id_form, values) {
    return db.transaction(async trx => {
      const id_form_version = await db
        .from('form_version')
        .transacting(trx)
        .select('id')
        .where({ id_form, latest: true })
        .first()
        .then(res => res.id);

      return db
        .into('record')
        .insert({ id_form_version, values })
        .returning('*')
    })
      .then(rows => rows[0]);
  },
  getUserRecords(db, id_user) {
    return db
      .from('form')
      .where({ id_user })
      .select()
      .join('form_version', function () {
        this.on('form.id', 'form_version.id_form')
      })
      .join('record', function () {
        this.on('form_version.id', 'record.id_form_version')
      })
  },
  prepareRecord(record) {
    const { id, created, id_form } = record;
    const name = xss(record.name);
    const description = xss(record.description);
    const fields = record.fields.map(field => {
      const { type, min, max, id } = field;
      const label = xss(field.label);
      return {
        id,
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