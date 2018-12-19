angular.module( 'poms.editor.services' ).factory( 'EditorService', [
    '$q',
    '$rootScope',
    '$http',
    '$modal',
    'appConfig',
    'PomsEvents',
    'localStorageService',
    function ( $q, $rootScope, $http, $modal, appConfig, pomsEvents, localStorageService ) {

        var baseUrl = appConfig.apihost + '/gui/editor',
            roleHolder = 0,
            editorHolder = {},
            permissions = {
                'EXTERNAL': 1 << 0,
                'SUPPORT': 1 << 1,
                'USER': 1 << 2,
                'SUPERUSER': 1 << 3,
                'ADMIN': 1 << 4,
                'SUPERADMIN': 1 << 5,
                'GTAAUSER': 1 << 15,
                'UPLOAD': 1 << 16,
                'ENCODER': 1 << 17,
                'MIS': 1 << 18,
                'SCREENUSER': 1 << 24
            };

        function getOrganisations ( path ) {
            var deferred = $q.defer(),
                url = baseUrl + path;

            $http.get( url, {cache: true} )
                .success( function ( organisations ) {
                    deferred.resolve( organisations );
                } )
                .error( function ( error ) {
                    deferred.reject( error );
                } );

            return deferred.promise;
        }

        function post ( path, body ) {
            var deferred = $q.defer(),
                url = baseUrl + path;

            $http.post( url, body )
                .success( function ( editor ) {
                    deferred.resolve( editor );
                } )
                .error( function ( error ) {
                    deferred.reject( error );
                } );

            return deferred.promise;
        }

        function EditorService () {
        }

        EditorService.heartBeatCount = 0;
        EditorService.heartBeatErrorCount = 0;
        EditorService.prototype = {

            init: function () {
                var deferred = $q.defer();
                var heartbeat = function() { // heartbeat (MSE-2949)
                    if (EditorService.heartBeatCount++ > 0) {
                        console && console.log("Heartbeating ", new Date(), "count: " + EditorService.heartBeatCount, "errors: " + EditorService.heartBeatErrorCount);
                    }
                    setTimeout(function () {
                        this.init()
                    }.bind(this), 30000);
                }.bind(this);
                $http.get(baseUrl)
                    .then(
                        // success
                        function (response) {
                            editor = response.data;
                            localStorageService.set("currentUser", editor.id);
                            editor.hashId = this.getHashId( editor.id, 'user' );
                            editorHolder = editor;
                            roleHolder = editor.role;
                            delete editor.role;

                            deferred.resolve(editor);
                            heartbeat();
                        }.bind(this),
                        // errors
                        function (response) {
                            EditorService.heartBeatErrorCount++;
                            console && console.log("Error from heartbeat", response);
                            heartbeat();
                            deferred.reject(false)
                        }.bind(this)
                    );

                return deferred.promise;
            },

            editAccount: function () {
                var modal = $modal.open( {
                    controller: 'AccountController',
                    controllerAs: 'accountController',
                    templateUrl: 'gui/modal-account.html',
                    windowClass: 'modal-account',
                    resolve: {
                        editor: function () {
                            return editorHolder;
                        }.bind( this )
                    }
                } );

                modal.result.then(
                    function ( editor ) {
                        angular.copy( editor, editorHolder );
                    }.bind( this )
                );

            },

            getCurrentEditor: function () {
                return editorHolder;
            },

            getCurrentOwnerType: function() {
                var ownerType = localStorageService.get('ownerType');
                if(ownerType && ownerType.length > 0) {
                    return ownerType;
                }
                else if ( this.currentEditorHasRoles( ['MIS'] ) ){
                    return 'NPO';
                }else{
                    return 'BROADCASTER';
                }
            },

            currentEditorHasRoles: function ( roles ) {
                var bits = 0;

                for ( var i = 0; i < roles.length; i ++ ) {
                    var role = roles[i];
                    var permission = permissions[role];
                    if ( permission ) {
                        bits |= permission;
                    }
                }

                return (roleHolder & bits) !== 0;
            },

            setAccount: function ( account ) {
                return post( '', account );
            },

            getAllowedBroadcasters: function () {
                return getOrganisations( '/broadcasters' );
            },

            setActiveBroadcasters: function ( broadcasters ) {
                return post( '/broadcasters', broadcasters );
            },

            getAllowedPortals: function () {
                return getOrganisations( '/portals' );
            },

            setActivePortals: function ( portals ) {
                return post( 'portals', portals );
            },

            logOut: function () {
                window.location.href = baseUrl + '/logout';
            },

            getHashId: function ( userId, prefix ) {
                var hash = 0;
                if ( userId.length == 0 ) {
                    return hash;
                }
                for ( var i = 0; i < userId.length; i ++ ) {
                    var char = userId.charCodeAt( i );
                    hash = ((hash << 12) - hash) + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                return prefix + Math.abs(hash);

            }

        };

        return new EditorService();
    }
] );
