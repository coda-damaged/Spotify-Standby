// Spotify Web API integration
const CLIENT_ID = '95611b1c29994911b89c1c209a517c29';
const REDIRECT_URI = 'https://coda-damaged.github.io/Spotify-Standby/callback'; // Ensure this matches the Spotify Developer Dashboard
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

// Add the required scopes for the access
const SCOPES = 'user-read-playback-state user-library-read user-read-currently-playing';

// Function to extract token from URL fragment or localStorage
function getAccessToken() {
    const urlParams = new URLSearchParams(window.location.hash.substr(1)); // Get params from URL fragment
    const token = urlParams.get('access_token');
    
    if (token) {
        // Save token to localStorage if it's present in the URL
        localStorage.setItem('spotifyAccessToken', token);
        window.location.hash = ''; // Clear the URL fragment after saving the token
    }
    
    return localStorage.getItem('spotifyAccessToken'); // Return token from localStorage if available
}

// Handle login button click
document.getElementById('login-btn').addEventListener('click', () => {
    window.location.href = `${AUTH_ENDPOINT}?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
});

// Dynamic clock
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('time').textContent = timeString;
}
setInterval(updateTime, 1000);
updateTime();

// Fetch user profile and currently playing track
const accessToken = getAccessToken(); // Get token (either from URL or localStorage)

if (accessToken) {
    fetchUserProfile(accessToken); // Fetch user profile
    fetchCurrentlyPlaying(accessToken); // Fetch currently playing track
    startPollingForCurrentTrack(accessToken); // Start polling to update current track
} else {
    console.log('Access Token is missing!');
    // Show message or prompt to log in
}

// Fetch user profile from Spotify API
async function fetchUserProfile(token) {
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
        const data = await response.json();
        console.log('User Data:', data); // Log user data
        // Update the UI with user profile data
        document.getElementById('user-name').textContent = `Welcome, ${data.display_name}`;
        
        // Hide the login button if user is logged in
        hideLoginButton();
    } else {
        console.error('Failed to fetch user profile.');
    }
}

// Fetch currently playing track from Spotify API
async function fetchCurrentlyPlaying(token) {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Currently Playing Data:', data); // Log track data
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

// Poll for currently playing track every 5 seconds to update UI
function startPollingForCurrentTrack(token) {
    setInterval(() => {
        fetchCurrentlyPlaying(token);
    }, 1000); // Poll every 5 seconds
}

// Hide the login button if the user is logged in
function hideLoginButton() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.style.display = 'none'; // Hide login button
    }
}

// Ensure the redirect URL is consistent and correct in Spotify Developer Dashboard
if (!window.location.hash && !localStorage.getItem('spotifyAccessToken')) {
    console.log('Please log in to Spotify.');
} else {
    // If token exists in URL or localStorage, we don’t redirect, just fetch data.
    const accessToken = getAccessToken();
    if (accessToken) {
        fetchUserProfile(accessToken); // Fetch user profile
        fetchCurrentlyPlaying(accessToken); // Fetch currently playing track
        hideLoginButton(); // Ensure login button is hidden after login
    }
}
