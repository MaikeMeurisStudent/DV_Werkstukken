let spotify = {
    token: 'BQBVRanE20AnQXsOJkMicozIs3hHk7rNxyjKrAfUjO6KniZX7ij9UFEx1waaT_u04k9ZMGjLHKPDuYISI5HbDtUUlrA5yEiI3MlnWzj__C9uomtC4cLUf5gsUM8twymkdV2ra0bKufrpE2KMjg0n290QG63cPNYtQ_KyEFAheaBMbIKiy91XK3ZW8Wqp',
    canplay: false,
    player: null,
    playlists: [],
    play: ({spotify_uri, playlist_nr, playerInstance: {_options: {getOAuthToken, id}}}) => {
        getOAuthToken(access_token => {
            fetch('https://api.spotify.com/v1/me/player/play?device_id=' + id, {
                method: 'PUT',
                body: JSON.stringify(
                    {

                        "context_uri": "spotify:playlist:" + spotify_uri,
                        "offset": {
                            "position": playlist_nr
                        },
                        "position_ms": 0

                    }
                ),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + access_token
                },
            });
        });
    },
    repeat: ({state, playerInstance: {_options: {getOAuthToken, id}}}) => {
        getOAuthToken(access_token => {
            fetch('https://api.spotify.com/v1/me/player/repeat?state=' + state + '&device_id=' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + access_token
                }
            });
        });
    },
    pause: ({playerInstance: {_options: {getOAuthToken, id}}}) => {
        getOAuthToken(access_token => {
            fetch('https://api.spotify.com/v1/me/player/pause?device_id=' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + access_token
                },
            });
        });
    },
    loadPlaylistTracks: (listUri) => {
        return fetch('https://api.spotify.com/v1/playlists/' + listUri + '/tracks', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + spotify.token
        }
    })
    },
    start: () => {

        spotify.player = new Spotify.Player({
            name: 'Friends Jam',
            getOAuthToken: cb => { cb(spotify.token); },
            volume: 1
        });

        // Error handling
        spotify.player.addListener('initialization_error', ({ message }) => { console.error(message); });
        spotify.player.addListener('authentication_error', ({ message }) => { console.error(message); });
        spotify.player.addListener('account_error', ({ message }) => { console.error(message); });
        spotify.player.addListener('playback_error', ({ message }) => { console.error(message); });

        // Ready
        spotify.player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);

            // Playback status updates
            spotify.player.addListener('player_state_changed', state => {});

            spotify.canplay = true;

            spotify.repeat({
                playerInstance: spotify.player,
                state: "track"
            });

        });

        // Not Ready
        spotify.player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        spotify.player.connect();
    }
};

