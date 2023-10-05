angular.module( 'poms.editor.services' ).factory( 'GTAAService', [
    '$q',
    '$rootScope',
    '$http',
    '$uibModal',
    "EditorService",
    function ( $q, $rootScope, $http, $uibModal, editorService) {


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
            handleMessage: function(modal, message, scheme, conceptHandler) {
                if (message.action === 'selected') {
                    concept = message.concept;
                    conceptHandler(concept, message.role);
                } else {
                    console && console.log("ignored because of action", message);
                }
            },
            modal: function(title, scheme, item, conceptHandler) {
                var handle = function(message) {
                    this.handleMessage(modal, message,  scheme, conceptHandler);
                    modal.close();
                }.bind(this);
                var gtaaPopup =  this.openFunction(handle, scheme, item);

                modal= $uibModal.open({
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
