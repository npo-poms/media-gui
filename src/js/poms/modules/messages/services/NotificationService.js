angular.module( 'poms.messages.services' ).factory( 'NotificationService', [
    'ngToast',
    function ( ngToast ) {

        function NotificationService () {
        }

        NotificationService.prototype = {

            notify : function ( message, status ) {

                var notification = {
                    content : '<span>' + message + '</span>'
                };

                if ( status ){
                    notification.className = status;
                }

                ngToast.create( notification );
            }

        };

        return new NotificationService();
    }
] );

