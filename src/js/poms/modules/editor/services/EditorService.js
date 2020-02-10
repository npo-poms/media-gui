angular.module( 'poms.editor.services' ).factory( 'EditorService', [
    '$q',
    '$rootScope',
    '$http',
    '$modal',
    'appConfig',
    'PomsEvents',
    'localStorageService',
    function ( $q, $rootScope, $http, $modal, appConfig, pomsEvents, localStorageService ) {

        var baseUrl = appConfig.apiHost + '/gui/editor';
        var rolesHolder = [];
        var editorHolder = null;

        function getOrganisations ( path ) {
            var deferred = $q.defer();
            var url = baseUrl + path;

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
            var deferred = $q.defer();
            var url = baseUrl + path;

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
                            if (editorHolder && editor.created < editorHolder.created) {
                                console.log("Received editor", editor, "is older then current one", editorHolder);
                                return;
                            }
                            editorHolder = editor;
                            if (editor.id) {
                                localStorageService.set("currentUser", editor.id);
                            }
                            if (editor.loginAsap) {
                                console.log("Seem to be logged out. Forcing reload", editor);
                                document.location.reload();
                                return;
                            }
                            if(editor.currentOwner) {
                                localStorageService.set("currentOwner", editor.currentOwner.id);
                            }
                            editor.hashId = this.getHashId( editor.id, 'user' );
                            rolesHolder = editor.roles;
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
                var ownerType = localStorageService.get('currentOwner');
                if(ownerType && ownerType.length > 0) {
                    return ownerType;
                }else{
                    return 'BROADCASTER';
                }
            },

            /**
             * Checks whether the current user has at least one of the given roles
             */
            currentEditorHasRoles: function ( roles ) {

//                console.log("check:" + roles);
//                console.log(rolesHolder);

                // I'd say: simply return false, because that is logical thing to do
                if(_.isEmpty(roles) ){
                  throw new Error("We expect to check permission on at least one role");
                }
                if(_.isEmpty(rolesHolder)){
                  return false;
                }

                // I'd say that the code below contains a bug, if the above to cases will not come out of it naturally.

                var result = _.find(rolesHolder, function(roleHolder) {
                    return _.some(roles, function(role) {
                        return 'MEDIA_' + role === roleHolder;
                    });
                });
                return Boolean(result);
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
                window.location.href = baseUrl + '/logout?url=' + encodeURIComponent(window.location.href);
            },

            getHashId: function ( userId, prefix ) {
                var hash = 0;
                if ( userId.length === 0 ) {
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
