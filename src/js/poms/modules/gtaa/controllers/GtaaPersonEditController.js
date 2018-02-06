angular.module( 'poms.gtaa.controllers' )
    .controller( 'GtaaPersonEditController', [
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
    'linkedPerson',
    'create',
    (function () {

        function GtaaPersonEditController ( $scope, $q, $modalInstance, $sce, pomsEvents, mediaService, editorService, gtaaService, roles, media, linkedPerson, create ) {

            this.$scope = $scope;

            this.$scope.gtaaPerson = '';
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
            this.$scope.linkedPerson = linkedPerson;
            this.$scope.person = {};

            this.$scope.registerNewPerson = false;
            this.$scope.suggestions = [];


            if ( linkedPerson ) {
                this.$scope.suggestData = linkedPerson.givenName + " " + linkedPerson.familyName;
                this.$scope.person = angular.copy( linkedPerson );

                this.suggest( undefined, 6 ).then(
                    function ( result ) {
                        this.$scope.suggestions = result;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind( this )
                );

            }

            $scope.$watch( 'person', function ( newValue ) {
                this.$scope.personFormValid = this.isValid( newValue, this.$scope.person );
            }.bind( this ), true );

        }

        GtaaPersonEditController.prototype = {

            cancel: function () {
                this.$modalInstance.dismiss();
            },

            isValid: function ( person ) {
                return (
                (person.role !== undefined && person.role.id !== undefined) &&
                ( person.familyName !== undefined && person.familyName !== '' ) &&
                ( person.givenName !== undefined && person.givenName !== '' )
                )
            },

            suggest: function ( data, max ) {

                if ( ! data ) {
                    data = angular.copy( this.$scope.suggestData );
                }

                this.$scope.suggestionsWaiting = true;
                return this.gtaaService.getPersons( data, max ).then( function ( response ) {

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

                    if ( ! this.$scope.linkedPerson ) {
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

                    this.$scope.registerNewPerson = true;
                    this.$scope.selectedPerson = undefined;

                    this.setPersonName( '', '', false );
                    this.setGtaa( undefined );
                } else {
                    this.$scope.registerNewPerson = false;
                    this.$scope.selectedPerson = angular.copy( data );

                    this.setGtaa( this.$scope.selectedPerson);
                    this.setPersonName( this.$scope.selectedPerson.givenName, this.$scope.selectedPerson.familyName, false );
                }

            },

            recordSelected: function ( data ) {
                this.$scope.selectedPerson = angular.copy( data );

                this.setGtaa( this.$scope.selectedPerson);
                this.setPersonName( this.$scope.selectedPerson.givenName, this.$scope.selectedPerson.familyName, false );
            },

            setPersonName: function ( chosenGivenName, chosenFamilyName, knownAs ) {

                this.$scope.person.familyName = chosenFamilyName;
                this.$scope.person.givenName = chosenGivenName;
                if ( this.$scope.person.gtaaUri ) {
                    this.$scope.person.gtaaKnownAs = knownAs;
                }
            },

            setGtaa: function ( record ) {
                this.$scope.person.gtaaUri = record && record.gtaaUri;
                this.$scope.person.gtaaKnownAs = record && record.gtaaKnownAs;
                this.$scope.person.gtaaStatus = record && record.gtaaStatus;

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

                return this.mediaService.setPerson( this.media, this.$scope.person ).then(
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

            submitNewPerson: function ( person ) {
                this.$scope.waiting = true;
                notes = [];
                if (person.note) {
                    notes.push(person.note);
                }
                notes.push('vanuit POMS voor: ' + this.media.mid);
                var newPerson = {
                    'familyName': person.familyName,
                    'givenName': person.givenName,
                    'notes': notes,
                    'objectType': 'person'
                };

                return this.gtaaService.submitPerson( newPerson ).then(
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

                if ( this.$scope.person.gtaaUri ) {
                    this.save();
                } else if ( this.$scope.person.familyName ) {

                    this.submitNewPerson( this.$scope.person ).then(
                        function ( result ) {
                            if ( result.gtaaUri ) {
                                this.$scope.person.gtaaUri = result.gtaaUri;
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

        return GtaaPersonEditController;
    }())
] );
