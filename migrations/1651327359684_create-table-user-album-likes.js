/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    userid: {
      type: 'varchar(50)',
      notNull: true,
    },
    albumid: {
      type: 'varchar(50)',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'user_album_likes',
    'fk_user_album_likes.userid_users.id',
    'FOREIGN KEY(userid) REFERENCES users(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'user_album_likes',
    'fk_user_album_likes.albumid_albums.id',
    'FOREIGN KEY(albumid) REFERENCES albums(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.albumid_albums.id');
  pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.userid_users.id');

  pgm.dropTable('user_album_likes');
};
