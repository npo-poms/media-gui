angular.module( 'poms.media.services' ).factory( 'InfoService', [
    '$q',
    '$http',
    'appConfig',
    function ( $q, $http, appConfig ) {
        var baseUrl = appConfig.apiHost + '/gui/info';
        var properties;
        function InfoService () {
            this.getProperties();
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
            },
            getProperties: function () {
                if (properties) {
                    return Promise.resolve(properties);
                } else {
                    var deferred = $q.defer();
                    $http.get(baseUrl + "/properties", {cache: true})
                        .success(function (info) {
                            deferred.resolve(info);
                            properties = info;
                            //console.log(properties);
                        })
                        .error(function (error) {
                            deferred.reject(error);
                        });

                    return deferred.promise;
                }
            },
            getImageBackendUrl: function() {
                return properties['image_backend.baseUrl']
            }

        };

        return new InfoService();
    }
] );
