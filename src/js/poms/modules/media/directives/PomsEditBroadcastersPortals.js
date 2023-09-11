angular.module( 'poms.media.directives' )
    .directive( 'pomsBroadcasters', ['EditService', '$q', '$filter', '$sce', '$modal', '$timeout', 'PomsEvents', 'EditFieldService', function ( editService, $q, $filter, $sce, $modal, $timeout, pomsEvents, editFieldService ) {
        return {
            restrict: 'E',
            templateUrl: 'edit/editables/poms-broadcasters-portals.html',
            transclude: true,
            scope: {
                header: '@header',
                field: '@field',
                placeholderText: '@placeholdertext',
                formatFilter: '@format',
                allowedPortals: '=',
                allowedBroadcasters: '=',
                options: '=',
                helpField: '@'
            },
            link: function ( $scope, element, attrs ) {
                var media = $scope.$parent.media;
                var uiSelect;

                $scope.errorType = attrs.errortype || '';
                $scope.isOpen = false;
                $scope.media = media;
                $scope.mayRead = function() {
                    return editService.hasReadPermission( media, $scope.field );
                }.bind(this);
                $scope.mayWrite = function() {
                    return editService.hasWritePermission( media, $scope.field );
                }.bind(this);

                $scope.selectedItems = {};
                $scope.selectedItems.selected = [];

                $scope.$watch( 'selectedItems', function ( a, b ) {
                    $scope.checkPortalsAndBroadcasters( $scope.selectedItems.selected, $scope.field );
                } );


                $scope.$on( 'closeEditField', function ( e, data ) {
                    if ( data.field === $scope.field ) {
                        $timeout( function () {
                            $scope.onHide();
                        }, 0 );
                    }
                } );

                $scope.onHide = function () {
                    $scope.isOpen = false;
                    $scope.selectedItems.selected = [];

                    $scope.$emit( 'editFieldOpen', { 'field': $scope.field, 'isOpen': false} );
                };


                $scope.showEditElement = function ( event) {

                    event.preventDefault();
                    event.stopPropagation();
                    if ( $scope.mayWrite() && ! $scope.isOpen ) {

                        var currentItems = angular.copy( $scope.media[$scope.field] );

                        $scope.isOpen = true;

                        $scope.selectedItems.selected = [];
                        if ( $scope.options.length > 0 && currentItems ) {
                            for ( var i = 0; i < currentItems.length; i ++ ) {
                                for ( var j = 0; j < $scope.options.length; j ++ ) {
                                    if ( $scope.options[j].id === currentItems[i].id ) {

                                        $scope.selectedItems.selected.push( $scope.options[j] );
                                    }
                                }
                            }
                        }

                        // We lookup the ui-select element via childscope because we can't acces it by name and dont want to alter its code
                        uiSelect = $scope.$$childHead.$select;
                        uiSelect.activate();
                    }

                    $scope.$emit( 'editFieldOpen', {'field': $scope.field, 'isOpen': true} );


                    element.find( 'button' ).on( 'click', function ( e ) {
                        e.stopPropagation();
                    } );
                };

                $scope.cancel = function ( e ) {
                    if ( e ) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    $scope.onHide();
                };


                $scope.trustAsHtml = function ( value ) {
                    return $sce.trustAsHtml( value );
                };

                $scope.save = function ( data ) {

                    $scope.waiting = true;

                    if ( angular.equals( data === media[$scope.field] ) ) {
                        $scope.waiting = false;
                        return; // no change
                    }

                    var deferred = $q.defer();

                    editService[$scope.field]( media, data ).then(
                        function ( result ) {

                            angular.copy( result, media );

                            deferred.resolve( false );
                            $scope.waiting = false;
                            $scope.onHide();

                            $scope.$emit( 'saved' );

                        },
                        function ( error ) {
                            if(error) {
                                var errorText = error.message;

                                if ( error.violations ) {
                                    for ( var violation in  error.violations ) {
                                        errorText = error.violations[violation];
                                        deferred.reject( errorText );
                                        break;
                                    }
                                } else {
                                    $scope.$emit( pomsEvents.error, error );
                                }
                            }
                            $scope.waiting = false;
                        }
                    );
                    return deferred.promise;

                };

                $scope.keyEvent = function ( event ) {
                    if ( event.keyCode == 27 ) {
                        $scope.cancel();
                    }
                };


                $scope.blurredSave = function ( e ) {
                    if ( e ) {
                        e.stopPropagation();
                    }
                    var data = $scope.selectedItems.selected;
                    if ( angular.equals( data === media[$scope.field] ) ) {
                        this.waiting = false;
                        $scope.onHide();
                    } else {

                        editFieldService.saveConfirm().then(
                            function ( result ) {
                                if ( result ) {
                                    $scope.save( data );
                                }
                            },
                            function ( error ) {
                                $scope.$emit( pomsEvents.error, error );
                            }
                        );
                    }

                };


                $scope.checkPortalsAndBroadcasters = function ( data, field ) {

                    $scope.selectedItems.selected = data;

                    // function to make sure at least one of the editors broadcasters or portals is selected //
                    // prevents editor from saving media item and thereby removing his own editing permssions //

                    var broadcasters, portals;

                    if ( field === 'broadcasters' ) {
                        broadcasters = data;
                        portals = $scope.media.portals;
                    } else if ( field === 'portals' ) {
                        broadcasters = $scope.media.broadcasters;
                        portals = data;
                    }
                    else {
                        return
                    }


                    var chosenAllowedBroadcasters = [];
                    if ( broadcasters ) {
                        for ( var i = 0; i < broadcasters.length; i ++ ) {
                            for ( var j = 0; j < $scope.allowedBroadcasters.length; j ++ ) {
                                if ( $scope.allowedBroadcasters[j].id === broadcasters[i].id ) {
                                    chosenAllowedBroadcasters.push( $scope.allowedBroadcasters[j] );
                                }
                            }
                        }
                    }

                    var chosenAllowedPortals = [];
                    if ( portals ) {
                        for ( var i = 0; i < portals.length; i ++ ) {
                            for ( var j = 0; j < $scope.allowedPortals.length; j ++ ) {
                                if ( $scope.allowedPortals[j].id === portals[i].id ) {
                                    chosenAllowedPortals.push( $scope.allowedPortals[j] );
                                }
                            }
                        }
                    }

                    if ( field === 'broadcasters' && $scope.options ) {
                        for ( var j = 0; j < $scope.options.length; j ++ ) {
                            $scope.options[j].disabled = ( broadcasters.length === 1 && broadcasters[0].id === $scope.options[j].id );

                        }
                    }


                    if ( field === 'portals' && $scope.options ) {
                        for ( var j = 0; j < $scope.options.length; j ++ ) {
                            $scope.options[j].disabled = ( chosenAllowedBroadcasters.length === 0
                            && chosenAllowedPortals.length === 1
                            && $scope.options[j].id === chosenAllowedPortals[0].id );

                        }
                    }


                }

            }
        };
    }] );


