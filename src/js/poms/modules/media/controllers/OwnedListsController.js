angular.module( 'poms.media.controllers' ).controller( 'OwnedListsController', [
    '$scope',
    '$q',
    '$sce',
    '$modal',
    '$timeout',
    'PomsEvents',
    'MediaService',
    'ListService',
    'EditFieldService',
    (function () {

        function doLoad ( scope, media, dest, pomsEvents ) {
            return scope.load( media ).then(
                function ( data ) {
                    angular.copy( data, dest );
                },
                function ( error ) {
                    scope.$emit( pomsEvents.error, error )
                }
            )
        }

        function doLoadOptions (scope, options, pomsEvents ) {
            return scope.options().then(
            function ( data ) {
                angular.copy( data, options );
            },
            function ( error ) {
                scope.$emit( pomsEvents.error, error )
            }
          )
        }


        function OwnedListsController (
          $scope, $q, $sce, $modal, $timeout,
          pomsEvents, mediaService, listService, editFieldService ) {

            var uiSelect;

            this.$scope = $scope;
            this.$q = $q;
            this.$sce = $sce;
            this.$modal = $modal;
            this.$timeout = $timeout;
            this.media = $scope.media;
            this.values = [];

            this.options = [];
            this.preSelectedItems = [];
            this.isOpen = false;
            this.editFieldService = editFieldService;
            this.mayWrite = mediaService.hasWritePermission( this.media, this.$scope.name );

            doLoad( this.$scope, this.media, this.values, pomsEvents);

            doLoadOptions ( this.$scope, this.options, pomsEvents );
        }

        OwnedListsController.prototype = {

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            },

            showEditElement: function ( event ) {

                if ( this.mayWrite && !this.isOpen ) {

                    this.$scope.load( this.media ).then(
                        function ( data ) {

                            this.$scope.selectedItems = {
                                selected :[]
                            };

                            for ( var i = 0; i < data.length; i ++ ) {
                                for ( var j = 0; j < this.options.length; j ++ ) {
                                    if ( this.options[j].id === data[i].id ) {
                                        this.$scope.selectedItems.selected.push( this.options[j] );
                                    }
                                }
                            }

                            this.isOpen = true;
                            this.$scope.errorText = false;

                            // We lookup the ui-select element via childscope because we can't acces it by name and dont want to alter its code
                            uiSelect = this.$scope.$$childHead.$select;
                            uiSelect.activate();

                        }.bind( this ),
                        function ( error ) {
                            this.$scope.$emit( pomsEvents.error, error )
                        }.bind( this )
                    );

                    this.$scope.$emit( 'editFieldOpen', { 'field': this.$scope.field, 'isOpen': true} );

                    this.$scope.$on( 'closeEditField', function ( e, data ) {
                        if ( data.field === this.$scope.field ) {
                            this.$timeout( function () {
                                this.close();
                            }.bind(this), 0 );
                        }
                    }.bind(this));
                }
            },

            keyEvent: function ( event ) {
                if ( event.keyCode == 27 ) {
                    this.close();
                }
            },

            close: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                this.isOpen = false;
                this.violation = undefined;
                this.$scope.errorText = false;
                this.selection = [];
                this.waiting = false;
                this.tempValue = undefined;

                this.$scope.$emit( 'editFieldOpen', { 'field': this.$scope.field, 'isOpen': false} );

            },


            submit: function ( e ) {
                this.waiting = true;

                var data = uiSelect.selected;
                var deferred = this.$q.defer();

                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if ( angular.equals( data, this.values ) || (data.length == 0 && !this.values ) ){
                    this.close();
                    return; // no change
                }

                this.$scope.save( this.media, data ).then(
                    function ( result ) {

                        doLoad( this.media, this.values, pomsEvents );
                        deferred.resolve( false );
                        this.isOpen = false;
                        this.$scope.waiting = false;
                        this.$scope.errorText = false;

                        this.$scope.$emit( 'saved' );
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.errorText = error.message;

                        if ( error.violations ) {
                            for ( var violation in  error.violations ) {
                                this.$scope.errorText = error.violations[violation];
                                deferred.reject( $scope.errorText );
                                break;
                            }
                        } else {
                            this.$scope.$emit( pomsEvents.error, error );
                        }

                        this.waiting = false;
                    }.bind( this )
                );
            },

            blurredSave: function( e ){

                e.stopPropagation();

                var data = uiSelect.selected;

                if ( angular.equals( data, this.values ) || (data.length == 0 && !this.values) ) {
                    this.close();

                }else{
                    this.editFieldService.saveConfirm().then(
                        function( result ){
                            if ( result ){
                                this.submit();
                            }
                        }.bind(this),
                        function( error ){
                            this.$scope.$emit( this.pomsEvents.error, error );
                        }.bind(this)
                    ) ;
                }

            }
        };

        return OwnedListsController;
    }())
] );
