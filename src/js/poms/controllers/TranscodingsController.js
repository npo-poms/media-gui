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
                    this.$scope.junctionError = false;
                }.bind(this),
                function ( error ) {
                    if ( error.code === 'nl.vpro.soap.timeout' ) {
                        this.notificationService.notify( "De transcodeerdienst is op dit moment onbereikbaar" );
                        this.$scope.junctionError = true;
                    } else {
                        this.$scope.$emit( 'error', error )
                    }
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
