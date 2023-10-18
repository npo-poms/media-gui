//var POMS_TIMEZONE="Europe/Amsterdam";
const POMS_TIMEZONE="Europe/Amsterdam";
angular.module( 'poms.util.filters' )
    .filter( 'withTimezone', function () {
        return function ( date ) {
            // this presumes a date has no timezone and adds it back.
            // deprecated, I think this is hackery
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
            // this converts a date object to another date object stripping of timezone information
            // deprecated, I think this is hackery
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
            // formats a date in poms way
            return $filter( 'date' )(date, "dd-MM-yyyy", POMS_TIMEZONE );
        }
    } )
    .filter( 'mediaTime', function ( $filter ) {
        return function ( date ) {
            // formats a time in poms way (no date information).
            // Deprecated, I think this hardly ever could make sense.
            return $filter( 'date' )( date, "HH:mm", POMS_TIMEZONE);
        }
    } )
    .filter( 'mediaDateTime', function ( $filter ) {
        return function ( date ) {
            // formats a time stamp  in poms way
            return $filter('date')(date, "dd-MM-yyyy HH:mm", POMS_TIMEZONE);
        }
    } )
    .filter( 'mediaDuration', function ( $filter ) {
        return function ( ms ) {
            if (ms instanceof Date) {
                // Sad, hack hack
                // deprecated usage _please_ don't do this kind of nonsense.
                ms = ms.getTime();

            }
            let s = Math.floor(ms / 1000);
            let m = Math.floor(s / 60);
            s %= 60;
            let h = Math.floor(m / 60);
            m %= 60;
            const d = Math.floor(h / 24);
            h %= 24;
            let result = "";
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
        return function ( text, length, ellipsis, at_begin) {
            if ( !text ){
                return;
            }
            if ( isNaN( length ) ) {
                length = 70;
            }

            if ( ellipsis === undefined || ellipsis === '') {
                ellipsis = "…";
            }

            if ( text.length <= length || text.length - ellipsis.length <= length ) {
                return text;
            } else {
                const desired_length = text.length - ellipsis.length;
                if (at_begin === undefined || ! at_begin) {
                    return String(text).substring(0, desired_length) + ellipsis;
                } else {
                    return ellipsis + String(text).substring(text.length - desired_length, text.length);
                }
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
                    const values = item[type].map(function (i) {
                        return i.text;
                    });
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
    .filter( 'displayName', function () {

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
    .filter( 'timeToMSeconds', function () {
        // I think this converts a formatted duration back to a number of milliseconds
        return function ( t ) {
            const res = t.split(/[:.]+/);
            return (parseInt(res[ 0 ]) * 60 * 60 * 1000) + (parseInt(res[ 1 ]) * 60 * 1000) + (parseInt(res[ 2 ]) * 1000) + parseInt(res[ 3 ]);
        }
    } )
    .filter( 'dateTimeToMSeconds', function () {
        // deprecated, I would not see any use case for such hackery.
        return function ( t ) {
            const now = new Date();
            const res = t.split(/[:.]+/);
            return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), parseInt(res[ 0 ]), parseInt(res[ 1 ]), parseInt(res[ 2 ]), parseInt(res[ 3 ]))).getTime();
        }
    } )
    .filter( 'secondsToMsTime', function( $filter ) {
        // Formats a duration in seconds to a string of the format HH:mm:ss.ssss
        return function ( v ) {
            if ( !v ) {
                v = 0;
            }
            let h = Math.floor(v / 3600);
            const m = Math.floor((v - (h * 3600)) / 60);
            const s = Math.floor(v % 60);
            const ms = Math.floor((v % 1) * 1000);

            h %= 24;

            return $filter( 'toDigits')( h ) + ':' + $filter( 'toDigits')( m ) + ':' + $filter( 'toDigits')( s ) + '.' + $filter( 'toDigits')( ms, 3 );
        }
    } )

    .filter( 'secondsToTime', function( $filter ) {
        // Formats a duration in seconds to a string of the format HH:mm:ss
        return function ( v ) {
            if ( !v ) {
                v = 0;
            }
            let h = Math.floor(v / 3600);
            const m = Math.floor((v - (h * 3600)) / 60);
            const s = Math.floor(v % 60);
            //var ms = Math.floor( (v % 1) * 1000 );

            h %= 24;

            return $filter( 'toDigits')( h ) + ':' + $filter( 'toDigits')( m ) + ':' + $filter( 'toDigits')( s );
        }
    } )
    .filter( 'toDigits' , function() {
        return function( v, digits ) {
            return ('0000' + v.toFixed( 0 )).substr( (digits || 2) * -1 );
        }
    } )
    .filter( 'convertMS', function() {
        // convert a duration in millis to a object with 4 fields, d, h, m, s
        return function(ms) {
            let s = Math.floor(ms / 1000);
            let m = Math.floor(s / 60);
            s %= 60;
            let h = Math.floor(m / 60);
            m %= 60;
            const d = Math.floor(h / 24);
            h %= 24;
            return { d: d, h: h, m: m, s: s };
        }
    });
