angular.module( 'poms.media.controllers' ).controller( 'RelationEditController', [
    '$scope',
    '$modalInstance',
    '$upload',
    '$sce',
    'appConfig',
    'PomsEvents',
    'MediaService',
    'types',
    'media',
    'relation',
    'edit',
    (function () {

        function isValid ( relation ) {
            return (
                relation.type !== undefined &&
                relation.type !== '' &&
                relation.text !== undefined &&
                relation.text !== ''
            );
        }

        function RelationEditController ( $scope, $modalInstance, $upload,  $sce, appConfig, PomsEvents, MediaService, types, media, relation, edit ) {

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.$upload = $upload;
            this.$sce = $sce;
            this.host = appConfig.apihost;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;
            this.resetValue = angular.copy( relation );

            $scope.types = types;

            $scope.relation = angular.copy( relation );

            $scope.media = media;

            $scope.edit = edit;

            if ( $scope.edit ) {
                $scope.modalTitle = "Relatie bewerken";
                $scope.submitText = "bewaar";
            } else {
                $scope.modalTitle = "Relatie toevoegen";
                $scope.submitText = "Maak aan";
            }

            $scope.required = [
                {'id': 'type', 'text': 'Type'},
                {'id': 'text', 'text': 'Tekst'}
            ];

            $scope.editRelationFormValid = false;

            $scope.$watch( 'relation', function ( newValue ) {
                $scope.editRelationFormValid = isValid( newValue, $scope );
            }, true );
        }

        RelationEditController.prototype = {

            violations: {},

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$modalInstance.dismiss();
            },

            save: function () {
                this.$scope.waiting = true;
                var data = this.$scope.relation;

                return this.mediaService.saveRelation( this.$scope.media, data ).then(
                    function ( media ) {
                        this.$modalInstance.close( media );
                        this.$scope.waiting = false;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.waiting = false;
                        if ( error.status === 400 && error.violations ) {
                            this.violations = error.violations;
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error );
                        }
                    }.bind( this )
                );

            },

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            }

        };

        return RelationEditController;
    }())
] );
