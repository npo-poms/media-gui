angular.module( 'poms.media.controllers' ).controller( 'LocationEditController', [
    '$scope',
    '$modalInstance',
    '$upload',
    '$sce',
    '$filter',
    'appConfig',
    'PomsEvents',
    'MediaService',
    'AVFileFormats',
    'media',
    'location',
    'priorityTypes',
    'edit',
    (function () {

        function isValid ( location ) {
            return location.format !== undefined &&
                location.format !== '' &&
                location.url !== undefined &&
                location.url !== ''
        }

        function LocationEditController ( $scope, $modalInstance, $upload, $sce, $filter, appConfig, PomsEvents, MediaService, AVFileFormats, media, location, priorityTypes, edit ) {

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.$upload = $upload;
            this.$sce = $sce;
            this.$filter = $filter;
            this.host = appConfig.apihost;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;

            location.publication = location.publication || {};

            $scope.AVFileFormats = AVFileFormats;

            $scope.location = angular.copy( location );

            $scope.priorityTypes = priorityTypes;

            $scope.media = media;

            $scope.edit = edit;

            if ( $scope.edit ) {
                $scope.modalTitle = "Bron bewerken";
                $scope.submitText = "bewaar";
            } else {
                $scope.modalTitle = "Bron toevoegen";
                $scope.submitText = "Maak aan";
            }

            $scope.required = [
                {'id': 'format', 'text': 'Type'},
                {'id': 'url', 'text': 'Url'}
            ];

            $scope.editLocationFormValid = false;

            $scope.$watch( 'location', function ( newValue ) {
                $scope.editLocationFormValid = isValid( newValue, $scope );

            }, true );
        }

        LocationEditController.prototype = {

            violations: {},

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$modalInstance.dismiss();
            },

            fields: function() {
                var location = this.$scope.location;
                return  {
                    priorityType: location.PriorityType ? location.priorityType.id : undefined,
                };

            },

            isFieldMissing : function(field){
                return (! this.$scope.location[ field.id ] && field.id !== 'file') || (field.id === 'file' && ! this.$scope.location.uri && ! this.$scope.location[ field.id ]);
            },

            mayWrite: function(field) {
                if (this.$scope.location.mayWrite) {
                    return this.$scope.location.mayWriteFields === undefined || this.$scope.location.mayWriteFields.indexOf(field) >= 0;
                }
                return false;
            },
            save: function () {

                var data = this.$scope.location;

                if ( data.offset ) {
                    data.offset = this.$filter( 'noTimezone' )( data.offset );
                }

                if ( data.format.id ) {
                    data.format = data.format.id
                }

                //MGNL-2923 // prevent saving of publication stop time before publication start time
                if ( data.publication.stop && data.publication.start && (data.publication.stop < data.publication.start) ){
                    data.publication.stop = data.publication.start;
                }

                return this.mediaService.saveLocation( this.$scope.media, data ).then(
                    function ( media ) {
                        this.$modalInstance.close( media );
                        this.$scope.waiting = false;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.waiting = false;
                        if ( error.status === 400 && error.violations ) {
                            this.violations = error.violations;
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }
                    }.bind( this )
                )

            },

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            }
        };

        return LocationEditController;
    }())
] );
