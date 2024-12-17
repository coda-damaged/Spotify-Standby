// Spotify Web API integration
const CLIENT_ID = '95611b1c29994911b89c1c209a517c29';
const REDIRECT_URI = 'https://coda-damaged.github.io/Spotify-Standby/callback'; // Update with your GitHub Pages URL
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

// Get access token from localStorage
const accessToken = localStorage.getItem('spotifyAccessToken');

// Login button click handler
document.getElementById('login-btn').addEventListener('click', () => {
    // Redirect user to Spotify login
    window.location.href = `${AUTH_ENDPOINT}?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
});

// Dynamic clock
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('time').textContent = timeString;
}
setInterval(updateTime, 1000);
updateTime();

// Fetch song data from Spotify
if (accessToken) {
    fetchUserProfile(accessToken); // Fetch user profile
    fetchCurrentlyPlaying(accessToken); // Fetch currently playing track
} else {
    console.log('Access Token is missing!');
    // Show a message or prompt to log in
}

async function fetchUserProfile(token) {
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
        const data = await response.json();
        console.log('User Data:', data); // Log the user data
        // Update the UI with user profile data
        document.getElementById('user-name').textContent = `Welcome, ${data.display_name}`;
    } else {
        console.error('Failed to fetch user profile.');
    }
}

async function fetchCurrentlyPlaying(token) {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Currently Playing Data:', data); // Log currently playing track data
        // Update the UI with currently playing song data
        if (data.item) {
            document.getElementById('cover').src = data.item.album.images[0].url;
            document.getElementById('title').textContent = data.item.name;
            document.getElementById('artist').textContent = data.item.artists[0].name;
        } else {
            document.getElementById('title').textContent = 'No song is currently playing';
        }
    } else {
        console.error('Failed to fetch currently playing track.');
    }
}
