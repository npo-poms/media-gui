angular.module( 'poms.gtaa.controllers' ).controller( 'GtaaConnectorEditController', [
    '$scope',
    '$route',
    '$q',
    '$sce',
    'PomsEvents',
    'MediaService',
    'EditorService',
    'GtaaService',
    (function () {

        function GtaaConnectorEditController ( $scope, $route, $q, $sce, pomsEvents, mediaService, editorService, gtaaService ) {

            this.$scope = $scope;
            this.$scope.gtaaPerson = '';

            this.$route = $route;
            this.$q = $q;
            this.$sce = $sce;

            this.pomsEvents = pomsEvents;
            this.mediaService = mediaService;
            this.editorService = editorService;
            this.gtaaService = gtaaService;

            this.$scope.waiting = false;

            this.$scope.person = {};

            this.$scope.registerNewPerson = false;
            this.$scope.suggestions = [];

            // TODO for now this connector is all about GTAA persons, but it should be for all GTAA type objects


            if ( this.$scope.linkedPerson ) {
                this.$scope.suggestData = this.$scope.linkedPerson.givenName + ' ' + this.$scope.linkedPerson.familyName;
                this.$scope.person = angular.copy( this.$scope.linkedPerson );

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

        GtaaConnectorEditController.prototype = {

            cancel: function () {
                this.$scope.$emit( 'cancel', this.$scope.linkedPerson || {} );
            },

            createRegisterForm: function () {

                this.$scope.registerNewPerson = true;
                this.$scope.selectedPerson = undefined;

                this.setPersonName(
                    ( ( this.$scope.linkedPerson  ) ? this.$scope.linkedPerson.givenName || ''  : '' ),
                    ( ( this.$scope.linkedPerson  ) ? this.$scope.linkedPerson.familyName || ''  : '' )
                    , false );

                this.setGtaaRecord( undefined );

                this.$scope.personFormValid = this.isValid( this.$scope.person );
            },

            isValid: function ( person ) {
                return (
                ( person.familyName !== undefined && person.familyName !== '' ) &&
                ( person.givenName !== undefined && person.givenName !== '' ) &&
                ( ! this.$scope.registerNewPerson || ( this.$scope.registerNewPerson && person.note !== undefined && person.note !== '' ) )
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

                    this.createRegisterForm();

                } else {
                    this.$scope.registerNewPerson = false;
                    this.$scope.selectedPerson = angular.copy( data );

                    this.setGtaaRecord( this.$scope.selectedPerson.gtaaRecord );
                    this.setPersonName( this.$scope.selectedPerson.givenName, this.$scope.selectedPerson.familyName, false );
                }

            },

            recordSelected: function ( data ) {
                this.$scope.selectedPerson = angular.copy( data );

                this.setGtaaRecord( this.$scope.selectedPerson.gtaaRecord );
                this.setPersonName( this.$scope.selectedPerson.givenName, this.$scope.selectedPerson.familyName, false );
            },

            setPersonName: function ( chosenGivenName, chosenFamilyName, knownAs ) {

                this.$scope.person.familyName = chosenFamilyName;
                this.$scope.person.givenName = chosenGivenName;
                if ( this.$scope.person.gtaaRecord ) {
                    this.$scope.person.gtaaRecord.knownAs = knownAs;
                }
            },

            setGtaaRecord: function ( record ) {
                this.$scope.person.gtaaRecord = record;
            },

            buildDisplayValue: function ( value ) {
                value.displayValue = '';

                if ( value.givenName ) {
                    value.displayValue += value.givenName;
                }

                if ( value.familyName ) {
                    value.displayValue += ' ' + value.familyName;
                }

                return value;
            },

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            },

            save: function () {
                this.$scope.waiting = false;

                // TODO: gtaaRecord should expose a real ID, we're now extracting it from the URI
                this.$scope.$emit( 'selected', {
                    givenName: this.$scope.person.givenName,
                    familyName: this.$scope.person.familyName,
                    gtaaId: this.$scope.person.gtaaRecord.uri
                } );
            },

            submitNewPerson: function ( person ) {
                this.$scope.waiting = true;

                var newPerson = {
                    'familyName': person.familyName,
                    'givenName': person.givenName,
                    'notes': [ person.note, this.$scope.origin || 'vanuit POMS GTAA Connector'],
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

                if ( this.$scope.person.gtaaRecord ) {
                    this.save();
                } else if ( this.$scope.person.familyName ) {

                    this.submitNewPerson( this.$scope.person ).then(
                        function ( result ) {
                            if ( result && result.gtaaRecord ) {
                                this.$scope.person.gtaaRecord = result.gtaaRecord;
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

        return GtaaConnectorEditController;
    }())
] );
