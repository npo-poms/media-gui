angular.module( 'poms.media.controllers' ).controller( 'LocationsController', [
    '$scope',
    '$filter',
    '$http',
    '$modal',
    '$sce',
    'localStorageService',
    'EditorService',
    'PomsEvents',
    'MediaService',
    'NotificationService',
    'ListService',
    'UploadService',
    'MessageService',
    'appConfig',
    (function () {

        function LocationsController ( $scope, $filter, $http, $modal, $sce, localStorageService, EditorService, PomsEvents, MediaService, NotificationService, ListService, UploadService , MessageService, appConfig) {
            this.$http = $http;
            this.$filter = $filter;
            this.$modal = $modal;
            this.localStorageService = localStorageService;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;
            this.notificationService = NotificationService;
            this.listService = ListService;
            this.uploadService = UploadService;
            this.$scope = $scope;
            this.$sce = $sce;
            this.messageService = MessageService;
            this.appConfig = appConfig;
            
            this.uploadInProgress = false;
            this.currentUpload = undefined;
            this.hasErrors = false;
            this.collapsed = localStorageService.get( 'locationsCollapsed' ) || false;
            this.$scope.upload_feedback = [];
            this.messageService.receiveLogMessage().then(null, null, function (message) {
                if (message.mid === $scope.media.mid) {
                    if (message.level === 'ERROR') {
                        this.hasErrors = true;
                        this.collapsed = false;
                    }
                    var i = this.$scope.upload_feedback.length;

                    while (i--) {
                        var existingMessage = this.$scope.upload_feedback[i];
                        if (existingMessage.id === message.id && existingMessage.phase === message.phase) {
                            $scope.upload_feedback.splice(i, 1);
                        }
                    }

                    this.$scope.upload_feedback.push(message);
                }
            }.bind(this));

            this.setAvFileFormats( this );
            this.load();

            $scope.upService = UploadService;

            $scope.$on( this.pomsEvents.uploadStatus, function ( e, upload ) {

                if ( upload.mid === $scope.media.mid ) {
                    if ( upload.status === "uploadStart" ) {
                        this.uploadInProgress = true;
                        this.currentUpload = upload.fileName;
                    }

                    if ( upload.status === "uploadFinished" ) {
                        this.uploadInProgress = false;
                        this.currentUpload = undefined;
                    }

                    if ( upload.status === "uploadError" ) {
                        this.uploadInProgress = false;
                        this.currentUpload = undefined;
                    }

                }
            }.bind( this ) );

            // update locations when platforms are updated since new locations can be created as result.
            $scope.$on(PomsEvents.predictionUpdated, function(event, mid) {
                if (mid === this.$scope.media.mid) {
                    this.load();
                }
            }.bind(this));
            $scope.$on(PomsEvents.externalChange, function(event, mid) {
                if (mid === this.$scope.media.mid) {
                    this.load();
                }
            }.bind(this));


        }

        LocationsController.prototype = {

            addLocation : function () {
                this.editLocation();
            },

            mayAddLocations: function (location) {
                return this.mediaService.hasWritePermission(this.$scope.media, 'locations');
            },
            mayUpload: function() {
                return  this.$scope.media.permissions['LOCATION_UPLOAD'];
            },
            
            toggleCollapsed : function () {
                if (!this.hasErrors) {
                    this.collapsed = ! this.collapsed;
                    this.localStorageService.set('locationsCollapsed', this.collapsed);
                }
            },
            
            editLocation : function ( location, permission ) {

                if ( permission === false ) {
                    return;
                }
                var editMode = true;

                if ( ! location ) {
                    // creating new location
                    location = {
                        mayWrite: true,
                        platform: 'INTERNETVOD'
                    };
                    editMode = false;
                }

                var modal = this.$modal.open( {
                    controller : 'LocationEditController',
                    controllerAs : 'controller',
                    templateUrl : 'edit/modal-edit-location.html',
                    windowClass : 'modal-form',
                    resolve: {
                        media: function () {
                            return this.$scope.media;
                        }.bind( this ),
                        location : function () {
                            return location;
                        },
                        AVFileFormats : function () {
                            return this.$scope.AVFileFormats;
                        }.bind( this ),
                        edit : function () {
                            return editMode;
                        }
                    }
                } );

                modal.result.then(
                    function ( media ) {
                        angular.copy( media, this.$scope.media );
                        this.load();
                    }.bind( this )
                );
            },
/*
            playLocation : function( location ) {
                this.$modal.open( {
                    controller : 'LocationPlayController',
                    controllerAs : 'LocationPlayController',
                    templateUrl : 'edit/modal-play-location.html',
                    windowClass : 'modal-play-location',
                    resolve : {
                        location : function () {
                            return location
                        }
                    }
                } );
            },*/

            load : function () {
                this.$scope.waiting = true;
                this.$scope.$emit( this.pomsEvents.loaded, { 'section' : 'locations', 'waiting' : true } );

                this.mediaService.getLocations( this.$scope.media ).then(
                    function ( locations ) {
                        this.locations = $.map( locations, function ( e ) {
                            e.offset = this.$filter( 'withTimezone' )( e.offset );
                            return e
                        }.bind( this ) );

                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( 'error', error )
                    }.bind( this ) )
                    .finally(
                    function () {
                        this.$scope.waiting = false;
                        this.$scope.$emit( this.pomsEvents.loaded, { 'section' : 'locations', 'waiting' : false } );
                    }.bind( this )
                );

                if ( this.mayUpload ) {
                    this.uploadService.getJobsForMid( this.$scope.media.mid ).then(
                        function ( transcodings ) {
                            this.transcodings = transcodings;
                            this.transcodingServiceError = false;
                        }.bind( this ),
                        function ( error ) {
                            if ( error.code) {
                                this.notificationService.notify( "De transcodeerdienst is op dit moment onbereikbaar" );
                                this.transcodingServiceError = true;
                            } else {
                                //this.$scope.$emit( 'error', error )
                            }
                        }.bind( this )
                    );
                }

            },


            remove : function ( index ) {
                var source = this.locations[ index ];
                return this.mediaService.removeLocation( this.$scope.media, source ).then(
                    function ( media ) {
                        angular.copy( media, this.$scope.media );
                        this.load();
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        return false;
                    }.bind( this ) )
                    .finally( function () {
                        this.$scope.waiting = false;
                        this.$scope.$emit( this.pomsEvents.loaded, { 'section' : 'locations', 'waiting' : false } );

                    }.bind( this ) );

            },


            setAvFileFormats : function () {
                this.listService.getAVFileFormats().then(
                    function ( data ) {
                        this.$scope.AVFileFormats = data;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.AVFileFormats = [];
                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind( this )
                );
            },
            notify: function(upload) {
                var message = "";
                var status;

                if ( upload.status === 'uploadFinished' ) {
                    if (upload.avType === 'AUDIO') {
                        message = '<span>' + upload.fileName + '  is geüpload, we wachten op de afhandeling door sourcing service</span>';
                    } else {
                        message = '<span>' + upload.fileName + '  is geüpload, transcodering is begonnen</span>';
                    }
                } else if ( upload.status === 'uploadStart' ) {
                    message = '<span>' + upload.fileName + '  is nu aan het uploaden bij MID ' + upload.mid + ' </span>';
                } else if ( upload.status === 'uploadError' ) {
                    message = '<span>' + upload.fileName + ' is niet ge&uuml;pload (' + upload.message + ')</span>';
                    status = 'error';
                } else if ( upload.status === 'transcodingPublication' ) {
                    message = '<span> Het geüploade bestand bij' + upload.mid + ' is getranscodeerd </span>';
                } else {
                    message = '<span>' + upload + '</span>';
                }
                upload.message = this.$sce.trustAsHtml(message);
                //console.log(upload);
                this.$scope.upload_feedback.push(upload);
            },

            uploadLocation : function (streamType) {
                var self = this;
                var modal = this.$modal.open( {
                    controller : 'LocationUploadController',
                    controllerAs : 'uploadController',
                    templateUrl : 'edit/modal-upload-location.html',
                    windowClass : 'modal-location-upload',
                    resolve : {
                        priorityTypes: this.listService.getPriorityTypes,
                        encryptionTypes: this.listService.getEncryptionTypes,
                        media : function () {
                            return this.$scope.media;
                        }.bind(this),
                        location : function () {
                            return {};
                        },
                        streamType: function () {
                            return streamType;
                        },
                        locationsController: function() {
                            return self
                        }.bind(this)
                    }
                } );

                modal.result.then(
                    function () {
                        this.load();
                    }.bind( this )
                );
            }

        };

        return LocationsController;
    }())
] );
