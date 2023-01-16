angular.module( 'poms.messages.services' ).factory( 'NotificationService', [
    'ngToast',
    '$filter',
    function ( ngToast,  $filter) {

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
                var creation = args.creation || new Date();
                var existing = document.querySelector( '.' + id);
                //console.log(message, status, args, id);
                var time = "<span class='timestamp' title='" + $filter('mediaDateTime')(creation) + "'>" + $filter('mediaTime')(creation) + "</span>";
                if (existing != null) {
                    existing.innerHTML = time + message;
                } else {
                    var span = id ? "<span class='" + id + "'>" : "<span>";
                    ngToast.create({
                        className: status,
                        timeout: args.timeout > 0 ? args.timeout : null,
                        dismissOnTimeout: args.timeout > 0,
                        content: span + time + message + '</span>'
                    });

                }
            }

        };

        return new NotificationService();
    }
] );

