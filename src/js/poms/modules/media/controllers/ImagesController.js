angular.module( 'poms.media.controllers' ).controller( 'ImagesController', [
    '$scope',
    '$modal',
    'PomsEvents',
    'ListService',
    'ServiceSelector',
    (function () {
        function ImagesController ( $scope, $modal, PomsEvents, ListService, ServiceSelector ) {

            this.$scope = $scope;
            this.$modal = $modal;
            this.pomsEvents = PomsEvents;
            this.listService = ListService;

            this.mediaService = ServiceSelector.getService( this.$scope.type );

            this.mayWrite = this.mediaService.hasWritePermission($scope.media, 'images');
            this.mayUpload = this.mediaService.hasWritePermission($scope.media, 'imagesUpload');

            this.$scope.sortableOptions = {
                handle: '.sort-handle',
                update: function ( event, ui ) {
                    var to = ui.item.index();
                    if ( this.from >= 0 && to !== this.from ) {
                        this.mediaService.moveImage( this.$scope.media, this.from, to ).then(
                            function ( media ) {
                                //this.load();
                            }.bind( this ),
                            function ( error ) {
                            }
                        )
                    } else if ( this.from < 0 ) {
                        this.load();
                    }

                    this.from = - 1;
                }.bind( this ),
                start: function ( event, ui ) {
                    this.from = ui.item.index();
                }.bind( this )
            };

            this.load();

            $scope.$on(PomsEvents.imageAdded, function(e, mid) {
                if(mid === $scope.media.mid) {
                    this.load();
                }
            }.bind(this));

            $scope.$on(PomsEvents.imageRemoved, function(e, mid) {
                if(mid === $scope.media.mid) {
                    this.load();
                }
            }.bind(this));

        }

        ImagesController.prototype = {

            from: - 1,

            load: function () {
                this.$scope.$emit( this.pomsEvents.loaded, {'section': 'images', 'waiting': true} );

                this.mediaService.getImages( this.$scope.media )
                    .then( function ( images ) {
                            this.$scope.images = images;
                            this.$scope.media.images = images.length
                        }.bind( this ), function ( error ) {
                        this.$scope.$emit( 'error', error )
                    }.bind( this ) )
                    .finally(
                    function () {
                        this.$scope.$emit( this.pomsEvents.loaded, {'section': 'images', 'waiting': false} );
                    }.bind( this )
                );
            },

            edit: function ( image, permission ) {

                if ( permission === false ) {
                    return;
                }

                var editMode = true;

                if ( ! image ) {
                    image = {};
                    editMode = false;
                }
                var modal = this.$modal.open( {
                    controller: 'ImageEditController',
                    controllerAs: 'controller',
                    templateUrl: 'edit/modal-edit-image.html',
                    windowClass: 'modal-form modal-images',
                    resolve: {
                        imageTypes: this.listService.getImagesTypes,
                        licenses: this.listService.getLicenses,
                        media: function () {
                            return this.$scope.media;
                        }.bind( this ),
                        image: function () {
                            return image;
                        },
                        edit: function () {
                            return editMode;
                        },
                        service: function(){
                            return this.mediaService
                        }.bind(this)

                    }
                } );

                modal.result.then(
                    function ( media ) {
                        angular.copy( media, this.$scope.media );
                        this.load();
                    }.bind( this )
                );

            },

            cancel: function ( index, rowform ) {
                this.$scope.images[index].violations = undefined;
                rowform.$cancel()
            },


            remove: function ( image ) {

                this.waiting = true;
                this.$scope.$emit( this.pomsEvents.loaded, {'section': 'images', 'waiting': true} );

                return this.mediaService.removeImage( this.$scope.media, image ).then(
                    function ( media ) {
                        this.load();
                        angular.copy( media, this.$scope.media );

                    }.bind( this ),
                    function ( error ) {
                        this.$scope.$emit( this.pomsEvents.error, error );
                        return false;
                    }.bind( this ) )
                    .finally(
                        function () {
                            this.waiting = false;
                            this.$scope.$emit( this.pomsEvents.loaded, {'section': 'images', 'waiting': false} );
                        }.bind( this )
                );
            },

            addImage: function () {
                this.edit();
            },

            setHighlight: function( image ){
                image.highlighted = !image.highlighted;

                var source = image;
                if ( source ) {
                    source.violations = undefined;
                }

                this.waiting = true;
                this.$scope.$emit( this.pomsEvents.loaded, {'section': 'images', 'waiting': true} );

                return this.mediaService.saveImage( this.$scope.media, image ).then(
                    function ( media ) {
                        angular.copy( media, this.$scope.media );
                    }.bind( this ),
                    function ( error ) {
                        if ( error.status === 400 && error.violations ) {
                            source.violations = error.violations;
                            return 'Errors';
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }
                    }.bind( this ) )
                    .finally(
                    function () {
                        this.waiting = false;
                        this.$scope.$emit( this.pomsEvents.loaded, {'section': 'images', 'waiting': false} );
                    }.bind( this )
                );


            }

        };

        return ImagesController;
    }())
] );
