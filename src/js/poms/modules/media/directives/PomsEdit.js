angular.module( 'poms.media.directives' )
    .directive( 'pomsEditor', [function () {
        return {
            restrict: 'E',
            templateUrl: '/views/media/editor.html',
            transclude: true,
            scope: {
                media: '='
            }
        };
    }] )
    .directive( 'pomsEdit', [function () {
        return {
            restrict: 'E',
            templateUrl: '/views/media/general.html',
            transclude: true,
            scope: {
                generalsection: '@generalsection',
                labelssection: '@labelssection',
                media: '='
            }
        };
    }] )

    .directive( 'pomsImages', [function () {
        return {
            restrict: 'E',
            templateUrl: '/views/media/images.html',
            transclude: true,
            scope: {
                section: '@section',
                media: '=',
                type: '@'
            }
        };
    }] )
    .directive( 'pomsPredictions', [function () {
        return {
            restrict: 'E',
            templateUrl: '/views/media/predictions.html',
            transclude: true,
            scope: {
                section: '@section',
                media: '='
            }
        };
    }] )
    .directive( 'pomsLocations', [function () {
        return {
            restrict: 'E',
            templateUrl: '/views/media/locations.html',
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
            templateUrl: '/views/media/members.html',
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
            templateUrl: '/views/media/relations.html',
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
            templateUrl: '/views/media/segments.html',
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
            templateUrl: '/views/media/schedule-events.html',
            transclude: true,
            scope: {
                section: '@section',
                media: '='
            }
        };
    }] )

;

