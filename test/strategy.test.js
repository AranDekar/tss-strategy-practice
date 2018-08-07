/* eslint max-len: ["off", { "ignoreComments": true }] */
import { config } from 'dotenv';
import request from 'supertest';
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';
import makeServer from '../src/server';
import Strategy from '../src/schemas/strategy_schema';
import strategies from './fixtures/strategies';
import badStrategies from './fixtures/bad_strategies';

const mockgoose = new Mockgoose(mongoose);
config({ path: './test/.env' });
let app;
let basicAuth;

// beforeEach(() =>);
afterEach(() => mockgoose.helper.reset());
afterAll(() => {
  const { connections } = mongoose;
  const { childProcess } = mockgoose.mongodHelper.mongoBin;
  // kill mongod
  childProcess.kill();
  // close all connections
  for (const con of connections) {
    return con.close();
  }
  return mongoose.disconnect();
});

beforeAll(async () => {
  app = await makeServer();
  await mockgoose.prepareStorage();
  await mongoose.connect('mongodb://localhost/tss-test', { useNewUrlParser: true });
  // basic auth setting
  basicAuth = `Basic ${Buffer.from(`${process.env.API_KEY}:${process.env.API_SECRET}`).toString('base64')}`;
});

it('GET - return one rec', async () => {
  await Strategy.insertMany(strategies[0]);
  const res = await request(app)
    .get('/api/v1/strategies')
    .set('Authorization', basicAuth);
  expect(200);
  expect(res.body.length).toBe(1);
  expect(res.body[0]).toMatchObject(strategies[0]);
});

it('GET - return empty collection', async () => {
  await request(app)
    .get('/api/v1/strategies')
    .set('Authorization', basicAuth)
    .expect(200, []);
});

it('GET - return two recs', async () => {
  await Strategy.insertMany(strategies);
  const res = await request(app)
    .get('/api/v1/strategies')
    .set('Authorization', basicAuth);
  expect(200);
  expect(res.body.length).toBe(2);
  expect(res.body[0]).toMatchObject(strategies[0]);
  expect(res.body[1]).toMatchObject(strategies[1]);
});

it('AUTH(GET) - no auth to return 401', async () => {
  await request(app)
    .get('/api/v1/strategies')
    .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
});

it('AUTH(GET) - wrong auth to return 401', async () => {
  await request(app)
    .get('/api/v1/strategies')
    .set('Authorization', 'Basic wWrronGToken1sP@ss3d')
    .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
});

it('POST - Ok', async () => {
  const res = await request(app)
    .post('/api/v1/strategies')
    .send(strategies[0])
    .type('application/json')
    .set('Authorization', basicAuth)
    .expect(201);

  expect(res.body).toMatchObject(strategies[0]);
  const rec = await Strategy.findOne().exec();
  expect(JSON.toString(res.body)).toBe(JSON.toString(rec));
});


it('POST - Nok strategy revision required', async () => {
  await request(app)
    .post('/api/v1/strategies')
    .send(badStrategies[0])
    .type('application/json')
    .set('Authorization', basicAuth)
    .expect(400, '{"message":"Validation errors","errors":[{"code":"INVALID_REQUEST_PARAMETER","errors":[{"code":"OBJECT_MISSING_REQUIRED_PROPERTY","params":["strategyRevisions"],"message":"Missing required property: strategyRevisions","path":[]}],"in":"body","message":"Invalid parameter (strategy): Value failed JSON Schema validation","name":"strategy","path":["paths","/strategies","post","parameters","0"]}]}');
});

it('POST - Nok name required', async () => {
  await request(app)
    .post('/api/v1/strategies')
    .send(badStrategies[1])
    .type('application/json')
    .set('Authorization', basicAuth)
    .expect(400, '{"message":"Validation errors","errors":[{"code":"INVALID_REQUEST_PARAMETER","errors":[{"code":"OBJECT_MISSING_REQUIRED_PROPERTY","params":["name"],"message":"Missing required property: name","path":[]}],"in":"body","message":"Invalid parameter (strategy): Value failed JSON Schema validation","name":"strategy","path":["paths","/strategies","post","parameters","0"]}]}');
});


