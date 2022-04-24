/* eslint-disable max-len */
const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, {
    authenticationsService, tokenManager, usersService, validator,
  }) => {
    const authenticationsHandler = new AuthenticationsHandler(authenticationsService, tokenManager, usersService, validator);
    server.route(routes(authenticationsHandler));
  },
};
