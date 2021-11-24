const { rejects } = require('assert');
const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

const habitablePlanets = [];

const isHabitablePlanet = (planet) =>
  planet['koi_disposition'] === 'CONFIRMED' &&
  planet['koi_insol'] > 0.36 &&
  planet['koi_insol'] < 1.11 &&
  planet['koi_prad'] < 1.6;

const parser = parse({
  comment: '#',
  columns: true,
});

const loadPlanetsData = () =>
  new Promise((resolve, reject) =>
    fs
      .createReadStream(path.join(__dirname, './kepler_data.csv'))
      .pipe(parser)
      .on('data', (data) => {
        if (isHabitablePlanet(data)) habitablePlanets.push(data);
      })
      .on('error', (err) => reject(err))
      .on('end', () => {
        console.log(`${habitablePlanets.length} habitable planets found!`);
        resolve();
      })
  );

module.exports = { planets: habitablePlanets, loadPlanetsData };
