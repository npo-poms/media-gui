angular.module( 'poms.media.directives' )
        .directive( 'pomsMulti', [function () {
            return {
                restrict: 'E',
                templateUrl: 'edit/editables/poms-multi.html',
                scope: {
                    options: '&',
                    load: '&',
                    save: '&',
                    permission: '@',
                    media: '=',
                    header: '@',
                    placeholder: '@',
                    helpField : '@'
                },
                controller: 'MultiEditController',
                controllerAs: 'multiEditController'
            };
        }] );