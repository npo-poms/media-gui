angular.module( 'poms.media.controllers' ).controller( 'LocationUploadController', [
    '$scope',
    '$modalInstance',
    '$upload',
    '$sce',
    'appConfig',
    'PomsEvents',
    'MediaService',
    'UploadService',
    'media',
    'location',
    'priorityTypes',
    'encryptionTypes',
    (function () {


        function LocationUploadController ( $scope, $modalInstance, $upload, $sce, appConfig, PomsEvents, MediaService, UploadService,  media, location, priorityTypes, encryptionTypes) {

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.$upload = $upload;
            this.$sce = $sce;
            this.host = appConfig.apihost;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;
            this.uploadService = UploadService;

            location.publication = location.publication || {};

            this.$scope.location = location;
            this.$scope.media = media;

            this.$scope.required = [
                {'id': 'file', 'text': 'Bestand'}
            ];

            this.$scope.uploadLocationFormValid = false;

            $scope.priorityTypes = priorityTypes;
            $scope.encryptionTypes = encryptionTypes;

            location.priority = $scope.priorityTypes[0];
            location.encryption = $scope.encryptionTypes[1];


            this.init();

        }

        LocationUploadController.prototype = {


            init: function () {

                var mock = false;

                this.uploadService.getJobsForMid( this.$scope.media.mid , mock).then(
                    function ( result ) {

                        if ( result.length ){
                            this.$scope.transcodings = result;
                            for (var i=0; i< result.length;i++){
                                if ( result[i] && result[i].state == 'REQUEST'
                                    || result[i].state == 'PENDING'
                                    || result[i].state == 'ENCODED'
                                    || result[i].state == 'DELIVERED' ){

                                    this.$scope.isTranscoding = true;
                                    break;
                                }
                            }
                        }

                    }.bind(this),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                    }.bind(this) );
            },


            fileSelected: function(){
                // DO NOT REMOVE
                // this method is necessary for ng-file-select in the upload-location.html directive
            },

            violations: {},

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$modalInstance.dismiss();
            },

            save: function () {

                this.$scope.waiting = true;

                // Uploading is a two step process:
                // - First the location is uploaded to the location server (running on /locations).
                // - Second the returned urn from the location server is submitted to Poms with all other meta-data.

                // We are using the legacy ext-js upload from the location server with a multipart-form upload
                var location = this.$scope.location;

                if ( location.publication && location.publication.start ) {
                    location.publication.start = new Date( location.publication.start ).getTime();
                }

                if ( location.publication && location.publication.stop ) {
                    location.publication.stop = new Date( location.publication.stop ).getTime();
                }

                //MGNL-2923 // prevent saving of publication stop time before publication start time
                if ( location.publication.stop && location.publication.start && (location.publication.stop < location.publication.start) ){
                    location.publication.stop = location.publication.start;
                }

                var media = this.$scope.media;
                var fields = {
                    mid: media.mid,
                    name: location.file[0].name,
                    priority: location.priority.id,
                    encryption: location.encryption.id

                    };
                if (location.publication.start) {
                    fields.publicationStart = location.publication.start;
                }
                if (location.publication.stop) {
                    fields.publicationStop = location.publication.stop;
                }

                // Location not uploaded to location server yet

                this.uploadService.upload( media, location, fields, this.$scope);


                this.$modalInstance.close( );

            },

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            }
        };

        return LocationUploadController;
    }())
] );
