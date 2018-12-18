angular.module( 'poms.util.directives' ).directive( 'favoriteFeedback', ['$rootScope', '$animate', function ( $rootScope, $animate ) {
        return {
            restrict: 'A',
            compile: function ( element ) {
                return function link ( scope, element ) {
                    $rootScope.$on( 'favoritesUpdated', function () {
                        $animate.addClass( element, 'saved' ).then( function () {
                            $animate.removeClass( element, 'saved' );
                        } );
                    } );

                };
            }
        };
    }] )



