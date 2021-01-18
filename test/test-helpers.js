const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * create a knex instance connected to postgres
 * @returns {knex instance}
 */
function makeKnexInstance() {
  return knex({
    client: 'pg',
    connection: process.env.TEST_DB_URL,
  });
}

/**
 * create a knex instance connected to postgres
 * @returns {array} of user objects
 */
function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      email: 'test-user-1@example.com',
      password: 'password',
    },
    {
      id: 2,
      username: 'test-user-2',
      email: 'test-user-2@example.com',
      password: 'password',
    },
  ];
}

function makeFormsArray() {
  return [
    {
      id: 1,
      id_user: 1
    }
  ]
}

function makeFormVersionsArray() {
  return [
    {
      id: 1,
      name: 'test-form-1',
      fields: JSON.stringify(
        [
          {
            id: '2888a8b2-4ec2-11eb-b543-bfee7e1d4520',
            label: 'labelOne',
            type: 'string'
          },
          {
            id: '2888aa74-4ec2-11eb-b544-9ff93ffc6d13',
            label: 'labelTwo',
            type: 'number'
          },
          {
            id: '2888aad8-4ec2-11eb-b546-9f3c6f78d71a',
            label: 'labelFour',
            type: 'range',
            min: 0,
            max: 5
          },
          {
            id: '2888aab0-4ec2-11eb-b545-8f760ba05e58',
            label: 'labelThree',
            type: 'boolean'
          },
        ]
      ),
      description: 'test description',
      id_form: 1
    },
  ]
}

function makeRecordsArray() {
  return [
    { // this one will test xss precautions
      id: 1,
      values: JSON.stringify({
        '2888a8b2-4ec2-11eb-b543-bfee7e1d4520': '<SCRIPT>evil</SCRIPT>',
        '2888aa74-4ec2-11eb-b544-9ff93ffc6d13': 5,
        '2888aab0-4ec2-11eb-b545-8f760ba05e58': true,
        '2888aad8-4ec2-11eb-b546-9f3c6f78d71a': 3
      }),
      id_form_version: 1,
    },
    {
      id: 2,
      values: JSON.stringify({
        '2888a8b2-4ec2-11eb-b543-bfee7e1d4520': 'valueOne',
        '2888aa74-4ec2-11eb-b544-9ff93ffc6d13': 5,
        '2888aab0-4ec2-11eb-b545-8f760ba05e58': true,
        '2888aad8-4ec2-11eb-b546-9f3c6f78d71a': 5
      }),
      id_form_version: 1
    },
  ]
}

/**
 * make a bearer token with jwt for authorization header
 * @param {object} user - contains `id`, `username`
 * @param {string} secret - used to create the JWT
 * @returns {string} - for HTTP authorization header
 */
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

/**
 * remove data from tables and reset sequences for SERIAL id fields
 * @param {knex instance} db
 * @returns {Promise} - when tables are cleared
 */
function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        "record_tag",
        "tag",
        "record",
        "form_version",
        "form",
        "user"`
    )
      .then(() =>
        Promise.all([
          trx.raw('ALTER SEQUENCE user_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE form_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE form_version_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE record_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE tag_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE record_tag_id_seq minvalue 0 START WITH 1'),
          trx.raw('SELECT setval(\'user_id_seq\', 0)'),
          trx.raw('SELECT setval(\'form_id_seq\', 0)'),
          trx.raw('SELECT setval(\'form_version_id_seq\', 0)'),
          trx.raw('SELECT setval(\'record_id_seq\', 0)'),
          trx.raw('SELECT setval(\'tag_id_seq\', 0)'),
          trx.raw('SELECT setval(\'record_tag_id_seq\', 0)'),
        ])
      )
  );
}

/**
 * insert users into db with bcrypted passwords and update sequence
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @returns {Promise} - when users table seeded
 */
function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db.transaction(async trx => {
    await trx.into('user').insert(preppedUsers);

    await trx.raw(
      'SELECT setval(\'user_id_seq\', ?)',
      [users[users.length - 1].id],
    );
  });
}

async function seedUsersFormsRecords(db, users, forms, form_versions, records) {
  await seedUsers(db, users);
  await db.transaction(async trx => {
    await trx.into('form').insert(forms);
    await trx.into('form_version').insert(form_versions);
    await trx.into('record').insert(records);

    await Promise.all([
      trx.raw(
        'SELECT setval(\'form_id_seq\', ?)',
        [forms[forms.length - 1].id],
      ),
      trx.raw(
        'SELECT setval(\'form_version_id_seq\', ?)',
        [form_versions[form_versions.length - 1].id],
      ),
      trx.raw(
        'SELECT setval(\'record_id_seq\', ?)',
        [records[records.length - 1].id],
      )
    ]);
  });
}

module.exports = {
  makeKnexInstance,
  makeUsersArray,
  makeRecordsArray,
  makeFormVersionsArray,
  makeFormsArray,
  makeAuthHeader,
  cleanTables,
  seedUsers,
  seedUsersFormsRecords
};
