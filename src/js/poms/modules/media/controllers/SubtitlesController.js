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
        'ValidationPatterns',

        (function () {

        function SubtitlesController ( $scope, $q, $filter, $modalInstance, subtitlesService, title, media, pomsEvents, validationPatterns) {

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
                sub.originalOffset  = {};
                angular.copy( sub.offset, sub.originalOffset );
                this.subtitles.push( sub );

            }.bind( this ) );

            $scope.waiting = false;
            $scope.errorMessage = null;

            $scope.durationRegexp = validationPatterns.duration.regexp;
            $scope.durationPlaceholder = validationPatterns.duration.placeholder;

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
                        angular.copy( subtitle.offset, subtitle.originalOffset );
                    }.bind(this),
                    function(response) {
                        console.log(response);
                        this.$scope.$emit( this.pomsEvents.error, response )
                    }.bind(this)
                );
            },
            cancel: function ( index) {
                var sub = this.subtitles[index];
                angular.copy( sub.originalOffset, sub.offset);
            }

        };

        return SubtitlesController;
    }())
] );
