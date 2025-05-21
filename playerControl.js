// playerControl.js
module.exports = (app, spotifyApi, tokens) => {
  app.get('/spotify/play/:id/:track', async (req, res) => {
    spotifyApi.setAccessToken(tokens.ACCESS_TOKEN);
    await spotifyApi.play({
      device_id: req.params.id,
      uris: [`${req.params.track}`]
    });
    res.send("Track started playing");
  });

  app.get('/spotify/play/:id', async (req, res) => {
    spotifyApi.setAccessToken(tokens.ACCESS_TOKEN);
    await spotifyApi.play({
      device_id: req.params.id
    });
    res.send("Playback resumed");
  });

  app.get('/spotify/pause/:id', async (req, res) => {
    spotifyApi.setAccessToken(tokens.ACCESS_TOKEN);
    await spotifyApi.pause({ device_id: req.params.id });
    res.send("Playback paused");
  });
};
