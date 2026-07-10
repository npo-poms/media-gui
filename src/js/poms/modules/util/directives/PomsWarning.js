angular.module( 'poms.util.directives' )
    .directive( 'pomsWarning', [ '$sce', function ( $sce ) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                warning: '='
            },
            template: '<div class="tooltip-wrapper warning-tooltip" ng-click="warningClicked($event)">' +
                '<div class="tooltip-icon warning-icon"></div>' +
                '<div class="tooltip"><span ng-bind-html="warningHtml"></span></div>' +
                '</div>',
            controller: [ '$scope', function ( $scope ) {
                $scope.$watch( 'warning', function ( warning ) {
                    $scope.warningHtml = warning ? $sce.trustAsHtml( warning ) : '';
                } );

                $scope.warningClicked = function ( e ) {
                    e.stopPropagation();
                };
            } ]
        };
    } ] );
