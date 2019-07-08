angular.module( 'poms.media.controllers' ).controller( 'SegmentEditController', [
    '$scope',
    '$modalInstance',
    '$sce',
    'segment',
    'media',
    (function () {
        function SegmentEditController( $scope, $modalInstance, $sce, segment, media) {

            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            this.$scope.modalTitle = 'Nieuw segment voor ' + media.mainTitle.text + " (" + media.mid + ")";
            this.$scope.createFormValid = true;
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


            save: function () {

                var data = this.$scope.media;
                console.log(data);


                return this.mediaService.saveSegment( this.$scope.media, data ).then(
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

            },
            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            }


        };

        return SegmentEditController;
    }())
] );
