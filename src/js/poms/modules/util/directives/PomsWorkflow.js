angular.module( 'poms.util.directives' )
    .directive( 'pomsWorkflow', [ 'MediaService', function (mediaService) {
        return {
            restrict : 'E',

            templateUrl : 'template/poms-workflow.html',
            controller : function ( $scope, PomsEvents ) {
                $scope.$on( PomsEvents.publication, function ( e, publication ) {
                    if ( publication.mid === $scope.mid ) {
                        if ( publication.workflow.id !== 'DELETED' ) {
                            $scope.workflow = publication.workflow;
                        } else {
                            if ( $scope.onDeleted ) {
                                $scope.onDeleted();
                            }
                        }
                    }
                } );
                if ( $scope.onUpdated ) {
                    $scope.$on( PomsEvents.updated, function ( e, mid ) {
                        if ( mid === $scope.mid ) {
                            $scope.onUpdated();
                        }
                    } );
                }

                if ( $scope.onDeleted ) {
                    $scope.$on( PomsEvents.deleted, function ( e, mid ) {
                        if ( mid === $scope.mid ) {
                            $scope.onDeleted();
                        }
                    } );
                }
                $scope.clickWorkflow = function(ev, media) {
                    mediaService.publish(media);
                };

            },
            scope : {
                workflow : '=',
                mid : '=',
                media: '=',
                onUpdated : '&',
                onDeleted : '&'
            }
        };
    } ] );
