describe('EditController', function() {

    var $q,
        $rootScope,
        $scope,
        $modal = {},
        $sce,
        editorService = {},
        guiService = {},
        listService = {},
        mediaService = {},
        searchFactory = {},
        searchService = {},
        deferredOptions,
        target;

    beforeEach(module('poms.media.controllers', function($provide) {
    }));

    beforeEach(inject(function($q) {
        deferredOptions = $q.defer();

        editorService.getAllowedBroadcasters = function() {
            return deferredOptions.promise;
        };
        editorService.getAllowedPortals = function() {
            return deferredOptions.promise;
        };
        listService.getMediaTypes = function() {
            return deferredOptions.promise;
        };
        listService.getAgeRatings = function() {
            return deferredOptions.promise;
        };
        listService.getContentRatings = function() {
            return deferredOptions.promise;
        };
        listService.getAvTypes = function() {
            return deferredOptions.promise;
        };
        listService.getChapterTypes = function() {
            return deferredOptions.promise;
        };
        listService.getBroadcasters = function() {
            return deferredOptions.promise;
        };
        listService.getPortals = function() {
            return deferredOptions.promise;
        };
        listService.getChannels = function() {
            return deferredOptions.promise;
        };
        listService.getTags = function() {
            return deferredOptions.promise;
        };
        listService.getUsers = function() {
            return deferredOptions.promise;
        };
        listService.getPersonRoles = function() {
            return deferredOptions.promise;
        };
        listService.getRegions = function() {
            return deferredOptions.promise;
        };
        listService.getCountries = function() {
            return deferredOptions.promise;
        };
        listService.getLanguages = function() {
            return deferredOptions.promise;
        };
        listService.getPlatforms = function() {
            return deferredOptions.promise;
        };
        listService.getPriorityTypes = function() {
            return deferredOptions.promise;
        };
        listService.getEncryptionTypes = function() {
            return deferredOptions.promise;
        };
        listService.getSubtitlesTypes = function () {
            return deferredOptions.promise;
        }
    }));

    beforeEach(inject(function(_$rootScope_, _$q_, _$sce_, $controller) {
        $q = _$q_

        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();

        $sce = _$sce_;

        target = $controller('EditController', {
            '$scope' : $scope,
            '$modal' : $modal,
            '$sce' : $sce,
            'PomsEvents' : {'error' : 'error'},
            'EditorService' : editorService,
            'GuiService' : guiService,
            'ListService' : listService,
            'MediaService' : mediaService,
            'SearchFactory' : searchFactory,
            'SearchService' : searchService
        });

        deferredOptions.resolve([
            {id : 'ID1', text : 'Type 1'},
            {id : 'ID2', text : 'Type 2'},
            {id : 'ID3', text : 'Type 3'}
        ]);

        _$rootScope_.$apply();
    }));

    describe("user option lists", function() {

        it('should contain the allowed broadcasters', function() {
            expect(target.allowedBroadcasters).toBeDefined();
            expect(target.allowedBroadcasters.length).toEqual(3);
        });

        it('should contain the allowed portals', function() {
            expect(target.allowedPortals).toBeDefined();
            expect(target.allowedPortals.length).toEqual(3);
        });

    });

    describe("default option lists", function() {

        it('should contain the broadcasters', function() {
            expect(target.broadcasters).toBeDefined();
            expect(target.broadcasters.length).toEqual(3);
        });

        it('should contain the portals', function() {
            expect(target.portals).toBeDefined();
            expect(target.portals.length).toEqual(3);
        });

        it('should contain the av types', function() {
            expect(target.avTypes).toBeDefined();
            expect(target.avTypes.length).toEqual(3);
        });

        it('should contain the age ratings', function() {
            expect(target.ageRatings).toBeDefined();
            expect(target.ageRatings.length).toEqual(3);
        });

        it('should contain the content ratings', function() {
            expect(target.contentRatings).toBeDefined();
            expect(target.contentRatings.length).toEqual(3);
        });

        it('should contain the personRoles', function() {
            expect(target.personRoles).toBeDefined();
            expect(target.personRoles.length).toEqual(3);
        });

        it('should contain the regions', function() {
            expect(target.regions).toBeDefined();
            expect(target.regions.length).toEqual(3);
        });


        it('should contain the languages', function() {
            expect(target.languages).toBeDefined();
            expect(target.languages.length).toEqual(3);
        });

        it('should contain the countries', function() {
            expect(target.countries).toBeDefined();
            expect(target.countries.length).toEqual(3);
        });
    });

});
