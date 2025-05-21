// db.js
module.exports = (app, spotifyApi, tokens) => {
  app.get('/spotify/my-playlists', async (req, res) => {
    try {
      if (!tokens.ACCESS_TOKEN) {
        return res.status(401).send('You must authenticate first');
      }

      spotifyApi.setAccessToken(tokens.ACCESS_TOKEN);
      const data = await spotifyApi.getUserPlaylists();

      const playlists = data.body.items.map(p => ({
        name: p.name,
        id: p.id
      }));

      res.json(playlists);
    } catch (err) {
      console.error('Error fetching user playlists:', err);
      res.status(500).send('Could not get playlists');
    }
  });

  app.get('/spotify/:playlist_id/tracks', async (req, res) => {
    spotifyApi.setAccessToken(tokens.ACCESS_TOKEN);
    const data = await spotifyApi.getPlaylistTracks(req.params.playlist_id);

    const tracks = data.body.items.map(item => ({
      artists: item.track.artists.map(a => a.name).join(', '),
      songName: item.track.name,
      uri: item.track.uri,
      id: item.track.id
    }));

    res.json(tracks);
  });

  app.get('/spotify/devices', async (req, res) => {
    spotifyApi.setAccessToken(tokens.ACCESS_TOKEN);
    const data = await spotifyApi.getMyDevices();
    res.json(data.body);
  });
};
