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
    const requiredFields = ['formId', 'body'];

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
        body: {
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

    it(`responds with 400 malformed when 'body' doesn't match form`, () => {
      const postAttemptBody = {
        formId: 1,
        body: {
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
        body: {
          labelOne: 'test-value',
          labelTwo: 5,
          labelThree: true,
          labelFour: 3
        }
      };

      it('responds 201, serialized record', () => {
        return supertest(app)
          .post('/api/record')
          .set(auth)
          .send(postAttemptBody)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.name).to.eql(testForm.name);
            expect(res.body.body).to.eql(postAttemptBody.body);
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
              .select('body')
              .where({ id: res.body.id })
              .first()
              .then((row) => {
                expect(row.body).to.eql(postAttemptBody.body);
              });
          });
      });
    });
  });

  /**
   * @description Get an array of a user's Records
   **/
  describe('GET /api/record', () => {
    // should return all user records

  });
})