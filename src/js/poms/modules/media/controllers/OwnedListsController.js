angular.module( 'poms.media.controllers' ).controller( 'OwnedListsController', [
    '$scope',
    '$q',
    '$sce',
    '$modal',
    '$timeout',
    'PomsEvents',
    'MediaService',
    'EditorService',
    'ListService',
    'EditFieldService',
    (function () {

        function doLoad ( mediaService, scope, media, dest, pomsEvents ) {
            return mediaService[scope.load]( media ).then(
                function ( data ) {
                    angular.copy( data, dest );
                },
                function ( error ) {
                    scope.$emit( pomsEvents.error, error )
                }
            )
        }

        function doLoadOptions (listService, scope, options, pomsEvents ) {
            return listService[scope.options]().then(
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
          pomsEvents, mediaService, editorService, listService, editFieldService ) {

            this.options = [];
            this.items = {};
            this.uiSelect = [];

            this.$scope = $scope;
            this.$q = $q;
            this.$sce = $sce;
            this.$modal = $modal;
            this.$timeout = $timeout;
            this.media = $scope.media;

            this.isOpen = false;
            this.editFieldService = editFieldService;
            this.mayWrite = function() {
                return mediaService.hasWritePermission( this.media, this.$scope.name );
            }.bind(this);
            this.mediaService = mediaService;
            this.pomsEvents = pomsEvents;
            this.currentOwnerType = editorService.getCurrentOwnerType();

            doLoad( this.mediaService , this.$scope, this.media, this.items, pomsEvents);

            doLoadOptions ( listService, this.$scope, this.options, pomsEvents );
        }

        OwnedListsController.prototype = {

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            },

            showEditElement: function ( event ) {

                if ( this.mayWrite && !this.isOpen ) {

                    this.mediaService[this.$scope.load]( this.media ).then(
                        function ( data ) {
                            var values = data.values;
                            this.$scope.selectedItems = {
                                selected :[]
                            };

                            for ( var i = 0; i < values.length; i ++ ) {
                                for ( var j = 0; j < this.options.length; j ++ ) {
                                    if ( this.options[j].id === values[i].id ) {
                                        this.$scope.selectedItems.selected.push( this.options[j] );
                                    }
                                }
                            }

                            this.isOpen = true;
                            this.$scope.errorText = false;

                            // We lookup the ui-select element via childscope because we can't acces it by name and dont want to alter its code
                            this.uiSelect = this.$scope.$$childHead.$select;
                            this.uiSelect.activate();

                        }.bind( this ),
                        function ( error ) {
                            this.$scope.$emit( this.pomsEvents.error, error )
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
                if ( event.keyCode === 27 ) {
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

                var data = this.uiSelect.selected;
                var deferred = this.$q.defer();

                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if ( angular.equals( data, this.items.values ) || (data.length === 0 && !this.items.values ) ){
                    this.close();
                    return; // no change
                }
                var saveMethodName = this.$scope.save;
                this.mediaService[saveMethodName]( this.media, data ).then(
                    function ( result ) {

                        doLoad( this.mediaService, this.$scope, this.media, this.items, this.pomsEvents );
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
                            this.$scope.$emit( this.pomsEvents.error, error );
                        }

                        this.waiting = false;
                    }.bind( this )
                );
            },

            blurredSave: function( e ){

                e.stopPropagation();

                var data = this.uiSelect.selected;

                if ( angular.equals( data, this.items.values ) || (data.length === 0 && !this.items.values) ) {
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

            },

            removeOverride: function () {
                var removeMethodName = this.$scope.removeAll;
                this.mediaService[removeMethodName](this.media).then(
                    function (data) {
                        angular.copy(data, this.items);
                    }.bind(this),
                    function(error) {
                        this.errorHandler(error);
                    }.bind(this)
                )
            }
        };

        return OwnedListsController;
    }())
] );
