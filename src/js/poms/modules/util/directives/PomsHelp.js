angular.module( 'poms.util.directives' )
    .directive( 'pomsHelp', ['HelpService', function ( helpService ) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/template/poms-help/poms-help.html',

            scope: {
                field: '@'
            },

            controller: function ( $scope ) {

                $scope.getHelp = function(){
                    if ( !$scope.message ){
                        helpService.getMessage( $scope.field ).then(
                            function ( message ) {
                                $scope.message = message;
                            }
                        );
                    }
                };

                $scope.helpClicked = function(e){
                    e.stopPropagation();
                };
            }
        };
    }] );
