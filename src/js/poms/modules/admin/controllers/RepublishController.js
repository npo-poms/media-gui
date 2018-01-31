angular.module( 'poms.admin.controllers' ).controller( 'RepublishController', [
    '$scope',
    '$modalInstance',
    'PomsEvents',
    'ListService',
    'AdminService',
    'NotificationService',
    (function () {

        function RepublishController ( $scope, $modalInstance, PomsEvents, ListService, AdminService, NotificatinService) {

            this.pomsEvents = PomsEvents;
            this.listService = ListService;
            this.adminService = AdminService;
            this.notificationService = NotificatinService;
            this.$scope = $scope;
            this.$modalInstance = $modalInstance;

            this.$scope.republish = {
                mids: [],
                types: [],
                lastPublishedRange: undefined,
                destinations: []
            };
            this.$scope.options = [];

            this.init();

        }

        RepublishController.prototype = {

            cancel: function () {
                this.$modalInstance.dismiss();
            },

            init: function () {

                this.listService.getMediaTypes().then(
                    function ( data ) {
                        data.splice( 0, 1 );
                        this.mediaTypes = {
                            data: data
                        };
                    }.bind( this ),
                    function () {
                        this.mediaTypes = {
                            data: []
                        };
                    }.bind( this )
                );

                this.adminService.getDestinations().then(
                    function ( data ) {
                        this.destinations = {
                            data: data
                        };
                    }.bind( this ),
                    function () {
                        this.destinations = {
                            data: []
                        };
                    }.bind( this )
                );
            },


            removeOption: function ( collection, index ) {
                collection.splice( index, 1 );
            },


            submit: function () {
                var formData = angular.copy( this.$scope.republish );

                if ( formData.publishStart || formData.publishStop ) {
                    formData.lastPublishedRange = {
                        start: formData.publishStart ? formData.publishStart.getTime() : undefined,
                        stop: formData.publishStop ? formData.publishStop.getTime() : undefined
                    };

                    //MGNL-2923 // prevent saving of publication stop time before publication start time
                    if ( formData.lastPublishedRange.stop && formData.lastPublishedRange.start && (formData.lastPublishedRange.stop < formData.lastPublishedRange.start) ){
                        formData.lastPublishedRange.stop = formData.lastPublishedRange.start;
                    }

                    formData.publishStart = undefined;
                    formData.publishStop = undefined;
                }

                return this.adminService.republish( formData, formData.offset, formData.max ).then(
                    function ( result ) {
                        this.$modalInstance.close( result );
                        this.notificationService.notify(result.text);

                    }.bind( this ),
                    function ( error ) {
                        if ( error.status == 400 && error.violations ) {
                            source.violations = error.violations;
                            return 'Errors';
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }
                    }.bind( this ) )
                    .finally( function () {
                        this.waiting = false;
                    }.bind( this ) );
            }
        };

        return RepublishController;
    }())
] );
