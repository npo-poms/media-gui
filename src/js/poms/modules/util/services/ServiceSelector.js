angular.module( 'poms.util.services' ).factory( 'ServiceSelector', [
    'ScreenService',
    'MediaService',
    'EditService',
    'ScreenEditService',
    function ( screenService, mediaService, editService, screenEditService ) {

        function ServiceSelector () {
        }

        ServiceSelector.prototype = {

            getService: function ( type ) {
                if ( type === 'screen' ) {
                    return screenService;
                } else if ( type === 'media' ) {
                    return mediaService;
                }
            },

            getEditService: function ( type ) {
                if ( type === 'screen' ) {
                    return screenEditService;
                } else if ( type === 'media' ) {
                    return editService;
                }
            },

        };

        return new ServiceSelector();

    }
] );