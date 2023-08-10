angular.module( 'poms.media.controllers' ).controller( 'SegmentsController', [
    '$scope',
    '$filter',
    '$modal',
    '$location',
    '$timeout',
    'GuiService',
    'PomsEvents',
    'MediaService',
    (function () {

        function SegmentsController ( $scope, $filter, $modal, $location, $timeout, GuiService, PomsEvents, MediaService ) {

            this.$scope = $scope;
            this.$filter = $filter;
            this.$modal = $modal;
            this.$location = $location;
            this.$timeout = $timeout;
            this.guiService = GuiService;
            this.pomsEvents = PomsEvents;
            this.mediaService = MediaService;
            this.mayWrite = function() {
                return MediaService.hasWritePermission( $scope.media, 'segments' );
            }.bind(this);

            this.$scope.$on( this.pomsEvents.deleted, function ( e, mid ) {
                if(mid === this.$scope.media.mid) {
                    _.forEach(this.segments, function(segment) {
                        this.guiService.deleted(segment.mid);
                    }, this)
                }
            }.bind( this ) );

            $scope.$on(PomsEvents.segmentAdded, function(e, mid) {
                if(mid === $scope.media.mid) {
                    this.load();
                }
            }.bind(this));

            $scope.$on(PomsEvents.segmentRemoved, function(e, mid) {
                if(mid === $scope.media.mid) {
                    this.load();
                }
            }.bind(this));

            this.init();
        }

        SegmentsController.prototype = {

            addSegment: function ( startTime ) {
                this.$scope.insertedSegment = {
                    start:  startTime || 0,
                    stop:  startTime || 0,
                    duration: 0,
                    mainTitle: null
                };
                
                if (this.canItemize()) {
                    // Itemize with player
                    this.itemize(this.$scope.insertedSegment);
                } else {
                    this.modalSegment(this.$scope.media)
                }
            },
            pushSegment: function(insertedSegment) {
                this.segments.push( insertedSegment);

            },
            modalSegment: function(media){
                var modal = this.$modal.open( {
                    controller: 'SegmentEditController',
                    controllerAs: 'controller',
                    templateUrl: 'edit/modal-create-segment.html',
                    windowClass: 'modal-form modal-segment',
                    resolve: {
                        media: function () {
                            return media;
                        }.bind( this ),
                        segment : function () {
                            start = "00:00:00.000";
                            startInMillis = 0;
                            for (var i = 0; i < this.segments.length; i++) {
                                if (this.segments[i].stop.inMillis > startInMillis) {
                                    start = this.segments[i].stop.string;
                                    startInMillis = this.segments[i].stop.inMillis;
                                }
                            }
                            return {
                                "mainTitle": null,//"nieuw segment",
                                "start": start,
                                "stop": undefined,
                                "duration": "00:02:00.000"
                            };
                            //return this.$scope.insertedSegment;
                        }.bind( this ),
                        segmentscontroller: function() {
                            return this;
                        }.bind(this)
                    }
                } );

                modal.result.then(
                    function ( media ) {
                        this.load();
                    }.bind( this )
                );

            },

            canItemize: function() {
                return this.$scope.media.itemizable;
            },

            editRef: function ( mid ) {
                return '#/edit/' + mid;
            },

            init: function(){
                this.load();
            },

            itemize: function ( segment ) {

                var itemizerController = undefined;
                var itemizerTemplate = undefined;

                if (this.canItemize()) {
                    itemizerController = 'ItemizerNEPController';
                    itemizerTemplate = 'media/itemizerNEP.html';
                }

                var modal = this.$modal.open( {
                    controller : itemizerController,
                    controllerAs : 'itemizerController',
                    templateUrl : itemizerTemplate,
                    windowClass : 'modal-itemizer',
                    resolve : {
                        media : function () {
                            return this.$scope.media;
                        }.bind( this ),
                        segments : function () {
                            return this.segments;
                        }.bind( this ),
                        segment : function () {
                            return {
                                id: segment.id,
                                mid: segment.mid,
                                start:  segment.start ? segment.start.inMillis : 0,
                                stop: segment.stop ? segment.stop.inMillis : 0,
                                mainTitle: segment.mainTitle ? segment.mainTitle.text : null,
                                mainDescription: segment.mainDescription ? segment.mainDescription.text : null
                            };
                        }
                    }
                } );

                modal.result.then(
                    function ( result ) {
                        this.load();
                    }.bind( this )
                );

            },

            load: function () {
                this.waiting = true;
                this.$scope.$emit( this.pomsEvents.loaded, {'section': 'segments', 'waiting': true} );


                this.mediaService.getSegments( this.$scope.media )
                    .then( function ( segments ) {
                            this.segments = $.map( segments, function ( e ) {
                                return e
                            }.bind( this ) );

                            this.$scope.media.segments = segments.length

                        }.bind( this ), function ( error ) {
                            this.$scope.$emit( 'error', error )

                    }.bind( this ) )
                    .finally(
                    function () {
                        this.waiting = false;
                        this.$scope.$emit( this.pomsEvents.loaded, {'section': 'segments', 'waiting': false} );
                    }.bind( this )
                );
            },

            onRemoveSegment : function(){
                this.load();
            },

            remove: function ( index ) {
                var source = this.segments[index];
                return this.mediaService.removeSegment( this.$scope.media, source ).then(
                    function ( media ) {
                        this.load();

                        angular.copy( media, this.$scope.media );

                        this.guiService.deleted(source.mid);
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        return false;
                    }.bind( this ) )
                    .finally(
                    function () {
                        this.waiting = false;
                        this.$scope.$emit( this.pomsEvents.loaded, {'section': 'segments', 'waiting': false} );
                    }.bind( this )
                );
            },

            view: function ( segment ) {
                window.location.href = this.editRef( segment.mid );
            }

        };

        return SegmentsController;
    }())
] );
