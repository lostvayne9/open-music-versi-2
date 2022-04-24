const InvariantError = require('../../exception/InvarianError');
const { PostPlaylistPayloadSchema, PostSongPlaylistPayloadSchema } = require('./schema');

const PlaylistValidator = {

  validatePostPlaylistPayloadSchema: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostSongPlaylistPayloadSchema: (payload) => {
    const validationResult = PostSongPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};
module.exports = PlaylistValidator;
