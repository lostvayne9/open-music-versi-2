/* eslint-disable max-len */
const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {
    CollaborationsService, PlaylistService, UsersService, validator,
  }) => {
    const collaborationsHandler = new CollaborationsHandler(CollaborationsService, PlaylistService, UsersService, validator);
    server.route(routes(collaborationsHandler));
  },
};
