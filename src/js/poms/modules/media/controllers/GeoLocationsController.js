angular.module( 'poms.media.controllers' ).controller( 'GeoLocationsController', [
    '$scope',
    '$q',
    '$modal',
    'PomsEvents',
    'MediaService',
    'EditorService',
    'ListService',
    ( function () {

        function load ( scope, pomsEvents, mediaService, media, dest ) {
            mediaService.getGeoLocations( media ).then(
                function ( data ) {
                    angular.copy( data, dest );
                },
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }
            )
        }
        function GeoLocationsController ( $scope, $q, $modal, pomsEvents, mediaService, editorService, listService ) {

            this.items = [];

            this.options = [];

            this.$scope = $scope;
            this.$q = $q;
            this.$modal = $modal;

            this.media = $scope.media;
            this.pomsEvents = pomsEvents;

            this.mediaService = mediaService;
            this.editorService = editorService;

            this.mayWrite = mediaService.hasWritePermission( $scope.media, $scope.permission );
            this.mayRead = mediaService.hasReadPermission( $scope.media, $scope.permission );

            this.maySkipGtaa = this.editorService.currentEditorHasRoles( [ 'SUPERADMIN', 'ADMIN' ] );

            listService.getGuiVariables().then(
                function ( data ) {
                    this.guiVariables = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );

            load( $scope, this.pomsEvents, this.mediaService, this.media, this.items );

            $scope.options().then(
                function ( data ) {
                    if ( data.length < 1 ) {
                        this.mayWrite = false;
                    } else {
                        angular.copy( data, this.options );
                    }
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( this.pomsEvents.error, error )
                }.bind( this )
            );

            $scope.$on( pomsEvents.externalChange, function ( e, mid ) {
                if ( mid === $scope.media.mid ) {
                    this.load();
                }
            }.bind( this ) );

        }

        GeoLocationsController.prototype = {

            addGeoLocation: function () {

                gtaa.open(
                    function ( message ) {
                        if (message.action === 'selected') {
                            concept = message.concept;
                            if (concept.objectType === "geographicname") {
                                var parsedGeoLocation = this.parseGeoLocation(concept, message.role);
                                if (parsedGeoLocation.role) {
                                    this.mediaService.addGeoLocation(this.media, parsedGeoLocation).then(
                                        function () {
                                            load(this.$scope, this.pomsEvents, this.mediaService, this.media, this.items);
                                        }.bind(this),
                                        function (error) {
                                            if (error.violations) {
                                                for (var violation in  error.violations) {
                                                    this.$scope.errorText = error.violations[violation];
                                                    break;
                                                }
                                            } else {
                                                this.$scope.$emit(this.pomsEvents.error, error);
                                            }
                                        }.bind(this)
                                    )
                                }
                            } else {
                                throw "unrecognized type";
                            }
                        } else {
                            console && console.log("ignored because of action", message);
                        }

                    }.bind( this ), {
                        value: '',
                        //id: $( '#id' ).val(),
                        schemes: 'geographicname',
                        jwt: this.editorService.getCurrentEditor().gtaaJws
                    }
                );

            },

            editGeoLocation: function ( item ) {
                this.addGeoLocation( item );
            },

            parseGeoLocation: function (concept, role) {
                return {
                    name: concept.value || '',
                    description: concept.notes ? concept.notes[ 0 ].value || '' : '',
                    status: concept.status || '',
                    gtaaUri: concept.id || '',
                    role: role ? role.name : null
                };
            },

            removeGeoLocation: function ( geoLocation ) {

                return this.mediaService.removeGeoLocation( this.$scope.media, geoLocation ).then(
                    function () {
                        load( this.$scope, this.pomsEvents, this.mediaService, this.media, this.items );
                        return true
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        return false;
                    }.bind( this ) ).finally(
                    function () {
                        load( this.$scope, this.pomsEvents, this.mediaService, this.media, this.items );
                        return true;
                    }.bind( this )
                );
            }

        };

        return GeoLocationsController;
    }() )
] );
