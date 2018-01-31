(function() {

    angular.module('poms.admin.services', []);
    angular.module('poms.admin.controllers', [
        'poms.admin.services'
    ]);

    angular.module('poms.admin', [
        'poms.admin.controllers'
    ]);

})();
