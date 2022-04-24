exports.up = (pgm) => {
  pgm.createTable('playlist_song', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlistid: {
      type: 'VARCHAR(50)',
      notNull: true,
      unique: true,
    },
    songid: {
      type: 'VARCHAR(50)',
      notNull: true,
      unique: true,
    },
  });
  pgm.addConstraint(
    'playlist_song',
    'fk_playlist_song.playlistid_playlist.id',
    'FOREIGN KEY(playlistid) REFERENCES playlist(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'playlist_song',
    'fk_playlist_song.songid_songs.id',
    'FOREIGN KEY(songid) REFERENCES songs(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlist-song');
};
