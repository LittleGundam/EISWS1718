global.WEEK                 = [ 'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag' ];



function getVeranstaltungen( callback ){
    var veranstaltungen = [];
    /////////veranstaltungDB
    var date                    = new Date();
    var today                   = date.getDay();
    var vdb_options             = {
        host: VARIABLES.eventdbaddr,
        port: VARIABLES.eventdbport,
        path: '/veranstaltung/' + WEEK[ 1 ],
        method: 'GET',
    };

    //console.log( vdb_options.path );

    var externalRequest         = http.request( vdb_options, function( externalResponse ){
        if( externalResponse.statusCode == 200 ){
            externalResponse.on( 'data', function( chunk ){
                veranstaltungen = JSON.parse( chunk );


                callback( veranstaltungen );

            });
        } else if( externalResponse.statusCode == 204 ){
            callback( null );
        }
    });
    externalRequest.end();

}
function getEmptyRooms( callback ){
    var rooms = [];
    /////////roomDB
    var rdb_options             = {
        host: VARIABLES.roomdbaddr,
        port: VARIABLES.roomdbport,
        path: '/room/empty',
        method: 'GET',
    };

    //console.log( rdb_options.path );

    var externalRequest         = http.request( rdb_options, function( externalResponse ){
        if( externalResponse.statusCode == 200 ){
            externalResponse.on( 'data', function( chunk ){
                rooms = JSON.parse( chunk );


                callback( rooms );

            });
        } else if( externalResponse.statusCode == 204 ){
            callback( null );
        }
    });
    externalRequest.end();

}

function getSuggestion( filter, callback ){
    var suggestion = null;
    var date = new Date();
    //var hour = date.getHours();
    //var min  = date.getMinutes();
    var hour = 17;      // Stunde zum Testen
    var min = 30;       // Minute zum Testen

    var size_max = 0;
    ////////////////////////
    getVeranstaltungen( function( result ){
        getEmptyRooms( function( rooms ){
            if( rooms != null ){
                for( var i = 0; i < rooms.length; i++ ){


                    for( var j = 0; j < result.length; j++ ){


                        // Bricht den Schleifendurchlauf ab, wenn die momentane Zeit innerhalb einer Veranstaltungszeit liegt UND die betreffenden Räume die selben sind
                        if(( result[j].begin<=(hour*100+min) && result[j].end>=(hour*100+min) ) && rooms[i].number == result[j].room ){


                            break;
                        }
                        // Bricht den Scheifendurchlauf ab, wenn der betreffende Raum innerhalb der nächsten Stunde( Belegungszeit ) durch eine Veranstaltung belegt ist.
                        if( result[j].begin<=((hour+1)*100+min) && result[j].end>=((hour+1)*100+min) && rooms[i].number == result[j].room ){


                            break;
                        }






                    }
                    if( filter == null ){
                        // Bricht den Schleifendurchlauf ab, wenn die maximale Größe des Raumes ( wie viele Sitzplätze maximal ) größer ist als vom bisher kleinsten raum

                        if( parseInt( rooms[i].size_max, 10 ) > size_max && size_max != 0 ){


                        } else {

                            size_max = rooms[i].size_max;

                            suggestion = rooms[i].number;
                        }
                    } else {
                        //TODO: Schließe Räume anhand des 'filter' aus
                    }


                }
                callback( suggestion );
            } else {
                callback( null );
            }
        });
    });
}

module.exports              = {
    getSuggestion: function( filter, callback ){
        getSuggestion( filter, callback );
    }
};
