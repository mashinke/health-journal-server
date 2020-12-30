const { expect } = require('chai');
const supertest = require('supertest');
const { set, post } = require('../src/app');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Record Endpoints', function () {
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
   * @description Post a new Record to the database
   **/
  describe('POST /api/record', () => {
    const requiredFields = ['formId', 'values'];

    it('responds with 401 unauthorized when no auth header set', () => {
      return supertest(app)
        .post('/api/record')
        .expect(401, {
          error: 'Missing bearer token'
        })
    });

    requiredFields.forEach(field => {
      const postAttemptBody = {
        formId: 1,
        body: {
          value: 7
        }
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete postAttemptBody[field];

        return supertest(app)
          .post('/api/record')
          .set(auth)
          .send(postAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });

    it(`responds with 400 incorrect when no 'formId' connected to user`, () => {
      const postAttemptBody = {
        formId: 99,
        values: {
          value: 'something'
        }
      };

      return supertest(app)
        .post('/api/record')
        .set(auth)
        .send(postAttemptBody)
        .expect(400, {
          error: `Form ID ${postAttemptBody.formId} not found for user ${testUser.username}`
        });
    });

    it(`responds with 400 malformed when incorrect label`, () => {
      const postAttemptBody = {
        formId: 1,
        values: {
          labelOne: 'invalid',
          bloop: 4,
          labelThree: false,
          labelFour: 5
        }
      };

      return supertest(app)
        .post('/api/record')
        .set(auth)
        .send(postAttemptBody)
        .expect(400, {
          error: `Malformed request, record body does not match form specifications`
        });
    });

    it(`responds with 400 malformed when incorrect value`, () => {
      const postAttemptBody = {
        formId: 1,
        values: {
          labelOne: 'invalid',
          labelTwo: 4,
          labelThree: false,
          labelFour: 10
        }
      };

      return supertest(app)
        .post('/api/record')
        .set(auth)
        .send(postAttemptBody)
        .expect(400, {
          error: `Malformed request, record body does not match form specifications`
        });
    });

    describe('Given a valid record', () => {
      const postAttemptBody = {
        formId: testForm.id,
        values: {
          labelOne: 'test-value',
          labelTwo: 5,
          labelThree: true,
          labelFour: 3
        }
      };

      it('responds 201, serialized record', () => {
        const fields = [
          {
            label: 'labelOne',
            type: 'string'
          },
          {
            label: 'labelTwo',
            type: 'number'
          },
          {
            label: 'labelFour',
            type: 'range',
            min: 0,
            max: 5
          },
          {
            label: 'labelThree',
            type: 'boolean'
          },
        ]

        return supertest(app)
          .post('/api/record')
          .set(auth)
          .send(postAttemptBody)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.name).to.eql(testForm.name);
            expect(res.body.values).to.eql(postAttemptBody.values);
            expect(res.body.fields).to.eql(fields);
            expect(res.headers.location).to.eql(`/api/record/${res.body.id}`);
          })
      });

      it('stores the new record in db', () => {
        return supertest(app)
          .post('/api/record')
          .set(auth)
          .send(postAttemptBody)
          .then(res => {
            return db
              .from('record')
              .select('values')
              .where({ id: res.body.id })
              .first()
              .then((row) =>
                expect(row.values).to.eql(postAttemptBody.values)
              );
          });
      });
    });
  });

  /**
   * @description Get an array of a user's Records
   **/
  describe('GET /api/record', () => {
    it('responds with 401 unauthorized when no auth header set', () => {
      return supertest(app)
        .get('/api/record')
        .expect(401, {
          error: 'Missing bearer token'
        })
    });

    it('returns all user records', () => {
      return supertest(app)
        .get('/api/record')
        .set(auth)
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.an('array');
          res.body.forEach(record =>
            expect(record).to.include.all.keys(
              'id',
              'name',
              'values',
              'fields',
              'created',
              'formId',
            )
          );
        });
    });
  });
});