angular.module( 'poms.media.services' ).factory('NpoPlayerService',
    function ( $http, $q, appConfig) {

        baseUrl = appConfig.apihost + '/gui/npoplayer/request';
        var NpoPlayerService = function () {};

        NpoPlayerService.prototype = {
            /*
            */


            play: function (mid, target, options) {
                options = options || {};
                var deferred = $q.defer();
                $http({
                    method : 'POST',
                    url : baseUrl,
                    headers: {
                        "Accept": "application/json"
                    },
                    data: {
                        mid: mid,
                        id: null,
                        autoplay: true,
                        startAt: options.start,
                        endAt: options.end,
                        noAds: true,
                        subtitleLanguage: "nl",
                        sterReferralUrl: null,
                        sterSiteId: null,
                        sterIdentifier : null,
                        hasAdConsent:  true,
                        pageUrl: null,
                        atInternetSiteId: null
                    }
                }).then(
                    function(data){
                        var embedCode = data.embedCode;
                        target.replaceItem()

                    }
                );

                return deferred.promise;
            }
        };

        return new NpoPlayerService();
    }
);
