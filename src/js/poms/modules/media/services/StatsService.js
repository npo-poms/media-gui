angular.module( 'poms.media.services' ).factory( 'StatsService', [
    '$q',
    '$http',
    'appConfig',
    function ($q, $http, appConfig ) {
        const baseUrl = appConfig.apiHost + '/gui/admin';

        function StatsService () {
        }

        StatsService.prototype = {

            getStats: function ( ) {
                const deferred = $q.defer();

                $http.get( baseUrl ).then(
                    function ( response ) {
                        const start = response.data;
                        deferred.resolve( stats );
                    },
                    function ( error ) {
                        deferred.reject( error );
                    }
                );

                return deferred.promise;
            }

        };

        return new StatsService();
    }
] );
