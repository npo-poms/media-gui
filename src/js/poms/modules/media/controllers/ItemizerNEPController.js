angular.module( 'poms.media.controllers' ).controller( 'ItemizerNEPController', [
    '$scope',
    '$filter',
    '$upload',
    '$interval',
    '$timeout',
    '$modalInstance',
    '$rootScope',
    'appConfig',
    'PomsEvents',
    'MediaService',
    'NotificationService',
    'NEPService',
    'MessageService',
    'media',
    'segments',
    'segment',
    'EditorService',
    'ListService',

    (function () {


        function isValid ( segment ) {

            return segment.mainTitle &&
                segment.mainTitle !== '' &&
                segment.mainDescription &&
                segment.mainDescription !== '' &&
                segment.start < segment.stop
        }


        function ItemizerNEPController ( $scope, $filter, $upload, $interval, $timeout, $modalInstance, $rootScope, appConfig, PomsEvents, MediaService, NotificationService, NEPService, MessageService, media, segments, segment, editorService, listService) {

            this.$scope = $scope;
            this.$filter = $filter;
            this.$upload = $upload;
            this.$interval = $interval;
            this.$timeout = $timeout;

            this.$modalInstance = $modalInstance;
            this.$rootScope = $rootScope;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;
            this.notificationService = NotificationService;
            this.NEPService = NEPService;
            this.messageService = MessageService;
            this.editorService = editorService;

            this.appConfig = appConfig;

            this.$scope.playerReady = false;
            this.$scope.isPlaying = false;
            this.$scope.segmentFormValid = false;
            this.$scope.unplayableMedia = false;

            this.$scope.media = media;
            this.$scope.segments = segments;

            this.$scope.required = [
                {
                    'id' : 'mainTitle',
                    'text' : 'Titel'
                },
                {
                    'id' : 'mainDescription',
                    'text' : 'Beschrijving'
                }
            ];
            listService.getChapterTypes().then(
                function ( data ) {
                    this.$scope.chapterTypes = data;
                }.bind(this));


            this.loadingAssets = []

            this.$modalInstance.opened.then( function () {
                this.init( segment );
            }.bind( this ) );

        }

        ItemizerNEPController.prototype = {

            init : function ( segment ) {

                this.subscribeToItemizerMessages();

                this.NEPService.getStream( this.$scope.media.mid ).then( function ( data ) {
                    this.createMediaPlayer( data );
                }.bind(this) );

                // segment already exists
                if ( segment ) {
                    this.$scope.duration = 1;
                    this.$scope.segment = angular.copy( segment );
                } else {
                    this.$scope.segment = {
                        start : 0 ,
                        stop : 0 ,
                        duration : 0
                    };
                }

                // make sure start / stop are not the same
                if ( this.$scope.segment.start === this.$scope.segment.stop ) {
                    this.$scope.segment.stop += 1;
                }

                this.$scope.segment.formattedstart = this.formatDuration(this.$scope.segment.start);
                this.$scope.segment.formattedstop = this.formatDuration(this.$scope.segment.stop);

                this.setDuration();

                this.setupWatchers();

                this.getImagesForSegment();

                this.$scope.still = false;

            },
            formatDuration: function(ms) {
                var s = Math.floor(ms / 1000);
                ms = ms % 1000;
                var m = Math.floor(s / 60);
                s %= 60;
                var h = Math.floor(m / 60);
                m %= 60;
                return this.$filter("toDigits")(h, 2) + ":" + this.$filter("toDigits")(m, 2) + ":" + this.$filter("toDigits")(s, 2) + "." + this.$filter("toDigits")(ms, 3);
            },
            parseDuration: function(string) {
                var split = string.replace(',', '.').split(':');
                var hours = parseInt(split[0]);
                var minutes = parseInt(split[1]);
                var millis  = 1000 * parseFloat(split[2]);

                return (hours * 60 + minutes) * 60 * 1000 + millis;

            },

            setDuration : function() {
                this.$scope.segment.duration =  this.$scope.segment.stop - this.$scope.segment.start;
                this.$scope.segment.formattedduration = this.formatDuration(this.$scope.segment.duration);

                if ( !this.$scope.segment.duration  || this.$scope.segment.duration <= 0) {
                    this.$scope.durationInvalid = true;
                } else {
                    this.$scope.durationInvalid = false;
                }

            } ,

            afterSave : function () {
                this.$scope.waiting = false;

                if ( this.newAfterSave ) {

                    if ( this.$scope.segment.mainTitle.text ) {
                        this.notificationService.notify( 'Segment "' + this.$scope.segment.mainTitle.text + '" opgeslagen.' );
                    }

                    this.newSegment();

                    this.newAfterSave = false;
                } else {
                    this.close();
                }

            },

            b64toBlob : function ( b64Data, contentType, sliceSize ) {
                contentType = contentType || '';
                sliceSize = sliceSize || 512;

                var byteCharacters = atob( b64Data );
                var byteArrays = [];

                for ( var offset = 0; offset < byteCharacters.length; offset += sliceSize ) {
                    var slice = byteCharacters.slice( offset, offset + sliceSize );

                    var byteNumbers = new Array( slice.length );
                    for ( var i = 0; i < slice.length; i++ ) {
                        byteNumbers[ i ] = slice.charCodeAt( i );
                    }

                    var byteArray = new Uint8Array( byteNumbers );

                    byteArrays.push( byteArray );
                }
                return new Blob( byteArrays, { type : contentType } );
            },

            cancel : function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if ( !this.$scope.segmentFormValid ) {
                    this.$scope.segments.pop();
                }
                // Do not dismiss. Several segments might have been made before this controller is cancelled
                this.$modalInstance.close();
            },


            close : function () {
                this.$modalInstance.close();
            },


            checkForImageSave : function () {
                if ( this.$scope.image && this.$scope.image.file[ 0 ] ) {
                    this.saveImage();
                } else {
                    this.afterSave();
                }
            },

            createMediaPlayer : function ( data ) {
                this.videoElement = document.getElementById( 'video-player' );
                // Setup player
                this.mediaPlayer = dashjs.MediaPlayer().create();
                this.mediaPlayer.initialize();
                this.mediaPlayer.setAutoPlay( true );
                //this.mediaPlayer.updateSettings({ 'debug': { 'logLevel': dashjs.Debug.LOG_LEVEL_NONE }});
                this.mediaPlayer.attachView( this.videoElement );

                // Initialize controlbar
                this.controlbar = new ControlBar( this.mediaPlayer ); //Player is instance of Dash.js MediaPlayer;
                this.controlbar.initialize();

                // Add generated drm tokens for the stream requested. Depends on the profile and drm type.
                var protectionData = {
                    'com.microsoft.playready': {
                        serverURL: 'https://npo-drm-gateway.samgcloud.nepworldwide.nl/authentication',
                        httpRequestHeaders: {
                            customdata: data.playReadyToken
                        }
                    },
                    'com.widevine.alpha' : {
                        serverURL : 'https://npo-drm-gateway.samgcloud.nepworldwide.nl/authentication',
                        httpRequestHeaders : {
                            customdata : data.widevineToken
                        }
                    }
                };

                // Attach protection data to mediaplayer
                this.mediaPlayer.setProtectionData( protectionData );

                // Attach manifest to mediaplayer
                this.mediaPlayer.attachSource( data.stream );

                this.handleVideoEvents();

            },

            handleVideoEvents : function () {

                this.videoElement.addEventListener( 'loadeddata', function ( event ) {
                    this.videoElement.pause();

                    if ( !this.$scope.duration ) {
                        this.$scope.duration = this.mediaPlayer.duration() * 1000 ;
                    }

                    this.seek( Math.floor( this.$scope.segment.start / 1000 ) );
                }.bind( this ), false );

            },


            grabFrame : function () {

                this.$scope.stillLoading = true;
                this.$scope.stillerror = null;
                var offset = Math.floor( this.videoElement.currentTime * 1000) ;

                this.NEPService.getScreengrab( this.$scope.media.mid , offset )

                    .then( function ( response ) {
                            if (response && response.data) {
                                var blob = new Blob([response.data], {type: 'image/jpeg'});
                                this.$scope.still = window.URL.createObjectURL(blob);

                                this.$scope.image = {
                                    'file': [blob]
                                };
                            }
                            this.$scope.stillLoading = false;

                        }.bind( this ),
                        function ( error ) {
                            var reader = new FileReader();
                            reader.onload = function() {
                                this.$scope.stillerror = reader.result;
                                this.notificationService.notify(reader.result, "error");
                                this.$scope.$apply();
                            }.bind(this);
                            reader.readAsText(error.data);
                            this.$scope.stillLoading = false;
                        }.bind( this )
                    );
            },


            getImagesForSegment : function () {

                if ( this.$scope.segment.mid ) {
                    this.mediaService.getImages( this.$scope.segment ).then(
                        function ( media ) {
                            this.$scope.segmentImages = media;
                        }.bind( this ),
                        function ( error ) {
                            this.$scope.$emit( this.pomsEvents.error, error );
                        }.bind( this ) );
                } else {
                    this.$scope.segmentImages = [];
                }
            },


            mayUpload : function () {
                return this.mediaService.hasWritePermission( this.$scope.media, 'imagesUpload' );
            },

            markStart : function () {
                var currentPos = Math.floor( this.videoElement.currentTime * 1000 );
                if ( ! isNaN( currentPos ) && this.$scope.segment.stop < currentPos ) {
                    this.$scope.segment.stop = currentPos;
                }
                this.$scope.segment.start = currentPos;
                this.$scope.segment.formattedstart = this.formatDuration(currentPos);
                this.setDuration();

            },

            markStop : function () {
                var currentPos = Math.floor( this.videoElement.currentTime * 1000 );

                if ( ! isNaN( currentPos ) && this.$scope.segment.start > currentPos ) {
                    this.$scope.segment.start = currentPos;
                }

                this.$scope.segment.stop = currentPos;
                this.$scope.segment.formattedstop = this.formatDuration(currentPos);
                this.setDuration();

            },

            mapNewSegment : function () {

                this.mediaService.getSegments( this.$scope.media ).then(
                    function ( segments ) {

                        for ( var i = 0; i < segments.length; i++ ) {

                            var isNew = true;

                            for ( var j = 0; j < this.$scope.segments.length; j++ ) {
                                if ( this.$scope.segments[ j ].mid && segments[ i ].mid === this.$scope.segments[ j ].mid ) {
                                    isNew = false;
                                }
                            }

                            if ( isNew ) {
                                angular.extend( this.$scope.segment, segments[ i ] );
                                angular.extend( this.$scope.segments, segments );

                                this.setInheritedGenres();

                                break;
                            }

                        }
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );

                    }.bind( this )
                );
            },


            newSegment : function () {
                this.$scope.image = false;
                this.init();
            },


            playSegment : function () {
                if ( this.videoElement ) {
                    this.videoElement.currentTime = Math.floor( this.$scope.segment.start / 1000  );
                    this.videoElement.play();
                    this.$scope.isPlaying = true;
                }
            },

            playEnd : function () {
                if ( this.videoElement ) {
                    this.videoElement.currentTime =  Math.floor( this.$scope.segment.stop / 1000  );
                    this.videoElement.play();
                    this.$scope.isPlaying = true;
                }
            },

            saveAndNew : function () {
                this.newAfterSave = true;
                this.save();
            },


            setStartValueAsMs : function () {
                if (this.$scope.segment.startastime) {
                    this.$scope.segment.start = this.$filter('timeToMSeconds')(this.$scope.segment.startastime);
                    this.$scope.segment.formattedstart = this.formatDuration(this.$scope.segment.start);

                }
                this.seekAndPause( this.$scope.segment.start );
                this.setDuration();
            },

            setStopValueAsMs : function () {
                if (this.$scope.segment.stopastime) {
                    this.$scope.segment.stop = this.$filter('timeToMSeconds')(this.$scope.segment.stopastime);
                    this.$scope.segment.formattedstop = this.formatDuration(this.$scope.segment.stop);
                }
                this.seekAndPause( this.$scope.segment.stop );
                this.setDuration();
            },

            seekAndPause : function ( time ) {
                if ( this.videoElement ){
                    this.videoElement.pause();
                    this.seek( Math.floor( time / 1000 ) );
                }
            },

            seek : function ( pos ) {
                if ( this.videoElement ) {
                    this.videoElement.currentTime = pos ;
                }
            },


            setupWatchers : function () {

                this.$scope.$watch( 'segment', function ( newValue ) {
                    this.$scope.segmentFormValid = isValid( newValue );
                    this.$scope.invalidTimes = !(newValue.start < newValue.stop);
                }.bind( this ), true );

                this.$scope.$watch( 'segment.startastime', function ( newValue ) {
                    if ( newValue ) {
                        this.$scope.assetLink = "";
                    }
                }.bind( this ) );

                this.$scope.$watch( 'segment.stopastime', function ( newValue ) {
                    if ( newValue ) {
                        this.$scope.assetLink = "";
                    }

                }.bind( this ) );
                this.$scope.$watch( 'segment.formattedstart', function ( newValue ) {
                    if ( newValue ) {
                        this.$scope.assetLink = "";
                        this.$scope.segment.start = this.parseDuration(newValue);
                        this.setDuration()

                    }
                }.bind( this ) );

                this.$scope.$watch( 'segment.formattedstop', function ( newValue ) {
                    if ( newValue ) {
                        this.$scope.assetLink = "";
                        this.$scope.segment.stop = this.parseDuration(newValue);
                        this.setDuration()

                    }
                }.bind( this ) );
            },


            setInheritedGenres : function () {

                this.mediaService.getGenres( this.$scope.media ).then(
                    function ( genres ) {

                        if ( genres.length ) {

                            this.mediaService.setGenres( this.$scope.segment, genres ).then(
                                function ( media ) {
                                    this.checkForImageSave();
                                }.bind( this ),
                                function ( error ) {
                                    this.$scope.$emit( this.pomsEvents.error, error );
                                }.bind( this ) );
                        } else {
                            this.checkForImageSave();
                        }

                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );

                    }.bind( this ) );

            },

            save : function () {

                this.$scope.waiting = true;

                var data = angular.copy( this.$scope.segment );

                data.start = {
                    string:  this.$scope.segment.formattedstart
                };
                data.duration =  {
                    string: this.$scope.segment.formattedduration
                };

                this.mediaService.saveSegment( this.$scope.media, data ).then(
                    function ( segment ) {
                        angular.copy(segment.media, this.$scope.media );

                        if ( !this.$scope.segment.mid ) {
                            // Saving a new segment return the parent media object with all it's segments,
                            // if we want to continue editing / save image, we need to know which of the segments it was we just created

                            this.mapNewSegment();
                        } else {
                            this.checkForImageSave();
                        }

                    }.bind( this ),
                    function ( error ) {
                        if ( error.status && error.status === 400 && error.violations ) {
                            source.violations = error.violations;
                            return 'Errors';
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }
                    }.bind( this ) );

            },

            saveImage : function () {

                var credits = 'Still ' + this.$scope.media.mainTitle.text + ( ( this.$scope.media.subTitle ) ? '/' + this.$scope.media.subTitle.text : '' );
                var sourceName = ( ( this.$scope.media.broadcasters ) ? this.$scope.media.broadcasters.map( function ( broadcaster ) {
                    return broadcaster.text;
                } ).join( ', ' ) : '' );
                var license = { id : "COPYRIGHTED", text : "Copyrighted" };
                var fields = {
                    title : this.$scope.media.mainTitle.text,
                    description : 'Still van ' + this.$scope.media.mainTitle.text,
                    imageType : 'PICTURE',
                    publishStart : '',
                    publishStop : ''
                };

                // Image not uploaded to image server yet
                this.$upload.upload( {
                    url : this.editorService.getCurrentEditor().imageUploadUrl,
                    method : 'POST',
                    fields : fields,
                    file : this.$scope.image.file[ 0 ],
                    fileFormDataName : 'file'
                } ).then(
                    function ( extResult ) {
                        var uploaded = extResult.data.list[ 0 ];

                        var imageToSave = {
                            'uri' : uploaded.urn,
                            'height' : uploaded.height,
                            'width' : uploaded.width,
                            'title' : uploaded.title,
                            'description' : uploaded.description,
                            'credits' : credits,
                            'sourceName' : sourceName,
                            'license' : license,
                            'type' : { id : "STILL", text : "Still" },
                            'publication' : {},
                            'file' : uploaded
                        };

                        this.mediaService.saveImage( this.$scope.segment, imageToSave ).then(
                            function () {
                                this.afterSave();
                            }.bind( this ),
                            function ( error ) {
                                this.$scope.$emit( this.pomsEvents.error, error );
                            }.bind( this )
                        )
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        this.$scope.waiting = false;

                    }.bind( this )
                );


            },

            createAsset : function() {
                this.$scope.assetWaiting = true;
                this.itemizeRequest = {
                    "mid" : this.$scope.media.mid,
                    "start": this.$scope.segment.start,
                    "stop" : this.$scope.segment.stop
                };

                this.NEPService.itemize( this.itemizeRequest ).then( function ( data ) {

                    this.$scope.assetLink = this.appConfig.apiHost + data;
                }.bind(this), function ( error ) {
                    this.$scope.$emit( this.pomsEvents.error, error );
                }.bind(this) );
            },

            openAsset : function (){
                window.open(
                    this.$scope.assetLink,
                    '_blank' // <- This is what makes it open in a new window.
                );
            },

            subscribeToItemizerMessages: function () {
                try {
                    this.messageService.receiveItemizerMessage()
                        .then( null, null, function ( message ) {
                            if (this.itemizeRequest &&
                                this.itemizeRequest.mid === message.request.mid &&
                                this.itemizeRequest.start === message.request.start &&
                                this.itemizeRequest.stop === message.request.stop
                            ) {
                                this.$scope.workflowExecution = message.workflowExecution;
                                this.$scope.assetWaiting = ! message.readyForDownload;
                                this.$scope.assetSize = message.mebiSize;
                            }
                        }.bind( this ) );
                } catch ( e ) {
                    console.log( 'Can\'t setup a /topic/publications websocket, see root cause: ', e );
                }
            }


        };
        return ItemizerNEPController;
    }())
] );
