const friends = [];
const genreCounter = {};

$(document).ready(function() {

    window.onSpotifyWebPlaybackSDKReady = () => {
        spotify.start();
        const promiseList = [];
        genres.forEach((genre) => {
            const genrePromise = spotify.loadPlaylistTracks(genre.uri);
            promiseList.push(genrePromise);
            genrePromise.then(response=>response.json()).then((data) => {
                genre.songs = data.items;
            })
        });
        Promise.all(promiseList).then(() => {
            spotify.playlistsLoaded = true;
            // promise.all() wacht niet op de genrePromise.then(), en voert dus de createFriendlist uit voordat de data juist verwerkt is => even wachten (250ms) tot alle .then() uitgevoerd zijn.
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

createHTMLFriendList = () => {
    let listHTML = "";

    for(let i = 0; i < friends.length; i++){
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

createFriendList = () => {
    for (let i = 0; i < names.length; i++){
        const genreId = Math.floor(Math.random() * genres.length);
        let genre = genres[genreId];
        let friendObject = {
            name: names[i],
            favourite_genre: genre,
            favourite_song: Math.floor(Math.random() * genre.songs.length)
        };

        friends.push(friendObject);

        if (!genre.hasOwnProperty('count')) {
            genre.count = 0;
        }
        genre.count++;
        genres[genreId] = genre;
    }
}

addClickEventListener = () => {
    $("#friend-list .friend").click(function(e) {
        const id = e.target.id;
        if (friends[id] !== undefined){ // anders kwamen er soms rare errors, nu ben je zeker dat er op de IMG zelf werd geklikt
            if (spotify.canplay && spotify.playlistsLoaded) {
                playSong(id);
            } else{
                console.warn("Player is nog niet klaar om iets af te spelen");
            }
        }
    });
}

createLegend = () => {
    let legendHTML = "";

    genres.sort((a, b) => {return b.count-a.count}).forEach((genre) => { // sort array by count, then loop over the sorted array
        const itemHeight = genre.hasOwnProperty('count')? genre.count * 2 : 0;
        const listItemStyle = "background: " + genre.color + "; flex: " + itemHeight + ";";
        if (itemHeight > 0) {
            let classList = 'legend-item';
            if (genre.count < 5) classList += " hidden-label";
            legendHTML += "<li class='" + classList + "' style='" + listItemStyle + "'><span class='label'>" + genre.name + " - " + Math.round(genre.count/names.length * 100) + "%</span></li>";
        }
    });

    $("#legend").html(legendHTML);
}

updatePlayOverview = (track, friend) => {
    $('#playing-song-image img').attr('src' ,track.album.images[0].url);
    $('#playing-song-name').text(track.name);
    $('#playing-song-artist').text(getArtistString(track));
    $('#friend-info-name').text(friend.name);
    $('#playing-overview-container').addClass('song-playing');
};

playSong = (id) => {
    const trackToPlay = genres[genres.indexOf(friends[id].favourite_genre)].songs[friends[id].favourite_song].track;
    spotify.play({
        playerInstance: spotify.player,
        spotify_uri: friends[id].favourite_genre.uri,
        playlist_nr: friends[id].favourite_song
    });
    updatePlayOverview(trackToPlay, friends[id]);
}

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