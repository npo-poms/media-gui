angular.module( 'poms.media.services' ).factory('LocationService',
    function ( $http, $q, LOCATIONS_API_CONFIG, AuthenticationService ) {

        function resolveLocationResult( deferred ) {

            return function ( data ) {
                var result = new LocationResult( data.data.programUrl, data.data.bitrate, data.data.avFileFormat );
                deferred.resolve(result);
            };
        }

        function LocationResult( programUrl, bitrate, avFileFormat ) {
            this.programUrl = programUrl;
            this.bitrate = bitrate;
            this.avFileFormat = avFileFormat;
        }

        LocationResult.prototype = {
            getProgramUrl: function () {
                return this.programUrl || '';
            },
            getBitrate: function () {
                return this.bitrate;
            },
            getByteSize: function () {
                return this.byteSize;
            },
            getAvFileFormat: function () {
                return this.avFileFormat;
            }
        };

        var LocationService = function () {};

        LocationService.prototype = {

            /**
             * Resolves a MID (and nothing else) to a playable url that can be used to play
             * @param {String} [mid] MID string that should be resolved
             * @param {String} [preferredFormat] encoded string of url paramters like 'h264%2Cmp4%2Chasp'
             * @returns A Promise object
             */
            resolve: function ( mid, preferredFormat ) {

                var headers = {
                    'x-npo-mid': mid
                };

                var authHeaders = AuthenticationService.getHeaders( '', {}, LOCATIONS_API_CONFIG, headers );
                authHeaders['x-origin']= 'http://www.vpro.nl' ;

                var deferred = $q.defer();
                var url = LOCATIONS_API_CONFIG.API_URL +'locations/' + encodeURIComponent( mid );

                if( preferredFormat ) {
                    url += '?options=' + preferredFormat;
                }

                $http({
                    method : 'GET',
                    url : url,
                    headers : authHeaders
                }).then(
                    resolveLocationResult( deferred ),
                    function(data){
                        deferred.reject(data);
                    }
                );

                return deferred.promise;
            }
        };

        return new LocationService();
    }
);
