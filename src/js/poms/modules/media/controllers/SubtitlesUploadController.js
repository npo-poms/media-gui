angular.module( 'poms.media.controllers' ).controller( 'SubtitlesUploadController', [
    '$scope',
    '$sce',
    '$filter',
    '$modalInstance',
    'SubtitlesService',
    'media',
    'title',
    'languages',
    'subtitlesTypes',
    'mayWrite',
    'PomsEvents',
    'ValidationPatterns',
    (function () {

        function SubtitlesUploadController ( $scope, $sce, $filter, $modalInstance, subtitlesService, media, title, languages, subtitlesTypes, mayWrite,  pomsEvents, validationPatterns ) {
            this.$scope = $scope;
            this.$sce = $sce;
            this.$filter = $filter;
            this.$modalInstance = $modalInstance;
            this.subtitlesService = subtitlesService;
            this.languages = languages;
            this.subtitlesTypes = subtitlesTypes;
            this.title = title;
            this.media = media;
            this.pomsEvents = pomsEvents;

            $scope.languages = languages;
            $scope.subtitlesTypes = subtitlesTypes;
            $scope.media = media;
            $scope.mayWrite = mayWrite;
            $scope.waiting = false;
            $scope.errorMessage = null;

            $scope.durationRegexp = validationPatterns.duration.regexp;
            $scope.durationPlaceholder = validationPatterns.duration.placeholder;


            getDuplicate = function () {
                var subtitleLanguage = $scope.uploadSubtitleForm.subtitleLanguage;
                var subtitleType = $scope.uploadSubtitleForm.subtitleType;

                var result = [];

                if (!$scope.uploadSubtitleForm.subtitleLanguage.id || !$scope.uploadSubtitleForm.subtitleType.id) {
                    return [];
                }
                media.subtitles.forEach(function (sub) {
                    if (sub.language === subtitleLanguage.id &&
                        sub.type === subtitleType.id) {
                        result.push(sub);
                    }
                });
                return result;
            }

        }

        SubtitlesUploadController.prototype = {

            close: function () {
                this.$modalInstance.dismiss();
            },


            addSubtitle: function () {
                this.$scope.waiting = true;
                var fields = {
                    mid: this.media.mid,
                    name: this.$scope.uploadSubtitleForm.subtitleFile[0].name,
                    fileSize: this.$scope.uploadSubtitleForm.subtitleFile[0].size,
                    language: this.$scope.uploadSubtitleForm.subtitleLanguage.id,
                    type: this.$scope.uploadSubtitleForm.subtitleType.id,
                    duration:  this.$scope.uploadSubtitleForm.offset.string

                };

                var data = this.$scope.uploadSubtitleForm.subtitleFile[0];

                this.subtitlesService.upload(fields.mid, fields.language, fields.type, fields, data).then(
                    function (response) {
                        this.subtitles = response;
                        this.media.subtitles = response;
                    }.bind(this),
                    function(response) {
                        console.log(response);
                        this.$scope.$emit( this.pomsEvents.error, response )
                }.bind(this));


                this.$modalInstance.close();
            },

            isDuplicate: function () {
                var dups = getDuplicate();
                return dups.length > 0

            },
            mayWriteDuplicate: function () {
                var dups = getDuplicate();
                mayWrite = true;
                if (dups.length > 0) {
                    dups.forEach(function (duplicate) {
                        if (duplicate.owner === "AUTHORITY") {
                            mayWrite = false;
                        }
                    });
                }
                return mayWrite;
            },
            trustAsHtml: function ( value ) {

                return this.$sce.trustAsHtml( value );
            }

        };

        return SubtitlesUploadController;
    }())
] );
