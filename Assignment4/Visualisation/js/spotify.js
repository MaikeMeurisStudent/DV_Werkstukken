let spotify = {
    // Token generator (Spotify account needed, refresh token each hour):
    // https://developer.spotify.com/documentation/web-playback-sdk/quick-start/#
    token: 'BQCVJlGdsI_6tkt55UuLCFFO93uBxT13FUjaxzoMKJWIX6Fy2QYmo0jLRALDJXkG1HmPj5pu34Zf5-Vdh-98Q2QF_l2zwrt5fh7mQl5SBv2YfJmsLXF09RKV9FnWDuhOzX-lnYSOEEmlIQ8ykoFNRXeNwVphhcmciElqZs0M0GX3slIYKPCV355Y5jny',
    canplay: false,
    player: null,
    playlists: [],
    // Play a song from a playlist
    play: ({spotify_uri, playlist_nr, playerInstance: {_options: {getOAuthToken, id}}}) => {
        getOAuthToken(access_token => {
            fetch('https://api.spotify.com/v1/me/player/play?device_id=' + id, {
                method: 'PUT',
                body: JSON.stringify(
                    {
                        // spotify_uri = ID of playlist that has to be used
                        "context_uri": "spotify:playlist:" + spotify_uri,
                        "offset": {
                            // playlist_nr = index of the song in the playlist
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
    // Put song on repeat
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
    // Pause a song
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
    // Get all songs from a playlist
    loadPlaylistTracks: (listUri) => {
        return fetch('https://api.spotify.com/v1/playlists/' + listUri + '/tracks', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + spotify.token
            }
        })
    },
    // Initialize the player object, which can be used to play songs
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

        // Check if player is ready
        spotify.player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);

            // Playback status updates
            spotify.player.addListener('player_state_changed', state => {});

            spotify.canplay = true;

            // Always repeat a song after it ends
            spotify.repeat({
                playerInstance: spotify.player,
                state: "track"
            });

        });

        // Check if something went wrong with the player
        spotify.player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        spotify.player.connect();
    }
};
