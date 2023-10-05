angular.module('poms.media.controllers').controller('PredictionsController', [
    '$rootScope',
    '$scope',
    '$filter',
    '$http',
    '$uibModal',
    'EditorService',
    'PomsEvents',
    'MediaService',
    'NotificationService',
    'ListService',
    'MessageService',
    'appConfig',
    (function () {

        function PredictionsController($rootScope, $scope, $filter, $http, $uibModal, EditorService, PomsEvents, MediaService, NotificationService, ListService, MessageService, appConfig) {
            this.$http = $http;
            this.$filter = $filter;
            this.$uibModal = $uibModal;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;
            this.notificationService = NotificationService;
            this.listService = ListService;
            this.messageService = MessageService;
            this.$scope = $scope;
            this.appConfig = appConfig;
            this.$rootScope = $rootScope;
            this.init();

        }

        PredictionsController.prototype = {
            init: function() {
                //console.log("Initing predictions");
                this.load();
                this.messageService.receiveRepaintMessage().then( null, null, function (message ) {
                    if (message.mid === this.$scope.media.mid && message.aspect === "avType") {
                        this.load()
                    }
                }.bind( this ));
            },

            editPrediction: function (prediction) {

                if(!prediction.mayWrite && ! prediction.mayWriteEmbargo){
                    console && console.log("You may not write", prediction);
                    return;
                }

                var editMode = true;

                var modal = this.$uibModal.open({
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
                        this.$rootScope.$broadcast(this.pomsEvents.predictionUpdated, media.mid);
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
