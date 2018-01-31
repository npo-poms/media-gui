angular.module( 'poms.screen.services' ).factory( 'ScreenEditService', [
    'ScreenService',
    function ( screenService ) {

        function ScreenEditService () {
        }

        ScreenEditService.prototype = {

            hasReadPermission: function () {
                return true;
            },

            hasWritePermission: function () {
                return true;
            },

            title: function ( screen, text ) {
                return screenService.setTitle( screen, text );
            },

            description: function ( screen, text  ) {
                return screenService.setDescription( screen, text  );
            },

            url: function ( screen, text  ) {
                return screenService.setUrl( screen, text  );
            }

        };

        return new ScreenEditService();
    }
] );
