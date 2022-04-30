exports.up = (pgm) => {
  pgm.createTable('playlist_collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primariKey: true,
    },
    playlistid: {
      type: 'VARCHAR(50)',
      notNull: true,

    },
    userid: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('playlist_collaborations', 'unique_playlistid_and_userid', 'UNIQUE(playlistid, userid)');

  pgm.addConstraint(
    'playlist_collaborations',
    'fk_playlist_collaborations.playlistid_playlist.id',
    'FOREIGN KEY(playlistid) REFERENCES playlist(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'playlist_collaborations',
    'fk_playlist_collaborations.userid_users.id',
    'FOREIGN KEY(userid) REFERENCES users(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_collaborations');
};
