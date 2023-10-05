angular.module( 'poms.media.controllers' ).controller( 'OwnerController', [
    '$uibModalInstance',
    'title',
    'ownerData',
    'owner',
    (function () {

        function OwnerController ( $uibModalInstance, title, ownerData, owner ) {

            this.title = title;
            this.owner = owner.text;
            this.ownerData = ownerData;

            this.$uibModalInstance = $uibModalInstance;

        }

        OwnerController.prototype = {

            close: function () {
                this.$uibModalInstance.dismiss();
            }

        };

        return OwnerController;
    }())
] );