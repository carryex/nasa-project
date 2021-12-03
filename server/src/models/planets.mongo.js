const mongoose = require('mongoose');

const planetsSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('Planet', planetsSchema);
