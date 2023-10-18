angular.module( 'poms.media.controllers' ).controller( 'LocationUploadController', [
    '$scope',
    '$uibModalInstance',
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
    'streamType',
    'locationsController',
    (function () {


        function LocationUploadController ( $scope, $uibModalInstance, $upload, $sce, appConfig, PomsEvents, MediaService, UploadService,  media, location, priorityTypes, encryptionTypes, streamType, locationsController) {

            this.$scope = $scope;
            this.$uibModalInstance = $uibModalInstance;
            this.$upload = $upload;
            this.$sce = $sce;
            this.host = appConfig.apiHost;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;
            this.uploadService = UploadService;
            this.locationsController = locationsController;

            location.publication = location.publication || {};

            this.$scope.location = location;
            this.$scope.media = media;
            this.$scope.streamType = streamType;
            this.streamType = streamType;

            this.$scope.required = [
                {'id': 'file', 'text': 'Bestand'}
            ];

            this.$scope.uploadLocationFormValid = false;

            $scope.priorityTypes = priorityTypes;
            $scope.encryptionTypes = encryptionTypes;

            // Set defaults
            location.priority = $scope.priorityTypes.find(function(priorty) { return priorty.id === 'LOW'});
            location.encryption = $scope.encryptionTypes.find(function(encryption) { return encryption.id === 'NONE'});


            this.init();

        }

        LocationUploadController.prototype = {


            init: function () {

                const mock = false;

                this.uploadService.getJobsForMid( this.$scope.media.mid , mock).then(
                    function ( result ) {

                        if ( result.length ){
                            this.$scope.transcodings = result;
                            for (let i=0; i< result.length; i++){
                                if ( result[i] && result[i].state === 'REQUEST'
                                    || result[i].state === 'PENDING'
                                    || result[i].state === 'ENCODED'
                                    || result[i].state === 'DELIVERED' ){

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

            needsPriorityField: function() {
                return this.$scope.streamType === 'VIDEO';
            },

            needsEncryptionField: function() {
                return this.$scope.streamType === 'VIDEO';
            },

            guiStreamType: function() {
                return this.$scope.streamType === 'AUDIO' ? 'audio' : 'video';
            },

            accept: function() {
                let accept = "";
                if (this.streamType  === 'AUDIO') {
                    accept = ".mp3,.wav,audio/mp3,audio/wav";
                }  else if (this.streamType  === 'VIDEO') {
                    accept += ".mp4,.m4v,.mxf,application/mxf,video/mp4,video/x-m4v";
                } else {
                    throw "unknown stream type" + this.streamType;
                }
                return accept;
            },

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$uibModalInstance.dismiss();
            },

            save: function () {

                this.$scope.waiting = true;

                // Uploading is a two-step process:
                // - First the location is uploaded to the location server (running on /locations).
                // - Second the returned urn from the location server is submitted to Poms with all other meta-data.

                // We are using the legacy ext-js upload from the location server with a multipart-form upload
                const location = this.$scope.location;

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

                const media = this.$scope.media;
                const fields = {
                    mid: media.mid,
                    name: location.file[0].name,
                    avType: media.avType.id,
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
                this.uploadService.upload( media, location, fields, this.$scope, this.locationsController);


                this.$uibModalInstance.close( );

            },

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            }
        };

        return LocationUploadController;
    }())
] );
