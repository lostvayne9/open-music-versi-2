const Joi = require('joi');

const tahunIni = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(tahunIni)
    .required(),
});

module.exports = AlbumPayloadSchema;
