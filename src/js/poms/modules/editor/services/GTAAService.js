angular.module( 'poms.editor.services' ).factory( 'GTAAService', [
    '$q',
    '$rootScope',
    '$http',
    '$modal',
    "EditorService",
    function ( $q, $rootScope, $http, $modal, editorService) {


        function GTAAService () {
        }


        GTAAService.prototype = {

            init: function () {
            },

            openFunction: function(handleMessage, scheme, item) {
                return function() {
                    gtaa.open(handleMessage, {
                        schemes: scheme,
                        id: item ? item.gtaaUri : null,
                        givenName: item ? item.givenName : null,
                        familyName: item ? item.familyName : null,
                        name: item ? item.name : null,
                        role: item && item.role ? item.role.id : null,
                        jwt: editorService.getCurrentEditor().gtaaJws,
                        jwtExpiration: editorService.getCurrentEditor().gtaaJwsExpiration,
                        iframe: "modal_iframe"
                    });
                }.bind(this);
            },
            modal: function(title, handleMessage, scheme, item) {
                var gtaaPopup =  this.openFunction(handleMessage, scheme, item);

                return $modal.open({
                    controller: "ModalIFrameController",
                    controllerAs: "controller",
                    templateUrl: 'edit/modal-iframe.html',
                    windowClass: 'modal-' + scheme,
                    resolve: {
                        "callback":  function() {
                            return gtaaPopup;
                        },
                        "title": function() {
                            return title;
                        }
                    }
                });
            }
        };


        return new GTAAService();
    }
] );
