angular.module( 'poms.media.controllers' ).controller( 'OwnersController', [
    '$q',
    '$uibModalInstance',
    'MediaService',
    'title',
    'owners',
    'media',
    'TextfieldNames',
    (function () {

        function OwnersController ( $q, $uibModalInstance, mediaService, title, owners, media, fieldNames ) {

            this.fieldNames = fieldNames;

            this.$uibModalInstance = $uibModalInstance;
            this.mediaService = mediaService;

            this.title = title;
            this.owners = owners;
            this.media = media;

            this.ownersData = {};

            var ownerPromises = [];

            angular.forEach( this.owners, function( owner, i ){

                ownerPromises.push( this.mediaService.getOwnerData( this.media, owner.id ) );

            }.bind( this ));

            // wait for all data to return for each of the owners
            $q.all( ownerPromises ).then( function( ownersData ){

                if( ownersData.length > 0 ) {

                    // get the keys from the first ownerData
                    var keys = Object.keys(ownersData[0]);
                    var ownKeys = [];

                    // filter out possibly inherited keys
                    for (var i = keys.length - 1; i >= 0; i--) {
                        if (ownersData[0].hasOwnProperty(keys[i])) {
                            ownKeys.push(keys[i]);
                        }
                    }

                    // iterate over all ownersData
                    angular.forEach(ownersData, function (ownerData) {

                        // Loop over all keys
                        for (var i = ownKeys.length - 1; i >= 0; i--) {

                            if (!this.ownersData[ownKeys[i]]) {
                                this.ownersData[ownKeys[i]] = {};
                            }

                            // collect ownersData by key
                            this.ownersData[ownKeys[i]][ownerData.owner.text] = ownerData[ownKeys[i]];

                        }
                    }.bind(this));

                }

            }.bind ( this ));

        }

        OwnersController.prototype = {

            close: function () {
                this.$uibModalInstance.dismiss();
            }

        };

        return OwnersController;
    }())
] );