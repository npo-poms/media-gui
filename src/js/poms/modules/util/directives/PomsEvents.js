angular.module('poms.util.directives')
        .directive('pomsDeleted', [function() {
            return {
                restrict : 'A',
                controller : function($scope, PomsEvents) {
                    if($scope.pomsDeleted) {
                        $scope.$on(PomsEvents.publication, function(e, publication) {
                            if(publication.mid === $scope.mid) {
                                if(publication.workflow.id === 'DELETED') {
                                    $scope.pomsDeleted();
                                }
                            }
                        });

                        $scope.$on(PomsEvents.deleted, function(e, mid) {
                            if(mid === $scope.mid) {
                                $scope.pomsDeleted();
                            }
                        });
                    }

                },
                scope : {
                    mid : '=',
                    pomsDeleted : '&'
                }
            };
        }]);
