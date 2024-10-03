const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

console.log(`API Key: ${clientId}`);

if (!clientId) {
  throw new Error("Missing SPOTIFY_CLIENT_ID environment variable");
}

document.addEventListener("DOMContentLoaded", async () => {
  // Check if user data is already saved in session storage
  const userData = loadFromSessionStorage("userData");
  const topArtistsData = loadFromSessionStorage("topArtists");
  const topSongsData = loadFromSessionStorage("topSongs");
  const accessToken = sessionStorage.getItem("accessToken");

  // Check if user data is already saved in session storage
  if (userData && topArtistsData && topSongsData && accessToken) {
    console.log("User data loaded from session storage:", userData);
    populateUI(userData); // Populate UI with user profile data from session storage
    populateTopArtistsUI(topArtistsData); // Populate UI with top artists from session storage
    populateTopSongsUI(topSongsData); // Populate UI with top songs from session storage
  } else {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      redirectToAuthCodeFlow(clientId); // Redirect to get authorization code
    } else {
      try {
        // Fetch the access token using the authorization code
        const accessToken = await getAccessToken(clientId, code);
        sessionStorage.setItem("accessToken", accessToken); // Save the access token for future use

        // Fetch the user profile using the access token
        const profile = await fetchProfile(accessToken);
        saveToSessionStorage("userData", profile); // Save profile to session storage
        populateUI(profile); // Update the UI with fetched profile

        // Fetch and save top artists
        const topArtists = await fetchTopArtists(accessToken);
        saveToSessionStorage("topArtists", topArtists); // Save top artists to session storage
        populateTopArtistsUI(topArtists); // Update UI with top artists

        // Fetch and save top songs
        const topSongs = await fetchTopSongs(accessToken);
        saveToSessionStorage("topSongs", topSongs); // Save top songs to session storage
        populateTopSongsUI(topSongs); // Update UI with top songs
      } catch (error) {
        console.error("Error during authentication or fetching data:", error);
      }
    }
  }
});

function generateCodeVerifier(length: number) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function getAccessToken(
  clientId: string,
  code: string
): Promise<string> {
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
    body: params,
  });

  const data = await result.json();

  if (data.error) {
    console.error("Error getting access token:", data.error);
    throw new Error(data.error.message);
  }

  // Destructure access token and refresh token from the response
  const { access_token, refresh_token } = data;

  // Save the access and refresh tokens to session storage
  sessionStorage.setItem("accessToken", access_token);
  sessionStorage.setItem("refreshToken", refresh_token);

  return access_token; // Return the access token
}

async function refreshAccessToken(refreshToken, clientxId) {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const data = await result.json();

  if (data.error) {
    console.error("Error refreshing access token:", data.error);
    throw new Error(data.error.message);
  }

  // Save the new access token and return it
  sessionStorage.setItem("accessToken", data.access_token);
  return data.access_token;
}

async function fetchProfile(token: string): Promise<any> {
  try {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await result.json();

    if (data.error && data.error.status === 401) {
      console.error("Invalid access token, redirecting to auth flow...");
      redirectToAuthCodeFlow(clientId); // Redirect to re-authenticate
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
  }
}

async function fetchTopArtists(token: string): Promise<any> {
  try {
    const result = await fetch(
      "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await result.json();

    if (data.error && data.error.status === 401) {
      console.error("Invalid access token, redirecting to auth flow...");
      redirectToAuthCodeFlow(clientId); // Redirect to re-authenticate
    }
    return data;
  } catch (error) {
    console.error("Failed to fetch top artists:", error);
  }
}

let topTracksIds = [];

async function fetchTopSongs(token: string): Promise<any> {
  try {
    const result = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await result.json();
    if (data.error && data.error.status === 401) {
      console.error("Invalid access token, redirecting to auth flow...");
    }
    return data;
  } catch (error) {
    console.error("Failed to fetch top songs:", error);
  }
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
  document
    .getElementById("uri")!
    .setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url")!.innerText = profile.href;
  document.getElementById("url")!.setAttribute("href", profile.href);
  document.getElementById("imgUrl")!.innerText =
    profile.images[0]?.url ?? "(no profile image)";
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

function populateTopSongsUI(data: any) {
  const topSongsContainer = document.getElementById("topSongs")!;
  topSongsContainer.innerHTML = "";
  console.log(data);

  data.items.forEach((song: any) => {
    const songElement = document.createElement("div");

    const albumImage = document.createElement("img");
    albumImage.src = song.album.images[0]?.url ?? "";
    albumImage.alt = song.name;
    albumImage.classList.add("w-16", "h-16", "mr-4"); // Add styles for size and spacing

    const songName = document.createElement("div");
    songElement.innerText = song.name;

    songElement.appendChild(albumImage); // Add the image before the text
    songElement.appendChild(songName); // Add the text after the image

    topSongsContainer.appendChild(songElement);
  });
}

// Save to session storage jsut for Dev work...

// Save data to session storage (with a specific key)
function saveToSessionStorage(key, data) {
  try {
    const dataString = JSON.stringify(data);
    sessionStorage.setItem(key, dataString);
    console.log(
      `Data saved to session storage under key "${key}":`,
      dataString
    );
  } catch (error) {
    console.error(`Failed to save to session storage for key "${key}":`, error);
  }
}

// Load data from session storage (by key)
function loadFromSessionStorage(key) {
  try {
    const dataString = sessionStorage.getItem(key);
    console.log(
      `Loaded data from session storage for key "${key}":`,
      dataString
    );
    return dataString ? JSON.parse(dataString) : null;
  } catch (error) {
    console.error(
      `Failed to load from session storage for key "${key}":`,
      error
    );
    return null;
  }
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
