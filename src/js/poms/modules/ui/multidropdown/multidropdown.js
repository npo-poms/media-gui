angular.module( 'poms.ui.multidropdown', [] );

angular.module( 'poms.ui.multidropdown' ).factory( 'MultiDropdownService', [
    /*
    *   Service to rule all multidropdowns. Responsible for closing dropdowns when:
    *
    *   1. another dropdown opens
    *   2. a click event outside dropdowns occurs
    *   3. the escape key is pressed
    *   4. tab or page navigation occurs
    *
    */
    '$document',
    function ( $document ) {

        var openScope = null,
            closeOnEvent = function ( event ) {

                if ( openScope ) {

                    switch ( event.type ) {
                        case 'click':
                            if ( openScope.element[0].contains( event.target ) ) {
                                return;
                            }
                            break;
                        case 'keydown':
                            if ( event.which !== 27 ) {
                                openScope.isOpen = false;
                                return;
                            }
                            break;
                    }

                    if ( openScope ) {
                        openScope.$apply( function () {
                            openScope.isOpen = false;
                        } )
                    }
                }
            };

        function MultiDropdownService () {

        }

        MultiDropdownService.prototype = {

            open: function ( someScope ) {

                if ( ! openScope ) {
                    $document.bind( 'click', closeOnEvent );
                    $document.bind( 'keydown', closeOnEvent );
                }

                if ( openScope && openScope !== someScope ) {
                    openScope.isOpen = false;
                }

                someScope.isOpen = true;
                openScope = someScope;
            },

            close: function ( someScope ) {

                someScope.isOpen = false;

                if ( someScope === openScope ) {
                    openScope = null;
                    $document.unbind( 'keydown', closeOnEvent );
                    $document.unbind( 'click', closeOnEvent );
                }
            }
        };

        return new MultiDropdownService();
    }
] );

angular.module( 'poms.ui.multidropdown' ).directive( 'pomsMultiDropdown', function () {

    'use strict';

    return {

        scope: {
            items: '=',
            defaultFunction: '&'
        },
        require: ['pomsMultiDropdown', 'ngModel'],
        transclude: true,
        replace: true,
        template: function ( element, attrs ) {

            var single = attrs.hasOwnProperty( 'single' );
            var hasDefault = attrs.hasOwnProperty( 'hasDefault' );
            return [
                '<div class="poms-multidropdown" ng-class="{open:isOpen}">',
                '   <span class="poms-multidropdown-label" ng-transclude ng-click="controller.toggleVisibility()">Label</span>',
                '   <div class="poms-multidropdown-items">',
                '       <span class="poms-multidropdown-item" ng-repeat="option in options" ng-click="controller.toggleValue(option)" ng-class="{selected:option.selected}">',
                '           <span class="label">{{option.label}}</span>',
                single ?
                    '<input name="abc" ng-checked="option.selected" type="radio" />'
                    :
                    '<input type="checkbox" ng-model="option.selected"/>'
                ,
                '       </span>',
                hasDefault ?
                    '<a class="poms-multidropdown-set-default" ng-click="controller.setDefault()" >maak standaard</a>' : '',
                '   </div>',
                '</div>'
            ].join( '' );
        },
        controllerAs: 'controller',
        controller: [
            '$scope',
            '$element',
            'MultiDropdownService',
            (function () {

                function MultiDropDownController ( $scope, $element, MultiDropDownService ) {

                    this.$scope = $scope;
                    this.service = MultiDropDownService;

                    this.$scope.isOpen = false;
                    this.$scope.element = $element;
                    this.$scope.value = [];

                    this.isSingleValue = false;
                }

                //TODO: Clean up and comment
                MultiDropDownController.prototype = {

                    init: function ( modelCtrl, parameters ) {

                        this.ngModelCtrl = modelCtrl;

                        this.ngModelCtrl.$render = this.setStateFromModel.bind( this );

                        this.ngModelCtrl.$isEmpty = function () {
                            return ! this.$scope.options.some( function ( option ) {
                                return option.selected;
                            } );
                        }.bind( this );

                        this.isSingleValue = parameters.singleValue;

                        this.$scope.$watch( 'isOpen', function ( isOpen, wasOpen ) {

                            if ( isOpen ) {
                                this.service.open( this.$scope );
                            } else {
                                this.service.close( this.$scope );
                            }

                        }.bind( this ) );

                        this.$scope.$watch( 'items', function ( newValue, oldValue ) {

                            if ( newValue ) {
                                this.$scope.options = this.$scope.items.map( function ( item ) {

                                    return {
                                        selected: false,
                                        label: item[parameters.labelField]
                                    };
                                } );

                                this.ngModelCtrl.$render();
                            }
                        }.bind( this ) );

                        this.$scope.$watch( function () {
                            this.ngModelCtrl.$render();
                        }.bind( this ) );

                        this.$scope.$on( '$locationChangeSuccess', function () {
                            this.$scope.isOpen = false;
                        }.bind( this ) );

                        this.$scope.$on( '$destroy', function () {
                            this.$scope.$destroy();
                        }.bind( this ) );
                    },

                    toggleVisibility: function () {

                        this.$scope.isOpen = ! this.$scope.isOpen;
                    },

                    toggleValue: function ( option ) {

                        if ( this.isSingleValue ) {
                            this.$scope.options.forEach( function ( someOption ) {
                                someOption.selected = false;
                            } );
                            option.selected = true;
                        } else {
                            option.selected = ! option.selected;
                        }

                        this.setModelFromState();
                    },

                    setDefault: function () {
                        this.$scope.defaultFunction();
                        this.toggleVisibility();
                    },

                    setModelFromState: function () {

                        var items = this.$scope.items,
                            options = this.$scope.options,
                            modelItems = [];

                        if ( this.isSingleValue ) {
                            options.every( function ( option, index ) {
                                if ( option.selected ) {
                                    this.ngModelCtrl.$setViewValue( items[index] );
                                }
                                return ! option.selected
                            }, this );
                        } else {
                            options.forEach( function ( option, index ) {
                                if ( option.selected ) {
                                    modelItems.push( items[index] );
                                }
                            } );
                            this.ngModelCtrl.$setViewValue( modelItems );
                        }

                    },

                    setStateFromModel: function () {

                        var items = this.$scope.items,
                            model = this.ngModelCtrl.$viewValue,
                            options = this.$scope.options;

                        //TODO: validate model

                        if ( options && options.length ) {

                            if ( model ) {
                                if ( this.isSingleValue ) {
                                    items.forEach( function ( item, index ) {
                                        options[index].selected = angular.equals( model, item );
                                    } );
                                } else {
                                    items.forEach( function ( item, index ) {
                                        options[index].selected = model.some( function ( someModel ) {
                                            return angular.equals( someModel, item );
                                        } );
                                    } );
                                }
                            } else {
                                options.forEach( function ( option ) {
                                    option.selected = false;
                                } );
                            }
                        }
                    }
                };

                return MultiDropDownController;
            }())
        ],
        link: function ( scope, element, attrs, controllers ) {

            var controller = controllers[0],
                ngModel = controllers[1];

            controller.init( ngModel, {
                labelField: attrs.labelfield,
                singleValue: attrs.hasOwnProperty( 'single' )
            } );
        }
    };
} );
