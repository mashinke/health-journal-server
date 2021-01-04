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
          id_user: 1
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

    //   const newForm =
    //     // .transacting(trx)
    //     .update({
    //     name: formData.name,
    //     description: formData.description,
    //     fields: JSON.stringify(formData.fields)
    //   })
    //       .returning('*')
    //       .then(rows => rows[0]);

    //   return newForm;
    // })

    // const form = await db
    //   .from('form')
    //   .select('name', 'description', 'fields', 'id_user')
    //   .where({ id: id_form })
    //   .first();
    // for (field of ['name', 'description']) {
    //   if (formData[field] !== undefined)
    //     form[field] = formData[field];
    // }
    // if (formData.fields) {
    //   form.fields = JSON.stringify(formData.fields);
    // } else {
    //   form.fields = JSON.stringify(form.fields);
    // }
    // const newForm = await db
    //   .into('form')
    //   .insert(form)
    //   .returning('*');
    // await db('form')
    //   .where({ id: id_form })
    //   .update({ hidden: true })
    // return newForm[0];
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
      .where({ id_user, hidden: false })
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