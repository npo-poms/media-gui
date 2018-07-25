angular.module( 'poms.media.controllers' ).controller( 'ScheduleEventEditController', [
    '$scope',
    '$modalInstance',
    '$upload',
    '$sce',
    '$filter',
    'appConfig',
    'PomsEvents',
    'MediaService',
    'ListService',
    'media',
    'event',
    'edit',
    'TextfieldNames',
    (function () {

        function ScheduleEventEditController ( $scope, $modalInstance, $upload, $sce, $filter, appConfig, PomsEvents, MediaService, listService, media, event, edit, textfieldNames ) {

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.$upload = $upload;
            this.$sce = $sce;
            this.$filter = $filter;
            this.host = appConfig.apihost;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;

            $scope.event = angular.copy( event );

            $scope.media = media;

            $scope.edit = edit;

            $scope.editScheduleEventFormValid = true;

            $scope.textfieldNames = textfieldNames;

            $scope.titles = [
                "mainTitle",
                "subTitle",
                "shortTitle",
                "abbreviationTitle",
                "workTitle",
                "originalTitle"
            ];

            $scope.descriptions = [
                "mainDescription",
                "shortDescription",
                "kickerDescription"
            ];

            listService.getNets().then(
                function ( data ) {
                    this.nets = [null].concat(data);
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );
             listService.getChannels().then(
                function ( data ) {
                    this.channels = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit( pomsEvents.error, error )
                }.bind( this )
            );
        }

        ScheduleEventEditController.prototype = {

            violations: {},

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$modalInstance.dismiss();
            },

            save: function () {

                var data = this.$scope.event;

                return this.mediaService.saveScheduleEvent( this.$scope.media, data ).then(
                    function (scheduleEvent) {
                        this.$modalInstance.close(scheduleEvent);
                        this.$scope.waiting = false;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.waiting = false;
                        if ( error.status === 400 && error.violations ) {
                            this.violations = error.violations;
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }
                    }.bind( this )
                )

            },

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            }
        };

        return ScheduleEventEditController;
    }())
] );
