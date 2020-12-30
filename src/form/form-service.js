const xss = require("xss")

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
      const { type, min, max } = field;
      const label = xss(field.label);
      return {
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