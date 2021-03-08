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
            this.itemizerTasks = {}

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
                setTimeout(this.startScrubber.bind(this), 100);

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

            startScrubber: function() {
                // 4 times a second update scrubber
                this.scrubberTask = setInterval(this.updateScrubber.bind(this), 250);
            },

            updateScrubber: function() {
                var scrubber = document.getElementById("scrubber");
                if (scrubber == null) {
                    clearInterval(this.scrubberTask);
                    return;
                }
                // at least a second passed
                if (new Date().getTime() - this.lastMouseDown > 1000) {
                    this.tickScrubber();
                }
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
                    document.getElementById("modal-create-asset").style.display = "none"
                } else {
                    document.getElementById("modal-create-asset").style.display = ""
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

                // since the workflow id's are stupid, we'll do our own
                var id = startttime + "-" + stopttime;
                // there you go, ugly and hacky innit? it's something, at least.

                if (this.itemizerTasks.hasOwnProperty(id)) return

                // create the element and call it a day, we'll update this element from the subscriber task
                var table = document.getElementById("itemizer-current-downloads")

                var size = 0, key;
                for (key in this.itemizerTasks) {
                    if (this.itemizerTasks.hasOwnProperty(key)) size++;
                }
                size++;
                document.getElementById("itemizer-current-downloads").style.display = ""
                table.innerHTML += "<tr id='itemizer-row-"+id+"'><td>" + size + "</td><td id='itemizer-state-"+id+"'>Starten...</td></tr>"

                this.$scope.durationInvalid = true;

                this.NEPService.itemizelive( this.itemizeRequest ).then( function ( data ) {
                    this.itemizerTasks[id] = this.appConfig.apiHost + data;
                }.bind(this), function ( error ) {
                    this.$scope.$emit( this.pomsEvents.error, error );
                    this.$scope.durationInvalid = false;
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
                if (this.mediaPlayer) {
                    // Attach protection data to mediaplayer
                    this.mediaPlayer.setProtectionData(protectionData);
                    // Attach manifest to mediaplayer
                    this.mediaPlayer.attachSource(data.stream);
                } else {
                    console.log("No media player yet");
                }


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
                            // check if we follow the current stream
                            var id = message.request.start + "-" + message.request.stop;

                            // check if we follow this id, because we might not (yet)
                            if (this.itemizerTasks[id] != null) {
                                console.log("updating subscribed item")
                                var messageHtml = document.getElementById("itemizer-state-" + id);
                                messageHtml.setAttribute("title", 'gestart op: ' + this.getTimeInAmsterdamAsString(message.issuedAt, "HH:mm:ss") + " gecheckt op "  + this.getTimeInAmsterdamAsString(message.checkedAt, "HH:mm:ss"));
                                if (message.readyForDownload) {
                                    // button! fancy, yes
                                    var link = this.itemizerTasks[id];
                                    messageHtml.innerHTML = "<button id='itemizer-download-"+id+"' class=\"live-editor-button\">Downloaden (" + message.mibSize + ")</button>"
                                    messageHtml.innerHTML += "<button id='itemizer-delete-"+id+"' class=\"live-editor-button\">Verwijderen</button>"

                                    setTimeout(function () {

                                        document.getElementById("itemizer-download-" + id).onclick = function() {
                                            window.open(
                                                link,
                                                '_blank' // <- This is what makes it open in a new window.
                                            );

                                        }

                                        document.getElementById("itemizer-delete-" + id).onclick = function() {
                                            var element = document.getElementById("itemizer-row-" + id);
                                            element.parentNode.removeChild(element);
                                        }
                                    }.bind(this), 6)
                                } else {
                                    messageHtml.innerHTML =  message.status;
                                    if (message.statusMessage) {
                                        messageHtml.innerHTML += ": " + message.statusMessage;
                                    }
                                }
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
                }
            },

            scrubberLetGo: function() {
                document.getElementById("scrubber").value = 0;
            },

            scrubberClick: function() {
                this.lastMouseDown = new Date().getTime();
                setTimeout(this.tickScrubber.bind(this), 50);
            },

            positionToFramesPerSecond: function(scrubberPosition) {
                var framesExponent = 2;
                var framesFactor = 0.5;
                // exponentially more frames if bigger slide on slider
                var framesPerSecondToScrub = framesFactor * Math.pow(Math.abs(scrubberPosition), framesExponent);
                if (framesPerSecondToScrub === 0.0) {
                    framesPerSecondToScrub = 1; //  but at least one
                }
                return Math.sign(scrubberPosition) * Math.round(framesPerSecondToScrub);
            },

            /**
             * This method is called every time a second passed since last click down on scrubber
             */
            tickScrubber: function() {
                var scrubber = document.getElementById("scrubber");
                var scrubberPosition =  parseFloat(scrubber.value);

                var framesPerSecondToScrub = this.positionToFramesPerSecond(scrubberPosition);

                var display = document.getElementById("scrubber-timer");
                if (scrubberPosition === 0.0) {
                    display.innerText = "scrubber voor fine-tuning";
                    return;
                }
                if (this.videoElement) {
                    var frameRate = 40; // frames/s  # TODO, how do we know the actual frame rate?
                    var offset = (framesPerSecondToScrub / frameRate ) * 1000 // ms

                    //display.innerText = "scrubbing " + framesPerSecondToScrub + " frames per seconde (" + offset + " ms/s)";
                    display.innerText = "scrubbing " + framesPerSecondToScrub + " frames per seconde"
                    display.style.display = "";


                    console && console.log("ticking " + scrubberPosition + " -> " + framesPerSecondToScrub + " frames/s -> " + offset + " ms/s");
                    var nextPoint = this.videoElement.currentTime + offset;
                    if (nextPoint > this.videoElement.duration || nextPoint < 0) {
                        return;
                    }
                    this.videoElement.currentTime = nextPoint;

                    var fakeEvent = new Event("timeupdate", {
                        currentTime: this.videoElement.currentTime
                    })
                    this.videoElement.dispatchEvent(fakeEvent)
                } else {
                    console.log("No videoelement found");
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
