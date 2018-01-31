angular.module( 'poms.screen.controllers' ).controller( 'ScreenController', [
    '$scope',
    'appConfig',
    'PomsEvents',
    'ScreenService',
    '$document',
    '$element',
    '$modal',
    '$window',
    (function () {

        function ScreenController ( $scope, appConfig, PomsEvents, ScreenService , $document, $element, $modal, $window) {

            this.$scope = $scope;
            this.host = appConfig.apihost;
            this.pomsEvents = PomsEvents;
            this.screenService = ScreenService;

            this.$document = $document;
            this.$modal = $modal;
            this.$element = $element;
            this.$scope.sidebarFixed = false;

            this.$scope.locationsWaiting = true;
            this.$scope.episodesWaiting = true;
            this.$scope.imagesWaiting = true;
            this.$scope.membersWaiting = true;
            this.$scope.relationsWaiting = true;
            this.$scope.segmentsWaiting = true;

            {
                this.$document.on( 'scroll', function () {

                    if ( this.$document.scrollTop() > 175 && ! this.$scope.sidebarFixed ) {
                        this.$scope.sidebarFixed = true;
                        this.$scope.$apply();
                    } else if ( this.$document.scrollTop() < 175 && this.$scope.sidebarFixed ) {
                        this.$scope.sidebarFixed = false;
                        this.$scope.$apply();
                    }

                }.bind( this ) );
            }

            {
                $scope.$on( 'editFieldOpen', function ( e, element ) {
                    this.editFieldOpen = ( element.isOpen ? true : false);
                    this.editField = element.field;
                });

                angular.element( $window ).on( 'keydown', function ( e ) {
                    if ( this.editFieldOpen && e.keyCode == 27 ) {
                        $scope.$broadcast( 'closeEditField', {'field' : this.editField } );
                    }
                });
            }

            {
                $scope.$on( PomsEvents.loaded, function ( event, loading ) {
                    if( !loading.section ){
                        return
                    }
                    switch ( loading.section ) {
                        case 'images':
                            this.$scope.imagesWaiting = loading.waiting;
                            break;
                        case 'members':
                            this.$scope.membersWaiting = loading.waiting;
                            break;

                    }
                }.bind(this));
            }
        }

        ScreenController.prototype = {


            sectionId: function ( section ) {
                return 'screen-' + section + '-' + this.$scope.screen.sid;
            }


        };

        return ScreenController;
    }())
] );