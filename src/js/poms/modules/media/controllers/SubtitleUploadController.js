angular.module( 'poms.media.controllers' ).controller( 'SubtitleUploadController', [
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
    (function () {

        function SubtitleUploadController ( $scope, $sce, $filter, $modalInstance, subtitlesService, media, title, languages, subtitlesTypes, mayWrite ) {
            this.$scope = $scope;
            this.$sce = $sce;
            this.$filter = $filter;
            this.$modalInstance = $modalInstance;
            this.subtitlesService = subtitlesService;
            this.languages = languages;
            this.subtitlesTypes = subtitlesTypes;
            this.title = title;
            this.media = media;

            $scope.languages = languages;
            $scope.subtitlesTypes = subtitlesTypes;
            $scope.media = media;
            $scope.mayWrite = mayWrite;
            $scope.waiting = false;
            $scope.epoch = new Date("Thu Jan 01 1970 00:00:00 GMT+0100 (Central European Standard Time)");
            $scope.errorMessage = null;


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

        SubtitleUploadController.prototype = {

            close: function () {
                this.$modalInstance.dismiss();
            },


            addSubtitle: function () {
                this.$scope.waiting = true;

                var offset = this.$filter('noTimezone')(this.$scope.uploadSubtitleForm.offset).getTime();
                var fields = {
                    mid: this.media.mid,
                    name: this.$scope.uploadSubtitleForm.subtitleFile[0].name,
                    fileSize: this.$scope.uploadSubtitleForm.subtitleFile[0].size,
                    language: this.$scope.uploadSubtitleForm.subtitleLanguage.id,
                    type: this.$scope.uploadSubtitleForm.subtitleType.id,
                    duration: offset

                };

                var data = this.$scope.uploadSubtitleForm.subtitleFile[0];

                //


                this.subtitlesService.upload(fields.mid, fields.language, fields.type, fields, data).then(function (response) {
                    //TODO: This should be done by Frontend.
                    this.subtitles = response;
                    this.media.subtitles = response;
                }.bind(this));


                this.$modalInstance.close();
            },

            isDuplicate: function () {
                var dups = getDuplicate();
                return dups.length > 0

            },
            mayWriteDuplicate: function () {
                var dups = getDuplicate();
                if (dups.length > 0) {
                    mayWrite = true;
                    dups.forEach(function (duplicate) {
                        if (duplicate.owner === "AUTHORITY") {
                            mayWrite = false;
                        }
                    });

                    return mayWrite;
                }
            },
            trustAsHtml: function ( value ) {

                return this.$sce.trustAsHtml( value );
            }

        };

        return SubtitleUploadController;
    }())
] );