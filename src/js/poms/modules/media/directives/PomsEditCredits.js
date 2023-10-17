angular.module( 'poms.media.directives' )
    .directive( 'pomsCredits', [function () {
        return {
            restrict: 'E',
            templateUrl: '/views/edit/editables/poms-editable-credits.html',
            scope: {
                options: '&',
                load: '&',
                permission: '@',
                media: '=',
                header: '@',
                optionTitle: '@',
                optionField: '@',
                singleName: '@',
                helpField : '@'
            },
            controller: 'CreditsController',
            controllerAs: 'creditsController'
        };
    }] );
