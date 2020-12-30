const FormService = {
  getUserForm(db, id_user, id) {
    return db
      .from('form')
      .select('name', 'description', 'fields')
      .where({ id_user, id })
      .first()
      .then(res => {
        return res
      })
  }
}

module.exports = FormService;