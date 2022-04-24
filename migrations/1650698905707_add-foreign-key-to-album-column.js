exports.up = (pgm) => {
  // membuat album baru
  pgm.sql("INSERT INTO users(id,username,password,fullname) VALUES('old_users','old_users',2,'old_users','old_users')");

  // mengubah nilai albumid
  pgm.sql("UPDATE playlist SET owner = 'old_users' WHERE owner IS NULL ");

  // memberikan constraint foreign key pada albumid terhadap kolom id dari tabel album
  pgm.addConstraint('playlist', 'fk_playlist.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // mengubah nilai albumid = old_users pada songs menjadi NULL
  pgm.sql("UPDATE playlist SET owner = NULL WHERE owner = 'old_users'");

  // menghapus album baru.
  pgm.sql("DELETE FROM users WHERE id = 'old_users'");

  // menghapus constraint fk_songs.owner_albums.id pada tabel songs
  pgm.dropConstraint('playlist', 'fk_playlist.owner_users.id');
};
