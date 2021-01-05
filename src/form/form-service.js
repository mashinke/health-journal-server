const xss = require("xss")

const FormService = {
  postNewForm(db, id_user, formData) {
    const { fields, name, description } = formData;
    return db.transaction(async trx => {
      const id_form = await db.into('form')
        .insert({ id_user })
        .transacting(trx)
        .returning('id')
        .then(rows => rows[0]);

      const newFormVersion = await db
        .into('form_version')
        .transacting(trx)
        .insert({
          fields: JSON.stringify(fields),
          name,
          description,
          id_form
        })
        .returning(['name', 'description', 'fields'])
        .then(rows => rows[0]);

      return {
        ...newFormVersion,
        id: id_form
      }
    });

  },

  updateForm(db, id_form, formData) {
    return db.transaction(async trx => {
      await db
        .from('form_version')
        .transacting(trx)
        .where({ id_form, latest: true })
        .update({ latest: false });

      const newFormVersion = await db
        .into('form_version')
        .transacting(trx)
        .insert({
          name: formData.name,
          description: formData.description,
          fields: JSON.stringify(formData.fields),
          id_form,
          latest: true
        })
        .returning(['name', 'description', 'fields'])
        .then(rows => rows[0]);

      return {
        ...newFormVersion,
        id: id_form
      }
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
      .from('form_version')
      .join('form_version', function () {
        this.on('form.id', 'form_version.id_form')
      })
      .where({ id_user, latest: true })
      .select('name', 'description', 'fields', 'form.id')
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