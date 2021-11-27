const express = require('express');
const laucnhesRouter = express.Router();

const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
} = require('./laucnhes.controller');

laucnhesRouter.get('/', httpGetAllLaunches);
laucnhesRouter.post('/', httpAddNewLaunch);
laucnhesRouter.delete('/:id', httpAbortLaunch);

module.exports = laucnhesRouter;
