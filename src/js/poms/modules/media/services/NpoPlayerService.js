angular.module( 'poms.media.services' ).factory('NpoPlayerService',
    function ( $http, $q, appConfig) {

        baseUrl = appConfig.apihost + '/gui/npoplayer/request';
        var NpoPlayerService = function () {};

        NpoPlayerService.prototype = {
            /*
            */


            play: function (mid, midOrParent, options) {
                options = options || {};
                var deferred = $q.defer();
                $http({
                    method : 'POST',
                    url : baseUrl,
                    headers: {
                        "Accept": "application/json"
                    },
                    data: {
                        mid: midOrParent,
                        id: "player-" + mid,
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
                    function(resp){
                        var embedCode = resp.data.embedCode;
                        $("#viewer-" + mid + " div.viewer-placeholder").replaceWith(embedCode);
                        $("#viewer-" + mid).addClass("playing");
                    }
                );

                return deferred.promise;
            }
        };

        return new NpoPlayerService();
    }
);
