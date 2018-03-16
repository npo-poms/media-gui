angular.module( 'poms.messages.services' ).factory( 'NotificationService', [
    'ngToast',
    function ( ngToast ) {

        function NotificationService () {
        }

        NotificationService.prototype = {

            notify : function ( message, status, timeout) {

                ngToast.create( {
                    className: status || "success",
                    timeout: timeout || 4000,
                    combineDuplications: true,
                    content: '<span>' + message + '</span>'
                });
            }

        };

        return new NotificationService();
    }
] );

