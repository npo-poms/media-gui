angular.module( 'poms.media.controllers' ).controller( 'ScheduleEventsController', [
    '$uibModalInstance',
    'title',
    'media',
    (function () {

        function ScheduleEventsController ( $uibModalInstance, title, media ) {

            this.$uibModalInstance = $uibModalInstance;
            this.title = title;
            this.media = media;

        }

        ScheduleEventsController.prototype = {

            close: function () {
                this.$uibModalInstance.dismiss();
            }

        };

        return ScheduleEventsController;
    }())
] );