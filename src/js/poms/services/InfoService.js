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
                $http.get(baseUrl, {cache: true}).then(
                    function ( response ) {
                        var info = response.data;
                        deferred.resolve( info );
                    },
                    function ( error ) {
                        deferred.reject( error );
                    }
                );

                return deferred.promise;
            },
            getProperties: function () {
                if (properties) {
                    return Promise.resolve(properties);
                } else {
                    var deferred = $q.defer();
                    $http.get(baseUrl + "/properties", {cache: true}).then(
                        function (response) {
                            var info = response.data;
                            deferred.resolve(info);
                            properties = info;
                            //console.log(properties);
                        },
                        function (error) {
                            deferred.reject(error);
                        });

                    return deferred.promise;
                }
            },
            getImageBackendUrl: function() {
                return properties['npo-images_backend.baseUrl']
            },
            getByteSize: function(programUrl) {
                 var deferred = $q.defer();
                $http.get(baseUrl + "/byteSize?programUrl=" + programUrl, {cache: true}).then(
                    function (response) {
                        var info = response.data;
                        deferred.resolve(info);
                        properties = info;
                        //console.log(properties);
                    },
                    function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            }

        };

        return new InfoService();
    }
] );
