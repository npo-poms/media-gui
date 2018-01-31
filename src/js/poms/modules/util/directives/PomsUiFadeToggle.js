angular.module( 'poms.util.directives' ).directive( 'uiFadeToggle', function () {
    return {
        link: function ( scope, element, attrs ) {
            scope.$watch( attrs.uiFadeToggle, function ( val, oldVal ) {
                if ( val === oldVal ) {
                    return;
                }
                element[val ? 'fadeIn' : 'fadeOut']( 300 );
            } );
        }
    }
} );