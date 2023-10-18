angular.module( 'poms.media.services' ).factory( 'InfoService', [
    '$q',
    '$http',
    'appConfig',
    function ( $q, $http, appConfig ) {
        const baseUrl = appConfig.apiHost + '/gui/info';
        let properties;

        function InfoService () {
            this.getProperties();
        }
        InfoService.prototype = {
            getInfo: function () {
                const deferred = $q.defer();
                $http.get(baseUrl, {cache: true}).then(
                    function ( response ) {
                        const info = response.data;
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
                    const deferred = $q.defer();
                    $http.get(baseUrl + "/properties", {cache: true}).then(
                        function (response) {
                            properties = response.data;
                            deferred.resolve(properties);
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

            getOtap: function() {
                return {
                    env: properties['npo.env'],
                    otap: properties['otap']
                };
            },
            getByteSize: function(programUrl) {
                const deferred = $q.defer();
                $http.get(baseUrl + "/byteSize?programUrl=" + programUrl, {cache: true}).then(
                    function (response) {
                        const info = response.data;
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
