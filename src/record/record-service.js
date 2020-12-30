const xss = require("xss");

const RecordService = {
  postNewRecord(db, id_form, body) {
    return db
      .into('record')
      .insert({ id_form, body })
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
    const { id, name, description, body, created, id_form } = record;
    const sanitizedBody = {};
    Object.entries(body).forEach(([key, value]) => {
      sanitizedBody[xss(key)] = typeof value === 'string'
        ? xss(value)
        : value;
    })
    return {
      id,
      name: xss(name),
      description: xss(description),
      body: sanitizedBody,
      created,
      formId: id_form
    }
  }
}

module.exports = RecordService;