const { UserPayloadSchema } = require('./schema');
const InvariantError = require('../../exception/InvarianError');

const UsersValidator = {
  validateUserPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};
module.exports = UsersValidator;
