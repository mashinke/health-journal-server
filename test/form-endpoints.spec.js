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
            // console.log(form)
          );
        });
    });
  });
});