angular.module( 'poms.util.directives' )
    .directive( 'pomsAlert', [function () {
        return {
            restrict: 'A',
            controller: function ( $rootScope, $scope, $modal, PomsEvents) {
                var errorOpen = false;

                $rootScope.$on( PomsEvents.error, function ( event, error ) {
                    var template;
                    if (! error) {
                        return;
                    }
                    switch (error.code) {
                        case 'nl.vpro.exception.circularReference':
                            template = 'util/modal-error/circular.html';
                            break;
                        case 'nl.vpro.exception.constraintViolation':
                            template = 'util/modal-error/violation.html';
                            break;
                        case 'nl.vpro.notFound':
                            // Because the status code will be 404, this code is never hit.
                            type = error.type;
                            console && console.log("Not found of type", type, error.message);
                            template = null;
                            break;
                        default:
                            template = 'util/modal-error/default.html';
                    }
                    if (template) {
                        var modal = $modal.open({
                            controller: 'AlertController',
                            controllerAs: 'alertController',
                            templateUrl: template,
                            windowClass: 'modal-error',
                            resolve: {
                                error: function () {
                                    return error;
                                }
                            }
                        });
                    }
                });
            }
        };
    }]
);
