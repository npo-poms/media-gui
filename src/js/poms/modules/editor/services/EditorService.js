angular.module( 'poms.editor.services' ).factory( 'EditorService', [
    '$q',
    '$rootScope',
    '$http',
    '$uibModal',
    'appConfig',
    'PomsEvents',
    'localStorageService',
    function ( $q, $rootScope, $http, $uibModal, appConfig, pomsEvents, localStorageService ) {

        const baseUrl = appConfig.apiHost + '/gui/editor';
        let rolesHolder = [];
        let editorHolder = null;

        function getOrganisations ( path ) {
            const deferred = $q.defer();
            const url = baseUrl + path;

            $http.get( url, {cache: true} ).then(
                function ( response ) {
                    const organisations = response.data;
                    deferred.resolve( organisations );
                },
                function ( error ) {
                    deferred.reject( error );
                }
            );

            return deferred.promise;
        }

        function post( path, body ) {
            const deferred = $q.defer();
            const url = baseUrl + path;

            $http.post( url, body ).then(
                function ( response ) {
                    const editor = response.data;
                    deferred.resolve( editor );
                },
                function ( error ) {
                    deferred.reject( error );
                }
            );

            return deferred.promise;
        }

        function EditorService () {
        }

        EditorService.heartBeatCount = 0;
        EditorService.heartBeatErrorCount = 0;
        EditorService.prototype = {
            init: function () {
                const deferred = $q.defer();
                this.hearbeatTimeout = 30000;
                const heartbeat = function () { // heartbeat (MSE-2949)
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
                            this.hearbeatTimeout = editor.heartbeat || this.hearbeatTimeout;
                            if (editorHolder && editor.authTime < editorHolder.authTime) {
                                console.log("Received editor", editor, "is older then current one", editorHolder);
                                return;
                            }
                            editorHolder = editor;
                            if (editor.id) {
                                localStorageService.set("currentUser", editor.id);
                            }
                            if (editor.loginAsap) {
                                const lastReload = localStorageService.get("lastReload");
                                console.log("Seem to be logged out. Forcing reload", editor, lastReload);
                                const reloadAfter = lastReload == null ? 0 : 10000;
                                localStorageService.set('lastReload', new Date());
                                setTimeout(function() {
                                    document.location.reload();
                                }, reloadAfter);
                                return;
                            } else {
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
                const modal = $uibModal.open({
                    controller: 'AccountController',
                    controllerAs: 'accountController',
                    templateUrl: '/views/gui/modal-account.html',
                    windowClass: 'modal-account',
                    resolve: {
                        editor: function () {
                            return editorHolder;
                        }.bind(this)
                    }
                });

                modal.result.then(
                    function ( editor ) {
                        angular.copy( editor, editorHolder );
                    }.bind( this )
                );

            },

            getCurrentEditor: function () {
                return editorHolder;
            },
            getKeycloakToken: function () {
                return editorHolder.keycloakToken;
            },
            getCurrentOwnerType: function() {
                const ownerType = localStorageService.get('currentOwner');
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

                // I'd say: simply return false, because that is logical thing to do
                if(_.isEmpty(roles) ){
                  throw new Error("We expect to check permission on at least one role");
                }
                if(_.isEmpty(rolesHolder)){
                  return false;
                }

                // I'd say that the code below contains a bug, if the above to cases will not come out of it naturally.

                const result = _.find(rolesHolder, function (roleHolder) {
                    return _.some(roles, function (role) {
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
                let hash = 0;
                if ( userId.length === 0 ) {
                    return hash;
                }
                for (let i = 0; i < userId.length; i ++ ) {
                    const char = userId.charCodeAt(i);
                    hash = ((hash << 12) - hash) + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                return prefix + Math.abs(hash);
            },

            refreshTokenInUrl: function(url) {
                const keyCloakToken = this.getKeycloakToken();
                const newUrl = new URL(url);
                newUrl.searchParams.set('access_token', keyCloakToken);
                return newUrl.toString();
            },

            openImage: function(event, url) {
                if (! url) {
                    url = event.currentTarget.getAttribute('href');
                }
                window.open(this.refreshTokenInUrl(url), event.currentTarget.target || "poms_image");
                event.preventDefault();

            }
        };

        return new EditorService();
    }
] );
