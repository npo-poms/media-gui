angular.module( 'poms.messages.services' ).factory( 'MessageService', [
    '$q',
    '$timeout',
    '$http',
    'appConfig',
    'NotificationService',
    'EditorService',
    function ( $q, $timeout, $http, appConfig, messagesListener, editorService) {

        var BASE_URL = appConfig.apihost + '/gui/messages';
        var RECONNECT_TIMEOUT = appConfig.RECONNECT_TIMEOUT || 30000;
        var PUBLICATIONS_REQUEST = appConfig.PUBLICATIONS_REQUEST || BASE_URL + '/publications';
        var PUBLICATIONS_TOPIC = appConfig.PUBLICATIONS_TOPIC || "/topic/publications";
        var ITEMIZER_TOPIC = "/topic/itemizer";
        var MESSAGES_TOPIC = "/topic/messages";
        var publicationListener = $q.defer();
        var itemizerListener = $q.defer();



        var client;
        var stomp;

        function initialize () {
            try {
                client = new SockJS(PUBLICATIONS_REQUEST);
                stomp = Stomp.over(client);
                stomp.connect({}, startListeners);
                stomp.debug = null;
                stomp.onclose = reconnect;
            } catch ( e ) {
                console.log( e )
            }

        }

        function startListeners () {
            stomp.subscribe( PUBLICATIONS_TOPIC, function ( data ) {
                publicationListener.notify( getMessage( data.body ) );
            } );

            stomp.subscribe( ITEMIZER_TOPIC, function ( data ) {
                itemizerListener.notify( getMessage( data.body ) );
            } );
            stomp.subscribe( MESSAGES_TOPIC, function ( data ) {
                var json = JSON.parse(data.body);
                if (json.receiverId == null || json.receiverId === editorService.getCurrentEditor().id) {
                    messagesListener.notify(json.text);
                }
            } );

        }

        function reconnect () {
            $timeout( function () {
                initialize();
            }, RECONNECT_TIMEOUT );
        }

        function getMessage ( data ) {
            return JSON.parse( data );
        }

        function MessageService () {
            initialize();
        }

        MessageService.prototype = {

            receivePublicationMessage: function () {
                return publicationListener.promise;
            },

            receiveItemizerMessage: function () {
                return itemizerListener.promise;
            },


            send: function ( message ) {
                stomp.send( PUBLICATIONS_BROKER, {
                    priority: 9
                }, JSON.stringify( {
                    message: message
                } ) );
            }

        };

        return new MessageService();
    }
] );

