angular.module( 'poms.media.controllers' ).controller( 'PredictionEditController', [
    '$scope',
    '$uibModalInstance',
    '$upload',
    '$sce',
    '$filter',
    'appConfig',
    'PomsEvents',
    'MediaService',
    'media',
    'prediction',
    'edit',
    'ListService',
    (function () {


        function PredictionEditController ( $scope, $uibModalInstance, $upload, $sce, $filter, appConfig, PomsEvents, MediaService, media, prediction, edit, listService) {

            this.$scope = $scope;
            this.$uibModalInstance = $uibModalInstance;
            this.$upload = $upload;
            this.$sce = $sce;
            this.$filter = $filter;
            this.host = appConfig.apiHost;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;

            location.publication = location.publication || {};

            $scope.prediction = angular.copy( prediction );

            $scope.media = media;

            $scope.edit = edit;

            if ( $scope.edit ) {
                $scope.modalTitle = prediction.platform.id + "bewerken";
                $scope.submitText = "sla op";
            }


            listService.getEncryptionTypes().then(function (l) {
                $scope.encryptionTypes = l;
            });

        }

        PredictionEditController.prototype = {

            violations: {},

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$uibModalInstance.dismiss();
            },


            save: function () {

                const prediction = this.$scope.prediction;

                if ( prediction.publication.stop &&
                    prediction.publication.start &&
                    (prediction.publication.stop < prediction.publication.start) ){
                    prediction.publication.stop = prediction.publication.start;
                }

                this.mediaService.savePrediction(this.$scope.media, prediction).then(
                    function ( media ) {
                        this.$uibModalInstance.close( media );
                        this.$scope.waiting = false;
                    }.bind( this ),
                    function (error) {
                        this.$scope.$emit('error', error)
                    }.bind(this))
                    .finally(
                        function () {
                            this.$scope.predictionsWaiting = false;
                            this.$scope.$emit(this.pomsEvents.loaded, {'section': 'predictions', 'waiting': false});
                        }.bind(this)
                    );

            },

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            }
        };

        return PredictionEditController;
    }())
] );
