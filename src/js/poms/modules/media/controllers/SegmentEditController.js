angular.module( 'poms.media.controllers' ).controller( 'SegmentEditController', [
    '$scope',
    '$modalInstance',
    '$sce',
    'segment',
    'media',
    'MediaService',
    (function () {
        function SegmentEditController( $scope, $modalInstance, $sce, segment, media, mediaService) {

            this.$scope = $scope;
            this.$scope.segment = segment;
            this.$scope.media = media;
            this.$modalInstance = $modalInstance;
            this.$scope.modalTitle = 'Nieuw segment voor ' + media.mainTitle.text + " (" + media.mid + ")";
            this.$scope.createFormValid = true;
            this.mediaService = mediaService;
        }

        SegmentEditController.prototype = {

            violations: {},

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$modalInstance.dismiss();
            },


            submit: function () {
                return this.mediaService.saveSegment(this.$scope.media, {
                    mainTitle: this.$scope.segment.mainTitle,
                    mainDescription: this.$scope.segment.mainDescription,
                    start: {
                        string: this.$scope.segment.start
                    },
                    stop: {
                        string: this.$scope.segment.stop
                    },
                    duration: {
                        string: this.$scope.segment.duration
                    }
                    }
                ).then(
                    function ( media ) {
                        this.$modalInstance.close( media );
                        this.$scope.waiting = false;
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.waiting = false;
                        if ( error.status === 400 && error.violations ) {
                            this.violations = error.violations;
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }
                    }.bind( this )
                )
            }


        };

        return SegmentEditController;
    }())
] );
