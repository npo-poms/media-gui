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
            this.mayWrite = MediaService.hasWritePermission( $scope.media, 'segments' );

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
                this.$scope.inserted = {
                    start:  this.$filter( 'withTimezone' )( new Date( startTime || 0 ) ),
                    stop:  this.$filter( 'withTimezone' )( new Date( startTime || 0 ) ),
                    duration: this.$filter( 'withTimezone' )( new Date( 0 ) )
                };

                this.segments.push( this.$scope.inserted );
                if (this.canItemize()) {
                    this.itemize(this.$scope.inserted);
                }
            },

            canItemize: function() {
                return this.$scope.media.streamingPlatformStatus.available;
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
                            return segment;
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
                                e.start = this.$filter( 'withTimezone' )( e.start );
                                e.stop = this.$filter( 'withTimezone' )( e.stop );
                                e.duration = this.$filter( 'withTimezone' )( e.duration );
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
