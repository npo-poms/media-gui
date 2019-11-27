angular.module( 'poms.media.controllers' ).controller(
    'SubtitlesController', [
        '$scope',
        '$q',
        '$filter',
        '$modalInstance',
        'SubtitlesService',
        'title',
        'media',
        'PomsEvents',

        (function () {

        function SubtitlesController ( $scope, $q, $filter, $modalInstance, subtitlesService, title, media, pomsEvents) {

            this.$scope = $scope;
            this.$filter = $filter;
            this.$modalInstance = $modalInstance;
            this.subtitlesService = subtitlesService;

            this.title = title;
            this.media = media;

            this.subtitles = [];
            this.pomsEvents = pomsEvents;

            this.media.subtitles.forEach( function ( subtitle ) {
                var sub = {};
                angular.copy( subtitle, sub );
                this.subtitles.push( sub );
            }.bind( this ) );

            $scope.waiting = false;
            $scope.errorMessage = null;
            this.$scope.durationRegexp = /^(\d+:\d{2}(:\d{2})?([\\.,]\d+)?|(\d+H)?(\d+\s*M)?\s*(\d+(\.\d+)?\s*S)?|\d+|)$/i;
            this.$scope.durationPlaceholder = "00:00,000 of 4 M 1.2 S of 12123";

        }

        SubtitlesController.prototype = {

            close: function () {
                this.$modalInstance.dismiss();
            },

            showSubtitle: function ( subtitle ) {
                var urlSuffix = this.media.mid + '/' + subtitle.language + '/' + subtitle.type.id;
                window.open( this.$filter( 'subtitlesLocationPrefix' )( urlSuffix ) );
            },

            deleteSubtitle: function ( subtitle ) {

                return this.subtitlesService.delete( this.media.mid, subtitle.language, subtitle.type.id).then(
                    function( response ){
                        this.subtitles = response;
                        this.media.subtitles = response;

                    }.bind(this),
                    function(response) {
                        console.log(response);
                        this.$scope.$emit( this.pomsEvents.error, response )
                    }.bind(this)
                )

            },

            submit: function ( subtitle) {
                return this.subtitlesService.setOffset( this.media.mid, subtitle.language, subtitle.type.id, subtitle.offset).then(
                    function( response ){
                        this.media.subtitles.find(function(currentValue, index, arr){
                            return currentValue.id === subtitle.id;
                            }, this).offset = response.offset;
                        subtitle.offset = response.offset;
                    }.bind(this),
                    function(response) {
                        console.log(response);
                        this.$scope.$emit( this.pomsEvents.error, response )
                    }.bind(this)
                );
            }
        };

        return SubtitlesController;
    }())
] );
