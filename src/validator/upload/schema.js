const Joi = require('joi');

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('image/png', 'image/avif', 'image/gif', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp').required(),
}).unknown();

module.exports = ImageHeadersSchema;
