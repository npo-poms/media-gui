angular.module( 'poms.util.directives' )
    .directive( 'pomsWorkflow', [ 'MediaService', 'EditorService', '$timeout', function (mediaService, editorService, $timeout) {
        return {
            restrict : 'E',

            templateUrl : '/views/template/poms-workflow.html',
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
                $scope.disablePublish = false;
                $scope.clickWorkflow = function(ev, media) {
                    if ($scope.mayPublish(media)) {
                        $scope.disablePublish = true;
                        $timeout(function() {
                            $scope.disablePublish = false;
                        }, 10000);
                        if (media.workflow.id === 'PUBLISHED') {
                            media.workflow.id =  'FOR_REPUBLICATION';
                        }
                        mediaService.publish(media);
                    }
                };
                $scope.mayPublish = function(media) {
                    if ($scope.disablePublish) {
                        return false;
                    }
                    var superUser = editorService.currentEditorHasRoles(['SUPERADMIN', 'SUPERUSER']);

                    return (media && media.permissions.WRITE) || superUser;
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
