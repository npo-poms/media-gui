angular.module( 'poms.services' ).factory( 'HelpService', [
    '$q',
    '$http',
    'appConfig',
    function ( $q, $http, appConfig ) {

        function HelpService () {
        }

        HelpService.prototype = {

            getMessage: function ( id ) {
                var deferred = $q.defer();

                $http.get( appConfig.apihost + '/gui/help', {cache: true, params: {message: id}} )
                    .success( function ( message ) {
                        deferred.resolve( message );
                    }.bind( this ) )
                    .error( function ( error ) {
                        deferred.reject( error );
                    } );

                return deferred.promise;
            }
        };

        return new HelpService();
    }
] );
