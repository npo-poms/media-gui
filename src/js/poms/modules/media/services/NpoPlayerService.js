angular.module( 'poms.media.services' ).factory('NpoPlayerService',
    function ( $http, appConfig) {

        const playerRequestBase = appConfig.apiHost + '/gui/npoplayer';
        const NpoPlayerService = function () {};
        const players = {};
        const loadedPlayers = {};
        const playerElement = function(containerId) {
            if (typeof(containerId) === 'string') {
                return $('#' + containerId + " div")[0];
            } else {
                return containerId.find(" div")[0];
            }
        };
        const playerObject = function(containerId) {
            return players[containerId];
        };
        const loadedPlayer = function(containerId) {
            const player = playerObject(containerId);
            return player && loadedPlayers[containerId] ? player : null;
        };
        const playerClasses = function() {
            const NpoVideoPlayer = window.NpoPlayer && window.NpoPlayer.NpoVideoPlayer;
            const NpoVideoPlayerUIFactory = window.NpoVideoPlayerUIFactory &&
                window.NpoVideoPlayerUIFactory.NpoVideoPlayerUIFactory;

            if (!NpoVideoPlayer || !NpoVideoPlayerUIFactory) {
                throw new Error('NPO Player v2 is not available');
            }

            return {
                NpoVideoPlayer: NpoVideoPlayer,
                NpoVideoPlayerUIFactory: NpoVideoPlayerUIFactory
            };
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
                return $http({
                    method : 'GET',
                    url : playerRequestBase + request,
                    headers: {
                        "Accept": "application/json"
                    }
                }).then(function(resp) {
                    const classes = playerClasses();
                    let container = $('#' + containerId);
                    let playerConfig = {
                        autoplay: true,
                        mediaType: 'video',
                        options: {
                            muted: false
                        },
                        uiFactory: new classes.NpoVideoPlayerUIFactory(),
                    };

                    $("#" + containerId + "-placeholder").hide();
                    container.show();
                    let element = playerElement(container);
                    if (!element) {
                        throw new Error('NPO Player container has no player element');
                    }
                    let previousPlayer = playerObject(containerId);
                    if (previousPlayer) {
                        previousPlayer.destroy();
                        delete players[containerId];
                    }
                    let player = new classes.NpoVideoPlayer(playerConfig, element);
                    players[containerId] = player;
                    loadedPlayers[containerId] = false;

                    // the npo player itself could also determin the start, then we could just pass the mid of the segment
                    let streamOptions = {
                        autoplay: true,
                        endpoint: resp.data.endpoint,
                        startOffset: options.start
                        //endOffset: options.stop
                    };
                    container.addClass("playing");
                    container.addClass("size-" + size);

                    return player.load(resp.data.token, streamOptions).then(function() {
                        if (players[containerId] === player) {
                            loadedPlayers[containerId] = true;
                        }
                    }).catch(function(error) {
                        if (players[containerId] === player) {
                            delete players[containerId];
                            delete loadedPlayers[containerId];
                            container.removeClass("playing");
                            $("#" + containerId + "-placeholder").show();
                            container.hide();
                        }
                        player.destroy();
                        throw error;
                    });
                });
            },

            stop: function (containerId) {
                const container = $('#' + containerId);
                const player = playerObject(containerId);
                player && player.destroy();
                delete players[containerId];
                delete loadedPlayers[containerId];
                container.removeClass("playing");
                $("#" + containerId + "-placeholder").show();
                container.hide();
            },
            pause: function (containerId) {
                const player = playerObject(containerId);
                player && player.pause();
            },
            resume: function (containerId) {
                const player = loadedPlayer(containerId);
                return player ? player.play() : null;
            },
            seek: function (containerId, timestamp) {
                const player = loadedPlayer(containerId);
                player && player.seek(timestamp);
            },
            getCurrentTime: function (containerId) {
                const player = loadedPlayer(containerId);
                return player ? player.getCurrentTime() : null;
            },
            getDuration: function (containerId) {
                const player = loadedPlayer(containerId);
                return player ? player.getDuration() : null;
            }
        };

        return new NpoPlayerService();
    }
);
