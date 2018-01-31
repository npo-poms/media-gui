angular.module( 'poms.media.directives' )
    .directive( 'pomsEditTools', [ function (  ) {
        return {
            restrict: 'E',
            replace: true,

            templateUrl: 'edit/editables/poms-edit-tools.html',

            scope: {
                helpField: '@',
                mayWrite: '='
            },

            controller: function ( $scope ) {

            }
        };
    }] );
