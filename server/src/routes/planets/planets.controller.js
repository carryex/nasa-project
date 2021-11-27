const { getAllPlanets } = require('../../models/planets.model');

const httpGetAllPlanets = (req, res) => res.status(200).json(getAllPlanets());

module.exports = { httpGetAllPlanets };
