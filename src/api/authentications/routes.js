const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.PostAuthenticationsHandler,
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.PutAuthenticationsHandler,
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.DeleteAuthenticationsHandler,
  },
];
module.exports = routes;
