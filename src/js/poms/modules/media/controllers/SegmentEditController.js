angular.module( 'poms.media.controllers' ).controller( 'SegmentEditController', [
    '$scope',
    '$modalInstance',
    '$sce',
    'segment',
    'media',
    'segmentscontroller',
    'PomsEvents',
    'MediaService',
    (function () {
        function SegmentEditController( $scope, $modalInstance, $sce, segment, media, segmentscontroller, pomsEvents, mediaService) {

            this.$scope = $scope;
            this.$scope.segment = segment;
            this.$scope.media = media;
            this.segmentscontroller = segmentscontroller;
            this.$modalInstance = $modalInstance;
            this.$scope.modalTitle = 'Nieuw segment voor ' + media.mainTitle.text + " (" + media.mid + ")";
            this.mediaService = mediaService;
            this.pomsEvents = pomsEvents;

            // allow
            // 00:00:00.000
            // <h> H <m> M <s> S
            // <ms>
            this.$scope.durationRegexp = /^(\d+:\d{2}(:\d{2})?([\\.,]\d{3})?|(\d+H)?(\d+\s*M)?\s*(\d+(\.\d+)?\s*S)?|\d+|)$/i;
            this.$scope.durationPlaceholder = "00:00:00,000 of 0 H 4 M 1.2 S of 123123";

            this.$scope.fieldNames = {
                "inputStart": "Starttijd",
                "inputStop": "Eindtijd",
                "inputDuration": "Duur",
                "inputTitle": "Title",
                "inputDescription": "Beschrijving"
            };
          /*  for (el in $(document.createForm).find("label")) {
                this.$scope.fieldNames[el.for] = el.text();
            }*/

            this.$scope.$watch("segment", function(newValue, oldValue){
                if(newValue.stop && newValue.stop !== "") {
                    if (! newValue.parkDuration) {
                        newValue.parkDuration = newValue.duration;
                        newValue.duration = undefined;
                    }
                } else if (newValue.parkDuration) {
                    newValue.duration = newValue.parkDuration;
                    newValue.parkDuration = undefined;
                    newValue.stop = undefined;
                    this.violations.stop = undefined;
                }
            }.bind(this), true);


        }

        SegmentEditController.prototype = {

            violations: {},

            cancel: function (e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$modalInstance.dismiss();
            },


            save: function () {
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
                    function (segment) {
                        this.segmentscontroller.pushSegment({
                            start:  segment.start,
                            stop:  segment.stop,
                            duration: segment.duration,
                            mainTitle: segment.mainTitle

                        });
                        this.$modalInstance.close(segment);
                        this.$scope.waiting = false;
                    }.bind(this),
                    function (error) {
                        this.$scope.waiting = false;
                        if (error.status === 400 && error.violations) {
                            this.violations = error.violations;
                        } else {
                            this.$scope.$emit(this.pomsEvents.error, error)
                        }
                    }.bind(this)
                )
            },

            saveAndNew: function () {
                this.save().then(function () {
                    if (this.$scope.segment.mainTitle.text) {
                        this.notificationService.notify('Segment "' + this.$scope.segment.mainTitle.text + '" opgeslagen.');
                    }
                    this.segmentscontroller.addSegment();
                }.bind(this))
            }
        };
        return SegmentEditController;
    }())
] );
