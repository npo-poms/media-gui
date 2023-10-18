angular.module( 'poms.search.controllers' ).controller( 'PreviewController', [
    '$scope',
    '$uibModalInstance',
    '$document',
    'items',
    'step',
    (function () {

        function PreviewController ( $scope, $uibModalInstance, $document, items, step ) {

            this.$scope = $scope;
            this.$uibModalInstance = $uibModalInstance;
            this.$document = $document;

            this.$scope.items = items;
            this.$scope.step = step;

            if ( this.$scope.items && this.$scope.items.length ) {
                this.$scope.currentItem = this.$scope.items[this.$scope.step];
            } else {
                this.$scope.currentItem = this.$scope.items;
            }


            this.$document.bind( 'keydown', function ( e ) {

                if ( e.which === 40 ) {
                    this.next();
                    this.$scope.$apply();
                } else if ( e.which === 38 ) {
                    this.previous();
                    this.$scope.$apply();
                }
            }.bind( this ) );

        }

        PreviewController.prototype = {


            editRef: function ( mid ) {
                return '#/edit/' + mid;
            },

            openInEditor: function ( mid ) {
                window.location.href = this.editRef( mid );
                this.cancel();
            },

            cancel: function () {
                this.$document.unbind( "keydown" );
                this.$uibModalInstance.dismiss();
            },

            hasPrevious: function () {
                return this.$scope.step > 0;
            },

            hasNext: function () {
                return this.$scope.step < this.$scope.items.length - 1;
            },

            previous: function () {
                if ( this.hasPrevious() ) {

                    this.$scope.visible = false;

                    this.$scope.step --;
                    this.$scope.currentItem = this.$scope.items[this.$scope.step];
                    this.$scope.visible = true;
                }
            },

            next: function () {
                if ( this.hasNext() ) {

                    this.$scope.visible = false;

                    this.$scope.step ++;
                    this.$scope.currentItem = this.$scope.items[this.$scope.step];
                    this.$scope.visible = true;
                }
            }

        };

        return PreviewController;
    }())
] );
