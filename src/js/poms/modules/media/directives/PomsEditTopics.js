angular.module( 'poms.media.directives' )
    .directive( 'pomsTopics', [function () {
        return {
            restrict: 'E',
            templateUrl: 'edit/editables/poms-editable-topics.html',
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
            controller: 'TopicsController',
            controllerAs: 'topicsController'
        };
    }] );