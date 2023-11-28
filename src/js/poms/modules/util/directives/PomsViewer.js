angular.module( 'poms.util.directives')
    .directive( 'pomsViewer', [function () {
        return {
            restrict: 'E',
            templateUrl: 'edit/viewer.html',
            scope: {
                media: '=',
                playertype: "@", // if set will be inserted into the id of the player. This was the same object can e.g. be in a modal, and in an editor.
                size: '@'
            },
            controller: function ( $scope, $rootScope, FavoritesService, MediaService, PomsEvents, NpoPlayerService, $q ) {
                $scope.containerId = 'viewer-' + ($scope.playertype ? $scope.playertype + '-' : '') + $scope.media.mid;
                $scope.isPlayable = $scope.media.playable;


                $scope.play = function () {

                    var mid = $scope.media.mid;
                    if ( mid && ( $scope.media.locations > 0 || ( $scope.media.locations && $scope.media.locations.length > 0) ) ) {
                         setupPlayer(mid).then(function() {
                             startPlayer(mid, {})
                         });
                    } else if(  $scope.media.type.id === 'SEGMENT' ){
                        if ( !$scope.media.segmentOf ) {
                            MediaService.load( mid ).then(
                                function ( media ) {
                                    if ( media.segmentOf ){
                                        getSegmentData( media.segmentOf.id, mid ).then(
                                            function ( data ) {
                                                setupPlayer(media.segmentOf.id).then(function() {
                                                    startPlayer(mid, {start: data.start, stop: data.stop})
                                                });
                                            }
                                        );
                                    }
                                }.bind( this ),
                                function ( error ) {
                                    $scope.$emit( PomsEvents.error, error )
                                }.bind( this )
                            )

                        } else {
                            getSegmentData( $scope.media.segmentOf.id, mid ).then(
                                function ( data ) {
                                    setupPlayer( $scope.media.segmentOf.id).then(function() {
                                        startPlayer(mid, {start: data.start, stop: data.stop})
                                    });
                                }
                            );
                        }
                    }
                };
                $scope.stop = function () {
                    NpoPlayerService.stop( $scope.containerId);
                };

                $scope.pause = function () {
                    NpoPlayerService.pause( $scope.containerId);
                };

                $scope.editRef = function ( mid ) {
                    return '#/edit/' + mid;
                };

                $scope.addFavorite = function () {
                    FavoritesService.addMediaItem( $scope.media );
                };

                $scope.isFavorite = function () {
                    return FavoritesService.isFavoriteMedia( $scope.media );
                };

                $scope.isAflevering = function ( media ) {
                    return (media.episodeOf[0].type.id === 'SEASON' && media.type.id === 'BROADCAST');
                };

                getSegmentData = function ( parentMid, mid ) {
                    return MediaService.load( parentMid ).then(
                        function ( parentMedia ) {
                            return MediaService.getSegments( parentMedia )
                        }.bind( this ),
                        function ( error ) {
                            $scope.$emit( PomsEvents.error, error )
                        }.bind( this )
                    ).then(
                        function ( segments ) {
                            var deferred = $q.defer();
                            for ( var i = 0; i < segments.length; i ++ ) {
                                if ( segments[i].mid === mid ) {
                                    deferred.resolve ( {
                                        start: segments[i].start.inMillis / 1000,
                                        stop: segments[i].stop.inMillis / 1000
                                    });
                                }
                            }
                            return deferred.promise;
                        }.bind( this ),
                        function ( error ) {
                            $scope.$emit( PomsEvents.error, error )
                        }.bind( this )
                    );
                };
                restartPlayer = function () {
                    $scope.stop();
                    $scope.play();
                };

                setupPlayer = function(midOrParent) {
                    if (!$scope.players) {

                        return NpoPlayerService.list(midOrParent).then(function (resp) {
                            $scope.players = resp.data;
                            $scope.selected = {"value": $scope.players[0]};
                            $scope.$watch('selected.value', function(newValue, oldValue) {
                                if (newValue !== oldValue) {
                                    restartPlayer();
                                }
                            }.bind(this))
                        }.bind(this));
                    }
                    $scope.players = $scope.players || [];
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                };
                startPlayer = function (containerId, options ) {
                    player = $scope.selected.value;
                    NpoPlayerService.play($scope.containerId, player.request, $scope.size, options);
                    $rootScope.$on(PomsEvents.tabChanged, function ( ) {
                        $scope.pause();
                    }.bind(this));
                };
            }
        };
    }] );
