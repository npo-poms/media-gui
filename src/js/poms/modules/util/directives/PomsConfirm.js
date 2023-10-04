angular.module( 'poms.util.directives' ).directive( 'pomsConfirm', [function () {
    return {
        restrict: 'A',
        scope: {
            pomsConfirm: '=',
            pomsMessage: '=',
            pomsSubmitButtonText: '=',
            pomsSkip: '&',
            pomsSubmit: '&',
            pomsCancel: '&'
        },
        controller: function ( $scope, $modal ) {
            $scope.confirm = function () {
                // skip modal if provided function returns true
                if ( $scope.pomsSkip() ) {
                    $scope.pomsSubmit();
                    return;
                }

                var title = $scope.pomsConfirm ? $scope.pomsConfirm + ' verwijderen?' : 'verwijderen?';
                var message = $scope.pomsMessage || 'Je kunt dit niet meer ongedaan maken.';
                var submitButtonText = $scope.pomsSubmitButtonText || 'verwijderen';

                var modal = $modal.open( {
                    controller: 'ConfirmController',
                    controllerAs: 'controller',
                    templateUrl: 'util/confirm.html',
                    windowClass: 'modal-confirm',
                    resolve: {
                        title: function () {
                            return title;
                        },
                        message: function () {
                            return message;
                        },
                        cancel: function () {
                            return 'annuleer';
                        },
                        submit: function () {
                            return submitButtonText;
                        }
                    }
                } );

                modal.result.then(
                    function () {
                        if ( $scope.pomsSubmit ) {
                            $scope.pomsSubmit();
                        }
                    },
                    function () {
                        if ( $scope.pomsCancel ) {
                            $scope.pomsCancel();
                        }
                    }
                );
            }

        },
        compile: function ( element, attr ) {
            return function ( scope, element ) {
                element.on( 'click', function ( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                    scope.confirm();
                } );
            };
        }
    };
}] );
