angular.module( 'poms.media.services' ).factory( 'InfoService', [
    '$q',
    '$http',
    'appConfig',
    function ( $q, $http, appConfig ) {
        var baseUrl = appConfig.apiHost + '/gui/info';
        function InfoService () {
        }
        InfoService.prototype = {
            getInfo: function () {
                var deferred = $q.defer();
                $http.get(baseUrl, {cache: true})
                    .success( function ( info ) {
                        deferred.resolve( info );
                    } )
                    .error( function ( error ) {
                        deferred.reject( error );
                    } );

                return deferred.promise;
            }

        };

        return new InfoService();
    }
] );
