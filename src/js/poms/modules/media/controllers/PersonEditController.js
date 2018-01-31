angular.module( 'poms.media.controllers' ).controller( 'PersonEditController', [
    '$scope',
    '$q',
    '$modalInstance',
    '$sce',
    'PomsEvents',
    'MediaService',
    'roles',
    'media',
    'linkedPerson',
    (function () {

        function PersonEditController ( $scope, $q, $modalInstance, $sce, pomsEvents, mediaService, roles, media, linkedPerson ) {

            this.$scope = $scope;

            this.$scope.gtaaPerson = '';
            this.$q = $q;
            this.$modalInstance = $modalInstance;
            this.$sce = $sce;
            this.media = media;

            this.pomsEvents = pomsEvents;
            this.mediaService = mediaService;

            this.$scope.roles = roles;
            this.$scope.linkedPerson = linkedPerson;
            this.$scope.person = {};

            if ( linkedPerson ) {
                this.$scope.person = linkedPerson;
            }

            $scope.$watch( 'person', function ( newValue ) {
                this.$scope.personFormValid = this.isValid( newValue, this.$scope.person );
            }.bind(this), true );

        }

        PersonEditController.prototype = {

            cancel: function () {
                this.$modalInstance.dismiss();
            },

            isValid: function ( person )  {
                return (
                (person.role !== undefined && person.role.id !== undefined) &&
                (( person.familyName !== undefined && person.familyName !== '' ) || ( person.givenName !== undefined && person.givenName !== '' ))
                )
            },

            save: function () {
                this.$scope.submitting = true;
                return this.mediaService.setPerson( this.media, this.$scope.person ).then(
                    function ( ) {
                        this.$modalInstance.close();
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.submitting = false;
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
            }

        };

        return PersonEditController;
    }())
] );