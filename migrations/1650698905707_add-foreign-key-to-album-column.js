exports.up = (pgm) => {
  // membuat album baru
  pgm.sql("INSERT INTO albums(id,name,year,created_at,update_at) VALUES('old_albums','old_albums',2,'old_albums','old_albums')");

  // mengubah nilai albumid
  pgm.sql("UPDATE songs SET albumid = 'old_albums' WHERE albumid IS NULL ");

  // memberikan constraint foreign key pada albumid terhadap kolom id dari tabel album
  pgm.addConstraint('songs', 'fk_songs.albumid_albums.id', 'FOREIGN KEY(albumid) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // menghapus constraint fk_songs.owner_albums.id pada tabel songs
  pgm.dropConstraint('songs', 'fk_songs.albumid_albums.id');

  // mengubah nilai albumid = old_albums pada songs menjadi NULL
  pgm.sql("UPDATE songs SET albumid = NULL WHERE albumid = 'old_albums'");

  // menghapus album baru.
  pgm.sql("DELETE FROM albums WHERE id = 'old_albums'");
};
