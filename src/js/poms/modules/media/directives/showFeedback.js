angular.module( 'poms.media.directives' )
    .directive( 'saveFeedback', ['$animate', function ( $animate ) {
        return function ( scope, element ) {
            scope.$on( 'saved', function () {
                $animate.addClass( element, 'saved' ).then( function () {
                    $animate.removeClass( element, 'saved' );
                } );
            } );
        }
    }] );

angular.module( 'poms.media.directives' )
    .directive( 'statusFeedback', ['$animate', function ( $animate ) {
        return {
            compile: function ( element, attrs ) {
                return function link ( scope, element, attrs ) {
                    let first = true;
                    attrs.$observe( 'status', function ( value ) {
                        if ( ! first ) {
                            $animate.addClass( element, 'saved' ).then( function () {
                                $animate.removeClass( element, 'saved' );
                            } );
                        }
                        first = false;
                    } );

                };
            }
        };
    }] );
