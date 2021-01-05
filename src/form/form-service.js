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

  updateForm(db, id_form, formData) {
    return db.transaction(async trx => {
      const oldForm = await db
        .from('form')
        .transacting(trx)
        .select('name', 'description', 'fields', 'id_user')
        .where({ id: id_form })
        .first();

      await db('form')
        .transacting(trx)
        .update({ hidden: true })
        .where({ id: id_form })

      const newFormId = await db
        .into('form')
        .transacting(trx)
        .insert({
          name: oldForm.name,
          description: oldForm.description,
          fields: JSON.stringify(oldForm.fields),
          id_user: 1,
          replaces: id_form
        })
        .returning('id')
        .then(rows => rows[0]);

      const newForm = await db('form')
        .transacting(trx)
        .where({ id: newFormId })
        .update({
          name: formData.name,
          description: formData.description,
          fields: JSON.stringify(formData.fields)
        })
        .returning('*')
        .then(rows => rows[0]);
      return newForm;
    })
  },

  getUserFormLatest(db, id_user, id_form) {
    return db
      .from('form')
      .join('form_version', function () {
        this.on('form.id', 'form_version.id_form')
      })
      .where({ id_user, id_form, latest: true })
      .select('name', 'description', 'fields')
      .first();
  },

  getUserForms(db, id_user) {
    return db
      .from('form')
      .join('form_version', function () {
        this.on('form.id', 'form_version.id_form')
      })
      .where({ id_user, latest: true })
      .select('name', 'description', 'fields', 'form.id')
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