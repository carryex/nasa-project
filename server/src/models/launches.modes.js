const launches = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_GLIGHT_NUMBER = 100;

const existsLaunchWithId = async (flightNumber) => {
  return await launches.findOne({ flightNumber });
};

const getLatestFlightNumber = async () => {
  try {
    const latestLaunch = await launches.findOne().sort('-flightNumber');
    return latestLaunch ? latestLaunch.flightNumber : DEFAULT_GLIGHT_NUMBER;
  } catch (err) {
    console.error(err);
  }
};

const getAllLaunches = async () => {
  try {
    return await launches.find({}, { __v: 0, _id: 0 });
  } catch (err) {
    console.error(err);
  }
};

const scheduleNewLaunch = async (launch) => {
  const flightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    upcoming: true,
    success: true,
    customers: ['ZTM', 'NASA'],
    flightNumber,
  });

  await saveLaunch(newLaunch);
};

const saveLaunch = async (launch) => {
  try {
    const planet = await planets.findOne({ keplerName: launch.target });
    if (!planet) {
      throw new Error('No matching planet found');
    }
    await launches.findOneAndUpdate(
      {
        flightNumber: launch.flightNumber,
      },
      launch,
      { upsert: true }
    );
  } catch (err) {
    console.error(err);
  }
};

const abortLaunchById = async (flightNumber) => {
  const aborted = await launches.updateOne(
    { flightNumber },
    { upcoming: false, success: false }
  );

  return aborted.modifiedCount === 1;
};

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
