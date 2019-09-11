angular.module( 'poms.media.directives' )
    .directive( 'pomsEditTools', [ function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'edit/editables/poms-edit-tools.html',
            scope: {
                helpField: '@',
                mayWrite: '=',
                mayRemoveOverride: '=',
                deleteScope: '='
            },
            link: function ( $scope ) {

                $scope.delete = function ( e ) {
                    if ( e ) {
                        e.stopPropagation();
                    }
                    if ( $scope.deleteScope ) {
                        $scope.deleteScope.removeOverride();
                    } else {
                        $scope.$parent.removeOverride();
                    }
                }

            }
        };
    } ] );
