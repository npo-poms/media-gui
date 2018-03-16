angular.module( 'poms.messages.services' ).factory( 'NotificationService', [
    'ngToast',
    function ( ngToast ) {

        function NotificationService () {
           /* ngToast.configure({
                combineDuplications: true
            });*/
        }

        NotificationService.prototype = {


            notify : function ( message, status, args) {
                args = args || {};
                args.timeout = args.timeout || 4000;
                var id = args.id ? "notification_" + args.id : null;
                var existing = document.querySelector( '#' + id);
                if (existing!= null) {
                    existing.innerHTML = message;
                } else {
                    var span = id ? "<span id='" + id + "'>" : "<span>";
                    ngToast.create({
                        className: status || "success",
                        timeout: args.timeout,
                        content: span + message + '</pan>'
                    });
                }
            }

        };

        return new NotificationService();
    }
] );

