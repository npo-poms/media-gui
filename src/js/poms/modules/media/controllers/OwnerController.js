angular.module( 'poms.media.controllers' ).controller( 'OwnerController', [
    '$modalInstance',
    'title',
    'ownerData',
    'owner',
    (function () {

        function OwnerController ( $modalInstance, title, ownerData, owner ) {

            this.title = title;
            this.owner = owner.text;
            this.ownerData = ownerData;

            this.$modalInstance = $modalInstance;

        }

        OwnerController.prototype = {

            close: function () {
                this.$modalInstance.dismiss();
            }

        };

        return OwnerController;
    }())
] );