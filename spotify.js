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
      'Authorization':
    }
  }