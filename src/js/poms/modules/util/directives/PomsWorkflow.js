angular.module( 'poms.util.directives' )
    .directive( 'pomsWorkflow', [ function () {
        return {
            restrict : 'E',
            template : '<p title="{{workflow.text}}" class="workflow {{workflow.id}}" > {{workflow.text}} </p>',
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

            },
            scope : {
                workflow : '=',
                mid : '=',
                onUpdated : '&',
                onDeleted : '&'
            }
        };
    } ] );
