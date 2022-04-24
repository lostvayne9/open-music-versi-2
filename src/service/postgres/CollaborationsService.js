/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exception/InvarianError');

class CollaborationService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collaborations - ${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_collaborations VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, userId],
    };
    const result = this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Data Collaborations gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE playlist_collaborations WHERE playlistid = $1 AND userid = $2 RETURNING id',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyCollaborations(playlistId, userId) {
    const query = {
      text: 'SELECT *FROM playlist_collaborations WHERE playlistid = $1 AND userid = $2',
      values: [playlistId, userId],
    };

    const result = this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Verifikasi Collaborations gagal');
    }
  }
}

module.exports = CollaborationService;
