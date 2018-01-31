angular.module( 'poms.media.directives' )
    .directive( 'pomsPersons', [function () {
        return {
            restrict: 'E',
            templateUrl: 'edit/editables/poms-editable-persons.html',
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
            controller: 'PersonsController',
            controllerAs: 'personsController'
        };
    }] );