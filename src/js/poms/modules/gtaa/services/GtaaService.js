angular.module( 'poms.gtaa.services' ).factory( 'GtaaService', [
    '$q',
    '$http',
    '$window',
    'appConfig',
    function ( $q, $http, $window, appConfig ) {

        var baseUrl = appConfig.apihost + '/gui/gtaa';

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

        function postToURL(url, body) {
            var deferred = $q.defer();            
            $http.post( url, body )
                .success( function ( media ) {
                    deferred.resolve( media );
                } )
                .error( function ( error ) {
                    deferred.reject( error );
                } );

            return deferred.promise;
        }

        function post( path, body ) {
           var url = baseUrl + path;
           return postToURL(url, body);
        }

        function GtaaService () {}

        GtaaService.prototype = {

           getPersons: function ( text, max ) {
                return get( '/persons', {params: {text: text, max: max || 10}} );
           },

           submitPerson: function ( gtaaPerson ) {
               var signService;
               var signServiceParam = /signService=([^&#]+)/.exec( $window.location.search );
               if ( signServiceParam && signServiceParam.length > 0 ) {
                   signService = decodeURIComponent( signServiceParam.pop() );
               }
               if(signService) {
                   return postToURL(signService, gtaaPerson);
               } else {
                return post( '/persons', gtaaPerson );
               }
           }

        };

        return new GtaaService();
    }
] );
