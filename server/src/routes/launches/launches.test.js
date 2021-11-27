const request = require('supertest');
const app = require('../../app');

describe('Test GET /launches', () => {
  test('It should response with 200 success', async () => {
    await request(app)
      .get('/launches')
      .expect('Content-Type', /json/)
      .expect(200);
  });
});

describe('Test POST /launches', () => {
  const launchDataWithoutDate = {
    mission: 'USS Enterprise',
    rocket: 'NCC 17-01-D',
    target: 'Kepler-186 f',
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
      .post('/launches')
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
      .post('/launches')
      .send(launchDataWithoutDate)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: 'Missing required launch property',
    });
  });

  test('It sould catch invalid dates', async () => {
    const response = await request(app)
      .post('/launches')
      .send(launchDataWithInvalidDate)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: 'Invalid launch Date',
    });
  });
});
