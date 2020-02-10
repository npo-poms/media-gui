angular.module( 'poms.util.filters' )
    .filter( 'withTimezone', function () {
        return function ( date ) {
            if ( date == null) {
                return date;
            }

            if ( ! (typeof date.getMonth === 'function') ) {
                date = new Date( date );
            }

            return new Date( date.getTime() + date.getTimezoneOffset() * 60 * 1000 )
        }
    } )
    .filter( 'noTimezone', function () {
        return function ( date ) {
            if ( date == null) {
                return date;
            }

            if ( ! (typeof date.getMonth === 'function') ) {
                date = new Date( date );
            }

            return new Date( date.getTime() - date.getTimezoneOffset() * 60 * 1000 )
        }
    } )
    .filter( 'mediaDate', function ( $filter ) {
        return function ( date ) {
            return $filter( 'date' )( date, "dd-MM-yyyy" );
        }
    } )
    .filter( 'mediaTime', function ( $filter ) {
        return function ( date ) {
            return $filter( 'date' )( date, "HH:mm" );
        }
    } )
    .filter( 'mediaDateTime', function ( $filter ) {
        return function ( date ) {
            return $filter( 'date' )( date, "dd-MM-yyyy HH:mm" );
        }
    } )
    .filter( 'mediaDuration', function ( $filter ) {
        return function ( ms ) {
            if (ms instanceof Date) {
                // Sad
                ms = ms.getTime();

            }
            var s = Math.floor(ms / 1000);
            ms = ms % 1000;
            var m = Math.floor(s / 60);
            s %= 60;
            var h = Math.floor(m / 60);
            m %= 60;
            var d = Math.floor(h / 24);
            h %= 24;
            var result = "";
            if (d === 1) {
                result += "1 dag ";
            } else if (d > 1 ) {
                result += d + " dagen ";
            }
            if (h > 0) {
                result += $filter( 'toDigits')(h, 2) + ":";
            }
            result += $filter( 'toDigits')(m, 2) + ":"  + $filter( 'toDigits')(s, 2);
            return result;
        }
    } )
    .filter( 'xmlLocationPrefix', function ( appConfig ) {
        return function ( id ) {
            return appConfig.apiHost + '/domain/media/' + id;
        }
    } )
    .filter('subtitlesLocationPrefix', function (appConfig) {
        return function (id) {
            return appConfig.apiHost + '/domain/subtitles/' + id;
        }
    })
    .filter( 'truncate', function () {
        return function ( text, length, end ) {
            if ( !text ){
                return;
            }

            if ( isNaN( length ) ) {
                length = 70;
            }

            if ( end === undefined ) {
                end = "...";
            }

            if ( text.length <= length || text.length - end.length <= length ) {
                return text;
            }
            else {
                return String( text ).substring( 0, length - end.length ) + end;
            }

        };
    } )
    .filter( 'searchColumnFilter', function ( $filter ) {

        return function ( item, type ) {
            switch ( type ) {
                case 'creationDate':
                case 'endDate':
                case 'publishDate':
                case 'lastModified':
                case 'lastModifiedDate':
                case 'publishStart':
                case 'publishStop':
                case 'lastPublished':
                case 'added':
                case 'sortDate':
                    return $filter('mediaDateTime')(item[type]);
                case 'firstScheduleEvent':
                    return $filter('mediaDateTime')(item);
                case 'lastScheduleEvent':
                    return $filter('mediaDateTime')(item);
                case 'broadcasters':
                    var values = item[type].map( function ( i ) {
                        return i.text;
                    } );
                    return values.join( ', ' );

                case 'type':
                case 'avType':
                case 'workflow':
                case 'createdBy':
                case 'lastModifiedBy':
                    return item[type] ? item[type].text : '';
                case 'score':
                    return $filter('limitTo')( item[type], 4 );
                default:
                    return $filter( 'limitTo' )( item[type], 50 )
            }

        }
    } )
    .filter( 'displayName', function ( $filter ) {

        return function ( item ) {
            switch ( item ) {
                case 'mainTitle':
                    return 'Titel';

                case 'subTitle':
                    return 'Subtitel';

                case 'shortTitle':
                    return 'Subtitel';

                case 'abbreviationTitle':
                    return 'Afkorting';

                case 'workTitle':
                    return 'Werktitel';

                case 'originalTitle':
                    return 'Originele titel';

                case 'lexicoTitle':
                    return 'Lexicografische titel';

                case 'mainDescription':
                    return 'Beschrijving';

                case 'subDescription':
                    return 'Afleveringsbeschrijving';

                case 'shortDescription':
                    return 'Korte beschrijving';

                default:
                    return item
            }

        }
    } )
    .filter( 'timeToMSeconds', function ( $filter ) {
        return function ( t ) {
            var res = t.split(/[:.]+/) ;
            return (parseInt(res[ 0 ]) * 60 * 60 * 1000) + (parseInt(res[ 1 ]) * 60 * 1000) + (parseInt(res[ 2 ]) * 1000) + parseInt(res[ 3 ]);
        }
    } )
    .filter( 'dateTimeToMSeconds', function ( $filter ) {
        return function ( t ) {
            var now = new Date();
            var res = t.split(/[:.]+/) ;
            return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), parseInt(res[ 0 ]), parseInt(res[ 1 ]), parseInt(res[ 2 ]), parseInt(res[ 3 ]))).getTime();
        }
    } )
    .filter( 'secondsToMsTime', function( $filter ) {
        return function ( v ) {
            if ( !v ) {
                v = 0;
            }
            var h = Math.floor( v / 3600 ), m = Math.floor( (v - (h * 3600)) / 60 ), s = Math.floor( v % 60 ),
                ms = Math.floor( (v % 1) * 1000 );

            h = h % 24;

            return $filter( 'toDigits')( h ) + ':' + $filter( 'toDigits')( m ) + ':' + $filter( 'toDigits')( s ) + '.' + $filter( 'toDigits')( ms, 3 );
        }
    } )

    .filter( 'secondsToTime', function( $filter ) {
        return function ( v ) {
            if ( !v ) {
                v = 0;
            }
            var h = Math.floor( v / 3600 ), m = Math.floor( (v - (h * 3600)) / 60 ), s = Math.floor( v % 60 ),
                ms = Math.floor( (v % 1) * 1000 );

            h = h % 24;

            return $filter( 'toDigits')( h ) + ':' + $filter( 'toDigits')( m ) + ':' + $filter( 'toDigits')( s );
        }
    } )
    .filter( 'toDigits' , function( $filter ) {
        return function( v, digits ) {
            return ('0000' + v.toFixed( 0 )).substr( (digits || 2) * -1 );
        }
    } )
    .filter( 'convertMS', function( $filter) {
        return function(ms) {
                var d, h, m, s;
                s = Math.floor(ms / 1000);
                m = Math.floor(s / 60);
                s = s % 60;
                h = Math.floor(m / 60);
                m = m % 60;
                d = Math.floor(h / 24);
                h = h % 24;
                return { d: d, h: h, m: m, s: s };
        }
    });
