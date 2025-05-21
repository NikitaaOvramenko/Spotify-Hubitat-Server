
require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = 4003;


const tokens = {
  ACCESS_TOKEN: null,
  REFRESH_TOKEN: null
};


const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URL
});


app.get('/spotify/login', async (req, res) => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private'
  ];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Callback route
app.get('/spotify/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    tokens.ACCESS_TOKEN = access_token;
    tokens.REFRESH_TOKEN = refresh_token;

    res.send('Spotify authentication successful!');
  } catch (err) {
    console.error('Error getting tokens:', err);
    res.send('Authentication failed.');
  }
});

// 🔗 Import and pass app, tokens, and spotifyApi to other modules
require('./db')(app, spotifyApi, tokens);
require('./playerControl')(app, spotifyApi, tokens);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
