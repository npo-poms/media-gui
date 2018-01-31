angular.module( 'poms.media.directives' )
    .directive( 'pomsEditor', [function () {
        return {
            restrict: 'E',
            templateUrl: 'media/editor.html',
            transclude: true,
            scope: {
                media: '='
            }
        };
    }] )
    .directive( 'pomsEdit', [function () {
        return {
            restrict: 'E',
            templateUrl: 'media/general.html',
            transclude: true,
            scope: {
                section: '@section',
                media: '='
            }
        };
    }] )
    .directive( 'pomsImages', [function () {
        return {
            restrict: 'E',
            templateUrl: 'media/images.html',
            transclude: true,
            scope: {
                section: '@section',
                media: '=',
                type: '@'
            }
        };
    }] )
    .directive( 'pomsLocations', [function () {
        return {
            restrict: 'E',
            templateUrl: 'media/locations.html',
            transclude: true,
            scope: {
                section: '@section',
                media: '='
            }
        };
    }] )
    .directive( 'pomsMembers', [function () {
        return {
            restrict: 'E',
            templateUrl: 'media/members.html',
            transclude: true,
            scope: {
                type: '@',
                section: '@',
                header: '@',
                media: '=',
                helpField: '@',
                item: '@'
            }
        };
    }] )
    .directive( 'pomsRelations', [function () {
        return {
            restrict: 'E',
            templateUrl: 'media/relations.html',
            transclude: true,
            scope: {
                section: '@section',
                media: '='
            }
        };
    }] )
    .directive( 'pomsSegments', [function () {
        return {
            restrict: 'E',
            templateUrl: 'media/segments.html',
            transclude: true,
            scope: {
                section: '@section',
                media: '='
            }
        };
    }] )
    .directive( 'pomsScheduleevents', [function () {
            return {
            restrict: 'E',
            templateUrl: 'media/schedule-events.html',
            transclude: true,
            scope: {
                section: '@section',
                media: '='
            }
        };
    }] );

