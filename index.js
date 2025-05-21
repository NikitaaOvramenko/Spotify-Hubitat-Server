require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = 4003;

let ACCESS_TOKEN = null;
let REFRESH_TOKEN = null;


const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URL
});

app.get('/spotify/login' ,async(req,res) => {
    const scopes = ['user-read-private','user-read-email','user-read-playback-state','user-modify-playback-state','playlist-read-private'];
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
    
})

app.get('/spotify/callback' , async(req,res) => {
    console.log('Query received:', req.query);
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token, expires_in } = data.body;

        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        ACCESS_TOKEN = access_token;
        REFRESH_TOKEN = refresh_token;

        res.send('Spotify authentication successful! You can now control playback.');
        // Optionally store tokens in memory or DB for use from Hubitat
    } catch (err) {
        console.error('Error getting tokens:', err);
        res.send('Error during authentication');
    }


})

app.get('/spotify/my-playlists', async (req, res) => {
    try {
        if (!ACCESS_TOKEN) {
            return res.status(401).send('You must authenticate first');
        }

        spotifyApi.setAccessToken(ACCESS_TOKEN);

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


app.get('/spotify/:playlist_id/tracks',async (req,res)=>{
    spotifyApi.setAccessToken(ACCESS_TOKEN);
    const data = await spotifyApi.getPlaylistTracks(req.params.playlist_id);
    const tracks = data.body.items.map(item => ({
        artists: item.track.artists,
        songName: item.track.name,
        uri: item.track.uri,
        id: item.track.id
    }) );

    res.json(tracks);
})


app.get('/spotify/devices', async(req,res) =>{
    spotifyApi.setAccessToken(ACCESS_TOKEN);
    const data = spotifyApi.getMyDevices();
    const devices = (await data).body;
    res.json(devices);
})

app.get('/spotify/play/:id/:track',async (req,res)=> {

    spotifyApi.setAccessToken(ACCESS_TOKEN);
    await spotifyApi.play({device_id:`${req.params.id}`, uris:[`${req.params.track}`]});
    res.send("Track started playing");
})

app.get('/spotify/play/:id',async (req,res)=> {

    spotifyApi.setAccessToken(ACCESS_TOKEN);
    await spotifyApi.play({device_id:`${req.params.id}`});
    res.send("Track resume playing !");
})

app.get('/spotify/pause/:id',async (req,res) => {
    spotifyApi.setAccessToken(ACCESS_TOKEN);
    await spotifyApi.pause(device_id=`${req.params.id}`);

})



app.listen(port);