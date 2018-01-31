angular.module( 'poms.media.controllers' ).controller( 'ScheduleEventsController', [
    '$modalInstance',
    'title',
    'media',
    (function () {

        function ScheduleEventsController ( $modalInstance, title, media ) {

            this.$modalInstance = $modalInstance;
            this.title = title;
            this.media = media;

        }

        ScheduleEventsController.prototype = {

            close: function () {
                this.$modalInstance.dismiss();
            }

        };

        return ScheduleEventsController;
    }())
] );