angular.module( 'poms.media.services' ).factory( 'StatsService', [
    '$q',
    '$http',
    'appConfig',
    function ($q, $http, appConfig ) {
        var baseUrl = appConfig.apiHost + '/gui/admin';

        function StatsService () {
        }

        StatsService.prototype = {

            getStats: function ( ) {
                var deferred = $q.defer();

                $http.get( baseUrl )
                        .success( function ( stats ) {
                            deferred.resolve( stats );
                        } )
                        .error( function ( error ) {
                            deferred.reject( error );
                        } );

                return deferred.promise;
            }

        };

        return new StatsService();
    }
] );
