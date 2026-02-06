angular.module( 'poms.media.services' ).factory( 'UploadService', [
    '$rootScope',
    '$timeout',
    '$upload',
    '$sce',
    'PomsEvents',
    'EditorService',
    'localStorageService',
    'appConfig',
    '$q',
    '$http',
    function ( $rootScope, $timeout, $upload, $sce, PomsEvents, editorService, localStorageService, appConfig, $q, $http ) {


        var baseUrl = appConfig.apiHost + '/gui',

            get = function ( path, config, params ) {

                var deferred = $q.defer(),
                    url = baseUrl + path + params;

                $http.get( url, config )
                    .success( function ( result ) {
                        deferred.resolve( result );
                    } )
                    .error( function ( error ) {
                        deferred.reject( error );
                    } );

                return deferred.promise;
            };

        function UploadService () {
            this.$upload = $upload;
            this.$timeout = $timeout;
            this.$rootScope = $rootScope;
            this.$sce = $sce;
            this.pomsEvents = PomsEvents;
            this.host = appConfig.apiHost;
            this.editorService = editorService;
            this.localStorageService = localStorageService;
            this.uploads = {};
            this.uploadProgress = {};

        }

        UploadService.prototype = {

            addUpload: function ( mid, locationsController ) {
                this.uploads[mid] = locationsController;
            },

            removeUpload: function ( mid ) {
                delete this.uploads[mid];
                delete this.uploadProgress[ mid ];
            },

            getUploads: function () {
                return this.uploads;
            },

            getJobs: function ( mock ) {
                var params ='';
                if ( mock ) {
                    params = '?mock=true';
                }

               return  get( '/jobs/user', {}, params );
            },

            isUploading: function () {
                return Object.keys(this.uploads).length > 0;
            },

            getJobsForMid: function ( mid, mock ) {
                let params='';
                if ( mock ) {
                    params = '?mock=true';
                }
                return get( '/jobs/media/' + mid, {}, params );
            },

            notify: function( upload ){
                this.locationsController = this.uploads[upload.mid];
                this.locationsController.notify(upload);
            },


            upload: function ( media, location, fields, uploadScope, locationsController) {

                const avType = media.avType;

                const uploadStatus = {
                    "mid": media.mid,
                    "fileName": location.file[0].name,
                    "status": "uploadStart",
                    "avType": avType
                };

                this.addUpload( media.mid, locationsController);

                this.$rootScope.$emit( this.pomsEvents.emitUploadStatus, uploadStatus );
                this.notify( uploadStatus );

                // not set on individual part?
                fields.fileSize = location.file[0].size;

                this.$upload.upload( {
                    url: this.host + '/gui/upload',
                    method: 'POST',
                    fields: fields,
                    file: location.file[0],
                    fileFormDataName: 'file'
                } )
                    .progress( function ( evt ) {

                        this.uploadProgress[ media.mid ] = parseInt( 100.0 * evt.loaded / evt.total ) + "%";

                    }.bind( this ) )

                    .success( function ( data, status, headers, config ) {

                        const uploadStatus = {
                            "mid": media.mid,
                            "fileName": location.file[0].name,
                            "status": "uploadFinished",
                            "avType": avType,
                            "message": data.message ? data.message : JSON.stringify(data)
                        };
                        console.log("success", data, status, headers, config, uploadStatus);

                        this.$rootScope.$emit( this.pomsEvents.emitUploadStatus, uploadStatus);
                        this.notify(uploadStatus);
                        this.removeUpload( media.mid );

                    }.bind( this ) )


                    .error( function ( data, status, headers, config ) {
                        if (data.cause === 'NEP_EXCEPTION') {
                            this.$rootScope.$emit(this.pomsEvents.error, data);
                        } else {
                            console.log("error", data, status, headers, config);
                            const newUpload = {
                                "mid": media.mid,
                                "fileName": location.file[0].name,
                                "status": "uploadError",
                                "message": data.message
                            };

                            this.notify(newUpload);
                        }
                        this.removeUpload( media.mid );
                    }.bind( this ) );


            }

        };

        return new UploadService();
    }
] );
