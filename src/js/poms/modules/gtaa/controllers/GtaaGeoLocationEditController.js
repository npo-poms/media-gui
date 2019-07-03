angular.module( 'poms.gtaa.controllers' )
    .controller( 'GtaaGeoLocationEditController', [
    '$scope',
    '$q',
    '$modalInstance',
    '$sce',
    'PomsEvents',
    'MediaService',
    'EditorService',
    'GtaaService',
    'roles',
    'media',
    'linkedGeoLocation',
    'create',
    (function () {

        function GtaaGeoLocationEditController ( $scope, $q, $modalInstance, $sce, pomsEvents, mediaService, editorService, gtaaService, roles, media, linkedGeoLocation, create ) {

            this.$scope = $scope;

            this.$scope.gtaaGeoLocation = '';
            this.$q = $q;
            this.$modalInstance = $modalInstance;
            this.$sce = $sce;
            this.media = media;

            this.pomsEvents = pomsEvents;
            this.mediaService = mediaService;
            this.editorService = editorService;
            this.gtaaService = gtaaService;

            this.$scope.waiting = false;
            this.$scope.create = create;
            this.$scope.roles = roles;
            this.$scope.linkedGeoLocation = linkedGeoLocation;
            this.$scope.geoLocation = {};

            this.$scope.registerNewGeoLocation = false;
            this.$scope.suggestions = [];


            if ( linkedGeoLocation ) {
                this.$scope.suggestData = linkedGeoLocation.givenName + " " + linkedGeoLocation.familyName;
                this.$scope.geoLocation = angular.copy( linkedGeoLocation );

                this.suggest( undefined, 6 ).then(
                    function ( result ) {
                        this.$scope.suggestions = result;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind( this )
                );

            }

            $scope.$watch( 'geoLocation', function ( newValue ) {
                this.$scope.geoLocationFormValid = this.isValid( newValue, this.$scope.geoLocation );
            }.bind( this ), true );

        }

        GtaaGeoLocationEditController.prototype = {

            cancel: function () {
                this.$modalInstance.dismiss();
            },

            isValid: function ( geoLocation ) {
                return (
                (geoLocation.role !== undefined && geoLocation.role.id !== undefined) &&
                ( geoLocation.familyName !== undefined && geoLocation.familyName !== '' ) &&
                ( geoLocation.givenName !== undefined && geoLocation.givenName !== '' )
                )
            },

            suggest: function ( data, max ) {

                if ( ! data ) {
                    data = angular.copy( this.$scope.suggestData );
                }

                this.$scope.suggestionsWaiting = true;
                return this.gtaaService.getGeoLocations( data, max ).then( function ( response ) {

                    angular.forEach( response, function ( value ) {

                        var regExp = /\s\([^)]+\)/;
                        var matches = regExp.exec( value.givenName );
                        if ( matches && matches.length ) {
                            value.qualifier = value.givenName.substr( matches.index );

                            value.givenName = value.givenName.substr( 0, matches.index );
                            value.familyName += value.qualifier;
                        }

                        this.buildDisplayValue( value );


                    }.bind( this ) );

                    if ( ! this.$scope.linkedGeoLocation ) {
                        response.push( {
                            'displayValue': 'Ik wil ' + data + ' als nieuw persoon registreren',
                            'new': data
                        } );
                    }

                    this.$scope.suggestionsWaiting = false;

                    return response;
                }.bind( this ) )
            },

            suggestionSelected: function ( data ) {
                if ( data.new ) {

                    this.$scope.registerNewGeoLocation = true;
                    this.$scope.selectedGeoLocation = undefined;

                    this.setGeoLocationName( '', '', false );
                    this.setGtaa( undefined );
                } else {
                    this.$scope.registerNewGeoLocation = false;
                    this.$scope.selectedGeoLocation = angular.copy( data );

                    this.setGtaa( this.$scope.selectedGeoLocation);
                    this.setGeoLocationName( this.$scope.selectedGeoLocation.givenName, this.$scope.selectedGeoLocation.familyName, false );
                }

            },

            recordSelected: function ( data ) {
                this.$scope.selectedGeoLocation = angular.copy( data );

                this.setGtaa( this.$scope.selectedGeoLocation);
                this.setGeoLocationName( this.$scope.selectedGeoLocation.givenName, this.$scope.selectedGeoLocation.familyName, false );
            },

            setGeoLocationName: function ( chosenGivenName, chosenFamilyName, knownAs ) {

                this.$scope.geoLocation.familyName = chosenFamilyName;
                this.$scope.geoLocation.givenName = chosenGivenName;
                if ( this.$scope.geoLocation.gtaaUri ) {
                    this.$scope.geoLocation.gtaaKnownAs = knownAs;
                }
            },

            setGtaa: function ( record ) {
                this.$scope.geoLocation.gtaaUri = record && record.gtaaUri;
                this.$scope.geoLocation.gtaaKnownAs = record && record.gtaaKnownAs;
                this.$scope.geoLocation.gtaaStatus = record && record.gtaaStatus;

            },

            buildDisplayValue: function ( value ) {
                value.displayValue = '';

                if ( value.givenName ) {
                    value.displayValue += value.givenName;
                }

                if ( value.familyName ) {
                    value.displayValue += ' ' + value.familyName;
                }
                //if ( value.knownAs && value.knownAs.length ) {
                //
                //    for ( var i = 0, len = value.knownAs.length; i < len; i ++ ) {
                //        value.displayValue += ' "' + (value.knownAs[i].givenName || "") + ' ' + (value.knownAs[i].familyName || "") + '"';
                //    }
                //}

                //if ( value.notes && value.notes.length ) {
                //    for ( var i = 0, len = value.notes.length; i < len; i ++ ) {
                //        value.displayValue += ' "' + (value.notes[i].value || "") + '"';
                //    }
                //}

                return value;
            },

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            },

            save: function () {
                this.$scope.waiting = true;

                return this.mediaService.addGeoLocation( this.media, this.$scope.geoLocation ).then(
                    function () {
                        this.$modalInstance.close();
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.waiting = false;

                        if ( error.violations ) {
                            for ( var violation in  error.violations ) {
                                this.$scope.errorText = error.violations[violation];
                                break;
                            }
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error );
                        }

                    }.bind( this )
                )
            },

            submitNewGeoLocation: function ( geoLocation ) {
                this.$scope.waiting = true;
                notes = [];
                if (geoLocation.note) {
                    notes.push(geoLocation.note);
                }
                notes.push('vanuit POMS voor: ' + this.media.mid);
                var newGeoLocation = {
                    'familyName': geoLocation.familyName,
                    'givenName': geoLocation.givenName,
                    'notes': notes,
                    'objectType': 'geoLocation'
                };

                return this.gtaaService.submitGeoLocation( newGeoLocation ).then(
                    function( result ){
                        return result
                    },
                    function(error){
                        this.$scope.$emit( this.pomsEvents.error, error );

                        this.$scope.waiting = false;
                    }.bind(this)
                );
            },

            submit: function () {
                this.$scope.waiting = true;
              // TEst
                this.$scope.geoLocation.gtaaUri="http://gtaa/123"
                this.$scope.geoLocation.name="Amsterdam Test"
                this.$scope.geoLocation.description="Capital of Netherlands"
                this.$scope.geoLocation.relationType={id: "SUBJECT"}


                if ( this.$scope.geoLocation.gtaaUri ) {
                    this.save();
                } else if ( this.$scope.geoLocation.name ) {

                    this.submitNewGeoLocation( this.$scope.geoLocation ).then(
                        function ( result ) {
                            if ( result.gtaaUri ) {
                                this.$scope.geoLocation.gtaaUri = result.gtaaUri;
                                this.save();
                            }
                        }.bind( this ),
                        function ( error ) {
                            this.$scope.waiting = false;

                            this.$scope.$emit( this.pomsEvents.error, error );
                        }.bind( this )
                    );
                }
            }


        };

        return GtaaGeoLocationEditController;
    }())
] );
