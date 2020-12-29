const RecordService = {
  postNewRecord(db, id_form, body) {
    return db
      .into('record')
      .insert({ id_form, body })
      .returning(['id', 'created'])
      .then(rows => rows[0]);
  }
}

module.exports = RecordService;