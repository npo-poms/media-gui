angular.module( 'poms.util.directives' )
    .directive( 'pomsClipboard', [ 'NotificationService', function ( NotificationService ) {
        return {
            replace : false,

            templateUrl : 'views/util/poms-clipboard.html',

            scope : {
                field : '='
            },

            controller : function ( $scope, $rootScope, PomsEvents, $timeout, $element ) {

                $scope.copySuccess = function () {
                    $timeout( function () {
                        NotificationService.notify( 'gekopieerd: "' + $scope.field + '"' );
                    }, 0 )

                };

                $scope.copyFailed = function ( err ) {
                    $element.find( 'input' ).select();
                }

            }
        };
    } ] );
