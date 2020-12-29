const RecordService = {
  postNewRecord(db, id_form, body) {
    return db
      .into('record')
      .insert({ id_form, body })
      .returning(['id', 'created'])
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
  }
}

module.exports = RecordService;