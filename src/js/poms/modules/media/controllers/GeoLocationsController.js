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
                    scope.$emit( pomsEvents.error, error )
                }
            )
        }
        function GeoLocationsController ( $scope, $q, $modal, pomsEvents, mediaService, editorService, listService ) {

            this.items = [];

            this.$scope = $scope;
            this.$q = $q;
            this.$modal = $modal;

            this.media = $scope.media;
            this.pomsEvents = pomsEvents;

            this.mediaService = mediaService;
            this.editorService = editorService;

            this.mayWrite = mediaService.hasWritePermission( $scope.media, $scope.permission );
            this.mayRead = mediaService.hasReadPermission( $scope.media, $scope.permission );
            this.currentOwnerType = editorService.getCurrentOwnerType();

            load( $scope, this.pomsEvents, this.mediaService, this.media, this.items );

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
                                this.saveGeoLocation(parsedGeoLocation);
                                if(this.items.owner.text !== this.currentOwnerType ){
                                 this.saveGeoLocationsCopy();
                                }
                            } else {
                                throw "unrecognized type";
                            }
                        } else {
                            console && console.log("ignored because of action", message);
                        }

                    }.bind( this ), {
                        //value: '',
                        //id: $( '#id' ).val(),
                        schemes: 'geographicname',
                        jwt: this.editorService.getCurrentEditor().gtaaJws,
                        jwtExpiration: this.editorService.getCurrentEditor().gtaaJwsExpiration
                    }
                );

            },

            saveGeoLocation: function (parsedGeoLocation) {
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
            },

            parseGeoLocation: function (concept, role) {
                return {
                    name: concept.name || '',
                    scopeNotes: concept.scopeNotes,
                    gtaaStatus: concept.status || '',
                    gtaaUri: concept.id || '',
                    role: role ? role.name : null
                };
            },

            removeGeoLocation: function ( geoLocation ) {
                if(this.items.owner.text !== this.currentOwnerType ){
                  _.remove(this.items.values, function (item) { return item.gtaaUri === geoLocation.gtaaUri })
                  return this.saveGeoLocationsCopy();
                }
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
            },

            saveGeoLocationsCopy: function () {
              var copyGeoLocations =
                _.map(this.items.values,
                  function(geoLocation) {
                    delete geoLocation.id;
                    return geoLocation;}
                );
              copyGeoLocations.map(this.saveGeoLocation.bind(this))
            }

        };

        return GeoLocationsController;
    }() )
] );
