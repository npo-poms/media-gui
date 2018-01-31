(function() {

    angular.module('poms.messages.services',[]);
    angular.module('poms.messages.controllers',['poms.messages.services']);
    angular.module('poms.messages', ['poms.messages.controllers']);

})();
