angular.module( 'poms.media.directives' )
    .directive( 'pomsEditable',
        [
            'EditService',
            'FavoritesService',
            '$q',
            '$filter',
            '$modal',
            '$timeout',
            'PomsEvents',
            'MediaService',
            'EditFieldService',
            'EditorService',
            'TextfieldNames',
            function (
                editService,
                favoritesService,
                $q,
                $filter,
                $modal,
                $timeout,
                pomsEvents,
                mediaService,
                editFieldService,
                editorService,
                TextfieldNames) {
        return {
            restrict: 'E',
            templateUrl: function ( element, attrs ) {
                switch ( attrs.fieldtype ) {
                    case 'title':
                        return 'edit/editables/poms-title.html';
                    case 'description':
                        return 'edit/editables/poms-description.html';
                    case 'time':
                        return 'edit/editables/poms-time.html';
                    case 'duration':
                        return 'edit/editables/poms-duration.html';
                    case 'number':
                        return 'edit/editables/poms-number.html';
                    case 'checklist':
                        return 'edit/editables/poms-checklist.html';
                    case 'checklist-icons':
                        return 'edit/editables/poms-checklist-icons.html';
                    case 'checkbox':
                        return 'edit/editables/poms-checkbox.html';
                    case 'radiolist':
                        return 'edit/editables/poms-radiolist.html';
                    case 'radiolist-icons':
                        return 'edit/editables/poms-radiolist-icons.html';
                }
            },
            transclude: true,
            scope: {
                header: '@header',
                field: '@field',
                helpField: '@',
                formatFilter: '@format',
                options: '=',
                media: '=' ,
                type: '@',
                static: '@'
            },
            link: function ( $scope, element, attrs ) {

                $scope.TextfieldNames = TextfieldNames;

                $scope.errorType = attrs.errortype || '';
                $scope.editForm = undefined;

                $scope.isOpen = false;
                $scope.fieldType = attrs.fieldtype || undefined;
                $scope.isTextField = ($scope.fieldType === "title" || $scope.fieldType === "description"  || $scope.fieldType === "url" );

                this.editService = editService;

                $scope.currentOwnerType = editorService.getCurrentOwnerType();

                $scope.mayRead = this.editService.hasReadPermission( $scope.media, $scope.field );

                $scope.mayWrite =
                    this.editService.hasWritePermission($scope.media, $scope.field);

                $scope.classes = "";
                $scope.titleclasses = "";
                if (attrs.static) {
                    $scope.classes = "media-static-field";
                    $scope.titleclasses = "media-static-field-title";
                }

                //console.log($scope.field, $scope.mayWrite);

                function formatDateForEdit(date) {
                   return $filter("withTimezone")(date);
                }

                function formatDateForDisplay(date) {
                   return $filter("mediaDuration")(date);
                }
                if ( $scope.fieldType === 'duration' ) {
                    // ridiculous hacks to reuse date editors for durations
                    $scope.editableDuration =  formatDateForEdit($scope.media[$scope.field]);
                    $scope.formattedDuration = formatDateForDisplay($scope.media[$scope.field]);
                }

                if ( $scope.field === 'year' ) {
                    $scope.minYearValue = 1900;
                }


                // Events //
                $scope.$on( 'openElement', function ( e, data ) {
                    if ( data.field === $scope.field ) {
                        $timeout( function () {
                            element.find( '.editfield-wrapper' ).trigger( 'click' );
                        }, 0, false );
                    }
                } );

                // our general MediaController listens for 'ESQ' key, to make sure the key works when user is in editmode but not focussed on the element
                $scope.$on( 'closeEditField', function ( e, data ) {
                    if ( data.field === $scope.field ) {
                        $scope.onHide();
                    }
                } );
                // end Events//


                // Functions //
                $scope.keyEvent = function ( e, form, data ) {

                    if ( e.keyCode === 9 && ! e.shiftKey && $scope.isTextField ) {
                        $scope.goToField = 1;
                        $scope.blurredSave( e, data );
                    }
                    if ( e.keyCode === 9 && e.shiftKey && $scope.isTextField ) {
                        $scope.goToField = - 1;
                        $scope.blurredSave( e, data );
                    }
                };

                $scope.isUnchanged = function ( data ) {

                    var oldValue = angular.copy( $scope.media[$scope.field] );

                    if ( $scope.field === "duration" && data ) {
                        data = $filter( 'noTimezone' )( data ).getTime();
                    }

                    return (
                     ( !oldValue && !data )
                     || ( data && oldValue && data === oldValue.text)
                     || ( angular.equals( oldValue, data ) )
                     || ( oldValue && oldValue.id && angular.equals( oldValue.id, data ) ));
                };

                $scope.isEmpty = function () {
                    return ( ! $scope.media[$scope.field] || angular.equals( {}, $scope.media[$scope.field] ) );
                };

                $scope.onShow = function () {
                    $scope.isOpen = true;

                    // our general MediaController listens for 'ESQ' key,
                    // to make sure the key works when user is in editmode but not focussed on the element
                    $scope.$emit( 'editFieldOpen', {'field': $scope.field, 'isOpen': true} );

                };

                $scope.onHide = function () {
                    $scope.isOpen = false;

                    // our general MediaController listens for 'ESQ' key,
                    // to make sure the key works when user is in editmode but not focussed on the element
                    $scope.$emit( 'editFieldOpen', {'field': $scope.field, 'isOpen': false} );
                };

                $scope.nextField = function ( element ) {
                    if ( ! $scope.isTextField ) {
                        $scope.goToField = false;
                        return;
                    }

                    if ( $scope.goToField === 1 ) {
                        $scope.$emit( 'nextField', element );
                    }
                    if ( $scope.goToField === - 1 ) {
                        $scope.$emit( 'prevField', element );
                    }

                    $scope.goToField = false;
                };

                $scope.save = function ( data ) {

                    if ( $scope.options && $scope.options.length ) {
                        for ( var key in $scope.options ) {
                            if ( $scope.options[key] && $scope.options[key].id === data ) {
                                data = $scope.options[key];
                                break;
                            }
                        }
                    }

                    $scope.waiting = true;

                    if ( $scope.field === 'lexicoTitle' && ( $scope.editForm.$data.editvalue === $scope.media['mainTitle'].text) ){
                        // lexico title exactly equals main title. Don't save that.
                        data = '';
                    }
                    // compare new data to old, if data is present
                    else if ( $scope.isUnchanged( data ) ) {
                        $scope.waiting = false;
                        $scope.nextField( element );
                        return; // no change
                    }

                    if ( $scope.field === "duration") {
                        if (data) {
                            data = $filter( 'noTimezone' )( data ).getTime();
                            $scope.formattedDuration = formatDateForDisplay(data);
                        } else if (data === undefined) {
                            // Using date object for duration _makes no sense whatsoever!!
                            $scope.editForm.$editables[0].scope.$data = $scope.media['duration'];
                            $scope.waiting = false;
                            $scope.nextField(element);
                            return; // no valid data found
                        } else if (!data) {
                            $scope.formattedDuration = null;
                             $scope.editForm.$editables[0].scope.$data = null;
                        }

                    }

                    // returning a string instead of object sets an error message in the x-editable component
                    return this.process( $scope.media, data );

                };
                DUTCH_PARTICLES =  [/^(de)\b.+/i, /^(het)\b.+/i, /^(een)\b.+/i];
                $scope.getLexico = function (title) {
                    // This is a javascript version of poms-shared.jar!nl.vpro.util.TextUtil#getLexico()
                    for (var i = 0; i < DUTCH_PARTICLES.length; i++) {
                        var regexp = DUTCH_PARTICLES[i];
                        var match = regexp.exec(title);
                        if (match !== null) {
                            var matchLength = match[1].length;
                            var start = title.substring(0, matchLength);
                            var uppercase = title.toUpperCase() === title;
                            var b = title.substring(matchLength).trim()
                                + ", " +
                                (uppercase ? start.toUpperCase() : start.toLowerCase());
                            if (start.charAt(0) === start.charAt(0).toUpperCase()) {
                                b = b.charAt(0).toUpperCase() + b.substring(1);
                            }
                            return b;
                        }
                    }
                    return title;
                };


                $scope.showEditElement = function ( event, editElement ) {
                    if ( ! $scope.editForm ) {
                        $scope.editForm = editElement;
                    }

                    // prevent opening of element when clicked on help button
                    if ( event.toElement && event.toElement['type'] === 'button' ) {
                        return;
                    }

                    if ( $scope.mayWrite && ! $scope.editForm.$visible ) {
                        $scope.editForm.$show();

                        // prevent re-opening of element when clicked on save or cancel button
                        angular.element( event.target ).closest( '.editfield-wrapper' ).find( 'button' ).on( 'click', function ( e ) {
                            e.stopPropagation();
                        } );

                        if ( $scope.field === 'lexicoTitle' && (!$scope.media[$scope.field] || !$scope.media[$scope.field].text) ){
                            // propose a lexico title based on main title
                            $scope.editForm.$editables[0].scope.$data = $scope.getLexico($scope.media['mainTitle'].text);
                        }
                    }
                };

                $scope.blurredSave = function ( e ) {
                    var data;

                    if ( e ) {
                        e.stopPropagation();
                    }

                    if ( $scope.editForm && $scope.editForm.$data && $scope.editForm.$data.editvalue ) {
                        data = $scope.editForm.$data.editvalue;
                    }


                    if ( $scope.field === 'lexicoTitle' && ( $scope.editForm.$data.editvalue === $scope.media['mainTitle'].text) ){
                        // I don't understand what is happening here.
                        // I suppose the automatic filling of the 'main title' makes it a bit complex
                        // but some comments explaining may be warranted!
                        editFieldService.saveConfirm().then(
                            function ( result ) {
                                if ( result ) {
                                    $scope.editForm.$submit();
                                }
                            },
                            function ( error ) {
                                $scope.$emit( pomsEvents.error, error );
                            }
                        );
                    } else if ( $scope.isUnchanged( data ) ) {
                        $timeout( function () {
                            $scope.editForm.$cancel();
                        }, 0 );
                        $scope.nextField( element );
                    } else {
                        editFieldService.saveConfirm().then(
                            function ( result ) {
                                if ( result ) {
                                    $scope.editForm.$submit();
                                }
                            },
                            function ( error ) {
                                $scope.$emit( pomsEvents.error, error );
                            }
                        );
                    }

                };


                $scope.process = function ( media, data ) {

                    var deferred = $q.defer();

                    this.editService[$scope.field]( media, data ).then(
                        function ( result ) {


                            angular.copy( result, media );

                            deferred.resolve( false );
                            $scope.waiting = false;

                            $scope.$emit( 'saved' );
                            $scope.nextField( element );

                        },
                        function ( error ) {
                            var errorText = error.message;

                            if ( error.violations ) {
                                for ( var violation in error.violations ) {
                                    errorText = error.violations[violation];
                                    deferred.reject( errorText );
                                    break;
                                }
                            } else {
                                $scope.$emit( pomsEvents.error, error );
                            }
                            $scope.waiting = false;
                        }
                    );
                    return deferred.promise;
                }.bind(this);

                $scope.showOwner = function( media, field ){
                    return ( media[field] && media[field].owner && media[field].owner !== $scope.currentOwnerType) ;
                }

            }
        };
    }] );
