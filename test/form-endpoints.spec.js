const { expect } = require('chai');
const supertest = require('supertest');
const { set, post } = require('../src/app');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Form Endpoints', function () {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testForms = helpers.makeFormsArray();
  const testRecords = helpers.makeRecordsArray();

  const testForm = testForms[0];
  const testUser = testUsers[0];
  const auth = { Authorization: helpers.makeAuthHeader(testUser) };

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  beforeEach('seed fixtures', () =>
    helpers.seedUsersFormsRecords(
      db,
      testUsers,
      testForms,
      testRecords
    )
  );

  afterEach('cleanup', () => helpers.cleanTables(db));

  /**
   * @description Get an array of a user's Forms
   **/
  describe('GET /api/form', () => {
    it('responds with 401 unauthorized when no auth header set', () => {
      return supertest(app)
        .get('/api/form')
        .expect(401, {
          error: 'Missing bearer token'
        })
    });

    it('returns all user forms', () => {
      return supertest(app)
        .get('/api/form')
        .set(auth)
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.an('array');
          res.body.forEach(form =>
            expect(form).to.include.all.keys(
              'id',
              'name',
              'fields'
            )
          );
        });
    });
  });


  /**
   * @description Post a new Form
   **/
  describe('POST /api/form', () => {
    const requiredFields = ['name', 'fields'];

    it('responds with 401 unauthorized when no auth header set', () => {
      return supertest(app)
        .post('/api/form')
        .expect(401, {
          error: 'Missing bearer token'
        })
    });

    requiredFields.forEach(field => {
      const postAttemptBody = {
        name: 'test form',
        fields: [
          {
            id: '2888e8b2-4ec2-11eb-b543-bfee7e1d4520',
            label: 'labelOne',
            type: 'string'
          }
        ]
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete postAttemptBody[field];

        return supertest(app)
          .post('/api/form')
          .set(auth)
          .send(postAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });

    it('responds with 400 malformed when wrong keys in fields', () => {
      const postAttemptBody = {
        fields: [
          {
            foo: '2888e8b2-4ec2-11eb-b543-bfee7e1d4520',
            label: 'labelOne',
            type: 'string'
          }
        ],
        name: 'new-test-form',
        description: 'another form to test'
      };
      return supertest(app)
        .post('/api/form')
        .set(auth)
        .send(postAttemptBody)
        .expect(400, {
          error: `'foo' is not a valid field key`
        });
    });

    it('responds with 400 malformed when field keys missing', () => {
      const postAttemptBody = {
        fields: [
          {
            label: 'labelOne',
            type: 'string'
          }
        ],
        name: 'new-test-form',
        description: 'another form to test'
      };
      return supertest(app)
        .post('/api/form')
        .set(auth)
        .send(postAttemptBody)
        .expect(400, {
          error: `'id' is missing from field`
        });
    });

    it('responds with 400 malformed when wrong types in fields', () => {
      const postAttemptBody = {
        fields: [
          {
            id: '2888e8b2-4ec2-11eb-b543-bfee7e1d4520',
            label: 'labelOne',
            type: 'invalid'
          }
        ],
        name: 'new-test-form',
        description: 'another form to test'
      };
      return supertest(app)
        .post('/api/form')
        .set(auth)
        .send(postAttemptBody)
        .expect(400, {
          error: `'invalid' is not a valid field type`
        });
    });

    describe('given a valid form', () => {
      const postAttemptBody = {
        fields: [
          {
            id: '2888e8b2-4ec2-11eb-b543-bfee7e1d4520',
            label: 'labelOne',
            type: 'string'
          },
          {
            id: '2888aa74-4eef-11eb-b544-9ff93ffc6d13',
            label: 'labelTwo',
            type: 'number'
          }
        ],
        name: 'new-test-form',
        description: 'another form to test'
      }
      it('returns 201, valid form', () => {
        return supertest(app)
          .post('/api/form')
          .set(auth)
          .send(postAttemptBody)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('name');
            expect(res.body).to.have.property('description');
            expect(res.body).to.have.property('fields');
          })
      });
      it('stores the new form in db', () => {
        return supertest(app)
          .post('/api/form')
          .set(auth)
          .send(postAttemptBody)
          .then(res => {
            return db
              .from('form')
              .select('fields')
              .where({ id: res.body.id })
              .first()
              .then(row =>
                expect(row.fields).to.eql(postAttemptBody.fields)
              );
          });
      });
    });
  });

  /**
  * @description Update a Form
  **/
  describe.only('PATCH /api/form', () => {
    describe('given a valid requrest', () => {
      const patchAttemptBody = {
        fields: [
          {
            id: '2888e8b2-4ec2-11eb-b543-bfee7e1d4520',
            label: 'ChangedLabel',
            type: 'string'
          },
          {
            id: '2888aa74-4eef-11eb-b544-9ff93ffc6d13',
            label: 'labelTwo',
            type: 'number'
          }
        ],
        description: 'this form was updated'
      }
      const formId = 1;
      it('returns 201 and a new form', () =>
        supertest(app)
          .patch(`/api/form/${formId}`)
          .set(auth)
          .send(patchAttemptBody)
          .expect(201)
          .then(res =>
            db
              .from('form')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.description).to.eql(patchAttemptBody.description);
                expect(row.fields).to.eql(patchAttemptBody.fields);
              })
          )
      );
      it('hides the old form', () => {
        return supertest(app)
          .patch(`/api/form/${formId}`)
          .set(auth)
          .send(patchAttemptBody)
          .then(() =>
            db
              .from('form')
              .select('hidden')
              .where({ id: formId })
              .first()
              .then(res => {
                expect(res.hidden).to.be.true;
              })
          )
      })
    });
  });
});