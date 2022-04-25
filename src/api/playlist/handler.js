/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exception/ClientError');

class PlaylistHandler {
  constructor(playlistService, songService, validator) {
    this._playlistService = playlistService;
    this._songService = songService;
    this._validator = validator;

    // playlist
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    //--
    // this.getPlaylistByIdHandler = this.getPlaylistByIdHandler.bind(this);
    this.postSongPlaylistHandler = this.postSongPlaylistHandler.bind(this);
    this.getSongPlaylistHandler = this.getSongPlaylistHandler.bind(this);
    this.deleteSongPlaylistHandler = this.deleteSongPlaylistHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePostPlaylistPayloadSchema(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      const playlistId = await this._playlistService.addPlaylist({ name, credentialId });

      const response = h.response({
        status: 'success',
        message: 'Lagu  berhasil ditambahkan',
        data: {
          playlistId,
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
        message: 'Maaf terdapat kendala pada server',
      });
      response.code(500);
      return response;
    }
  }

  async getPlaylistHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._playlistService.GetPlaylist(credentialId);
      return {
        status: 'success',
        data: {
          playlists,
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
        message: 'Maaf terdapat kendala pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistOwner(id, credentialId);
      await this._playlistService.deletePlaylistById(id);
      return {
        status: 'success',
        message: 'Playlist berhasil di hapus',
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
        message: 'Maaf terdapat kendala pada server',
      });
      response.code(500);
      return response;
    }
  }

  //-----
  /*
  async getPlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyAccessPlaylist(id, credentialId);
      const playlist = await this._playlistService.getPlaylistById(id);
      return {
        status: 'success',
        data: {
          playlist,
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
        message: 'Maaf terdapat kendala pada server',
      });
      response.code(500);
      return response;
    }
  } * */
  // -- playsong
  async postSongPlaylistHandler(request, h) {
    try {
      const { songId } = request.payload;
      const { id: playlistId } = request.params;
      this._validator.validatePostSongPlaylistPayloadSchema({ playlistId, songId });
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyAccessPlaylist({ playlistId, credentialId });
      await this._songService.getSongById(songId);
      const SongId = await this._playlistService.addSongToPlaylist(playlistId, songId);
      await this._playlistService.addPlaylistActivities(playlistId, songId, credentialId, 'add');

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan',
        data:
          SongId,
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
        message: 'Maaf terdapat kendala pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongPlaylistHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;
      await this._playlistService.verifyAccessPlaylist(playlistId, credentialId);
      const playlist = await this._playlistService.getSongsByPlaylistId(playlistId);
      const songs = await this._playlistService.getPlaylistSong(playlistId);
      return {
        status: 'success',
        data: {
          playlist: {
            id: playlist.id,
            name: playlist.name,
            username: playlist.username,
            songs,
          },
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
        message: 'Maaf terdapat kendala pada server',
      });
      response.code(500);
      return response;
    }
  }

  async deleteSongPlaylistHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      this._validator.validatePostSongPlaylistPayloadSchema(request.payload);
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyAccessPlaylist(playlistId, credentialId);
      await this._playlistService.deleteSongFromPlaylist(playlistId, songId);
      await this._playlistService.addPlaylistActivities(playlistId, songId, credentialId, 'delete');

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus',
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
        message: 'Maaf terdapat kendala pada server',
      });
      response.code(500);
      return response;
    }
  }

  // ------
  async getPlaylistByActivitiesHandler(request, h) {
    try {
      let activities = null;
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this.playlistService.verifyAccessPlaylist(id, credentialId);

      activities = await this._playlistService.getPlaylistActivities(id, credentialId);
      return {
        status: 'success',
        data: {
          playlistId: id,
          activities,
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
        status: 'fail',
        message: 'Maaf. terdapat kendala pada server',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = PlaylistHandler;
