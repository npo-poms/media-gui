angular.module( 'poms.media.controllers' ).controller( 'ScheduleEventOverviewController', [
    '$scope',
    '$filter',
    '$http',
    '$modal',
    'PomsEvents',
    'MediaService',
    'NotificationService',
    'ListService',
    'appConfig',
    (function () {

        function ScheduleEventOverviewController ( $scope, $filter, $http, $modal, PomsEvents, MediaService, NotificationService, ListService , appConfig) {
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

        ScheduleEventOverviewController.prototype = {


            mayWrite: function(event) {
                return this.$scope.media.permissions.SCHEDULE_WRITE;
            },


            edit : function ( event ) {

                if (! this.mayWrite(event)) {
                    return;
                }
                var editMode = true;

                var modal = this.$modal.open( {
                    controller : 'ScheduleEventEditController',
                    controllerAs : 'controller',
                    templateUrl : 'edit/modal-edit-schedule-event.html',
                    windowClass : 'modal-form',
                    resolve : {
                        media : function () {
                            return this.$scope.media;
                        }.bind( this ),
                        event : function () {
                            return event;
                        },
                        edit : function () {
                            return editMode;
                        }
                    }
                } );

                modal.result.then(
                    function ( scheduleEvent ) {
                        //angular.copy( media, this.$scope.media );
                        this.load();
                    }.bind( this )
                );
            },


            load : function () {

                this.$scope.waiting = true;

                this.mediaService.getScheduleEvents( this.$scope.media ).then(
                    function ( events ) {
                        this.$scope.events = events;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( 'error', error )
                    }.bind( this ) )
                    .finally(
                        function () {
                            this.$scope.waiting = false;
                            this.$scope.$emit( this.pomsEvents.loaded, { 'section' : 'scheduleevents', 'waiting' : false } );
                        }.bind( this )
                    );


                }

        };

        return ScheduleEventOverviewController;
    }())
] );
