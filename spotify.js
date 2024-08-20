// promise based HTTP client for the browser and node.js
// this will be the crux of our API calls
const axios = require("axios");
// dotenv is a zero-dependency module that loads environment variables from a .env file into process.env
require("dotenv").config();

const getSpotifyToken = async () => async () => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  
  // 
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': `Basic` + Buffer.from(client_id + ':' + client_secret).toString('base64')
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  }
  try {
    const response = await axios.post(authOptions.url, null, {
      headers: authOptions.headers,
      paramsL authOptions.form
    });
    return response.data.acces_tokens;
  } catch (error) {
    console.log("error getting spotify token:", error);
  }
}; 

module.exports = getSpotifyToken;