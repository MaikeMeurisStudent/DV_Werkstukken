const friends = [];
const genreCounter = {};

$(document).ready(function() {

    window.onSpotifyWebPlaybackSDKReady = () => {
        // Initialize the player object
        spotify.start();

        const promiseList = [];

        // Get all songs from each playlist/genre and put them with corresponding playlist/genre in genres array
        genres.forEach((genre) => {
            const genrePromise = spotify.loadPlaylistTracks(genre.uri);
            promiseList.push(genrePromise);
            genrePromise.then(response=>response.json()).then((data) => {
                genre.songs = data.items;
            })
        });

        // When all songs from all playlists are in the genres array, the webpage can be shown
        Promise.all(promiseList).then(() => {
            spotify.playlistsLoaded = true;
            // promise.all() doesn't wait for genrePromise.then() in the code above, and so it executes createFriendList before the data is processed correctly => wait for 250ms until all .then()'s are finished
            setTimeout(() => {
                createPage();
            }, 250)
        })
    }

});

createPage = () => {
    createFriendList();
    createHTMLFriendList();
    addClickEventListener();
    createLegend();
}

// Create friends array
createFriendList = () => {
    for (let i = 0; i < names.length; i++){

        // Get a random genre from the genres array
        const genreIndex = Math.floor(Math.random() * genres.length);
        let genre = genres[genreIndex];

        // Create friend with a name, a random favourite genre and a random favourite song index
        let friendObject = {
            name: names[i],
            favourite_genre: genre,
            favourite_song: Math.floor(Math.random() * genre.songs.length)
        };

        // Add this friend to the friends array
        friends.push(friendObject);

        // Count the number of times a genre has been randomly chosen, so this data can be used to create the right section of the page with the chart
        if (!genre.hasOwnProperty('count')) {
            genre.count = 0;
        }
        genre.count++;
        genres[genreId] = genre;
    }
}

// Create section of page with music notes that correspond to a certain friend
createHTMLFriendList = () => {
    let listHTML = "";

    for(let i = 0; i < friends.length; i++){
        // Get the favourite song of this friend using the favourite song index
        const favoriteTrack = genres[genres.indexOf(friends[i].favourite_genre)].songs[friends[i].favourite_song].track;

        listHTML += "<div class='friend' id='" + i + "'><img src='" + friends[i].favourite_genre.image + "'/>";
        listHTML += "<div class='info-field'>";
        listHTML += "<p class='name'><img src='images/profile.svg'>" + friends[i].name + "</p>";
        listHTML += "<p class='song-name'>" + favoriteTrack.name + " - " + getArtistString(favoriteTrack) + "</p>";
        listHTML += "<p class='genre-name'>" + friends[i].favourite_genre.name + "</p>";
        listHTML += "</div>";

        listHTML += "</div>";
    }
    $("#friend-list").html(listHTML);
}

// If a music note gets clicked upon; play favourite song of this person
addClickEventListener = () => {
    $("#friend-list .friend").click(function(e) {
        const id = e.target.id;
        if (friends[id] !== undefined){ // If this isn't done, sometimes weird errors appeared. Now we're certain the user clicked on the IMG itself
            if (spotify.canplay && spotify.playlistsLoaded) {
                playSong(id);
            } else{
                console.warn("Player isn't ready yet to play a song");
            }
        }
    });
}

// Create right section of the webpage with the chart
createLegend = () => {
    let legendHTML = "";

    // Sort the genre count data, then loop over the sorted array; create a bar with a height that corresponds to the count
    genres.sort((a, b) => {return b.count-a.count}).forEach((genre) => {
        const itemHeight = genre.hasOwnProperty('count')? genre.count * 2 : 0;
        const listItemStyle = "background: " + genre.color + "; flex: " + itemHeight + ";";
        if (itemHeight > 0) {
            let classList = 'legend-item';
            // If the count is too low, don't show a label (only on hover)
            if (genre.count < 5) classList += " hidden-label";
            legendHTML += "<li class='" + classList + "' style='" + listItemStyle + "'><span class='label'>" + genre.name + " - " + Math.round(genre.count/names.length * 100) + "%</span></li>";
        }
    });

    $("#legend").html(legendHTML);
}

// Show which song is playing on the bottom of the webpage
updatePlayOverview = (track, friend) => {
    $('#playing-song-image img').attr('src' ,track.album.images[0].url);
    $('#playing-song-name').text(track.name);
    $('#playing-song-artist').text(getArtistString(track));
    $('#friend-info-name').text(friend.name);
    $('#playing-overview-container').addClass('song-playing');
};

// Play the favourite song of a certain friend
playSong = (id) => {
    const trackToPlay = genres[genres.indexOf(friends[id].favourite_genre)].songs[friends[id].favourite_song].track;
    spotify.play({
        playerInstance: spotify.player,
        spotify_uri: friends[id].favourite_genre.uri,
        playlist_nr: friends[id].favourite_song
    });
    // Update the section on the bottom of the page with the song that is playing
    updatePlayOverview(trackToPlay, friends[id]);
}

// Put together the artist name in the right way
getArtistString = (track) => {
    let artistsString = '';
    track.artists.forEach((artist, index) => {
        if(index > 0) {
            artistsString += ' ft.';
        }
        artistsString += ' ' + artist.name;
    });
    return artistsString;
};
