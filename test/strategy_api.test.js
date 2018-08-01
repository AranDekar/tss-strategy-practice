/* eslint max-len: ["off", { "ignoreComments": true }] */

import request from 'supertest';
import makeServer from '../src/server';

const wrongMovieID = {
  id: '54f0be26ae8aba',
  title: 'The Shawshank Redemption',
  plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
  releaseDate: '1994-10-14',
  actors: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler'],
  duration: 142,
  poster: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
  rating: 'PG',
};
const movie1 = {
  id: '54f0be26ae8aba260b8f6db8',
  title: 'The Shawshank Redemption',
  plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
  releaseDate: '1994-10-14',
  actors: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler'],
  duration: 142,
  poster: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
  rating: 'PG',
};
const movie2 = {
  id: '54f0be26ae8aba260b8f6db9',
  title: 'The Shawshank Redemption',
  plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
  releaseDate: '1994-10-14',
  actors: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler'],
  duration: 142,
  poster: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
  rating: 'PG',
};
let app;

beforeEach(async (done) => {
  app = await makeServer();
  done();
});


it('should GET 404', async () => {
  await request(app)
    .get('/api/v1/movie/54f0be26ae8aba260b8f6db8')
    .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(404, '{"message":"❌ movie with the id: 54f0be26ae8aba260b8f6db8 not found"}');
});

it('should GET 400', async () => {
  await request(app)
    .get('/api/v1/movie/ds')
    .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(400, '{"message":"Validation errors","errors":[{"code":"INVALID_REQUEST_PARAMETER","errors":[{"code":"INVALID_FORMAT","params":["ObjectId","ds"],"message":"Object didn\'t pass validation for format ObjectId: ds","path":[],"description":"The ID of the movie to get."}],"in":"path","message":"Invalid parameter (id): Value failed JSON Schema validation","name":"id"}]}');
});

it('should POST a movie', async () => {
  await request(app)
    .post('/api/v1/movie')
    .send(movie1)
    .type('application/json')
    // .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(201, movie1);
});

it('should POST a movie FAILED', async () => {
  await request(app)
    .post('/api/v1/movie')
    .send(JSON.stringify(wrongMovieID))
    .type('application/json')
    // .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(400, '{"message":"Validation errors","errors":[{"code":"INVALID_REQUEST_PARAMETER","errors":[{"code":"INVALID_FORMAT","params":["ObjectId","54f0be26ae8aba"],"message":"Object didn\'t pass validation for format ObjectId: 54f0be26ae8aba","path":["body","id"],"description":null}],"in":"body","message":"Invalid parameter (id): Value failed JSON Schema validation","name":"id"}]}');
});

it('should GET a movie in the collection', async () => {
  await request(app)
    .get('/api/v1/movie')
    .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(200, [movie1]);
});


it('should GET 200', async () => {
  await request(app)
    .get('/api/v1/movie/54f0be26ae8aba260b8f6db8')
    .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(200, movie1);
});


it('should DELETE the movie 200', async () => {
  await request(app)
    .delete('/api/v1/movie/54f0be26ae8aba260b8f6db8')
    .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(204);
});


it('should GET an empty collection', async () => {
  await request(app)
    .get('/api/v1/movie')
    .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(200, []);
});


it('should GET 404', async () => {
  await request(app)
    .get('/api/v1/movie/54f0be26ae8aba260b8f6db8')
    .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(404);
});

it('should POST a movie', async () => {
  await request(app)
    .post('/api/v1/movie')
    .send(movie1)
    .type('application/json')
    // .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(201, movie1);
});

it('should POST another movie', async () => {
  await request(app)
    .post('/api/v1/movie')
    .send(movie2)
    .type('application/json')
    // .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(201, movie2);
});

it('should GET two movie in the collection', async () => {
  await request(app)
    .get('/api/v1/movie')
    .set('Accept', 'application/json')
    .set('Authorization', 'Basic c3Bhcms6dGVzdGluZzE=')
    .expect(200, [movie1, movie2]);
});


it('AUTH - should GET 401', async () => {
  await request(app)
    .get('/api/v1/movie/54f0be26ae8aba260b8f6db8')
    .set('Accept', 'application/json')
    .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
});

it('AUTH - should GET 401', async () => {
  await request(app)
    .get('/api/v1/movie')
    .set('Accept', 'application/json')
    .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
});

it('AUTH - should DELETE 401', async () => {
  await request(app)
    .delete('/api/v1/movie/54f0be26ae8aba260b8f6db8')
    .set('Accept', 'application/json')
    .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
});


it('AUTH - should GET 401', async () => {
  await request(app)
    .get('/api/v1/movie/54f0be26ae8aba260b8f6db8')
    .set('Accept', 'application/json')
    .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
});

it('AUTH - should POST 401', async () => {
  await request(app)
    .post('/api/v1/movie')
    .send(movie2)
    .type('application/json')
    .expect(401, '{"message":"Please login to view this page.","code":"server_error"}');
});
