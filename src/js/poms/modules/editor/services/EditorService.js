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
        EditorService.asapCount = 0;
        EditorService.prototype = {

            init: function () {
                const deferred = $q.defer();
                this.hearbeatTimeout = 30000;
                const heartbeat = function() { // heartbeat (MSE-2949)
                    if (EditorService.heartBeatCount++ > 0) {
                        console && console.log("Heartbeating ", new Date(), "count: " + EditorService.heartBeatCount, "errors: " + EditorService.heartBeatErrorCount);
                    }
                    setTimeout(function () {
                        this.init()
                    }.bind(this), this.hearbeatTimeout);
                }.bind(this);
                $http.get(baseUrl)
                    .then(
                        // success
                        function (response) {
                            const editor = response.data;
                            if (! angular.isObject(editor)) {
                                // e.g. an empty response, or a html page because of a redirect to login. That is not an editor, and should not replace the current one.
                                EditorService.heartBeatErrorCount++;
                                console && console.log("Not an editor received from heartbeat", response);
                                heartbeat();
                                deferred.reject(false);
                                return;
                            }
                            this.hearbeatTimeout = editor.hearbeat || this.hearbeatTimeout;
                            if (editorHolder && editor.created < editorHolder.created) {
                                console.log("Received editor", editor, "is older then current one", editorHolder);
                                return;
                            }
                            editorHolder = editor;
                            if (editor.id) {
                                localStorageService.set("currentUser", editor.id);
                            }
                            if (editor.loginAsap) {
                                EditorService.asapCount++;
                                const lastReload = localStorageService.get("lastReload");
                                if (EditorService.asapCount > 1) {
                                    console.log(baseUrl, response, "Seems to be logged out. Forcing reload", editor, lastReload);
                                    const reloadAfter = lastReload == null ? 0 : 10000;
                                    localStorageService.set('lastReload', new Date());
                                    setTimeout(function () {
                                        document.location.reload();
                                    }, reloadAfter);
                                } else {
                                    console.log(baseUrl, response, "Seems to be logged out. Giving another change", editor, lastReload, EditorService.asapCount);

                                }
                                return;
                            } else {
                                EditorService.asapCount = 0;
                                localStorageService.set("lastReload", null);
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
                            // if the editor is not loaded (yet), load it first. Otherwise the dialog would edit, and post, nothing.
                            // (not via init(), since that would start another heartbeat)
                            return editorHolder || $http.get( baseUrl ).then( function ( response ) {
                                return angular.isObject( response.data ) ? response.data : $q.reject( response );
                            } );
                        }.bind( this )
                    }
                } );

                modal.result.then(
                    function ( editor ) {
                        if (editorHolder) {
                            angular.copy( editor, editorHolder );
                        } else {
                            editorHolder = editor;
                        }
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
                if (! angular.isObject(account)) {
                    console && console.log("Not posting account without editor", account);
                    return $q.reject( {message: 'Gebruikersgegevens zijn (nog) niet geladen. Probeer het opnieuw.'} );
                }
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
                return post( '/portals', portals );
            },

            getAllowedThirdParties: function () {
                return getOrganisations( '/thirdparties' );
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
