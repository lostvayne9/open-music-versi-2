const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlist',
    handler: handler.postPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlist',
    handler: handler.getPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlist/{id}',
    handler: handler.getPlaylistByIdHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlist/{id}',
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlist/{id}/songs',
    handler: handler.postSongPlaylistHandler,
    options:
        {
          auth: 'openmusic_jwt',
        },
  },
  {
    method: 'GET',
    path: '/playlist/{id}/songs',
    handler: handler.getSongPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlist/{id}/songs',
    handler: handler.deleteSongPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlist/{id}/activities',
    handler: handler.getPlaylistByActivitiesHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
