angular.module( 'poms.media.services' ).factory( 'SubtitlesService', [
    '$q',
    '$http',
    '$upload',
    'appConfig',
    function ( $q, $http, $upload, appConfig ) {

        const baseUrl = appConfig.apiHost + '/gui/subtitles';

        function get( path, config ) {
            const deferred = $q.defer();
            $http.get( baseUrl + path, config ).then(
                function ( response ) {
                    const data = response.data;
                    deferred.resolve( data );
                }.bind( this ),
                function ( error ) {
                    deferred.reject( error );
                }
            );

            return deferred.promise;
        }

        function post ( mediaId, path, body ) {
            const deferred = $q.defer();
            const url = baseUrl + '/' + mediaId + '/' + path;

            $http.post( url, body ).then(
                function ( response ) {
                    deferred.resolve( response.data);
                },
                function ( error ) {
                    deferred.reject( error );
                }
            );

            return deferred.promise;
        }

        function postData ( mediaId, path, fields, file ) {
            const deferred = $q.defer();
            const url = baseUrl + '/' + mediaId + '/' + path;

            $upload.upload( {
                url: url,
                method: 'POST',
                fields: fields,
                file: file,
                fileFormDataName: 'file'
                })
                .success( function ( data, status, headers, config ) {
                    deferred.resolve( data );
                })
                .error( function ( data, status, headers, config ) {

                    deferred.reject( data )
                });

            return deferred.promise;

        }

        function del ( mediaId, path ) {
            const deferred = $q.defer();
            const url = baseUrl + '/' + mediaId + '/' + path;

            $http.delete( url )
                .then(
                    function ( response ) {
                        const subtitles = response.data;
                        deferred.resolve( subtitles );
                    },
                    function ( error ) {
                        deferred.reject( error );
                    }
                );


            return deferred.promise;
        }

        function SubtitlesService () {}

        SubtitlesService.prototype = {

            list: function ( mid ) {
                return get( '/' + mid, {params: {}} );
            },

            setOffset: function ( mid, language, type, offset ) {
                return post( mid, [ language, type, 'offset' ].join('/'), offset);
            },

            delete: function ( mid, language, type) {
                return del( mid, [ language, type ].join('/'));
            },

            upload: function ( mid, language, type, fields, data ) {
                return postData( mid, [language, type ].join('/'), fields, data);
            }
        };

        return new SubtitlesService();
    }
] );
