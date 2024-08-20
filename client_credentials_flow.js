const axios = require("axios");
require("dotenv").config();

const getSpotifyToken = async () => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "client_credentials",
    },
    json: true,
  };

  try {
    const response = await axios.post(authOptions.url, null, {
      headers: authOptions.headers,
      params: authOptions.form,
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting Spotify token:", error);
  }
};

module.exports = getSpotifyToken;
