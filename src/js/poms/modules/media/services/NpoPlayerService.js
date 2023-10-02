angular.module( 'poms.media.services' ).factory('NpoPlayerService',
    function ( $http, $q, appConfig) {

        var playerRequestBase = appConfig.apiHost + '/gui/npoplayer';
        var NpoPlayerService = function () {};
        var playerELement =  function(containerId) {
            if (typeof(containerId) === 'string') {
                return $('#' + containerId + " div")[0];
            } else {
                return containerId.find(" div")[0];
            }
        };
        NpoPlayerService.prototype = {

            list: function(midOrParent) {
                return $http({
                    method : 'GET',
                    url : playerRequestBase + "/players/" + midOrParent,
                    headers: {
                        "Accept": "application/json"
                    } 
                });
            },
          
            
            play: function (containerId, request, size, options) {
                options = options || {};
                var deferred = $q.defer();
                $http({
                    method : 'GET',
                    url : playerRequestBase + request,
                    headers: {
                        "Accept": "application/json"
                    } 
                }).then(
                    function(resp){
                        let container = $('#' + containerId);
                        let  playerConfig = {
                            key: resp.data.key,
                            analytics: {
                                key: resp.data.analyticsKey
                            },
                            logs: {
                                level: 'info'
                            },
                            playback: {
                                muted: false,
                                autoplay: true
                            },
                        };
                        
                        $("#" + containerId + "-placeholder").hide();
                        container.show();
                        let element = playerELement(container);
                        let player = new NpoPlayer.default(element, playerConfig);
                        
                        // the npo player itself could also determin the start, then we could just pass the mid of the segment
                        player.loadStream(resp.data.token, {
                            endpoint: resp.data.endpoint,
                            startOffset: options.start,
                            endOffset: options.stop
                        });
                        container.addClass("playing");
                        container.addClass("size-" + size);
                    }
                );

                return deferred.promise;
            },
            stop: function (containerId) {
                container = $('#' + containerId);
                player =  playerELement(container).player;
                player && player.unload();
                container.removeClass("playing");
                $("#" + containerId + "-placeholder").show();
                container.hide();
            },
            pause: function (containerId) {
                player =  playerELement(containerId).player;
                player && player.pause();
            }
        
            
        };

        return new NpoPlayerService();
    }
);
