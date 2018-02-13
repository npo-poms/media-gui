angular.module( 'poms.media.controllers' ).controller( 'PredictionEditController', [
    '$scope',
    '$modalInstance',
    '$upload',
    '$sce',
    '$filter',
    'appConfig',
    'PomsEvents',
    'MediaService',
    'media',
    'prediction',
    'edit',
    (function () {


        function PredictionEditController ( $scope, $modalInstance, $upload, $sce, $filter, appConfig, PomsEvents, MediaService, media, prediction, edit ) {

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.$upload = $upload;
            this.$sce = $sce;
            this.$filter = $filter;
            this.host = appConfig.apihost;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;

            location.publication = location.publication || {};

            $scope.prediction = angular.copy( prediction );

            $scope.media = media;

            $scope.edit = edit;


            if ( $scope.edit ) {
                $scope.modalTitle = prediction.platform + "bewerken";
                $scope.submitText = "sla op";
            }
        }

        PredictionEditController.prototype = {

            violations: {},

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$modalInstance.dismiss();
            },

            save: function () {

                var data = this.$scope.prediction;

                this.mediaService.savePrediction(this.$scope.media, data).then(
                    function (error) {
                        this.$scope.$emit('error', error)
                    }.bind(this))
                    .finally(
                        function () {
                            this.$scope.predictionsWaiting = false;
                            this.$scope.$emit(this.pomsEvents.loaded, {'section': 'predictions', 'waiting': false});
                        }.bind(this)
                    );

            }
        };

        return PredictionEditController;
    }())
] );
