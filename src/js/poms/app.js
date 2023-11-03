(function () {
    angular.module( 'poms.services', [] );
    angular.module( 'poms.controllers', [
        'poms.services',
        'poms.media'
    ] );

    const module = angular.module('poms', [
        'poms.controllers',
        'poms.editor',
        'poms.util',
        'poms.list',
        'poms.search',
        'poms.media',
        'poms.messages',
        'poms.ui',
        "poms.constants",
        'ui.bootstrap',
        'ui.select',
        'ui.tab.scroll',
        'ngRoute',
        'LocalStorageModule',
        'angularFileUpload',
        'xeditable',
        'checklist-model',
        'duScroll',
        'ngSanitize',
        'ngAnimate',
        'ngToast',
        "ui-rangeSlider",
        "angular-clipboard"
    ]);


    module.config(function($locationProvider) {
        $locationProvider.hashPrefix('');   // in angular 1.6 the default changed to '!', but we stay compatible for now
    });
    module.config( function ( $httpProvider ) {
        $httpProvider.defaults.headers.common['Accept'] = 'application/json';
        $httpProvider.defaults.withCredentials = true;
    } );

    module.factory('httpCurrentOwnerInterceptor', ['localStorageService', 'appConfig',  function(localStorageService, appConfig) {
      return {
        'request': function(config) {
            // add header for all request to POMS backend

            // check for absolute URL (http://, https:// or //)
            const isAbsolute = /^(?:https?:\/\/|\/\/)/.test(config.url);

            // Absolute URL could also be a POMS url, for instance when developing GUI locally against poms-dev
            const isAbsolutePomsUrl = (isAbsolute && (config.url.indexOf(appConfig.apiHost) !== -1));

            const isPomsUrl = (!isAbsolute || (isAbsolute && isAbsolutePomsUrl));
            const currentOwner = localStorageService.get("currentOwner");
            const currentUser = localStorageService.get("currentUser");
            if((config.method === 'GET' || config.method === 'POST' || config.method === 'DELETE' || config.method === 'PUT') && currentOwner && currentOwner.length > 0 && isPomsUrl ) {
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

    module.config( function ( uibDatepickerConfig, uibDatepickerPopupConfig ) {
        uibDatepickerConfig.showWeeks = false;
        uibDatepickerConfig.startingDay = 1;
        uibDatepickerPopupConfig.datepickerPopup = "dd/MM/yyyy";
        uibDatepickerPopupConfig.currentText = "Vandaag";
        uibDatepickerPopupConfig.clearText = "Wis";
        uibDatepickerPopupConfig.closeText = "Klaar";
        uibDatepickerPopupConfig.toggleWeeksText = "Week";
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
        scheduleEventUpdated: 'scheduleEventUpdated',
        tabChanged: 'tabChanged'
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
        kickerDescription: 'Eénregelige beschrijving',
        subDescription: 'Afleveringsbeschrijving'
    });

    module.value( 'ValidationPatterns', {
        offset: {
            // like a duration, but can also be negative
            regexp: /^(-?\d+:\d{2}(:\d{2})?([\\.,]\d+)?|(-?PT)?(-?\d+H)?(-?\d+\s*M)?\s*(-?\d+(\.\d+)?\s*S)?|-?\d+|)$/i,
            placeholder: "04:01,2 of 4M 1.2S of 241200"
        },
        duration: {
            regexp: /^(\d+:\d{2}(:\d{2})?([\\.,]\d+)?|(PT)?(\d+H)?(\d+\s*M)?\s*(\d+(\.\d+)?\s*S)?|\d+|)$/i,
            placeholder: "04:01,2 of 4M 1.2S of 241200"
        }
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
   /* module.config( function( $provide ) {
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
    });*/


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
                    const parsed = editableNgOptionsParser(this.attrs.eNgOptions);
                    const html = '<label ng-repeat="'+parsed.ngRepeat+'">'+
                        '<input  type="checkbox" checklist-model="$parent.$data" checklist-value="'+parsed.locals.valueFn+'">'+
                        '<span class="list-icon" ng-class="' + parsed.locals.valueName + '.iconClass'  + '" ng-bind="' + parsed.locals.displayFn+'"></span></label>';

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
                    const parsed = editableNgOptionsParser(this.attrs.eNgOptions);
                    const html = '<label ng-repeat="' + parsed.ngRepeat + '">' +
                        '<input type="radio" ng-disabled="' + this.attrs.eNgDisabled + '" ng-model="$parent.$data" value="{{' + parsed.locals.valueFn + '}}">' +
                        '<span class="list-icon" ng-class="' + parsed.locals.valueName + '.iconClass' + '" ng-bind="' + parsed.locals.displayFn + '"></span></label>';
                    this.inputEl.removeAttr('ng-model');
                    this.inputEl.removeAttr('ng-options');
                    this.inputEl.html(html);
                },
                autosubmit: function() {
                    const self = this;
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

                        const viewValue = ngModel.$viewValue;

                        //restore to null value so that the typeahead can detect a change
                        if (ngModel.$viewValue === ' ') {
                            ngModel.$setViewValue(null);
                        }

                        //force trigger the popup
                        ngModel.$setViewValue(' ');

                        //set the actual value in case there was already a value in the input
                        ngModel.$setViewValue(viewValue || ' ');
                    });

                    //compare function that treats the empty space as a match
                    scope.emptyOrMatch = function (actual, expected) {
                        if (expected === ' ') {
                            return true;
                        }
                        return actual.indexOf(expected) > -1;
                    };
                }
            };
        });

  /*  angular.module( 'poms' )
        .config( [ '$uibModalInstance', function ( $uibModalProvider ) {
            $uibModalProvider.options.backdrop = "static";
        } ] );
*/
    module.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(true);

        // Allow blob links in urls
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|file|blob|mailto):|data:image\//);
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
