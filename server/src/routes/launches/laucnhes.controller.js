const {
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
} = require('../../models/launches.model');

const { getPagination } = require('../../services/query');

const httpGetAllLaunches = async (req, res) => {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
};

const httpAddNewLaunch = async (req, res) => {
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

  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
};

const httpAbortLaunch = async (req, res) => {
  const id = Number(req.params.id);

  if (!(await existsLaunchWithId(id)))
    return res.status(404).json({
      error: 'Launch not found',
    });

  const aborted = abortLaunchById(id);
  if (!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted',
    });
  }
  return res.status(200).json({ ok: true });
};

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
