const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios').default;

const DEFAULT_GLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

const populateLaunches = async () => {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });
    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      laucnDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };
    await saveLaunch(launch);
  }

  if (response.status !== 200) {
    console.error('Problem downloading launch data');
    throw new Error('Launch data download failed');
  }
};

const loadLaunchData = async () => {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log(';Launch data already loaded');
    return;
  } else {
    await populateLaunches();
  }
};

const findLaunch = async (filter) => {
  return await launches.findOne(filter);
};

const existsLaunchWithId = async (flightNumber) => {
  return await findLaunch({ flightNumber });
};

const getLatestFlightNumber = async () => {
  try {
    const latestLaunch = await launches.findOne().sort('-flightNumber');
    return latestLaunch ? latestLaunch.flightNumber : DEFAULT_GLIGHT_NUMBER;
  } catch (err) {
    console.error(err);
  }
};

const getAllLaunches = async (skip, limit) => {
  try {
    return await launches
      .find({}, { __v: 0, _id: 0 })
      .sort({ flightNumber: 1 })
      .skip(skip)
      .limit(limit);
  } catch (err) {
    console.error(err);
  }
};

const scheduleNewLaunch = async (launch) => {
  const planet = await planets.findOne({ keplerName: launch.target });
  if (!planet) {
    throw new Error('No matching planet found');
  }
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
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
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
  loadLaunchData,
};
