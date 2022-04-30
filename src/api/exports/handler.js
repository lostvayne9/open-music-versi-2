const ClientError = require('../../exception/ClientError');

class ExportsHandler {
  constructor(service, validator, playlistService) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;
    this.postExportsNotesHandler = this.postExportsNotesHandler.bind(this);
  }

  async postExportsNotesHandler(request, h) {
    try {
      this._validator.validateExportsPlaylistPayload(request.payload);

      const { id: userId } = request.auth.credentials;
      const { playlistId } = request.params;
      const { targetEmail } = request.payload;

      await this._playlistService.verifyAccessPlaylist(playlistId, userId);

      const message = {
        playlistId,
        targetEmail,
      };

      await this._service.sendMessage('exports:playlist', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
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
      return response;
    }
  }
}

module.exports = ExportsHandler;
