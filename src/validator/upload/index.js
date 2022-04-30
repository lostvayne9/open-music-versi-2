const ImageHeadersSchema = require('./schema');
const InvariantError = require('../../exception/InvarianError');

const UploadValidator = {
  validateImageHeaders: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadValidator;
