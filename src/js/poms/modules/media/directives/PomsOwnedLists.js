angular.module( 'poms.media.directives' )
    .directive( 'pomsOwnedlists', [function () {
        return {
            restrict: 'E',
            templateUrl: 'edit/editables/poms-ownedlists.html',
            scope: {
              media: '=',
              helpField : '@',
              header: '@',
              options: '@',
              load: '@',
              save: '@',
              removeAll: '@',
              name: '@',
              label: '@'
            },
            controller: 'OwnedListsController',
            controllerAs: 'ownedListsController'
        };
    }] );