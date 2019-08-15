angular.module( 'poms.media.directives' )
    .directive( 'pomsGtaaPersons', [function () {
        return {
            restrict: 'E',
            templateUrl: 'edit/editables/poms-editable-gtaapersons.html',
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
            controller: 'GtaaPersonsController',
            controllerAs: 'gtaaPersonsController'
        };
    }] );