angular.module( 'poms.media.controllers' ).controller(
    'SubtitlesController', [
    '$scope',
    '$q',
    '$filter',
    '$modalInstance',
    'SubtitlesService',
    'title',
    'media',
    'mayWrite',
    (function () {

        function SubtitlesController ( $scope, $q, $filter, $modalInstance, subtitlesService, title, media, mayWrite ) {

            this.$scope = $scope;
            this.$filter = $filter;
            this.$modalInstance = $modalInstance;
            this.subtitlesService = subtitlesService;

            this.title = title;
            this.media = media;

            this.subtitles = [];

            this.media.subtitles.forEach( function ( subtitle ) {
                var sub = {};

                angular.copy( subtitle, sub );

                sub.offset = $filter( 'withTimezone' )( sub.offset );

                this.subtitles.push( sub );
            }.bind( this ) );

            $scope.mayWriteMedia = mayWrite
            $scope.waiting = false;
            $scope.errorMessage = null;

        }

        SubtitlesController.prototype = {

            close: function () {
                this.$modalInstance.dismiss();
            },

            mayWriteSubtitle: function ( subtitle ) {
                return this.$scope.mayWriteMedia && subtitle.owner === "BROADCASTER"
            },

            editOrShowIfAllowed: function ( row, subtitle ) {

                if ( this.mayWriteSubtitle( subtitle ) ) {
                    row.$show();
                } else {
                    this.showSubtitle( subtitle );
                }
            },

            showSubtitle: function ( subtitle ) {
                var urlSuffix = this.media.mid + '/' + subtitle.language + '/' + subtitle.type;

                window.open( this.$filter( 'subtitlesLocationPrefix' )( urlSuffix ) );
            },

            deleteSubtitle: function ( subtitle ) {

                return this.subtitlesService.delete( this.media.mid, subtitle.language, subtitle.type).then( function( response ){
                    //TODO: This should be done by Frontend.
                    this.subtitles = response;
                    this.media.subtitles = response;

                }.bind(this))

            },

            submit: function ( subtitle, data ) {
                var offset = this.$filter( 'noTimezone' )( data.offset ).getTime();
                return this.subtitlesService.setOffset( this.media.mid, subtitle.language, subtitle.type, offset );
            }

        };

        return SubtitlesController;
    }())
] );