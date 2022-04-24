/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */

const ClientError = require('../../exception/ClientError');

class CollaborationsHandler {
  constructor(CollaborationsService, PlaylistService, UsersService, validator) {
    this._CollaborationsService = CollaborationsService;
    this._PlaylistService = PlaylistService;
    this._UsersService = UsersService;
    this._validator = validator;
    this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
    this.deleteCollaborationsHandler = this.deleteCollaborationsHandler.bind(this);
  }

  async postCollaborationsHandler(request, h) {
    try {
      this._validator.validateCollaborationsPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._PlaylistService.verifyPlaylistOwner(playlistId, userId);
      await this._UsersService.getUserById(userId);

      const collaborationsId = this._CollaborationsService.addCollaborations(playlistId, credentialId);
      const response = h.response({
        status: 'success',
        message: 'Collaborations telah ditambahkan',
        data: {
          collaborationsId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf. terdapat kendala pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteCollaborationsHandler(request, h) {
    try {
      this._validator.validateCollaborationsPayload(request.payload);
      const { playlistId, userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._PlaylistService.verifyPlaylistOwner(playlistId, credentialId);
      await this._CollaborationsService.deleteCollaborations(playlistId, userId);
      return {
        status: 'success',
        message: 'Collaborations berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Maaf. terdapat kendala pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = CollaborationsHandler;
