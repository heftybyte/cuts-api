'use strict';

module.exports = function search(Spotify) {

    Spotify._search = async function(args) {
        const results = await Spotify.search(args)
        console.log(results)
        return results
    }

    Spotify.remoteMethod('_search', {
        accepts: [
            {arg: 'q', type: 'string'},
            {arg: 'type', type: 'string'}
        ],
        http: {
            path: '/search'
        }
    });

};


/*
module.exports = {
Search,
GetTracks,
Browse,


}

*/