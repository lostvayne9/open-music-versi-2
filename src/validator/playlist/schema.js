const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongPlaylistPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  songId: Joi.string().required(),
});

module.exports = { PostPlaylistPayloadSchema, PostSongPlaylistPayloadSchema };
