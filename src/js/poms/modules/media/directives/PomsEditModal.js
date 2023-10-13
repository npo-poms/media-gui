angular.module( 'poms.media.directives' )
    .directive( 'pomsEditableModal', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/edit/editables/poms-editable-modal.html',
            scope: {
                options: '&',
                platforms: '&',
                load: '&',
                permission: '@',
                media: '=',
                header: '@',
                optionTitle: '@',
                optionField: '@',
                setRestriction: '&',
                columns: '&',
                removeRestriction: '&',
                moveRestriction: '&',
                singleName: '@',
                helpField: '@'
            },
            controller: 'ModalTableEditController',
            controllerAs: 'modalTableEditController'
        };
    }] );
