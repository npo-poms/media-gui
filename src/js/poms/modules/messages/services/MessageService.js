angular.module( 'poms.messages.services' ).factory( 'MessageService', [
    '$q',
    '$timeout',
    '$http',
    'appConfig',
    'NotificationService',
    'EditorService',

    function ( $q, $timeout, $http, appConfig, notificationService, editorService) {

        var BASE_URL = appConfig.apiHost + '/gui/messages';
        var RECONNECT_TIMEOUT = appConfig.RECONNECT_TIMEOUT || 30000;
        var PUBLICATIONS_REQUEST = appConfig.PUBLICATIONS_REQUEST || BASE_URL + '/publications';
        var PUBLICATIONS_TOPIC = appConfig.PUBLICATIONS_TOPIC || "/topic/publications";
        var REPAINT_TOPIC =  "/topic/repaint";
        var ITEMIZER_TOPIC = "/topic/itemizer";
        var MESSAGES_TOPIC = "/topic/messages";
        var publicationListener = $q.defer();
        var itemizerListener = $q.defer();
        var repaintListener = $q.defer();

        var callbacks = {};
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
            stomp.subscribe( REPAINT_TOPIC, function ( data ) {
                console.log("repaint", data);
                repaintListener.notify( getMessage( data.body ) );
            } );
            stomp.subscribe( MESSAGES_TOPIC, function ( data ) {
                var json = JSON.parse(data.body);
                var callback = callbacks[json.id];
                if (callback) {
                    delete callbacks[json.id];
                    if (callback(json)) {
                        return;
                    }
                }
                if (json.receiverId == null || json.receiverId === editorService.getCurrentEditor().id) {
                    var debug = json.levelInt < 20;
                    console.log(json);
                    if (! debug) {
                        notificationService.notify(
                            json.text,
                            json.levelInt > 20 ? 'error' : 'success',
                            {
                                timeout: json.duration * 1000,
                                id: json.id,
                                creation: new Date(json.creation)
                            }
                        );
                    }
                }
            }.bind(this) );

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
            this.callbacks = callbacks;
        }

        MessageService.prototype = {

            receivePublicationMessage: function () {
                return publicationListener.promise;
            },

            receiveItemizerMessage: function () {
                return itemizerListener.promise;
            },
            
            receiveRepaintMessage: function () {
                return repaintListener.promise;
            },
            callback: function(id, f) {
                this.callbacks[id] = f;
            },

            send: function ( message ) {
                stomp.send(MESSAGES_TOPIC, {
                    priority: 9
                }, JSON.stringify( {
                    message: message
                }));
            }

        };

        return new MessageService();
    }
] );

