const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /launches', () => {
    test('It should response with 200 success', async () => {
      await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('Test POST /launches', () => {
    const launchDataWithoutDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 17-01-D',
      target: 'Kepler-1410 b',
    };

    const completeLaucnData = {
      ...launchDataWithoutDate,
      launchDate: 'January 4, 2028',
    };

    const launchDataWithInvalidDate = {
      ...launchDataWithoutDate,
      launchDate: 'zoom',
    };

    test('It should response with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaucnData)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaucnData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test('It sould catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });

    test('It sould catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch Date',
      });
    });
  });
});
