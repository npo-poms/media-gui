angular.module( 'poms.media.controllers' ).controller( 'GtaaPersonsController', [
    '$scope',
    '$q',
    '$modal',
    'PomsEvents',
    'MediaService',
    'EditorService',
    ( function () {

        function load ( scope, pomsEvents, mediaService, media, dest ) {
            mediaService.getPersons( media ).then(
                function ( data ) {
                    angular.copy( data, dest );
                },
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }
            )
        }
        function GtaaPersonsController ( $scope, $q, $modal, pomsEvents, mediaService, editorService) {

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

        GtaaPersonsController.prototype = {

            editPerson: function (item) {
                var handleMessage = function ( message ) {
                    if (message.action === 'selected') {
                        concept = message.concept;
                        if (concept.objectType === "person") {
                            var parsedPerson = this.parsePerson(concept, message.role);
                            parsedPerson.id = item ? item.id : null;
                            if (parsedPerson.role) {
                                this.mediaService.setPerson(this.media, parsedPerson).then(
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
                                )
                            } else {
                                console.log("No role!");
                            }
                        } else {
                            throw "unrecognized type";
                        }
                    } else {
                        console && console.log("ignored because of action", message);
                    }
                     modal.close();

                 }.bind( this );
                var gtaaPopup = function () {
                    gtaa.open(handleMessage, {
                        //value: '',
                        //id: $( '#id' ).val(),
                        schemes: 'person',
                        id: item ? item.gtaaUri : null,
                        givenName: item ? item.givenName : null,
                        familyName: item ? item.familyName : null,
                        role: item && item.role ? item.role.id : null,
                        jwt: this.editorService.getCurrentEditor().gtaaJws,
                        jwtExpiration: this.editorService.getCurrentEditor().gtaaJwsExpiration,
                        iframe: "modal_iframe"
                    });
                }.bind(this);

                var modal = this.$modal.open( {
                    controller: "ModalIFrameController",
                    controllerAs: "controller",
                    templateUrl: 'edit/modal-iframe.html',
                    windowClass: 'modal-form modal-person',
                    resolve: {
                        "callback":  function() {
                            return gtaaPopup;
                        },
                        "title": function() {
                            return "Zoek een persoon in GTAA";
                        }
                    }
                });

            },

            addPerson: function ( item ) {
                this.editPerson( item );
            },

            parsePerson: function (person, role) {
                return {
                    givenName: person.givenName,
                    familyName: person.familyName,
                    scopeNotes: person.scopeNotes,
                    gtaaStatus: person.status,
                    gtaaUri: person.id,
                    role: role ? role.name : null
                };
            },

            removeOverride: function () {
                this.mediaService.removePersons(this.media).then(
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

            removePerson: function ( person ) {

                return this.mediaService.removePerson( this.$scope.media, person ).then(
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

        return GtaaPersonsController;
    }() )
] );
