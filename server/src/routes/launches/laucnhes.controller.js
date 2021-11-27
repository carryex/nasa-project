const {
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
} = require('../../models/launches.modes');

const httpGetAllLaunches = (req, res) =>
  res.status(200).json(Array.from(getAllLaunches()));

const httpAddNewLaunch = (req, res) => {
  const launch = req.body;
  if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target)
    return res.status(400).json({
      error: 'Missing required launch property',
    });

  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate))
    return res.status(400).json({
      error: 'Invalid launch Date',
    });

  addNewLaunch(launch);
  return res.status(201).json(launch);
};

const httpAbortLaunch = (req, res) => {
  const id = Number(req.params.id);

  if (!existsLaunchWithId(id))
    return res.status(404).json({
      error: 'Launch not found',
    });

  const aborted = abortLaunchById(id);
  return res.status(200).json(aborted);
};

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
