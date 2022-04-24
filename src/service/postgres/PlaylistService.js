/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exception/InvarianError');
const NotFoundError = require('../../exception/NotFoundError');
const AuthorizationError = require('../../exception/AuthorizationError');
const { mapDBToModelPlaylist } = require('../../utils/playlist');
const { mapDBToModelPlaySong } = require('../../utils/playSong');

class PlaylistService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, credentialId: owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist VALUES($1,$2,$3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist-song VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async addPlaylistActivities(playlistId, userId, songId, Action) {
    const id = `Activities-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      Text: 'INSERT INTO playsong_activities VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
      values: [id, playlistId, songId, userId, Action, time],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menyimpan activity');
    }

    return result.rows[0].id;
  }

  async GetPlaylist(owner) {
    const query = {
      text: 'SELECT playlist.*, users.username FROM playlist LEFT JOIN users ON users.id = playlist.owner LEFT JOIN playlist_collaborations ON playlist_collaboration.playlistid = playlist.id WHERE playlist_collaboration.userid = $1 OR playlist.owner = $1',
      values: [owner],
    };
    const result = await this._pool.query(query);

    return result.rows.map(mapDBToModelPlaylist);
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ada');
    }

    return result.rows[0];
  }

  async getPlaylistSong(playlistId) {
    const query = {
      text: 'SELECT playlist.*, users.username, songs.id, songs.title, song.performer FROM playlist LEFT JOIN playlist_song ON playlist_song.playlistid = playlist.id LEFT JOIN songs ON songs.id = playlist_song.songid LEFT JOIN users ON users.id = playlist.owner WHERE playlist.id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const song = result.rows.map(mapDBToModelPlaySong);
    const result2 = result.rows.map(mapDBToModelPlaylist)[0];

    return { ...result2, song };
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: 'SELECT users.username songs.title, playsong_activities.action, playsong_activities.time FROM playsong_activities LEFT JOIN playlist ON playsong_activities.playlistid = playlist.id LEFT JOIN songs ON playsong_activities.songid = songs.id LEFT JOIN users ON playsong_activities.userid = users.id WHERE playlist.id = $1 ',
      values: [playlistId],
    };

    const result = this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist tidak ada');
    }

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async deleteSongFromPlaylist(playlistId, SongId) {
    const query = {
      text: 'DELETE FROM playlist_song WHERE playlistid = $1 AND songid = $2 RETURNING id',
      values: [playlistId, SongId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT *FROM playlist WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ada');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak memiliki akses');
    }
  }

  async verifyAccessPlaylist(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._CollaborationsService.verifyCollaborations(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistService;
