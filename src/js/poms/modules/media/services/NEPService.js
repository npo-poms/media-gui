angular.module( 'poms.media.services' ).factory( 'NEPService', [
    '$rootScope',
    '$q',
    '$http',
    '$modal',
    'localStorageService',
    'appConfig',
    'NotificationService',
    function ( $rootScope, $q, $http, $modal, localStorageService, appConfig, notificationService) {

        var baseUrl = appConfig.apihost + '/gui/player';

        var get = function ( path, config ) {

            var deferred = $q.defer();
            var url = baseUrl + '/'  + path;
            $http.get(url, config )
                .success( function ( result ) {
                    deferred.resolve( result );
                } )
                .error( function ( error ) {
                    deferred.reject( error );
                    notificationService.notify(error.message, 'error', {timeout: -1, id: 'nep-service'});
                    }
                );

            return deferred.promise;
        };


        function NepService () {

        }

        NepService.prototype = {

            getWideVineToken: function () {
                return get( 'widevine', {} );
            },

            getPlayReadyToken: function () {
                return get( 'playready', {} );
            },

            getStreamUrl: function (mid, duration ) {
                var url = 'streamurl?mid=' + mid;
                if ( duration ) {
                    url = url + '&duration=' + duration;
                }
                return get( url , {} );
            },

            getScreengrab : function(mid, offset){

                var url = 'screengrab/' + mid + '&offset=' + datetime;

                return  $http({
                    method: 'GET',
                    url: baseUrl  + '/' + url,
                    data: '',
                    headers: {
                        'Accept' : undefined,
                        'Content-Type': 'application/octet-stream'
                    },
                    'responseType' : 'blob'
                });


            },


            getLiveScreengrab : function( channel, datetime){
                var url = 'screengrab/channel/' + channel + '?dateTime=' + datetime.utc().format( 'YYYY-MM-DDTHH:mm:ss.SSS');

                return  $http({
                    method: 'GET',
                    url: baseUrl  + '/' + url,
                    data: '',
                    headers: {
                        'Accept' : undefined,
                        'Content-Type': 'application/octet-stream'
                    },
                    'responseType' : 'blob'
                });


            },


            getStream : function( mid ) {

                var deferred = $q.defer();
                this.getPlayReadyToken().then( function ( playReady ) {
                    var playReadyToken = playReady.token;

                    this.getWideVineToken().then( function ( widevine ) {
                        var widevineToken = widevine.token;

                        this.getStreamUrl(mid).then( function ( result ) {
                            deferred.resolve( {stream: result, widevineToken: widevineToken, playReadyToken: playReadyToken } );
                        }.bind( this ), function ( error ) {
                            deferred.reject( error );
                        } );

                    }.bind( this ), function ( error ) {
                        deferred.reject( error );
                    } );

                }.bind( this ), function ( error ) {
                    deferred.reject( error );
                } );

                return deferred.promise;

            },

            itemize :  function( request ) {

                var deferred = $q.defer();
                var url = baseUrl + '/itemize';

                $http({
                        method: 'post',
                        url: url,
                        data: request,
                        headers: {
                            'Accept': "text/plain",
                            'Content-Type': 'application/json'
                        }
                    })
                    .success(function (media) {
                        deferred.resolve(media);
                    })
                    .error(function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            },
             itemizelive :  function( request ) {

                var deferred = $q.defer();
                var url = baseUrl + '/itemizelive';

                $http({
                        method: 'post',
                        url: url,
                        data: request,
                        headers: {
                            'Accept': "text/plain",
                            'Content-Type': 'application/json'
                        }
                    })
                    .success(function (media) {
                        deferred.resolve(media);
                    })
                    .error(function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            }

        };

        return new NepService();
    }
] );
