angular.module( 'poms.media.directives' )
    .directive( 'pomsDaterangepicker', ['EditService', 'EditFieldService', '$q', function ( editService, editFieldService, $q ) {
        return {
            restrict: 'E',
            templateUrl: 'views/edit/editables/poms-daterangepicker.html',
            scope: {
                field: '@',
                header: '@',
                helpField: '@'
            },
            link: function ( $scope, element, attrs ) {

                var media = $scope.$parent.media;
                $scope.errorType = '';

                $scope.media = media;

                $scope.mayRead = function() {
                    return editService.hasReadPermission( media, $scope.field );
                }.bind(this);

                $scope.mayWrite = function() {
                    return editService.hasWritePermission( media, $scope.field );
                }.bind(this);

                $scope.show = function (editableForm){
                  if (media.mayWriteEmbargo) {editableForm.$show()}
                }

                if ( ! $scope.media[$scope.field] ) {
                    $scope.media[$scope.field] = {
                        start: undefined,
                        stop: undefined
                    }
                } else {
                    $scope.maxStart = $scope.media[$scope.field].stop;
                    $scope.minStop = $scope.media[$scope.field].start;
                }

                $scope.showEditElement = function () {
                    if ( $scope.mayWrite ) {
                        $scope.$$childTail.editableForm.$show();
                        $scope.errorMessage = undefined;
                    }
                };

                $scope.keyEvent = function ( event ) {
                    if ( event.keyCode == 27 ) {
                        $scope.cancel();
                    }
                };

                $scope.cancel = function () {
                    $scope.editableForm.$cancel();
                };


                $scope.save = function (  ) {
                    $scope.waiting = true;

                    var dateObject = {};

                    var startdate = $scope.editableForm.$data.startdate;
                    var stopdate = $scope.editableForm.$data.stopdate;

                    if ( startdate ) {
                        startdate = new Date( startdate ).getTime();
                        dateObject.start = startdate;
                    }

                    if ( stopdate ) {
                        stopdate = new Date( stopdate ).getTime();
                        dateObject.stop = stopdate;
                    }

                    //MGNL-2923 // prevent saving of publication stop time before publication start time
                    if ( dateObject.stop && dateObject.start && (dateObject.stop < dateObject.start) ){
                        dateObject.stop = dateObject.start;
                    }

                    if (// field was empty, end remained empty
                        (!dateObject.stop && !dateObject.start && !$scope.media[$scope.field].start && !$scope.media[$scope.field].stop) ||
                        // or, no changes
                        ( $scope.media[$scope.field].start == startdate && $scope.media[$scope.field].stop == stopdate )){
                            $scope.waiting = false;
                            $scope.editableForm.$hide();
                    } else {
                        var deferred = $q.defer();

                        editService[$scope.field]( media, dateObject ).then(
                            function ( result ) {

                                angular.copy( result, $scope.$parent.media );
                                $scope.editableForm.$hide();
                                deferred.resolve( result );
                                $scope.waiting = false;

                                $scope.$emit( 'saved' );
                            },
                            function ( error ) {

                                $scope.errorText = error.message;
                                if ( error.violations && error.violations[$scope.errorType] ) {
                                    $scope.errorText = error.violations[$scope.errorType];
                                }

                                deferred.reject( $scope.errorText );

                                $scope.waiting = false;
                            }
                        );
                        return deferred.promise;
                    }

                };

                $scope.blurredSave = function( e ){

                    e.stopPropagation();

                    var dateObject = {};

                    var startdate = $scope.editableForm.$data.startdate;
                    var stopdate = $scope.editableForm.$data.stopdate;

                    if ( startdate ) {
                        startdate = new Date( startdate ).getTime();
                        dateObject.start = startdate;
                    }

                    if ( stopdate ) {
                        stopdate = new Date( stopdate ).getTime();
                        dateObject.stop = stopdate;
                    }

                    //MGNL-2923 // prevent saving of publication stop time before publication start time
                    if ( dateObject.stop && dateObject.start && (dateObject.stop < dateObject.start) ){
                        dateObject.stop = dateObject.start;
                    }

                    if ((!dateObject.stop && ! dateObject.start ) || ( $scope.media[$scope.field].start == startdate && $scope.media[$scope.field].stop == stopdate )){
                        $scope.waiting = false;
                        $scope.editableForm.$hide();
                    }else{

                        editFieldService.saveConfirm().then(
                            function( result ){
                                if ( result ){
                                    $scope.save();
                                }
                            },
                            function( error ){
                             //   $scope.$emit( pomsEvents.error, error );
                            }
                        ) ;
                    }

                }

            }
        };
    }] )
