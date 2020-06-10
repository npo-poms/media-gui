angular.module('poms.media.controllers').controller('LiveEditorController', [
    '$scope',
    '$modalInstance',
    '$filter',
    '$timeout',
    '$interval',
    'PomsEvents',
    'NEPService',
    'ListService',
    'MessageService',
    'NotificationService',
    'appConfig',
    (function() {

        function LiveEditorController($scope, $modalInstance, $filter, $timeout, $interval,  PomsEvents, NEPService, ListService, MessageService, notificationService, appConfig) {

            this.pomsEvents = PomsEvents;
            this.appConfig = appConfig;

            this.listService = ListService;
            this.messageService = MessageService;
            this.notificationService = notificationService;

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.$filter = $filter;
            this.$timeout = $timeout;
            this.$interval = $interval;

            this.$scope.durationInvalid = true;

            this.NEPService = NEPService;

            this.lastMouseDown = 0;
            this.scrubberTask = setInterval(function() {
                var scrubber = document.getElementById("scrubber");
                if (scrubber == null) {
                    clearInterval(this.scrubberTask);
                    return;
                }
                if (new Date().getTime() - this.lastMouseDown > 1000) this.tickScrubber();
            }, 250);

            this.init();
        }

        LiveEditorController.prototype = {
            cancel : function() {
                this.stopCustomPlayerTimeInterval();
                if (this.videoElement) {
                    this.videoElement.pause();
                }
                this.$modalInstance.dismiss();
            },

            init : function () {

                this.subscribeToItemizerMessages();

                this.listService.getLivestreams().then(
                    function ( data ) {
                        this.$scope.availableStreams = data;

                        this.$scope.item = {
                            currentStream : this.$scope.availableStreams[ 0 ]
                        };

                        this.NEPService.getStream( this.$scope.item.currentStream.id, true).then( function ( data ) {
                            this.createMediaPlayer( data );
                        }.bind( this ),  function ( error ) {

                            //alert("Cannot create player");

                        });

                        this.setupWatchers();

                    }.bind( this ),
                    function ( error ) {


                    }.bind( this )
                );

            },

            setupWatchers : function() {
                this.$scope.$watch( 'item.currentStream', function ( newValue ) {
                    if ( newValue ) {
                        this.changeStream( newValue.id );
                        this.$scope.item.assetLink = "";
                    }
                }.bind( this ) );

                this.$scope.$watch( 'item.startAsString', function ( newValue ) {
                    if ( newValue ) {
                        this.$scope.item.assetLink = "";
                    }
                }.bind( this ) );

                this.$scope.$watch( 'item.stopAsString', function ( newValue ) {
                    if ( newValue ) {
                        this.$scope.item.assetLink = "";
                    }
                }.bind( this ) );
            },


            createMediaPlayer : function ( data ) {
                this.videoElement = document.getElementById( 'video-player' );
                // Setup player
                this.mediaPlayer = dashjs.MediaPlayer().create();
                this.mediaPlayer.initialize();
                this.mediaPlayer.setAutoPlay( true );
                //mediaPlayer.setScheduleWhilePaused(true);
                //this.mediaPlayer.updateSettings({ 'debug': { 'logLevel': dashjs.Debug.LOG_LEVEL_NONE }});
                this.mediaPlayer.getDebug().setLogToBrowserConsole( false );
                this.mediaPlayer.attachView( this.videoElement );

                // Initialize controlbar
                this.controlbar = new ControlBar( this.mediaPlayer , false); //Player is instance of Dash.js MediaPlayer;
                this.controlbar.initialize();


                this.setStream( data );
                this.handleVideoEvents();
            },


            handleVideoEvents : function () {

                this.mediaPlayer.on( dashjs.MediaPlayer.events.PLAYBACK_PLAYING, function(e ){
                    this.setCustomPlayerTimeInterval();
                }, this);

                this.mediaPlayer.on( dashjs.MediaPlayer.events.PLAYBACK_PAUSED, function(e ){
                    this.stopCustomPlayerTimeInterval();
                }, this);

            },

            setCustomPlayerTimeInterval : function() {

                if ( !this.customPlayerTimeInterval ) {
                    this.customPlayerTimeInterval = this.$interval( function () {
                        var currentPos = Math.floor( this.videoElement.currentTime * 1000 );
                        this.$scope.playerTime =  this.getTimeInAmsterdamAsString(currentPos, "HH:mm:ss");

                        var lastPos = this.videoElement.currentTime + this.mediaPlayer.duration() - this.mediaPlayer.time();
                        this.$scope.playerMax = this.getTimeInAmsterdamAsString(Math.floor(lastPos * 1000), "HH:mm:ss");
                    }.bind( this ), 1000 );
                }
            },

            stopCustomPlayerTimeInterval : function () {
                if ( this.customPlayerTimeInterval ) {
                    this.$interval.cancel( this.customPlayerTimeInterval );
                    this.customPlayerTimeInterval = undefined;
                }

            },
            markStart : function () {
                var currentPos = Math.floor( this.videoElement.currentTime * 1000 );
                //console.log(this.videoElement.currentTime, currentPos);
                if ( ! isNaN( currentPos ) && this.$scope.item.stop < currentPos ) {
                    this.$scope.item.stop = currentPos;
                }
                this.mark("start", "startAsString", currentPos);
            },

            markStop : function () {
                var currentPos = Math.floor( this.videoElement.currentTime * 1000 );
                //console.log(this.videoElement.currentTime, currentPos);
                if ( ! isNaN( currentPos ) && this.$scope.item.start > currentPos ) {
                    this.$scope.item.start = currentPos;
                }
                this.mark("stop", "stopAsString", currentPos);
            },
            mark: function(timeField, stringField, currentPos) {
                this.$scope.item[timeField] = currentPos;
                this.$scope.item[stringField] = this.getTimeInAmsterdamAsString(currentPos);
                this.setDuration();
            },

            getTimeInAmsterdamAsString: function(utcMillis, format) {
                if (format == null) {
                    format =  "HH:mm:ss.sss";
                }
                return this.$filter('date')(new Date(utcMillis), format, "Europe/Amsterdam");
            },

            parseTimeInAmsterdam: function(string) {
                var split = string.split(":");
                return 1000 * ( parseFloat(split[2]) + 60 * (parseInt(split[1]) + 60 * parseInt(split[0])));
            },

            setDuration : function() {
                this.$scope.item.duration =  this.$scope.item.stop - this.$scope.item.start;
                //console.log("Duration in ms", this.$scope.item.duration)
                this.$scope.item.durationAsString =  this.$filter('secondsToMsTime')( ( this.$scope.item.duration ) / 1000 );
                if ( !this.$scope.item.duration  || this.$scope.item.duration <= 0) {
                    this.$scope.durationInvalid = true;
                } else {
                    this.$scope.durationInvalid = false;
                }

            } ,

            createAsset : function() {

                this.$scope.itemizerWaiting = true;

                var startttime = this.$scope.item.start;
                var stopttime = this.$scope.item.stop;

                this.itemizeRequest = {
                    "start": startttime,
                    "stop" : stopttime,
                    "stream" : this.$scope.item.currentStream.id
                };

                this.NEPService.itemizelive( this.itemizeRequest ).then( function ( data ) {
                    this.$scope.item.assetLink = this.appConfig.apiHost + data;

                }.bind(this), function ( error ) {
                    this.$scope.$emit( this.pomsEvents.error, error );
                }.bind(this) );
            },


            changeStream : function( newStream ) {
                this.NEPService.getStream( newStream, true).then( function ( data ) {
                    this.setStream( data );
                }.bind(this) );
            },

            setStream : function( data ) {

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


            },

            openAsset : function (){

                window.open(
                    this.$scope.item.assetLink,
                    '_blank' // <- This is what makes it open in a new window.
                );

            },

            grabFrame : function () {

                this.$scope.stillLoading = true;
                this.$scope.stillerror = null;

                var time = Math.floor(this.videoElement.currentTime * 1000);

                this.NEPService.getLiveScreengrab( this.$scope.item.currentStream.id , time )
                    .then( function ( response ) {
                    if (response && response.data) {
                        var blob = new Blob([response.data], {type: 'image/jpeg'});
                        this.$scope.still = window.URL.createObjectURL(blob);

                        this.$scope.image = {
                            'file': [blob]
                        };

                        var reader = new window.FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = function () {
                            this.$scope.stillBase64 = reader.result;
                        }.bind(this);
                    }

                    this.$scope.stillLoading = false;
                    }.bind(this),
                    function ( error ) {
                        var reader = new FileReader();
                        reader.onload = function() {
                            this.$scope.stillerror = reader.result;
                            this.notificationService.notify(reader.result, "error");
                            this.$scope.$apply();
                        }.bind(this);
                        reader.readAsText(error.data);
                        this.$scope.stillLoading = false;

                    }.bind(this)
                );
            },

            subscribeToItemizerMessages: function () {
                try {
                    this.messageService.receiveItemizerMessage()
                        .then( null, null, function ( message ) {
                            if ( this.itemizeRequest.stream === message.request.stream &&
                                this.itemizeRequest.start === message.request.start &&
                                this.itemizeRequest.stop === message.request.stop
                            ) {
                                this.$scope.workflowExecution = message.workflowExecution;
                                this.$scope.itemizerWaiting = ! message.readyForDownload;
                                this.$scope.assetSize = message.mibSize;
                            }
                        }.bind( this ) );
                } catch ( e ) {
                    console.log( 'Can\'t setup a /topic/publications websocket, see root cause: ', e );
                }
            },

            playFromStart : function () {
                this.playFrom("start");
            },

            playFromEnd : function () {
                this.playFrom("stop");
            },

            playFrom: function(timeField) {
                if ( this.videoElement ) {
                    this.videoElement.currentTime = this.$scope.item[timeField] / 1000;
                    this.videoElement.play();
                }
            },

            scrubberLetGo: function(element, element) {
                document.getElementById("scrubber").value = 0;
            },

            scubberClick: function() {
                this.lastMouseDown = new Date().getTime();
                setTimeout(function() {
                    this.tickScrubber();
                }, 50)
            },

            tickScrubber: function() {
                var scrubber = document.getElementById("scrubber");
                var scrubberPosition = scrubber.value;
                var frames = Math.abs(scrubberPosition * scrubberPosition);
                var offset = frames * 40;

                var display = document.getElementById("scrubber-timer");
                if (scrubberPosition == 0) {
                    display.style.display = "none";
                    return;
                }
                display.innerText = frames + " frames per seconde"
                display.style.display = "";

                if (this.videoElement) {
                    if (scrubberPosition > 0) {
                        this.videoElement.currentTime += offset / 1000;
                    } else {
                        this.videoElement.currentTime -= offset / 1000;
                    }
                }
            },

            setStartValueAsString : function () {
                this.setTimeAsString("start", "startAsString");
            },

            setStopValueAsString : function () {
                this.setTimeAsString("stop", "stopAsString");
            },

            setTimeAsString: function(timeField, stringField) {
                var specified = this.parseTimeInAmsterdam(this.$scope.item[stringField]);
                if(!isNaN(specified)){
                    // https://jira.vpro.nl/browse/MSE-4712
                    previous = this.parseTimeInAmsterdam(this.getTimeInAmsterdamAsString(this.$scope.item[timeField]));
                    diff = specified - previous;
                    if (diff !== 0) {
                        this.$scope.item[timeField] += diff;
                        this.seekAndPause(this.$scope.item[timeField]);
                        this.setDuration();
                    }
                }
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
            }
        };

        return LiveEditorController;
    }())
]);
