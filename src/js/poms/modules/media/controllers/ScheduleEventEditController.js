angular.module( 'poms.media.controllers' ).controller( 'ScheduleEventEditController', [
    '$scope',
    '$timeout',
    '$uibModalInstance',
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

        function ScheduleEventEditController ( $scope, $timeout, $uibModalInstance, $upload, $sce, $filter, appConfig, PomsEvents, mediaService, listService, media, event, edit, textfieldNames ) {

            this.$scope = $scope;
            this.$timeout = $timeout;
            this.$uibModalInstance = $uibModalInstance;
            this.$upload = $upload;
            this.$sce = $sce;
            this.$filter = $filter;
            this.host = appConfig.apiHost;
            this.pomsEvents = PomsEvents;
            this.mediaService = mediaService;

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
                    $scope.$emit(  PomsEvents.error, error )
                }.bind( this )
            );
             listService.getChannels().then(
                function ( data ) {
                    this.channels = data;
                }.bind( this ),
                function ( error ) {
                    $scope.$emit(  PomsEvents.error, error )
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
                this.$uibModalInstance.dismiss();
            },

            save: function () {

                var data = this.$scope.event;

                return this.mediaService.saveScheduleEvent( this.$scope.media, data ).then(
                    function (scheduleEvent) {
                        this.$uibModalInstance.close(scheduleEvent);
                        this.$scope.waiting = false;
                        this.$scope.events = [scheduleEvent];
                        this.$timeout(function() {
                            this.$scope.$root.$digest();
                        }.bind(this));

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
