angular.module( 'poms.media.controllers' ).controller( 'ItemizerController', [
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
    'LocationService',
    'NotificationService',
    'swfobject',
    'media',
    'segments',
    'segment',
    (function () {


        function isValid ( segment ) {

            return segment.mainTitle &&
                segment.mainTitle.text !== undefined &&
                segment.mainTitle.text !== '' &&
                segment.mainDescription &&
                segment.mainDescription.text != undefined &&
                segment.mainDescription.text !== '' &&
                segment.start < segment.stop
        }


        function ItemizerController ( $scope, $filter, $upload, $interval, $timeout, $modalInstance, $rootScope, appConfig, PomsEvents, MediaService, LocationService, NotificationService, swfobject, media, segments, segment ) {

            this.$scope = $scope;
            this.$filter = $filter;
            this.$upload = $upload;
            this.$interval = $interval;
            this.$timeout = $timeout;

            this.$modalInstance = $modalInstance;
            this.$rootScope = $rootScope;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;
            this.locationService = LocationService;
            this.notificationService = NotificationService;
            this.swfobject = swfobject;

            this.imageshost = appConfig.imageshost;

            this.$scope.playerReady = false;
            this.$scope.isPlaying = false;
            this.$scope.segmentFormValid = false;
            this.$scope.unplayableMedia = false;

            this.$scope.media = media;
            this.$scope.segments = segments;

            this.$scope.required = [
                { 'id' : 'mainTitle', 'text' : 'Titel' },
                { 'id' : 'mainDescription', 'text' : 'Beschrijving' }
            ];

            this.init( segment );

        }

        ItemizerController.prototype = {

            init : function ( segment ) {

                if ( segment ) {
                    this.$scope.duration = 1;

                    this.$scope.segment = angular.copy( segment );
                } else {
                    this.$scope.segment = {
                        start : this.$filter( 'withTimezone' )( new Date( this.$scope.segment.stop || 0 ) ),
                        stop : this.$filter( 'withTimezone' )( new Date( this.$scope.segment.stop || 0 ) ),
                        duration : this.$filter( 'withTimezone' )( new Date( 0 ) )
                    };
                }

                this.$scope.segment.startAsTime = this.$scope.segment.start;
                this.$scope.segment.stopAsTime = this.$scope.segment.stop;

                this.$scope.segment.start = this.$filter( 'noTimezone' )( this.$scope.segment.start ).getTime();
                this.$scope.segment.stop = this.$filter( 'noTimezone' )( this.$scope.segment.stop ).getTime();

                if ( this.$scope.segment.start == this.$scope.segment.stop ) {
                    this.$scope.segment.stop += 1;
                }

                this.setupWatchers();

                this.getImagesForSegment();

                if ( ! this.$scope.location ) {
                    this.getLocationByMid();
                }

                this.$scope.still = false;

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


            setupWatchers : function () {

                this.$scope.$watch( 'segment.start', _.debounce( function ( a, b ) {
                    if ( a != b ) {
                        this.$timeout( function () {
                            this.setStartValueAsDate( a );
                            this.seekAndPause( a );
                        }.bind( this ), 0 )
                    }
                }.bind( this ), 100 ) );

                this.$scope.$watch( 'segment.stop', _.debounce( function ( a, b ) {
                    if ( a != b ) {
                        this.$timeout( function () {
                            this.setStopValueAsDate( a );
                            this.seekAndPause( a );
                        }.bind( this ), 0 )
                    }
                }.bind( this ), 100 ) );

                this.$scope.$watch( 'segment', function ( newValue ) {
                    this.$scope.segmentFormValid = isValid( newValue );
                    this.$scope.invalidTimes = ! (newValue.start < newValue.stop);
                }.bind( this ), true );

                //onchange="itemizerController.seekviaScrubber()" ng-click="itemizerController.seekviaScrubber()"
                $("#scrubberhandle").on("input change", function() {
                    this.$timeout( function () {
                        this.seekviaScrubber();
                    }.bind( this ), 0 );
                });
            },

            canvasPlay : function () {
                if ( this.canvas.getPaused() ) {
                    this.canvas.playVideo();
                    this.seek(  this.$scope.canvasPosition / 1000  );
                    this.$scope.isPlaying = true;
                } else {
                    this.canvas.pauseVideo();
                    this.$scope.isPlaying = false;
                }
            },

            mayUpload : function () {
                return this.mediaService.hasWritePermission( this.$scope.media, 'imagesUpload' );
            },

            cancel : function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if ( ! this.$scope.segmentFormValid ) {
                    this.$scope.segments.pop();
                }
                // Do not dismiss. Several segments might have been made before this controller is cancelled
                this.$modalInstance.close();
            },


            markStart : function () {
                var currentPos = this.canvas.getCurrentTime() * 1000;
                if ( ! isNaN( currentPos ) && this.$scope.segment.stop < currentPos ) {
                    this.$scope.segment.stop = currentPos;
                    this.setStopValueAsDate();
                }
                this.$scope.segment.start = currentPos;
                this.setStartValueAsDate();

            },

            markStop : function () {
                var currentPos = this.canvas.getCurrentTime() * 1000;
                if ( ! isNaN( currentPos ) && this.$scope.segment.start > currentPos ) {
                    this.$scope.segment.start = currentPos;
                    this.setStartValueAsDate();
                }
                this.$scope.segment.stop = currentPos;
                this.setStopValueAsDate();
            },

            setScrubbing : function (  ) {
                this.$scope.scrubbing = true;
            },

            setStartValueAsDate : function ( start ) {
                this.$scope.segment.startAsTime = this.$filter( 'withTimezone' )( new Date( this.$scope.segment.start ) );
            },

            setStopValueAsDate : function ( stop ) {
                this.$scope.segment.stopAsTime = this.$filter( 'withTimezone' )( new Date( this.$scope.segment.stop ) );
            },

            setStartValueAsMs : function () {
                this.$scope.segment.start = this.$filter( 'noTimezone' )( this.$scope.segment.startAsTime ).getTime();
            },

            setStopValueAsMs : function () {
                this.$scope.segment.stop = this.$filter( 'noTimezone' )( this.$scope.segment.stopAsTime ).getTime();
            },

            seekAndPause : function ( time ) {
                if ( this.canvas ){
                    this.canvas.pauseVideo();
                    this.$scope.isPlaying = false;
                    this.seek( Math.floor( time / 1000 ) );
                }
            },

            seekviaScrubber : function () {
                this.seek( Math.floor( this.$scope.canvasPosition / 1000 ) );
                this.$scope.scrubbing = false;
            },

            seek : function ( pos ) {
                if ( this.canvas ) {
                    this.canvas.setCurrentTime( pos );
                }
            },

            playSegment : function () {
                if ( this.canvas ) {
                    this.canvas.setCurrentTime( Math.floor( this.$scope.segment.start / 1000 ) );
                    this.canvas.playVideo();
                    this.$scope.isPlaying = true;
                }
            },

            playEnd : function () {
                if ( this.canvas ) {
                    this.canvas.setCurrentTime( Math.floor( this.$scope.segment.stop / 1000 ) );
                    this.canvas.playVideo();
                    this.$scope.isPlaying = true;
                }
            },

            handleCanvasEvents : function ( e ) {

                if ( e.type === 'loadedmetadata' ) {
                    this.$timeout( function () {
                        this.$scope.duration = Math.floor( e.value.duration * 1000 );
                    }.bind( this ), 0 );
                }

                if ( e.type === 'loadstart' ) {
                    this.canvas.playVideo();
                    this.canvas.pauseVideo();
                    this.canvas.setCurrentTime( this.$scope.segment.start );

                }

                if ( e.type === 'play' ) {
                    this.$timeout( function () {
                        this.$scope.playerReady = true;
                    }.bind( this ), 0 );
                }

                if ( e.type === 'timeupdate' ) {
                    this.$timeout( function () {
                        if ( !this.$scope.scrubbing ){
                            this.$scope.canvasPosition = e.value * 1000;
                        }
                    }.bind( this ), 0 );

                }

                if ( e.type === 'progress' ) {
                    this.$timeout( function () {
                        this.$scope.downloadProgress = Math.floor( e.value.loaded / e.value.total * 100 ) + "%";
                    }.bind( this ), 0 );

                }
            },

            newSegment : function () {
                this.$scope.image = false;
                this.init();
            },

            close : function () {
                this.$modalInstance.close();
            },

            saveAndNew : function () {
                this.newAfterSave = true;
                this.save();
            },

            afterSave : function () {
                this.$scope.waiting = false;

                if ( this.newAfterSave ) {

                    if ( this.$scope.segment.mainTitle.text ) {
                        this.notificationService.notify('Segment "' + this.$scope.segment.mainTitle.text + '" opgeslagen.');
                    }

                    this.newSegment();

                    this.newAfterSave = false;
                } else {
                    this.close();
                }

            },

            checkForImageSave : function () {
                if ( this.$scope.image && this.$scope.image.file[ 0 ] ) {
                    this.saveImage();
                } else {
                    this.afterSave();
                }
            },

            mapNewSegment : function () {

                this.mediaService.getSegments( this.$scope.media ).then(
                    function ( segments ) {

                        for ( var i = 0; i < segments.length; i ++ ) {

                            var isNew = true;

                            for ( var j = 0; j < this.$scope.segments.length; j ++ ) {
                                if ( this.$scope.segments[ j ].mid && segments[ i ].mid == this.$scope.segments[ j ].mid ) {
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

            setInheritedGenres :  function(){

                this.mediaService.getGenres( this.$scope.media ).then(
                    function ( genres ) {

                        if ( genres.length ){

                            this.mediaService.setGenres( this.$scope.segment, genres ).then(
                                function ( media ) {
                                    this.checkForImageSave();
                                }.bind( this ),
                                function ( error ) {
                                    this.$scope.$emit( this.pomsEvents.error, error );
                                }.bind( this ) );
                        }else{
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

                data.start = this.$filter( 'noTimezone' )( this.$scope.segment.startAsTime ).getTime();
                data.duration = this.$filter( 'noTimezone' )( this.$scope.segment.stopAsTime ).getTime() - data.start;

                this.mediaService.saveSegment( this.$scope.media, data ).then(
                    function ( media ) {
                        angular.copy( media, this.$scope.media );

                        if ( ! this.$scope.segment.mid ) {
                            // Saving a new segment return the parent media object with all it's segments,
                            // if we want to continue editing / save image, we need to know which of the segments it was we just created

                            // TODO use deferreds instead of this nested calls structure
                            this.mapNewSegment();
                        } else {
                            this.checkForImageSave();
                        }

                    }.bind( this ),
                    function ( error ) {
                        if ( error.status && error.status == 400 && error.violations ) {
                            source.violations = error.violations;
                            return 'Errors';
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }
                    }.bind( this ) );

            },

            saveImage : function () {

                var credits = 'Still ' + this.$scope.media.mainTitle.text + ( ( this.$scope.media.subTitle ) ? '/' + this.$scope.media.subTitle.text : '' );
                var sourceName = ( ( this.$scope.media.broadcasters ) ? this.$scope.media.broadcasters.map(function (broadcaster) {return broadcaster.text;}).join(', ') : '' );
                var license = {id: "COPYRIGHTED", text: "Copyrighted"};
                var fields = {
                    title : this.$scope.media.mainTitle.text,
                    description : 'Still van ' + this.$scope.media.mainTitle.text,
                    imageType : 'PICTURE',
                    publishStart : '',
                    publishStop : ''
                };

                // Image not uploaded to image server yet
                this.$upload.upload( {
                    url : this.imageshost,
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

            getLocationByMid : function () {
                if ( ! this.canvas ) {
                    this.locationService.resolve( this.$scope.media.mid, 'h264%2Cmp4' ).then(
                        function ( video ) {
                            this.$scope.location = video.getProgramUrl();
                            this.$scope.location = this.$scope.location.replace( /\+/g, '%2B' );

                            if (/odi.omroep.nl/i.test( this.$scope.location )){
                                // We call the location in jsonp format for ODI sources to check if we have direct stream after redirects (MSE-3213)
                                $.ajax( {
                                    url : this.$scope.location.split( '?' ).shift() + '?type=jsonp&callback=?',
                                    dataType : 'json',
                                    crossDomain : true
                                } ).done( function ( data ) {
                                        if ( data.path ) {
                                            this.createCanvas();
                                        }else{
                                            this.warnUnplayableMedia();
                                        }
                                    }.bind( this )
                                );
                            }else{
                                this.createCanvas();
                            }

                        }.bind( this ),
                        function ( error ) {
                            this.warnUnplayableMedia();

                            console.log( 'no location found for mid: ' + this.$scope.media.mid );
                            //this.$scope.$emit( this.pomsEvents.error, error );
                        }.bind( this )
                    );
                }
            },

            createCanvas : function () {

                var host = angular.element( '.framegrabber' )[ 0 ];

                var id = "__engine__" + Math.floor( Math.random() * 999999999 );

                host.setAttribute( 'id', id );

                // Global Flash callback for communication with external interface
                window[ id ] = function ( type, value ) {

                    this.handleCanvasEvents( {
                        target : host,
                        type : type,
                        value : value
                    } );

                }.bind( this );


                var params = {
                    flashvars : [
                        'externalCallback=' + id,
                        (this.$scope.location) ? 'src=' + this.$scope.location : '',
                        'muted=muted',
                        'policydomains=https://files.vpro.nl/flash/videoplayer/policy-domains.txt'
                    ].join( '&' ),
                    wmode : 'transparent',
                    allownetworking : 'all',
                    allowscriptaccess : 'always'
                };

                this.swfobject.embedSWF(
                    'https://files.vpro.nl/flash/videoplayer/player-2.1.0.swf',
                    id, '100%', '100%', '10.0.0', '', {}, params, {},
                    function ( e ) {
                        if ( e.success ) {
                            this.$timeout( function () {
                                this.canvas = e.ref;
                            }.bind( this ), 0 );
                        }else{
                            console.log( 'cannot create canvas, is Flash enabled?' )
                        }
                    }.bind( this )
                );
            },

            warnUnplayableMedia :  function(){
                this.$timeout( function () {
                    this.$scope.unplayableMedia = true;
                }.bind( this ), 0 );
            },

            grabFrame : function () {
                this.canvas.pauseVideo();
                this.$scope.isPlaying = false;
                var canvasData = this.canvas.grabImageData();
                var reader = new FileReader();

                reader.onload = function ( e ) {
                    this.$scope.$apply( function () {
                        this.$scope.still = e.target.result;
                        this.$scope.stillLoading = false;
                    }.bind( this ) );
                }.bind( this );

                this.$scope.image = {
                    'file' : [ this.b64toBlob( canvasData, 'image/png' ) ]
                };

                reader.readAsDataURL( this.$scope.image.file[ 0 ] );
            },

            b64toBlob : function ( b64Data, contentType, sliceSize ) {
                contentType = contentType || '';
                sliceSize = sliceSize || 512;

                var byteCharacters = atob( b64Data );
                var byteArrays = [];

                for ( var offset = 0; offset < byteCharacters.length; offset += sliceSize ) {
                    var slice = byteCharacters.slice( offset, offset + sliceSize );

                    var byteNumbers = new Array( slice.length );
                    for ( var i = 0; i < slice.length; i ++ ) {
                        byteNumbers[ i ] = slice.charCodeAt( i );
                    }

                    var byteArray = new Uint8Array( byteNumbers );

                    byteArrays.push( byteArray );
                }
                return new Blob( byteArrays, { type : contentType } );
            }


        };
        return ItemizerController;
    }())
] );
