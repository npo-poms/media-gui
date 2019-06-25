angular.module( 'poms.media.directives' )
    .directive( 'pomsGeolocations', [function () {
        return {
            restrict: 'E',
            templateUrl: 'edit/editables/poms-editable-geolocations.html',
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
            controller: 'GeoLocationsController',
            controllerAs: 'geoLocationsController'
        };
    }] );