// it('should GET 400', async () => {
//   await request(app)
//     .get('/api/v1/movie/ds')
//     .set('Accept', 'application/json')
//     .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
//     .expect(400, '{"message":"Validation errors","errors":[{"code":"INVALID_REQUEST_PARAMETER","errors":[{"code":"INVALID_FORMAT","params":["ObjectId","ds"],"message":"Object didn\'t pass validation for format ObjectId: ds","path":[],"description":"The ID of the movie to get."}],"in":"path","message":"Invalid parameter (id): Value failed JSON Schema validation","name":"id"}]}');
// });

// it('should POST a movie', async () => {
//   await request(app)
//     .post('/api/v1/movie')
//     .send(movie1)
//     .type('application/json')
//     // .set('Accept', 'application/json')
//     .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
//     .expect(201, movie1);
// });

// it('should POST a movie FAILED', async () => {
//   await request(app)
//     .post('/api/v1/movie')
//     .send(JSON.stringify(wrongMovieID))
//     .type('application/json')
//     // .set('Accept', 'application/json')
//     .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
//     .expect(400, '{"message":"Validation errors","errors":[{"code":"INVALID_REQUEST_PARAMETER","errors":[{"code":"INVALID_FORMAT","params":["ObjectId","54f0be26ae8aba"],"message":"Object didn\'t pass validation for format ObjectId: 54f0be26ae8aba","path":["body","id"],"description":null}],"in":"body","message":"Invalid parameter (id): Value failed JSON Schema validation","name":"id"}]}');
// });

// it('should GET a movie in the collection', async () => {
//   await request(app)
//     .get('/api/v1/movie')
//     .set('Accept', 'application/json')
//     .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
//     .expect(200, [movie1]);
// });


// it('should GET 200', async () => {
//   await request(app)
//     .get('/api/v1/movie/54f0be26ae8aba260b8f6db8')
//     .set('Accept', 'application/json')
//     .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
//     .expect(200, movie1);
// });


// it('should DELETE the movie 200', async () => {
//   await request(app)
//     .delete('/api/v1/movie/54f0be26ae8aba260b8f6db8')
//     .set('Accept', 'application/json')
//     .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
//     .expect(204);
// });


// it('should GET an empty collection', async () => {
//   await request(app)
//     .get('/api/v1/movie')
//     .set('Accept', 'application/json')
//     .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
//     .expect(200, []);
// });


// it('should GET 404', async () => {
//   await request(app)
//     .get('/api/v1/movie/54f0be26ae8aba260b8f6db8')
//     .set('Accept', 'application/json')
//     .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
//     .expect(404);
// });

// it('should POST a movie', async () => {
//   await request(app)
//     .post('/api/v1/movie')
//     .send(movie1)
//     .type('application/json')
//     // .set('Accept', 'application/json')
//     .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
//     .expect(201, movie1);
// });

// it('should POST another movie', async () => {
//   await request(app)
//     .post('/api/v1/movie')
//     .send(movie2)
//     .type('application/json')
//     // .set('Accept', 'application/json')
//     .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
//     .expect(201, movie2);
// });

// it('should GET two movie in the collection', async () => {
//   await request(app)
//     .get('/api/v1/movie')
//     .set('Accept', 'application/json')
//     .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
//     .expect(200, [movie1, movie2]);
// });


// it('AUTH - should GET 401', async () => {
//   await request(app)
//     .get('/api/v1/movie/54f0be26ae8aba260b8f6db8')
//     .set('Accept', 'application/json')
//     .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
// });

// it('AUTH - should GET 401', async () => {
//   await request(app)
//     .get('/api/v1/movie')
//     .set('Accept', 'application/json')
//     .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
// });

// it('AUTH - should DELETE 401', async () => {
//   await request(app)
//     .delete('/api/v1/movie/54f0be26ae8aba260b8f6db8')
//     .set('Accept', 'application/json')
//     .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
// });


// it('AUTH - should GET 401', async () => {
//   await request(app)
//     .get('/api/v1/movie/54f0be26ae8aba260b8f6db8')
//     .set('Accept', 'application/json')
//     .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
// });

// it('AUTH - should POST 401', async () => {
//   await request(app)
//     .post('/api/v1/movie')
//     .send(movie2)
//     .type('application/json')
//     .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
// });
