angular.module( 'poms.util.directives' )
    .directive( 'pomsInvalid', [function () {
        return {
            restrict: 'E',
            template: '<span class="inline-error" ng-show="violation">{{violation}}</span>',
            scope: {
                violation: '='
            }
        };
    }] );