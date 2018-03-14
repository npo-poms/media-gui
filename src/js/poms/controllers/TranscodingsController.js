angular.module( 'poms.media.controllers' ).controller( 'TranscodingsController', [
    '$scope',
    '$modalInstance',
    'PomsEvents',
    'UploadService',
    'MediaService',
    'NotificationService',
    (function () {

        function TranscodingsController ( $scope, $modalInstance, PomsEvents, uploadService, mediaService, notificationService ) {

            this.pomsEvents = PomsEvents;

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.uploadService = uploadService;
            this.mediaService = mediaService;
            this.notificationService = notificationService;

            var mock = false;

            this.uploadService.getJobs( mock ).then(
                function ( data ) {
                    this.$scope.transcodings = data;
                    this.$scope.transcodingServiceError = false;

                }.bind(this),
                function ( error ) {
                    this.$scope.$emit( 'error', error );
                    //this.$scope.transcodingServiceError = true;

                }.bind(this)
            );
        }

        TranscodingsController.prototype = {

            cancel: function () {
                this.$modalInstance.dismiss();
            },

            openMid: function( mid ){
                this.$modalInstance.close( mid );
            }
        };

        return TranscodingsController;
    }())
] );
