angular.module( 'poms.screen.directives' )
    .directive( 'pomsSecondScreens', function () {
        return {
            restrict: 'E',
            templateUrl: 'screen/screens-overview.html',
            controller: 'AllScreensController',
            controllerAs: 'allScreensController'
        }
    }
);

angular.module( 'poms.screen.directives' )
    .directive( 'pomsScreen', function () {
        return {
            restrict: 'E',
            templateUrl: 'screen/screen.html',
            controller: 'ScreenController',
            controllerAs: 'screenController',
            scope: {
                screen: '='
            }
        }
    }
);