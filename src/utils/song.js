/* eslint-disable camelcase */
const mapDBToModelSong = ({
  id, title, year, performer, genre, duration, albumid, created_at, update_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: albumid,
  createAt: created_at,
  updatedAt: update_at,
});

module.exports = { mapDBToModelSong };
