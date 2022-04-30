/* eslint-disable no-console */
const ClientError = require('../../exception/ClientError');

/* eslint-disable no-underscore-dangle */
class AlbumHandler {
  constructor(service, validator, storageService, uploadValidator) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    this._uploadValidator = uploadValidator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);

    // bind upload cover album
    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);

    // bind likes
    this.postLikeAlbumHandler = this.postLikeAlbumHandler.bind(this);
    this.getLikeAlbumHandler = this.postLikeAlbumHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;

      const AlbumId = await this._service.addAlbum({ name, year });

      const response = h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId: AlbumId,
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
        status: 'fail',
        message: 'Maaf, terdapat kendala pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { album, isCache = 0 } = await this._service.getAlbumById(id);

      const response = h.response({
        status: 'success',
        data: {
          album,
        },
      });
      response.code(200);
      if (isCache) response.header('X-Data-Source', 'cache');
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

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;
      await this._service.putAlbumById(id, request.payload);
      return {
        status: 'success',
        message: 'Data berhasil diperbarui',
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

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);
      return {
        status: 'success',
        message: 'Album Berhasil dihapus',
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

  // upload cover album

  async postUploadImageHandler(request, h) {
    try {
      const { cover } = request.payload;
      this._uploadValidator.validateImageHeaders(cover.hapi.headers);

      const filename = await this._storageService.writeFile(cover, cover.hapi);

      const { id } = request.params;

      const path = `http://${process.env.HOST}:${process.env.PORT}/albums/images/${filename}`;
      await this._service.addCoverAlbum(id, path);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
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

  // like

  async postLikeAlbumHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._service.getAlbumById(id);
      await this._service.addLikeAlbums(userId, id);
      const response = h.response({
        status: 'success',
        message: 'Like album berhasil ditambahkan ke daftar ',
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

  async getLikeAlbumHandler(request, h) {
    try {
      const { albumid } = request.params;
      const { likes, isCache = 0 } = await this._service.getLikeAlbum(albumid);

      const response = h.response({
        status: 'success',
        data: {
          likes: likes.length,
        },
      });
      response.code(200);

      if (isCache) response.header('X-Data-Source', 'cache');
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
}

module.exports = AlbumHandler;
