/* eslint-disable object-curly-newline */
/* eslint-disable object-curly-spacing */
/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exception/InvarianError');
const NotFoundError = require('../../exception/NotFoundError');
const { mapDBToModelSong } = require('../../utils/song');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Data lagu Gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getSong() {
    const result = await this._pool.query('SELECT id, title, performer FROM songs');
    return result.rows.map(mapDBToModelSong);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Data lagu gagal ditampilkan, Id tidak diketahui');
    }
    return result.rows.map(mapDBToModelSong)[0];
  }

  async editSongById(id, {title, year, performer, genre, duration, albumId}) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, albumid = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Data lagu gagal diupdate, Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Data lagu gagal dihapus, Id tidak ditemukan');
    }
  }
}

module.exports = SongService;
