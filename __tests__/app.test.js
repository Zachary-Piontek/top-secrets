const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');


const secretUser = {
  firstName: 'James',
  lastName: 'Bond',
  email: '007@Qbranch.gov',
  password: 'Skyfall',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? secretUser.password;

  const agent = request.agent(app);
  
  const user = await UserService.create({ ...secretUser, ...userProps });
  
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('DOD secret routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  afterAll(() => {
    pool.end();
  });

  it('create new user', async () => {
    const res = await request(app).post('/api/v1/users').send(secretUser);
    const { firstName, lastName, email } = secretUser;
    console.log(secretUser);
    console.log(res.body);
    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });

  it('return current user', async () => {
    const [agent, user] = await registerAndLogin();
    const me = await agent.get('/api/v1/users/me');
    console.log(me.body);
    expect(me.body).toEqual({
      ...user,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });

  it('delete user session(logout)', async () => {
    const [agent] = await registerAndLogin();
    const resp = await agent.delete('/api/v1/users/sessions');
    console.log(resp.status);
    expect(resp.status).toBe(204);
  });

  it('return secrets to users logged in', async () => {
    const [agent] = await registerAndLogin();
    const res = await agent.get('/api/vi/secrets');
    console.log(res.body);
    expect(res.body.length).toEqual(2);
  });
  

});
