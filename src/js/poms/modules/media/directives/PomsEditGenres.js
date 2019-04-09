angular.module( 'poms.media.directives' )
    .directive( 'pomsGenres', ['PomsEvents', 'EditService', 'FavoritesService' ,'MediaService', 'ListService', '$q', '$sce', '$timeout', '$modal', 'EditFieldService', function ( pomsEvents, editService, favoritesService, mediaService, listService, $q, $sce, $timeout, $modal, editFieldService ) {
        return {
            restrict: 'E',
            templateUrl: 'edit/editables/poms-genres.html',
            scope: {
                media: '=',
                helpField : '@'
            },
            controller: function ( $scope ) {

                var media = $scope.media;
                var uiSelect;

                $scope.genres = [];
                $scope.options = [];
                $scope.preSelectedItems = [];
                $scope.isOpen = false;
                $scope.mayWrite = mediaService.hasWritePermission( media, 'genres' );

                function load ( media, dest ) {
                    mediaService.getGenres( media ).then(
                        function ( data ) {
                            dest = angular.copy( data, dest );
                        },
                        function ( error ) {
                            $scope.$emit( pomsEvents.error, error )
                        }
                    )
                }
                load( media, $scope.genres );

                listService.getGenres().then(
                    function ( data ) {
                        $scope.options = data;
                    },
                    function ( error ) {
                        $scope.$emit( pomsEvents.error, error )
                    }
                );


                $scope.$on( 'closeEditField', function ( e, data ) {
                    if ( data.field === $scope.field ) {
                        $timeout( function () {
                            $scope.cancel();
                        }, 0 );
                    }
                } );

                $scope.showEditElement = function ( ) {

                    if ( $scope.mayWrite && !$scope.isOpen ) {

                        mediaService.getGenres( media ).then(
                            function ( data ) {

                                $scope.selectedItems = {
                                    selected :[]
                                };

                                for ( var i = 0; i < data.length; i ++ ) {
                                    for ( var j = 0; j < $scope.options.length; j ++ ) {
                                        if ( $scope.options[j].id === data[i].id ) {
                                            $scope.selectedItems.selected.push( $scope.options[j] );
                                        }
                                    }
                                }

                                $scope.isOpen = true;
                                $scope.errorText = false;

                                // We lookup the ui-select element via childscope because we can't acces it by name and dont want to alter its code
                                uiSelect = $scope.$$childHead.$select;
                                uiSelect.activate();

                            },
                            function ( error ) {
                                $scope.$emit( pomsEvents.error, error )
                            }
                        );

                        $scope.$emit( 'editFieldOpen', { 'field': $scope.field, 'isOpen': true} );


                    }
                };

                $scope.keyEvent = function ( e ) {

                    if ( e.keyCode == 27 ) {
                        $scope.cancel();
                    }

                };


                $scope.cancel = function ( e ) {
                    if ( e ) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    $scope.isOpen = false;
                    $scope.waiting = false;

                    $scope.$emit( 'editFieldOpen', { 'field': $scope.field, 'isOpen': false} );

                };

                $scope.trustAsHtml = function ( value ) {
                    return $sce.trustAsHtml( value );
                };

                $scope.submit = function ( e ) {
                    $scope.waiting = true;

                    if ( e ) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    var data = uiSelect.selected;
                    var deferred = $q.defer();

                    if ( angular.equals( data, $scope.genres ) ) {
                        $scope.waiting = false;
                        $scope.isOpen = false;
                        return; // no change
                    }

                    editService.genres( media, data ).then(
                        function ( result ) {
                            angular.copy( result, media );

                            load( media, $scope.genres )
                            deferred.resolve( false );
                            $scope.isOpen = false;
                            $scope.waiting = false;
                            $scope.errorText = false;

                            $scope.$emit( 'saved' );
                        },
                        function ( error ) {
                            $scope.errorText = error.message;

                            if ( error.violations ) {
                                for ( var violation in  error.violations ) {
                                    $scope.errorText = error.violations[violation];
                                    deferred.reject( $scope.errorText );
                                    break;
                                }
                            } else {
                                this.$scope.$emit( pomsEvents.error, error );
                            }

                            $scope.waiting = false;
                        }
                    );
                };

                $scope.blurredSave = function( e ){

                    e.stopPropagation();

                    var data = uiSelect.selected;

                    if ( angular.equals( data, $scope.genres ) ) {
                        $scope.waiting = false;
                        $scope.isOpen = false;
                    }else{

                        editFieldService.saveConfirm().then(
                            function( result ){
                                if ( result ){
                                    $scope.submit();
                                }
                            },
                            function( error ){
                                $scope.$emit( pomsEvents.error, error );
                            }
                        ) ;

                    }

                }
            }
        };
    }] );
