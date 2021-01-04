const xss = require("xss")

const FormService = {
  postNewForm(db, id_user, formData) {
    const { fields, name, description } = formData;
    return db
      .into('form')
      .insert({
        name,
        description,
        id_user,
        fields: JSON.stringify(fields)
      })
      .returning('*')
      .then(rows => rows[0]);
  },
  getUserForm(db, id_user, id) {
    return db
      .from('form')
      .select('name', 'description', 'fields')
      .where({ id_user, id })
      .first()
      .then(res => {
        return res
      })
  },
  getUserForms(db, id_user) {
    return db
      .from('form')
      .select('*')
      .where({ id_user })
      .then(res => {
        return res
      })
  },
  prepareForm(form) {
    const { id } = form;
    const name = xss(form.name);
    const description = xss(form.description);
    const fields = form.fields.map(field => {
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
    return {
      id,
      name,
      description,
      fields
    }
  }
}

module.exports = FormService;