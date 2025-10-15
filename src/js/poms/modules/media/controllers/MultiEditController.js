angular.module( 'poms.media.controllers' ).controller( 'MultiEditController', [
    '$scope',
    '$q',
    '$sce',
    '$modal',
    '$timeout',
    'PomsEvents',
    'MediaService',
    'EditFieldService',
    (function () {

        function load ( scope, pomsEvents, dest ) {
            scope.load().then(
                function ( data ) {
                    angular.copy( data, dest );
                },
                function ( error ) {
                    scope.$emit( pomsEvents.error, error )
                }
            )
        }

        function MultiEditController (
          $scope, $q, $sce, $modal, $timeout,
          pomsEvents, mediaService, editFieldService ) {

            this.violation = undefined;
            this.options = [];
            this.selection = [];
            this.tempValue = undefined;

            this.$scope = $scope;
            this.$q = $q;
            this.$sce = $sce;
            this.$modal = $modal;
            this.$timeout = $timeout;
            this.media = $scope.media;
            this.values = [];

            this.pomsEvents = pomsEvents;
            this.mediaService = mediaService;
            this.editFieldService = editFieldService;
            this.mayWrite = function() {
                return mediaService.hasWritePermission( $scope.media, $scope.permission );
            }.bind(this);

            load( $scope, this.pomsEvents, this.values );

        }

        MultiEditController.prototype = {

            isOpen: false,

            mayWrite: false,

            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            },

            showEditElement: function ( event ) {

                if ( this.mayWrite && !this.isOpen ) {
                    load( this.$scope, this.pomsEvents, this.selection );

                    this.isOpen = true;
                    this.$scope.errorText = false;

                    this.$timeout( function () {
                        angular.element( event.currentTarget ).find( '.ui-select-container input' ).last().focus();
                    }, 0 );

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


            removeOverride :  function () {
                this.selection = [];
                this.submit();
            },

            updateOptions: function ( text ) {

                if( !text ) {
                    return;
                }

                this.tempValue = text;

                var options = this.$scope.options( ({data: text}) );
                if ( options && options.then ) {
                    options.then(
                        function ( response ) {
                            this.options = response;
                        }.bind( this ),
                        function ( error ) {
                            this.$scope.$emit( this.pomsEvents.error, error )
                        }.bind( this )
                    );
                }
            },

            submit: function ( e ) {

                this.waiting = true;

                this.pushTemp();

                var data = this.selection;
                consolo.log("submitting", data);
                var deferred = this.$q.defer();

                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if ( angular.equals( data, this.values ) || (data.length === 0 && !this.values ) ){
                    this.close();
                    return; // no change
                }

                this.$scope.save( {data: data} ).then(
                    function ( result ) {
                        angular.copy( result, this.media );

                        load( this.$scope, this.pomsEvents, this.values );

                        deferred.resolve( false );

                        this.close();

                        this.$scope.$emit( 'saved' );
                    }.bind( this ),
                    function ( error ) {
                        this.$scope.errorText = error.message;

                        if ( error.violations ) {
                            for ( var violation in  error.violations ) {
                                this.$scope.errorText = error.violations[violation];
                                deferred.reject( this.$scope.errorText );
                                break;
                            }
                        } else {
                            this.$scope.$emit( this.pomsEvents.error, error );
                        }

                        this.waiting = false;
                    }.bind( this )
                );
            },

            pushTemp: function() {
                if (this.tempValue && this.selection.indexOf(this.tempValue) === -1) {
                    this.selection.push(this.tempValue);
                }
                this.tempValue = undefined;
            },

            blurredSave : function( e , checkNewItems){

                e.stopPropagation();

                if( checkNewItems ){
                    this.pushTemp();
                }

                var data = this.selection;

                if ( angular.equals( data, this.values ) || (data.length === 0 && !this.values) ) {
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

        return MultiEditController;
    }  ())
] );
