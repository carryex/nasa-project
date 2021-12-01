const launches = new Map();

let lastLaunchNumber = 100;

const launch = {
  flightNumber: 100,
  mission: 'Kepler Exploration X',
  rocket: 'Exlorer IS1',
  launchDate: new Date('December 27, 2030'),
  target: 'Kepler-442 b',
  customers: ['ZTM', 'NASA'],
  upcoming: true,
  success: true,
};

launches.set(launch.flightNumber, launch);

const existsLaunchWithId = (id) => launches.has(id);

const getAllLaunches = () => Array.from(launches.values());

const addNewLaunch = (launch) => {
  lastLaunchNumber++;
  launches.set(
    lastLaunchNumber,
    Object.assign(launch, {
      flightNumber: lastLaunchNumber,
      customers: ['ZTM', 'NASA'],
      upcoming: true,
      success: true,
    })
  );
};

const abortLaunchById = (id) => {
  const aborted = launches.get(id);
  aborted.upcoming = false;
  aborted.success = false;
  return aborted;
};

module.exports = {
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
