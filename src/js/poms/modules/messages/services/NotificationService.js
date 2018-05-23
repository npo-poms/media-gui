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
                status = status || "success";
                var id = args.id ? "notification_" + status + "_" + args.id : null;
                var existing = document.querySelector( '.' + id);
                if (existing!= null) {
                    existing.innerHTML = message;
                } else {
                    var span = id ? "<span class='" + id + "'>" : "<span>";
                    ngToast.create({
                        className: status,
                        timeout: args.timeout > 0 ? args.timeout : null,
                        dismissOnTimeout: args.timeout > 0,
                        content: span + message + '</span>'
                    });

                }
            }

        };

        return new NotificationService();
    }
] );

