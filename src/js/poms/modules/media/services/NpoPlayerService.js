angular.module( 'poms.media.services' ).factory('NpoPlayerService',
    function ( $http, $q, appConfig) {

        const playerRequestBase = appConfig.apiHost + '/gui/npoplayer';
        const NpoPlayerService = function () {
        };
        const playerELement = function (containerId) {
            if (typeof (containerId) === 'string') {
                return $('#' + containerId + " div")[0];
            } else {
                return containerId.find(" div")[0];
            }
        };
        const playerObject = function (containerId) {
            element = playerELement(containerId);
            player = element ? element.player : null;
            return player;
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
                const deferred = $q.defer();
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
                            logs: {
                                level: 'info'
                            },
                            playback: {
                                muted: false,
                                autoplay: true
                            },
                        };
                        if (resp.data.analyticsKey) {
                            playerConfig.analytics = {
                                key: resp.data.analyticsKey
                            }
                        }

                        $("#" + containerId + "-placeholder").hide();
                        container.show();
                        const element = playerELement(container);
                        //console.log("element", element);
                        const player = new NpoPlayer.default(element, playerConfig);

                        // the npo player itself could also determin the start, then we could just pass the mid of the segment
                        const streamOptions = {
                            endpoint: resp.data.endpoint,
                            startOffset: options.start
                            //endOffset: options.stop
                        };
                        console.log("player with options", streamOptions);
                        player.loadStream(resp.data.token, streamOptions);
                        container.addClass("playing");
                        container.addClass("size-" + size);
                    }
                );

                return deferred.promise;
            },

            stop: function (containerId) {
                container = $('#' + containerId);
                player =  playerObject(containerId);
                player && player.unload();
                container.removeClass("playing");
                $("#" + containerId + "-placeholder").show();
                container.hide();
            },
            pause: function (containerId) {
                player =  playerObject(containerId);
                player && player.pause();
            }
        };

        return new NpoPlayerService();
    }
);
