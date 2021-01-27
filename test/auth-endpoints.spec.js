const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Auth Endpoints', function () {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  /**
   * @description Get token for login
   * */
  describe('POST /api/auth/token', () => {
    beforeEach('insert users', () => helpers.seedUsers(
      db,
      testUsers,
    ));

    const requiredFields = ['email', 'password'];

    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        email: testUser.email,
        password: testUser.password,
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post('/api/auth/token')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it('responds 400 \'invalid email or password\' when bad email', () => {
      const userInvalidUser = { email: 'user-not', password: 'existy' };
      return supertest(app)
        .post('/api/auth/token')
        .send(userInvalidUser)
        .expect(400, { error: 'Incorrect email or password' });
    });

    it('responds 400 \'invalid email or password\' when bad password', () => {
      const userInvalidPass = { email: testUser.email, password: 'incorrect' };
      return supertest(app)
        .post('/api/auth/token')
        .send(userInvalidPass)
        .expect(400, { error: 'Incorrect email or password' });
    });

    it('responds 200 and JWT auth token when valid credentials',
      () => {
        const userValidCreds = {
          email: testUser.email,
          password: testUser.password,
        };
        const expectedToken = jwt.sign(
          { user_id: testUser.id, username: testUser.username },
          process.env.JWT_SECRET,
          {
            subject: testUser.email,
            expiresIn: process.env.JWT_EXPIRY,
            algorithm: 'HS256',
          },
        );
        return supertest(app)
          .post('/api/auth/token')
          .send(userValidCreds)
          .expect(200, {
            authToken: expectedToken,
          });
      });
  });

  /**
   * @description Refresh token
   * */
  describe('PATCH /api/auth/token', () => {
    beforeEach('insert users', () => helpers.seedUsers(
      db,
      testUsers,
    ));

    it('responds 200 and JWT auth token using secret', () => {
      const expectedToken = jwt.sign(
        { user_id: testUser.id, username: testUser.username },
        process.env.JWT_SECRET,
        {
          subject: testUser.email,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256',
        },
      );
      return supertest(app)
        .put('/api/auth/token')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, {
          authToken: expectedToken,
        });
    });
  });
});
