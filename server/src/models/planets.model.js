const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

const planets = require('./planets.mongo');

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
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) await savePlanet(data);
      })
      .on('error', (err) => reject(err))
      .on('end', async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets found`);
        resolve();
      })
  );

const getAllPlanets = async () => await planets.find({}, { __v: 0, _id: 0 });

const savePlanet = async (planet) => {
  try {
    const keplerName = planet.kepler_name;
    await planets.updateOne({ keplerName }, { keplerName }, { upsert: true });
  } catch (err) {
    console.error(`Could not save planet ${keplerName}`);
  }
};

module.exports = { getAllPlanets, loadPlanetsData };
