require.("dotenv").config();  // Load environment variables from .env file
const clientID = process.env.SPOTIFY_CLIENT_ID;

const code = undefined;  // The authorization code from the user

if(!code) {
  redirectToAuthCodeFlow(clientID);
} else { 
  const 
}