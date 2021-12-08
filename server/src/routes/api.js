const express = require('express');

const planetsRouter = require('./planets/planets.router');
const laucnhesRouter = require('./launches/launches.router');

const api = express();

api.use('/planets', planetsRouter);
api.use('/launches', laucnhesRouter);

module.exports = api;
