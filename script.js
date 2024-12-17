// Spotify Web API integration
const CLIENT_ID = '95611b1c29994911b89c1c209a517c29';
const REDIRECT_URI = 'https://coda-damaged.github.io/Spotify-Standby/callback'; // Ensure this is in the Spotify Developer Dashboard
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

// Add the required scopes for the access
const SCOPES = 'user-read-playback-state user-library-read user-read-currently-playing user-modify-playback-state';

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

// Check if there is an active player
async function checkActivePlayer(token) {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok) {
        const data = await response.json();
        if (data.device && data.device.is_active) {
            return true; // Active player is available
        } else {
            console.log('No active player available');
            return false;
        }
    } else {
        console.error('Failed to check player status');
        return false;
    }
}

// Play the track using Spotify API
async function playMusic(token) {
    const isActive = await checkActivePlayer(token);
    if (isActive) {
        const response = await fetch('https://api.spotify.com/v1/me/player/play', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // You can pass the URI of the track or album you want to play, or leave empty to resume playback
                context_uri: 'spotify:album:6v0o0tD0l6j5CZ7Vt8u6SY' // Example album URI
            }),
        });

        if (response.ok) {
            console.log('Playback started');
        } else {
            console.error('Failed to start playback');
        }
    } else {
        console.log('No active player available for play');
    }
}

// Skip to next track using Spotify API
async function skipToNextTrack(token) {
    const isActive = await checkActivePlayer(token);
    if (isActive) {
        const response = await fetch('https://api.spotify.com/v1/me/player/next', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            console.log('Skipped to next track');
        } else {
            console.error('Failed to skip track');
        }
    } else {
        console.log('No active player available to skip track');
    }
}

// Skip to previous track using Spotify API
async function skipToPreviousTrack(token) {
    const isActive = await checkActivePlayer(token);
    if (isActive) {
        const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            console.log('Skipped to previous track');
        } else {
            console.error('Failed to go to previous track');
        }
    } else {
        console.log('No active player available to go to previous track');
    }
}

// Add event listeners for buttons
document.getElementById('play-btn').addEventListener('click', () => {
    playMusic(accessToken);
});

document.getElementById('next-btn').addEventListener('click', () => {
    skipToNextTrack(accessToken);
});

document.getElementById('prev-btn').addEventListener('click', () => {
    skipToPreviousTrack(accessToken);
});
