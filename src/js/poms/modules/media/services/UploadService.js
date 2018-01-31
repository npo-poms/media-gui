angular.module( 'poms.media.services' ).factory( 'UploadService', [
    '$rootScope',
    '$timeout',
    '$upload',
    'PomsEvents',
    'EditorService',
    'localStorageService',
    'NotificationService',
    'appConfig',
    '$q',
    '$http',
    function ( $rootScope, $timeout, $upload, PomsEvents, editorService, localStorageService, notificationService, appConfig, $q, $http ) {


        var baseUrl = appConfig.apihost + '/gui',

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
            this.pomsEvents = PomsEvents;
            this.host = appConfig.apihost;

            this.editorService = editorService;

            this.localStorageService = localStorageService;
            this.notificationService = notificationService;

            this.uploads = [];
            this.uploadProgress = {};

        }

        UploadService.prototype = {

            addUpload: function ( mid ) {
                this.uploads.push( mid );
            },

            removeUpload: function ( mid ) {
                var index = this.uploads.indexOf( mid );
                if ( index > - 1 ) {
                    this.uploads.splice( index, 1 );
                }
                this.uploadProgress[ mid ] = undefined;
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
                return (this.uploads.length > 0);
            },

            getJobsForMid: function ( mid, mock ) {
                var params='';
                if ( mock ) {
                    params = '?mock=true';
                }
                return get( '/jobs/media/' + mid, {}, params );
            },

            notify: function( upload ){

                var message = "";
                var status;

                if ( upload.status == 'uploadFinished' ) {
                    message = '<span>' + upload.fileName + '  is ge&uuml;pload, transcodering is begonnen </span>';
                } else if ( upload.status == 'uploadStart' ) {
                    message = '<span>' + upload.fileName + '  is nu aan het uploaden bij MID ' + upload.mid + ' </span>';
                } else if ( upload.status == 'uploadError' ) {
                    message = '<span>' + upload.fileName + ' is niet ge&uuml;pload </span>';
                    status = 'error';
                } else if ( upload.status == 'transcodingPublication' ) {
                    message = '<span> Het geüploade bestand bij' + upload.mid + ' is getranscodeerd </span>';
                }

                this.notificationService.notify( message, status );
            },


            upload: function ( media, location, fields ) {

                var newUpload = {
                    "mid": media.mid,
                    "fileName": location.file[0].name,
                    "status": "uploadStart"
                };


                this.addUpload( media.mid );

                this.$rootScope.$emit( this.pomsEvents.emitUploadStatus, newUpload );
                this.notify( newUpload );

                this.$upload.upload( {
                    url: this.host + '/ext-api/assets/upload',
                    method: 'POST',
                    fields: fields,
                    file: location.file[0],
                    fileFormDataName: 'file'
                } )
                    .progress( function ( evt ) {

                        this.uploadProgress[ media.mid ] = parseInt( 100.0 * evt.loaded / evt.total ) + "%";

                    }.bind( this ) )

                    .success( function ( data, status, headers, config ) {

                        var newUpload = {
                            "mid": media.mid,
                            "fileName": location.file[0].name,
                            "status": "uploadFinished"
                        };

                        this.$rootScope.$emit( this.pomsEvents.emitUploadStatus, newUpload );
                        this.notify( newUpload );

                        this.removeUpload( media.mid );

                    }.bind( this ) )


                    .error( function ( data, status, headers, config ) {

                        var newUpload = {
                            "mid": media.mid,
                            "fileName": location.file[0].name,
                            "status": "uploadError"
                        };

                        this.$rootScope.$emit( this.pomsEvents.emitUploadStatus, newUpload );
                        this.notify( newUpload );

                        this.removeUpload( media.mid );
                    }.bind( this ) );


            }

        };

        return new UploadService();
    }
] );
