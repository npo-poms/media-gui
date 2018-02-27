angular.module('poms.media.controllers').controller('PredictionsController', [
    '$scope',
    '$filter',
    '$http',
    '$modal',
    'EditorService',
    'PomsEvents',
    'MediaService',
    'NotificationService',
    'ListService',
    'appConfig',
    (function () {

        function PredictionsController($scope, $filter, $http, $modal, EditorService, PomsEvents, MediaService, NotificationService, ListService, appConfig) {
            this.$http = $http;
            this.$filter = $filter;
            this.$modal = $modal;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;
            this.notificationService = NotificationService;
            this.listService = ListService;
            this.$scope = $scope;
            this.appConfig = appConfig;
            this.load();
        }

        PredictionsController.prototype = {

            isViewable: function () {
                if (this.$scope.media.avType.id == 'VIDEO'){
                    return true;
                }
                return false;
            },

            editPrediction: function (prediction) {

                if(!prediction.mayWrite){
                    return;
                }

                var editMode = true;

                var modal = this.$modal.open({
                    controller: 'PredictionEditController',
                                controllerAs: 'controller',
                                templateUrl: 'edit/modal-edit-prediction.html',
                                windowClass: 'modal-form modal-edit-prediction',
                                resolve: {
                                media: function () {
                                    return this.$scope.media;
                        }.bind(this),
                        prediction: function () {
                            return prediction;
                        },
                        edit: function () {
                            return editMode;
                        }
                    }
                });

                modal.result.then(
                    function (media) {
                        angular.copy(media, this.$scope.media);
                        this.load();
                    }.bind(this)
                );
            },

            load: function () {
                this.$scope.waiting = true;
                this.$scope.$emit(this.pomsEvents.loaded, {'section': 'predictions', 'waiting': true});

                this.mediaService.getPredictions(this.$scope.media).then(
                    function (predictions) {
                        this.predictions = $.map(predictions, function (e) {
                            return e
                        }.bind(this));

                    }.bind(this),
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

        return PredictionsController;
    }())
]);
