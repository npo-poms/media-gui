angular.module( 'poms.util.directives' )
    .directive( 'pomsUiSelectMulti', [function () {
        return {
            restrict: 'E',
            templateUrl: '/views/search/poms-ui-select-multiple.html',
            scope: {
                selection: '=',
                options: '=',
                remove: '&',
                name: '@',
                optionSelected: '&'
            },
            controller: 'PomsUiSelectMultiController',
            controllerAs: 'controller'
        };
    }] );


angular.module( 'poms.util.directives' )
    .controller( 'PomsUiSelectMultiController', ['$scope', '$sce', '$timeout',

        (function () {

            function PomsUiSelectController($scope, $sce, $timeout) {
                this.$scope = $scope;
                this.$sce = $sce;
                this.$timeout = $timeout;
                this.$scope.opened = false;
                this.template = "";
                this.$scope.selected = { };
                this.$scope.tagHandler = function (tag){
                    return null;
                }


                this.$scope.$on("uiSelect:events", function ( e, events ) {
                    console.log("Received event", e, events);
                    const open = events[0];
                    if (! open ) {
                        this.$scope.opened = false;
                    }
                }.bind( this ) );
            }

            PomsUiSelectController.prototype = {
                toggleOpen: function (event ) {
                    this.$scope.opened = ! this.$scope.opened;
                    if ( this.$scope.opened ) {
                        this.$timeout( function () {
                            angular.element( event.currentTarget ).parent().find( 'input' ).click();
                        }, 0 );
                    }
                },

                openClose: function ( isOpen ) {
                    this.$scope.opened = isOpen;
                },
                trustAsHtml: function ( value ) {
                    return this.$sce.trustAsHtml( value );
                },

                remove: function ( collection, item ) {
                    collection.some( function ( someItem, index ) {
                        if ( angular.equals( someItem, item ) ) {
                            collection.splice( index, 1 );
                            return true;
                        }
                    } );
                },

                select: function () {
                    this.$scope.optionSelected();
                }
            };

            return PomsUiSelectController;

        })()
    ] );


angular.module( 'poms.util.directives' )
    .directive( 'pomsUiSelect', [function () {
        return {
            restrict: 'E',
            templateUrl: '/views/search/poms-ui-select.html',
            scope: {
                selection: '=',
                options: '=',
                remove: '&',
                name: '@',
                optionSelected: '&'
            },
            controller: 'PomsUiSelectController',
            controllerAs: 'controller'
        };
    }] );


angular.module( 'poms.util.directives' )
    .controller( 'PomsUiSelectController', ['$scope', '$sce', '$timeout',
        (function () {

            function PomsUiSelectController ($scope, $sce, $timeout) {
                this.$scope = $scope;
                this.$sce = $sce;
                this.$timeout = $timeout;
                this.$scope.opened = false;

                this.$scope.$on( "uiSelect:events", function ( e, events ) {
                    const open = events[0];
                    if ( ! open ) {
                        this.$scope.opened = false;
                    }
                }.bind( this ) );
            }

            PomsUiSelectController.prototype = {
                select: function () {
                    this.$scope.optionSelected();
                },
                openClose: function ( isOpen ) {
                    this.$scope.opened = isOpen;
                },

                toggleOpen: function ( event ) {

                    this.$scope.opened = ! this.$scope.opened;
                    if ( this.$scope.opened ) {
                        this.$timeout( function () {
                            angular.element( event.currentTarget ).parent().find( 'input' ).click();
                        });
                    }
                },

                trustAsHtml: function ( value ) {
                    return this.$sce.trustAsHtml( value );
                }


            };

            return PomsUiSelectController;

        })()
    ] );


/**
 * Called 'suggest', but actually only tag!
 */
angular.module( 'poms.util.directives' )
    .directive( 'pomsUiSelectSuggest', [function () {
        return {
            restrict: 'E',
            templateUrl: '/views/search/poms-ui-select-suggest.html',
            scope: {
                selection: '=',
                remove: '&',
                name: '@',
                optionSelected: '&',
                updateOptions: '&'
            },
            controller: 'PomsUiSelectSuggestController',
            controllerAs: 'controller'
        };
    }] );


angular.module( 'poms.util.directives' )
    .controller( 'PomsUiSelectSuggestController', ['$scope', '$sce', '$timeout',

        (function () {

            function PomsUiSelectSuggestController ( $scope, $sce, $timeout ) {
                this.$scope = $scope;
                this.$sce = $sce;
                this.$timeout = $timeout;
                this.$scope.opened = false;
                this.$scope.options = [];

                // this might be broken currently?
                this.$scope.$on( "uiSelect:events", function ( e, events ) {
                    console.log("event", e, events);
                    const open = events[0];
                    if ( ! open ) {
                        this.$scope.opened = false;
                    }
                }.bind(this));
            }

            PomsUiSelectSuggestController.prototype = {

                getOptions: function ( text ) {

                    if (text) {
                        this.$scope.updateOptions(text).then(
                            function (data) {
                                this.$scope.options = data;
                            }.bind( this )
                        );
                    }
                },
                openClose: function ( isOpen ) {
                    this.$scope.opened = isOpen;
                },

                toggleOpen: function ( event ) {

                    this.$scope.opened = ! this.$scope.opened;
                    if ( this.$scope.opened ) {
                        this.$timeout( function () {
                            angular.element( event.currentTarget ).parent().find( 'input' ).click();
                        }, 0 );
                    }
                },

                trustAsHtml: function ( value ) {
                    return this.$sce.trustAsHtml( value );
                },

                select: function () {
                    this.$scope.optionSelected();
                }


            };

            return PomsUiSelectSuggestController;

        })()
    ] );
