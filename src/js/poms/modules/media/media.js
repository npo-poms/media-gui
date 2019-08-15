(function() {

    angular.module('poms.media.services', []);
    angular.module('poms.media.controllers', ['poms.media.services', 'poms.list']);
    angular.module('poms.media.directives', ['poms.media.controllers']);

    angular.module('poms.media', [
        'poms.media.controllers',
        'poms.media.directives'
    ]);

})();
