angular.module( 'poms.media.controllers' ).controller( 'SegmentEditController', [
    '$scope',
    '$modalInstance',
    '$sce',
    'segment',
    'media',
    'segmentscontroller',
    'PomsEvents',
    'MediaService',
    'ValidationPatterns',
    'HelpService',
    'ListService',
    (function () {
        function SegmentEditController( $scope, $modalInstance, $sce, segment, media, segmentscontroller, pomsEvents, mediaService, validationPatterns, helpService, listService) {

            this.$scope = $scope;
            this.$scope.segment = segment;
            this.$scope.media = media;
            this.segmentscontroller = segmentscontroller;
            this.$modalInstance = $modalInstance;
            this.$scope.modalTitle = 'Nieuw segment voor ' + media.mainTitle.text + " (" + media.mid + ")";
            this.mediaService = mediaService;
            this.pomsEvents = pomsEvents;

            console.log("SegmentEditController", segment, media, segmentscontroller);

            listService.getChapterTypes().then(
                function ( data ) {
                    this.$scope.chapterTypes = data;
                }.bind(this));
            this.$scope.segmentsHelp = "...";

            helpService.getMessage('editor.segments.help').then(function(result) {
                this.$scope.segmentsHelp = $sce.trustAsHtml(result.text);
            }.bind(this));



            // TODO These constants could be stored somewhere centralized (or even server side?)
            // It is also used in e.g. Subtitles Controller
            // allow
            // 00:00:00.000
            // <h> H <m> M <s> S
            // <ms>
            this.$scope.durationRegexp = validationPatterns.duration.pattern;
            this.$scope.durationPlaceholder = validationPatterns.duration.placeholder;

            this.$scope.fieldNames = {
                "inputStart": "Starttijd",
                "inputStop": "Eindtijd",
                "inputDuration": "Duur",
                "inputTitle": "Titel",
                "inputDescription": "Beschrijving",
                "chapterType": "Hoofdstuktype"
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
                        },
                        chapterType: this.$scope.segment.chapterType
                    }
                ).then(
                    function (segment) {
                        this.segmentscontroller.pushSegment({
                            start:  segment.start,
                            stop:  segment.stop,
                            duration: segment.duration,
                            mainTitle: segment.mainTitle,
                            chapterType: segment.chapterType

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
