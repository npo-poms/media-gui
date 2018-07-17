angular.module( 'poms.media.directives' )
    .directive( 'pomsDropdown', [
        'EditService',
        '$q',
        '$filter',
        '$sce',
        '$modal',
        '$timeout',
        'PomsEvents',
        'EditFieldService',
        function (
            editService,
            $q,
            $filter,
            $sce,
            $modal,
            $timeout,
            pomsEvents,
            editFieldService ) {
        return {
            restrict: 'E',
            templateUrl: 'edit/editables/poms-dropdown.html',
            transclude: true,
            scope: {
                header: '@header',
                field: '@field',
                formatFilter: '@format',
                placeholderText: '@placeholdertext',
                options: '=',
                helpField: '@'
            },
            link: function ( $scope, element, attrs ) {
                var media = $scope.$parent.media;
                var uiSelect;

                $scope.errorType = attrs.errortype || '';
                $scope.isOpen = false;
                $scope.media = media;
                $scope.mayRead = editService.hasReadPermission( media, $scope.field );
                $scope.mayWrite = editService.hasWritePermission(media, $scope.field);

                //console.log("may write", $scope.field, $scope.mayWrite);

                $scope.selectedItems = {};
                $scope.selectedItems.selected = [];

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


                $scope.showEditElement = function ( event ) {

                    event.preventDefault();
                    event.stopPropagation();

                    if ( $scope.mayWrite && ! $scope.isOpen ) {

                        var currentItems = angular.copy( $scope.media[$scope.field] );

                        $scope.isOpen = true;

                        $scope.selectedItems.selected = [];
                        if ( $scope.options.length > 0 && currentItems ) {
                            for ( var i = 0; i < currentItems.length; i ++ ) {
                                for ( var j = 0; j < $scope.options.length; j ++ ) {
                                    if ( $scope.options[j].id == currentItems[i].id ) {

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


            }
        };
    }] );


