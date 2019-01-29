angular.module( 'poms.util.directives')
    .directive( 'pomsViewer', [function () {
        return {
            restrict: 'E',
            templateUrl: 'edit/viewer.html',
            scope: {
                media: '=',
                type: "@",
                size: '@'
            },
            controller: function ( $scope, FavoritesService, MediaService, PomsEvents, NpoPlayerService, $q ) {

                var width, height;

                if ( $scope.size === 'small' ) {
                    width = 200;
                    height = 150
                } else {
                    width = 410;
                    height = 275
                }

                $scope.isPlayable = ($scope.media.locations > 0
                                    || ($scope.media.locations && $scope.media.locations.length > 0)
                                    || $scope.media.type.id === 'SEGMENT');

                $scope.play = function () {

                    var mid = $scope.media.mid;

                    if ( mid && ( $scope.media.locations > 0 || ( $scope.media.locations && $scope.media.locations.length > 0) ) ) {
                         setupPlayer( mid, mid );
                    }else if(  $scope.media.type.id === 'SEGMENT' ){

                        if ( !$scope.media.segmentOf ){

                            MediaService.load( mid ).then(
                                function ( media ) {
                                    if ( media.segmentOf ){
                                        getSegmentData( media.segmentOf.id, mid ).then(
                                            function ( data ) {
                                                setupPlayer(mid, media.segmentOf.id, data.start, data.stop );
                                            }
                                        );
                                    }
                                }.bind( this ),
                                function ( error ) {
                                    $scope.$emit( PomsEvents.error, error )
                                }.bind( this )
                            )

                        }else{
                            getSegmentData( $scope.media.segmentOf.id, mid ).then(
                                function ( data ) {
                                    setupPlayer( mid, $scope.media.segmentOf.id, data.start, data.stop );
                                }
                            );

                        }

                    }

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
                    return (media.episodeOf[ 0 ].type === 'Seizoen' && media.type === 'Uitzending');
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
                                        start: segments[i].start / 1000,
                                        stop: segments[i].stop / 1000
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

                setupPlayer = function (mid, midOrParent, start, stop ) {
                    NpoPlayerService.play(mid, midOrParent,  {start: start, stop: stop});
                }
            }
        };
    }] );
