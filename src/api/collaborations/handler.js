/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */

const ClientError = require('../../exception/ClientError');

class CollaborationsHandler {
  constructor(collaborationsService, playlistService, usersService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistService = playlistService;
    this._usersService = usersService;
    this._validator = validator;

    this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
    this.deleteCollaborationsHandler = this.deleteCollaborationsHandler.bind(this);
  }

  async postCollaborationsHandler(request, h) {
    try {
      this._validator.validateCollaborationsPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._usersService.getUserById(userId);
      await this._playlistService.getPlaylistById(playlistId);

      await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
      const collaborationsId = this._collaborationsService.addCollaboration(playlistId, userId);
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

      await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
      await this._collaborationsService.deleteCollaboration(playlistId, userId);
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
