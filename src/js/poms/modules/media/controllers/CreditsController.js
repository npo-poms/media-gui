angular.module( 'poms.media.controllers' ).controller( 'CreditsController', [
    '$scope',
    '$q',
    '$modal',
    'PomsEvents',
    'MediaService',
    'EditorService',
    'GTAAService',
    ( function () {

        function load ( scope, pomsEvents, mediaService, media, dest ) {
            mediaService.getCredits( media ).then(
                function ( data ) {
                    angular.copy( data, dest );
                },
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }
            )
        }
        function CreditsController ( $scope, $q, $modal, pomsEvents, mediaService, editorService, gtaaService) {

            this.items = [];
            this.$scope = $scope;
            this.$q = $q;
            this.$modal = $modal;

            this.media = $scope.media;
            this.pomsEvents = pomsEvents;

            this.mediaService = mediaService;
            this.editorService = editorService;
            this.gtaaService = gtaaService;


            this.mayWrite = function() {
                return mediaService.hasWritePermission( $scope.media, $scope.permission );
            }.bind(this);
            this.mayRead = function() {
                return mediaService.hasReadPermission( $scope.media, $scope.permission );
            }.bind(this);
            this.currentOwnerType = editorService.getCurrentOwnerType();

            load( $scope, this.pomsEvents, this.mediaService, this.media, this.items );

            $scope.$on( pomsEvents.externalChange, function ( e, mid ) {
                if ( mid === $scope.media.mid ) {
                    load( $scope, this.pomsEvents, this.mediaService, this.media, this.items );
                }
            }.bind( this ) );

        }

        CreditsController.prototype = {
            editCredits: function (item) {
                this.gtaaService.modal(
                    "Zoek een persoon of andere naam in GTAA",
                    "person,name",
                    item,
                    function (concept, role ) {
                        var parsedCredits = this.parseConcept(concept, role);
                        parsedCredits.id = item ? item.id : null;
                        if (parsedCredits.role) {
                            this.mediaService.setCredits(this.media, parsedCredits)
                                .then(
                                    // TODO, I don't quite get why a load is needed, the call will return the new media object
                                    function () {
                                        load(this.$scope, this.pomsEvents, this.mediaService, this.media, this.items);
                                    }.bind(this),
                                    function (error) {
                                        if (error.violations) {
                                            for (var violation in  error.violations) {
                                                this.$scope.errorText = error.violations[violation];
                                                break;// what about the next error?
                                            }
                                        } else {
                                            this.$scope.$emit(this.pomsEvents.error, error);
                                        }
                                    }.bind(this)
                                );
                        } else {
                            console && console.log("No role!");
                        }
                    }.bind( this)
                );

            },

            addCredits: function ( item ) {
                this.editCredits( item );
            },

            parseConcept: function (concept, role) {
                return {
                    givenName: concept.givenName,
                    familyName: concept.familyName,
                    name: concept.name,
                    scopeNotes: concept.scopeNotes,
                    gtaaStatus: concept.status,
                    gtaaUri: concept.id,
                    role: role ? role.name : null,
                    type: concept.objectType
                };
            },

            removeOverride: function () {
                this.mediaService.removeCredits(this.media).then(
                    function (data) {
                        angular.copy(data, this.items);
                    }.bind(this),
                    function( error) {
                        this.errorHandler(error);
                    }.bind(this)
                )
            },

            errorHandler: function(error) {
                if (error.violations) {
                    for (var violation in  error.violations) {
                        this.$scope.errorText = error.violations[violation];
                        break;
                    }
                } else {
                    this.$scope.$emit(this.pomsEvents.error, error);
                }
            },

            removeCredits: function ( credits ) {

                return this.mediaService.removeCredits( this.$scope.media, credits ).then(
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

        return CreditsController;
    }() )
] );
