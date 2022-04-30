exports.up = (pgm) => {
  // menambahkan coverurl pada tabel albums
  pgm.addColumn('albums', {
    coverurl: {
      type: 'VARCHAR(255) ',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'coverurl');
};
