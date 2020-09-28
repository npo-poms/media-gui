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

                    switch (error.cause) {
                        case 'CIRCULAR_REFERENCE':
                            template = 'util/modal-error/circular.html';
                            break;

                        case 'CONSTRAINT_VIOLATION':
                            template = 'util/modal-error/violation.html';
                            break;

                        case 'NOT_FOUND':
                            type = error.type;
                            console && console.log("Not found of type", type, error.message);
                            template = null;
                            break;

                        case 'NEP_EXCEPTION':
                            template = 'util/modal-error/nep.html';
                            break;

                        default:
                            template = 'util/modal-error/default.html';
                            break;
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
