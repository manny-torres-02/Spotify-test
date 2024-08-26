const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

console.log(`API Key: ${clientId}`);

if (!clientId) {
  throw new Error("Missing SPOTIFY_CLIENT_ID environment variable");
}

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  (async () => {
    try {
      const accessToken = await getAccessToken(clientId, code);
      const profile = await fetchProfile(accessToken);
      populateUI(profile);

      // Fetch top artists
      const topArtists = await fetchTopArtists(accessToken);
      populateTopArtistsUI(topArtists);
      const topSongs = await fetchTopSongs(accessToken);
      populateTopSongsUI(topSongs);
    } catch (error) {
      console.error("Error during authentication or fetching data:", error);
    }



  })();
}

export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("scope", "user-read-private user-read-email user-top-read"); // Added user-top-read to scope
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function getAccessToken(clientId: string, code: string): Promise<string> {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("code_verifier", verifier!);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const { access_token } = await result.json();
  return access_token;
}

async function fetchProfile(token: string): Promise<any> {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

async function fetchTopArtists(token: string): Promise<any> {
  const result = await fetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

async function fetchTopSongs(token: string): Promise<any> {
  const result = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(result);
  return await result.json();
}

function populateUI(profile: any) {
  document.getElementById("displayName")!.innerText = profile.display_name;
  if (profile.images[0]) {
    const profileImage = new Image(100, 100);
    profileImage.src = profile.images[0].url;
    document.getElementById("avatar")!.appendChild(profileImage);
  }
  document.getElementById("id")!.innerText = profile.id;
  document.getElementById("email")!.innerText = profile.email;
  document.getElementById("uri")!.innerText = profile.uri;
  document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url")!.innerText = profile.href;
  document.getElementById("url")!.setAttribute("href", profile.href);
  document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';
  // console.log(profile);
}

function populateTopArtistsUI(data: any) {
  const topArtistsContainer = document.getElementById("topArtists")!;
  topArtistsContainer.innerHTML = "";

  data.items.forEach((artist: any) => {
    const artistElement = document.createElement("div");
    artistElement.innerText = artist.name;
    topArtistsContainer.appendChild(artistElement);
  });
}

function populateTopSongsUI(data: any ) {
  const topSongsContainer = document.getElementById("topSongs")!;
  topSongsContainer.innerHTML = "";
  console.log(data);

  data.items.forEach((song: any) => {
    const songElement = document.createElement("div");


    const albumImage = document.createElement("img")
    albumImage.src = song.album.images[0]?.url ?? ''; 
    albumImage.alt = song.name; 
    albumImage.classList.add("w-16", "h-16", "mr-4");  // Add styles for size and spacing
    
    const songName = document.createElement("div");
    songElement.innerText = song.name;
    

    songElement.appendChild(albumImage); // Add the image before the text
    songElement.appendChild(songName); // Add the text after the image

    topSongsContainer.appendChild(songElement);
  });
}