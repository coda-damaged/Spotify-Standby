// Spotify Web API integration
const CLIENT_ID = '95611b1c29994911b89c1c209a517c29';
const REDIRECT_URI = 'https://coda-damaged.github.io/Spotify-Standby/callback'; // Change for GitHub Pages
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

// Get access token from localStorage
const accessToken = localStorage.getItem('spotifyAccessToken');

// Proceed with fetching data only if the access token exists
if (accessToken) {
    fetchUserProfile(accessToken); // Fetch user profile
    fetchCurrentlyPlaying(accessToken); // Fetch currently playing track
} else {
    console.log('Access Token is missing!');
    // Optionally, show a message or redirect to login page
}


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
    setInterval(() => fetchCurrentlyPlaying(accessToken), 3000); // Update every 3 seconds
} else {
    console.log('Access Token is missing!');
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

// Handle play/pause and navigation
document.getElementById('play-btn').addEventListener('click', () => {
    togglePlayPause(accessToken);
});

document.getElementById('prev-btn').addEventListener('click', () => {
    changeTrack('previous', accessToken);
});

document.getElementById('next-btn').addEventListener('click', () => {
    changeTrack('next', accessToken);
});

// Toggle play/pause
async function togglePlayPause(token) {
    const statusResponse = await fetch('https://api.spotify.com/v1/me/player', {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (statusResponse.ok) {
        const data = await statusResponse.json();

        // Check if the player is playing or paused
        if (data.is_playing) {
            // If playing, pause the song
            const pauseResponse = await fetch('https://api.spotify.com/v1/me/player/pause', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (pauseResponse.status === 204) {
                console.log('Playback paused');
            }
        } else {
            // If paused, play the song
            const playResponse = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (playResponse.status === 204) {
                console.log('Playback started');
            }
        }
    } else {
        console.error('Failed to fetch player status.');
    }
}

// Skip to next/previous track
async function changeTrack(direction, token) {
    const response = await fetch(`https://api.spotify.com/v1/me/player/${direction}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok) {
        console.log(`Moved to ${direction} track`);
    } else {
        console.error('Failed to change track.');
    }
}
