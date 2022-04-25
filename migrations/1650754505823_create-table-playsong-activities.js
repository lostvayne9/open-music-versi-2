exports.up = (pgm) => {
  pgm.createTable('playsong_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlistid: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    songid: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    userid: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    action: {
      type: 'TEXT',
      notNull: true,
    },
    time: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint(
    'playsong_activities',
    'fk_playsong_activities.playlistid_playlist.id',
    'FOREIGN KEY(playlistid) REFERENCES playlist(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playsong_activities');
};
