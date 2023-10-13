angular.module( 'poms.media.services' ).factory( 'NEPService', [
    '$rootScope',
    '$q',
    '$http',
    '$uibModal',
    'localStorageService',
    'appConfig',
    'NotificationService',
    function ( $rootScope, $q, $http, $uibModal, localStorageService, appConfig, notificationService) {

        var baseUrl = appConfig.apiHost + '/gui/player';

        var get = function ( path, config ) {

            var deferred = $q.defer();
            var url = baseUrl + '/'  + path;
            $http.get(url, config ).then(
                function ( response ) {
                    var result = response.data;
                    deferred.resolve( result );
                },
                function ( error ) {
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
                return get(url , {} );
            },


            getLiveStreamUrl: function (channel, duration ) {
                var url = 'streamurllive?channel=' + channel;
                if ( duration ) {
                    url = url + '&duration=' + duration;
                }
                return get(url , {} );
            },

            getScreengrab : function(mid, offset){
                var url = 'screengrab/' + mid + '?offset=' + offset;
                return this.getBlob(url);
            },


            getLiveScreengrab : function(channel, datetime){
                var url = 'screengrablive/' + channel + '?epoch=' + datetime;
                return this.getBlob(url);
            },

            getBlob : function(url) {
                return  $http({
                    method: 'GET',
                    url: baseUrl  + '/' + url,
                    responseType : 'blob'
                });
            },

            getStream : function( midOrChannel, live) {

                var deferred = $q.defer();
                this.getPlayReadyToken().then( function ( playReady ) {
                    var playReadyToken = playReady.token;

                    this.getWideVineToken().then( function ( widevine ) {
                        var widevineToken = widevine.token;


                        var getUrl = live ? this.getLiveStreamUrl : this.getStreamUrl;

                        getUrl(midOrChannel).then( function ( result ) {
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
                    }).then(
                        function (media) {
                            deferred.resolve(media);
                        },
                        function (error) {
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
                    }).then(
                        function (media) {
                            deferred.resolve(media);
                        },
                        function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            }

        };

        return new NepService();
    }
] );
