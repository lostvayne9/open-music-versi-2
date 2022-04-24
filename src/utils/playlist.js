const mapDBToModelPlaylist = ({
  id, name, owner, username,
}) => ({
  id,
  name,
  owner,
  username,
});

module.exports = { mapDBToModelPlaylist };
