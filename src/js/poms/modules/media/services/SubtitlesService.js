angular.module( 'poms.media.services' ).factory( 'SubtitlesService', [
    '$q',
    '$http',
    'appConfig',
    function ( $q, $http, appConfig ) {

        var baseUrl = appConfig.apihost + '/gui/subtitles';

        function get( path, config ) {
            var deferred = $q.defer();
            $http.get( baseUrl + path, config )
                .success( function ( data ) {
                    deferred.resolve( data );
                }.bind( this ) )
                .error( function ( error ) {
                    deferred.reject( error );
                } );

            return deferred.promise;
        }

        function post ( mediaId, path, body ) {

            var deferred = $q.defer();
            var url = baseUrl + '/' + mediaId +'/'+ path;

            $http.post( url, body )
                .success( function ( subtitle ) {
                    deferred.resolve( subtitle );
                } )
                .error( function ( error ) {
                    deferred.reject( error );
                } );

            return deferred.promise;
        }

        function del ( mediaId, path ) {
            // debugger;
            var deferred = $q.defer();
            var url = baseUrl + '/' + mediaId +'/'+ path;

            $http.delete( url )
                .success( function ( subtitles ) {
                    deferred.resolve( subtitles );
                } )
                .error( function ( error ) {
                    deferred.reject( error );
                } );


            return deferred.promise;
        }

        function SubtitlesService () {}

        SubtitlesService.prototype = {

            list: function ( id ) {
                return get( '/' + id, {params: {}} );
            },

            setOffset: function ( id, language, type, offset ) {
                return post( id, [ language, type, 'offset' ].join('/'), { duration: offset } );
            },

            delete: function (id, language, type) {
                return del(id, [ language, type ].join('/'));
            }
        };

        return new SubtitlesService();
    }
] );
