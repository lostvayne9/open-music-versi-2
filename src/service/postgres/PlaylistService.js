/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exception/InvarianError');
const NotFoundError = require('../../exception/NotFoundError');
const AuthorizationError = require('../../exception/AuthorizationError');
const ClientError = require('../../exception/ClientError');

class PlaylistService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, credentialId: owner }) {
    const id = `playlist_${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist VALUES ( $1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async GetPlaylist(owner) {
    const query = {
      text: 'SELECT playlist.id, playlist.name, users.username FROM playlist LEFT JOIN users ON users.id = playlist.owner LEFT JOIN playlist_collaborations ON playlist_collaborations.playlistid = playlist.id WHERE users.id = $1 OR playlist_collaborations.userid = $1',
      values: [owner],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async getPlaylistById({ playlistId: id }) {
    const query = {
      text: 'SELECT playlist.id, playlist.name, users.username FROM playlist LEFT JOIN users ON users.id = playlist.owner WHERE playlist.id = $1 ',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ada');
    }

    return result.rows[0];
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

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
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
      const id = playlistId;
      const owner = userId;

      await this.verifyPlaylistOwner(id, owner);
    } catch (error) {
      if (error instanceof ClientError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborations(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  // -----------------
  async addSongToPlaylist(playlistId, songId) {
    const id = `playlistSong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_song VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
    return result.rows[0].id;
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

  async getPlaylistSong(playlistId) {
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs LEFT JOIN playlist_song ON songs.id = playlist_song.songid  WHERE playlist_song.playlistid = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ada');
    }

    return result.rows;
  }

  async getSongsByPlaylistId(playlistId) {
    const query = {
      text: `SELECT playlist.id, playlist.name, users.username
      FROM playlist
      LEFT JOIN users
      ON playlist.owner = users.id
      WHERE playlist.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  // ------
  async addPlaylistActivities(playlistId, songId, userId, Action) {
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

  async getPlaylistActivities(playlistId, owner) {
    const query = {
      text: 'SELECT users.username songs.title, playsong_activities.action, playsong_activities.time FROM playsong_activities JOIN playlist ON playsong_activities.playlistid = playlist.id JOIN songs ON playsong_activities.songid = songs.id JOIN users ON users.id = playsong_activities.userid LEFT JOIN playlist_collaborations ON playlist_collaborations.playlistid = playsong_activities.id WHERE playlist.id = $1 AND playlist.owner = $2 OR playlist_collaborations.userid = $2 ORDER BY playsong_activities.time ASC ',
      values: [playlistId, owner],
    };

    const result = this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ada');
    }
    return result.rows;
  }
}

module.exports = PlaylistService;
