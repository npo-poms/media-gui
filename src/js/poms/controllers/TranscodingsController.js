angular.module( 'poms.media.controllers' ).controller( 'TranscodingsController', [
    '$scope',
    '$uibModalInstance',
    'PomsEvents',
    'UploadService',
    'MediaService',
    'NotificationService',
    (function () {

        function TranscodingsController ( $scope, $uibModalInstance, PomsEvents, uploadService, mediaService, notificationService ) {

            this.pomsEvents = PomsEvents;

            this.$scope = $scope;
            this.$uibModalInstance = $uibModalInstance;
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
                this.$uibModalInstance.dismiss();
            },

            openMid: function( transcoding ){
                if (transcoding.missingMedia) {
                    alert("Er is geen object " + transcoding.mid);
                } else {
                    this.$uibModalInstance.close(transcoding.mid);
                }
            }
        };

        return TranscodingsController;
    }())
] );
