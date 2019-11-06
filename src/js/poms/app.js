(function () {
    angular.module( 'poms.services', [] );
    angular.module( 'poms.controllers', [
        'poms.services',
        'poms.media'
    ] );

    var module = angular.module( 'poms', [
        'poms.controllers',
        'poms.editor',
        'poms.util',
        'poms.list',
        'poms.search',
        'poms.media',
        'poms.admin',
        'poms.messages',
        'poms.ui',
        "poms.constants",
        'ui.bootstrap',
        'ui.select',
        'ngRoute',
        'LocalStorageModule',
        'angularFileUpload',
        'xeditable',
        'checklist-model',
        'duScroll',
        'ngSanitize',
        'ngAnimate',
        'ngToast',
        'ui',
        "ui-rangeSlider",
        "angular-clipboard",
        'ui.tab.scroll'
    ] );


    module.config( function ( $httpProvider ) {
        $httpProvider.defaults.headers.common['Accept'] = 'application/json';
        $httpProvider.defaults.withCredentials = true;
    } );

    module.factory('httpCurrentOwnerInterceptor', ['localStorageService', 'appConfig',  function(localStorageService, appConfig) {
      return {
        'request': function(config) {
            // add header for all request to POMS backend

            // check for absolute URL (http://, https:// or //)
            var isAbsolute = /^((https?:\/\/|\/\/))/.test( config.url );

            // Absolute URL could also be a POMS url, for instance when developing GUI locally against poms-dev
            var isAbsolutePomsUrl =  ( isAbsolute && ( config.url.indexOf( appConfig.apihost ) !== -1 ) );

            var isPomsUrl = ( !isAbsolute || ( isAbsolute  && isAbsolutePomsUrl ) );
            var currentOwner = localStorageService.get("currentOwner");
            var currentUser  = localStorageService.get("currentUser");
            if((config.method === 'GET' || config.method === 'POST' || config.method === 'DELETE') && currentOwner && currentOwner.length > 0 && isPomsUrl ) {
                config.headers['X-Poms-CurrentOwner'] = currentOwner; // This seems like a horrible hack.
                config.headers['X-Poms-CurrentUser'] = currentUser;

            }
            return config;
        }
      };
    }])
    .config(function($httpProvider) {
      $httpProvider.interceptors.push('httpCurrentOwnerInterceptor');
    });

    module.config( function ( localStorageServiceProvider ) {
        localStorageServiceProvider.setPrefix( 'poms.ui' );
        localStorageServiceProvider.setStorageCookie( 365, '/' );
    } );

    module.config( function ( $routeProvider ) {
        $routeProvider
            .when( '/edit/:mid', {} )
            .when( '/search/:qid', {} )
            .otherwise( {
                redirectTo: '/'
            } );
    } );

    module.config( function ( datepickerConfig, datepickerPopupConfig ) {
        datepickerConfig.showWeeks = false;
        datepickerConfig.startingDay = 1;
        datepickerPopupConfig.datepickerPopup = "dd/MM/yyyy";
        datepickerPopupConfig.currentText = "Vandaag";
        datepickerPopupConfig.clearText = "Wis";
        datepickerPopupConfig.closeText = "Klaar";
        datepickerPopupConfig.toggleWeeksText = "Week";
    } );

    module.value( 'PomsEvents', {
        error: 'error',
        publication: 'publication',
        publicationNotification: 'publicationNotification',
        notification: 'notification',
        preferenceSaved: 'preferenceSaved',
        favorite: 'favorite',
        loaded: 'loaded',
        remove: 'remove',
        edit: 'edit',
        uploadStatus: 'uploadStatus',
        emitUploadStatus: 'emitUploadStatus',
        deleted: 'deleted',
        updated: 'updated',
        imageAdded: 'imageAdded',
        imageRemoved: 'imageRemoved',
        segmentAdded: 'segmentAdded',
        segmentRemoved: 'segmentRemoved',
        memberAdded: 'memberAdded',
        memberRemoved: 'memberRemoved',
        memberOfAdded: 'memberOfAdded',
        memberOfRemoved: 'memberOfRemoved',
        episodeAdded: 'episodeAdded',
        episodeRemoved: 'episodeRemoved',
        episodeOfAdded: 'episodeOfAdded',
        episodeOfRemoved: 'episodeOfRemoved',
        externalChange: 'externalChange',
        predictionUpdated: 'predictionUpdated',
        scheduleEventUpdated: 'scheduleEventUpdated'
    } );

    module.value( 'TextfieldNames', {
        title: 'Titel',
        url: 'url',
        description: 'Beschrijving',
        mainTitle: 'Titel',
        subTitle: 'Afleveringtitel / Subtitel',
        shortTitle: 'Korte titel',
        abbreviationTitle: 'Afkorting',
        workTitle: 'Werktitel',
        originalTitle: 'Originele titel',
        lexicoTitle: 'Lexicografische titel',
        mainDescription: 'Beschrijving',
        shortDescription: 'Korte beschrijving',
        kickerDescription: 'Eenregelige beschrijving',
        subDescription: 'Afleveringsbeschrijving'
    });

    // Toast provides us with notifications
    module.config(['ngToastProvider', function(ngToast) {
        ngToast.configure({
            compileContent: true,
            animation: 'fade',
            maxNumber: 3,
            dismissButton: true,
            dismissButtonHtml:'&times;',
            timeout: 4000,
            additionalClasses: 'notification-animation'
        });
    }]);



    // We extend Angular ui-select directive to we can catch OPEN events
    // https://github.com/angular-ui/ui-select/issues/432
    module.config( function( $provide ) {
        $provide.decorator( "uiSelectDirective", function( $delegate ) {
            var directive = $delegate[ 0 ];
            directive.compile = function compile( ) {
                return {
                    pre: function preLink( scope) {
                        scope.$watchGroup( [ "$select.open", "$select.focus", "$select.blur" ], function( val ) {
                            scope.$parent.$broadcast( "uiSelect:events", val );
                        });
                    },
                    post: directive.link
                }
            };
            return $delegate;
        });
    });


    // custom directive copied from x-editable (editableChecklist) to allow for custom render template with icons
    angular.module('xeditable').directive('editableChecklistIcons', [
        'editableDirectiveFactory',
        'editableNgOptionsParser',
        function(editableDirectiveFactory, editableNgOptionsParser) {
            return editableDirectiveFactory({
                directiveName: 'editableChecklistIcons',
                inputTpl: '<span></span>',
                useCopy: true,
                render: function() {
                    this.parent.render.call(this);
                    var parsed = editableNgOptionsParser(this.attrs.eNgOptions);
                    var html = '<label ng-repeat="'+parsed.ngRepeat+'">'+
                        '<input  type="checkbox" checklist-model="$parent.$data" checklist-value="'+parsed.locals.valueFn+'">'+
                        '<span class="list-icon" ng-class="\'value_\' + ' + parsed.locals.valueFn +'"  ng-bind="'+parsed.locals.displayFn+'"></span></label>';

                    this.inputEl.removeAttr('ng-model');
                    this.inputEl.removeAttr('ng-options');
                    this.inputEl.html(html);
                }
            });
        }]);

    // custom directive copied from x-editable (editableRadiolist) to allow for custom render template with icons
    angular.module('xeditable').directive('editableRadiolistIcons', [
        'editableDirectiveFactory',
        'editableNgOptionsParser',
        function(editableDirectiveFactory, editableNgOptionsParser) {
            return editableDirectiveFactory({
                directiveName: 'editableRadiolistIcons',
                inputTpl: '<span></span>',
                render: function() {
                    this.parent.render.call(this);
                    var parsed = editableNgOptionsParser(this.attrs.eNgOptions);
                    var html = '<label ng-repeat="'+parsed.ngRepeat+'">'+
                        '<input type="radio" ng-disabled="' + this.attrs.eNgDisabled + '" ng-model="$parent.$data" value="{{'+parsed.locals.valueFn+'}}">'+
                        '<span class="list-icon" ng-class="\'value_\' + '+ parsed.locals.valueFn +'"  ng-bind="'+parsed.locals.displayFn+'"></span></label>';
                    this.inputEl.removeAttr('ng-model');
                    this.inputEl.removeAttr('ng-options');
                    this.inputEl.html(html);
                },
                autosubmit: function() {
                    var self = this;
                    self.inputEl.bind('change', function() {
                        setTimeout(function() {
                            self.scope.$apply(function() {
                                self.scope.$form.$submit();
                            });
                        }, 500);
                    });
                }
            });
        }]);


    // A fix for a bug in Angular UI's datepicker, which sometimes falls back to a date format we don't like
    // https://github.com/angular-ui/bootstrap/issues/1129
    angular.module('poms').directive('datepickerPopup', function (){
        return {
            restrict: 'EAC',
            require: 'ngModel',
            link: function(scope, element, attr, controller) {
                //remove the default formatter from the input directive to prevent conflict
                controller.$formatters.shift();
            }
        }
    });

    // directive to force typeahead to open  from outside event
    angular.module('poms')
        .directive('typeaheadFocus', function () {
            return {
                require: 'ngModel',
                link: function (scope, element, attr, ngModel) {

                    //trigger the popup on 'click' because 'focus'
                    //is also triggered after the item selection
                    element.bind('click', function () {

                        var viewValue = ngModel.$viewValue;

                        //restore to null value so that the typeahead can detect a change
                        if (ngModel.$viewValue == ' ') {
                            ngModel.$setViewValue(null);
                        }

                        //force trigger the popup
                        ngModel.$setViewValue(' ');

                        //set the actual value in case there was already a value in the input
                        ngModel.$setViewValue(viewValue || ' ');
                    });

                    //compare function that treats the empty space as a match
                    scope.emptyOrMatch = function (actual, expected) {
                        if (expected == ' ') {
                            return true;
                        }
                        return actual.indexOf(expected) > -1;
                    };
                }
            };
        });

    angular.module( 'poms' )
        .config( [ '$modalProvider', function ( $modalProvider ) {
            $modalProvider.options.backdrop = "static";
        } ] );

    module.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);

        // Allow blob links in urls
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
    }]);


    /* Attach to input time elements and switch their formatting to be HH:MM:ss
     */
    angular.module( 'poms' ).directive('ngModel', function( $filter ) {
        return {
            require: '?ngModel',
            link: function(scope, elem, attr, ngModel) {
                if( !ngModel )
                    return;
                if( attr.type !== 'time' )
                    return;

                ngModel.$formatters.unshift(function(value) {
                    return value.replace(/\.\d{3}$/, '')
                });
            }
        }
    });




})();
