/* eslint-disable no-underscore-dangle */

const ClientError = require('../../exception/ClientError');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
    this.PostAuthenticationsHandler = this.PostAuthenticationsHandler.bind(this);
    this.PutAuthenticationsHandler = this.PutAuthenticationsHandler.bind(this);
    this.DeleteAuthenticationsHandler = this.DeleteAuthenticationsHandler.bind(this);
  }

  async PostAuthenticationsHandler(request, h) {
    try {
      this._validator.validatePostAuthenticationsPayload(request.payload);
      const { username, password } = request.payload;
      const id = await this._usersService.verifyUserCredential(username, password);

      const accessToken = this._tokenManager.generateAccessToken({ id });
      const refreshToken = this._tokenManager.generateRefreshToken({ id });
      await this._authenticationsService.addRefreshToken(refreshToken);

      const response = h.response({
        status: 'success',
        message: 'Authentications berhasil ditambahkan',
        data: {
          accessToken,
          refreshToken,
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
        message: 'Maaf, terdapat kendala pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async PutAuthenticationsHandler(request, h) {
    try {
      this._validator.validatePutAuthenticationsPayload(request.payload);
      const { refreshToken } = request.payload;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

      const accessToken = this._tokenManager.generateAccessToken({ id });

      return {
        status: 'success',
        message: 'Akses token diperbarui',
        data: {
          accessToken,
        },
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
        message: 'Maaf, terdapat kendala pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async DeleteAuthenticationsHandler(request, h) {
    try {
      this._validator.validateDeleteAuthenticationsPayload(request.payload);
      const { refreshToken } = request.payload;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      await this._authenticationsService.deleteRefreshToken(refreshToken);
      return {
        status: 'success',
        message: 'Token berhasil dihapus',
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
        message: 'Maaf, terdapat kendala pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AuthenticationsHandler;
