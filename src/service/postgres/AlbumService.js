/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exception/InvarianError');
const NotFoundError = require('../../exception/NotFoundError');
const { mapDBToModelAlbum } = require('../../utils/album');

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1,$2,$3,$4,$5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Data album gagal ditambahkan');
    }
    await this._cacheService.delete('albums');
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    try {
      const result = await this._cacheService.get(`albums:${id}`);
      return { album: JSON.parse(result), isCache: 1 };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM albums where id = $1',
        values: [id],
      };
      const { rows } = await this._pool.query(query);
      if (rows.length === 0) {
        throw new NotFoundError('Data album tidak ditemukan');
      }

      await this._cacheService.set(`albums:${id}`, JSON.stringify(rows[0]));

      return { album: { ...rows[0] } };
    }
  }

  async putAlbumById(id, { name, year }) {
    const updateAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums set name =$1, year =$2, update_at =$3 WHERE id = $4 RETURNING id',
      values: [name, year, updateAt, id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Data gagal diupdate, Id tidak ditemukan');
    }

    await this._cacheService.delete(`albums:${id}`);
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums where id =$1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Data gagal dihapus, Id tidak ditemukan');
    }

    await this._cacheService.delete(`albums:${id}`);
  }

  async getSongInAlbum(id) {
    try {
      const result = await this._cacheService.get(`song-albums:${id}`);
      return { song: JSON.parse(result), isCache: 1 };
    } catch (error) {
      const query = {
        text: 'SELECT id,title,performer, FROM songs WHERE albumId = $1',
        values: [id],
      };

      const { result } = await this._pool.query(query);
      const mapped = result.rows.map(mapDBToModelAlbum)[0];

      await this._cacheService.set(`song-albums:${id}`, JSON.stringify(mapped));

      return { song: { ...mapped } };
    }
  }
  // Cover Album

  async addCoverAlbum(albumid, coverurl) {
    const query = {
      text: 'UPDATE albums SET coverurl = $2 WHERE id = $1',
      values: [albumid, coverurl],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Cover Album gagal ditambahkan');
    }
  }

  // album likes
  async addLikeAlbums(userid, albumid) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE userid = $1 AND albumid = $2 ',
      values: [userid, albumid],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      await this.userLike(userid, albumid);
    } else {
      await this.userDislike(userid, albumid);
    }

    await this._cacheService.delete(`likes:${albumid}`);
  }

  async userLike(userid, albumid) {
    const query = {
      text: 'INSERT INTO user_album_likes (id,userid,albumid) VALUES ($1,$2,$3)',
      values: [nanoid(16), userid, albumid],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Like album gagal ditambahkan');
    }
  }

  async userDislike(userid, albumid) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE userid = $1 AND albumid = $2',
      values: [userid, albumid],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Like album gagal dihapus');
    }
  }

  async getLikeAlbum(albumid) {
    try {
      const result = await this._cacheService.get(`likes:${albumid}`);
      return { likes: JSON.parse(result), isCache: 1 };
    } catch (error) {
      const query = {
        text: 'SELECT userid FROM user_album_likes where albumid = $1',
        values: [albumid],
      };

      const { result } = await this._pool.query(query);

      await this._cacheService.set(`likes:${albumid}`, JSON.stringify(result));

      return { likes: result };
    }
  }
}

module.exports = AlbumService;
