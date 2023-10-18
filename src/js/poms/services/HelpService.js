angular.module( 'poms.services' ).factory( 'HelpService', [
    '$q',
    '$http',
    'appConfig',
    function ( $q, $http, appConfig ) {

        function HelpService () {
        }

        HelpService.prototype = {

            getMessage: function ( id ) {
                const deferred = $q.defer();

                $http.get( appConfig.apiHost + '/gui/help', {cache: true, params: {message: id}} )
                    .then(
                        function ( response ) {
                            const message = response.data;
                            deferred.resolve( message );
                        }.bind( this ),
                        function ( error ) {
                            deferred.reject( error );
                        }
                    );

                return deferred.promise;
            }
        };

        return new HelpService();
    }
] );
