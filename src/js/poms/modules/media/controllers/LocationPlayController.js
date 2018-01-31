angular.module( 'poms.media.controllers' ).controller( 'LocationPlayController', [
    '$scope',
    '$modalInstance',
    '$http',
    'appConfig',
    'location',
    (function () {

        function LocationPlayController ( $scope, $modalInstance,  $http, appConfig, location) {

            this.$scope = $scope;
            this.$scope.location = location;
            this.$http = $http;
            this.appConfig = appConfig;
            this.$modalInstance = $modalInstance;

            this.init();
        }

        LocationPlayController.prototype = {

            init : function(){

                // TODO headers authentication
                this.$http({
                    method : 'GET',
                    url : this.appConfig.apihost + '/odi/url?url=' + encodeURIComponent(  this.$scope.location.url )
                }).then(
                    function( succes ){
                        //TODO on succes, launch VPRO player with programUrl
                        this.$scope.url = "ja";
                    }.bind(this),
                    function( data ){
                        this.$scope.url = "nee";
                    }.bind(this)
                );

            },

            close: function ( e ) {
              this.cancel();
            },

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.$modalInstance.dismiss();
            }

        };

        return LocationPlayController;
    }())
] );