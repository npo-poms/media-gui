describe('SearchFactory', function() {

    var $rootScope,
            $filter,
            listService = {},
            mediaService = {
                hasWritePermission : function() {
                    return true;
                },
                dateConstraintTypes: {
                    'sortDate': 'uitzend-/sorteerdatum:',
                    'lastModifiedDate': 'gewijzigd:',
                    'createdDate': 'aangemaakt:'
                }
            },
            target,
            deferredTypes;

    beforeEach(module('poms.search.services', function($provide) {
        $provide.service('MediaService', function() {
            return mediaService;
        });
        $provide.service('ListService', function() {
            return listService
        });
    }));

    beforeEach(inject(function($q) {
        deferredTypes = $q.defer();

        listService.getMediaTypes = function() {
            return deferredTypes.promise;
        }

    }));

    beforeEach(inject(function(_$rootScope_, _$filter_, SearchFactory) {
        $rootScope = _$rootScope_;
        $filter = _$filter_;
        target = SearchFactory;

        deferredTypes.resolve([
            {id : 'BROADCAST', text : 'Uitzending'},
            {id : 'COLLECTION', text : 'Collectie'},
            {id : 'PLAYLIST', text : 'Speellijst'},
            {id : 'SERIES', text : 'Serie'},
            {id : 'SEASON', text : 'Seizoen'}
        ]);

        $rootScope.$apply();
    }));

    describe("A restricted value", function() {

        it('should test true as a restricted value', function() {
            expect(target.newRestrictedValue().isRestrictedField).toBeTruthy();
        });

        it('should be lenient by default', function() {
            expect(target.newRestrictedValue().strict).toBeFalsy();
        });

        it('should not contain default restrictions', function() {
            expect(target.newRestrictedValue().restriction).toBeUndefined();
        });

        it('should not contain default values', function() {
            expect(target.newRestrictedValue().value).toBeUndefined();
        });

        it('should initialise fields on construction', function() {
            var restriction = target.newRestrictedValue({
                isRestrictedField : false,
                strictstrict : true,
                restriction : 'restriction',
                value : 'value'
            });

            expect(restriction.isRestrictedField).toBeTruthy(); // never set this field!
            expect(restriction.restriction).toBeTruthy();
            expect(restriction.restriction).toEqual('restriction');
            expect(restriction.value).toEqual('value');
        });

        it('should remove value', function() {
            var restriction = target.newRestrictedValue({
                value : [
                    {id : 'a'},
                    {id : 'b'}
                ]
            });

            var success = restriction.remove({id : 'a'});

            expect(success).toBeTruthy();
            expect(restriction.value).not.toContain({id : 'a'});
            expect(restriction.value).toContain({id : 'b'});
        });

        it('should not drain when restricted', function() {
            var restriction = target.newRestrictedValue({
                restriction : [
                    {id : 'a'}
                ],
                value : [
                    {id : 'a'}
                ]
            });

            var success = restriction.remove({id : 'a'});

            expect(success).toBeFalsy();
            expect(restriction.value).toContain({id : 'a'});
        });

        it('should keep all restricted values when strict', function() {
            var restriction = target.newRestrictedValue({
                strict : true,
                restriction : [
                    {id : 'a'},
                    {id : 'b'}
                ],
                value : [
                    {id : 'a'},
                    {id : 'b'}
                ]
            });

            var success = restriction.remove({id : 'a'});

            expect(success).toBeFalsy();
            expect(restriction.value).toContain({id : 'a'});
            expect(restriction.value).toContain({id : 'b'});
        });

        it('should remove non restricted values when strict', function() {
            var restriction = target.newRestrictedValue({
                strict : true,
                restriction : [
                    {id : 'a'},
                    {id : 'b'}
                ],
                value : [
                    {id : 'a'},
                    {id : 'b'},
                    {id : 'c'}
                ]
            });

            var success = restriction.remove({id : 'c'});

            expect(success).toBeTruthy();
            expect(restriction.value).not.toContain({id : 'c'});
        });

    });

    describe("A form", function() {
        it('should display date fields as such', function() {
            expect(target.newForm().dateConstraintTypes).toEqual({
                'sortDate' : 'uitzend-/sorteerdatum:',
                'lastModifiedDate' : 'gewijzigd:',
                'createdDate' : 'aangemaakt:'
            });
        });

        it('should contain a summary', function() {
            expect(target.newForm().summary).toEqual('Geen beperking');
        });

        it('should set a summary', function() {
            expect(target.newForm({summary : 'a'}).summary).toEqual('a');
        });

        it('should contain no text', function() {
            expect(target.newForm().text).toEqual('');
        });

        it('should set a text', function() {
            expect(target.newForm({text : 'a'}).text).toEqual('a');
        });

        it('should contain no types', function() {
            expect(target.newForm().types).toEqual({ strict : false, restriction : undefined, value : [  ] });
        });

        it('should set a type', function() {
            var form = target.newForm({types : {value : [
                {id : 'a'}
            ]}});

            expect(form.types.isRestrictedField).toBeTruthy();
            expect(form.types.value).toEqual([
                {id : 'a'}
            ]);
        });

        it('should contain no broadcasters', function() {
            expect(target.newForm().broadcasters).toEqual([]);
        });

        it('should set a broadcaster', function() {
            var form = target.newForm({broadcasters : [
                {id : 'a'}
            ]});

            expect(form.broadcasters).toEqual([
                {id : 'a'}
            ]);
        });

        it('should contain no portals', function() {
            expect(target.newForm().portals).toEqual([]);
        });

        it('should set a portal', function() {
            var form = target.newForm({portals : [
                {id : 'a'}
            ]});

            expect(form.portals).toEqual([
                {id : 'a'}
            ]);
        });

        it('should contain no channels', function() {
            expect(target.newForm().channels).toEqual([]);
        });

        it('should set a channel', function() {
            var form = target.newForm({channels : [
                {id : 'a'}
            ]});

            expect(form.channels).toEqual([
                {id : 'a'}
            ]);
        });

        it('should contain no avType', function() {
            expect(target.newForm().avType).toBeUndefined();
        });

        it('should set an avType', function() {
            var form = target.newForm({avType : {id : 'AUDIO'}});

            expect(form.avType).toEqual({id : 'AUDIO'});
        });

        it('should contain no createdBy', function() {
            expect(target.newForm().createdBy).toBeUndefined();
        });

        it('should set a createdBy', function() {
            var form = target.newForm({createdBy : {id : 'USER'}});

            expect(form.createdBy).toEqual({id : 'USER'});
        });

        it('should contain no properties', function() {
            expect(target.newForm().properties).toEqual({ strict : false, restriction : undefined, value : [  ] });
        });

        it('should set a property', function() {
            var form = target.newForm({properties : {value : [
                {id : 'a'}
            ]}});

            expect(form.properties.isRestrictedField).toBeTruthy();
            expect(form.properties.value).toEqual([
                {id : 'a'}
            ]);
        });

        it('should contain no tags', function() {
            expect(target.newForm().tags).toEqual([]);
        });

        it('should set a tag', function() {
            var form = target.newForm({tags : [
                {id : 'a'}
            ]});

            expect(form.tags).toEqual([
                {id : 'a'}
            ]);
        });

        it('should contain a sortDate', function() {
            var form = target.newForm();

            expect(form.sortDate).toBeDefined();
            expect(form.sortDate.start).toBeUndefined();
            expect(form.sortDate.stop).toBeUndefined();
        });

        it('should set a sortDate start and stop', function() {
            var form = target.newForm({sortDate : {start : new Date(), stop : new Date()}});

            expect(form.sortDate).toBeDefined();
            expect(form.sortDate.start).toBeDefined();
            expect(form.sortDate.stop).toBeDefined();
        });

        it('should contain a createdDate', function() {
            var form = target.newForm();

            expect(form.createdDate).toBeDefined();
            expect(form.createdDate.start).toBeUndefined();
            expect(form.createdDate.stop).toBeUndefined();
        });

        it('should set a createdDate start and stop', function() {
            var form = target.newForm({createdDate : {start : new Date(), stop : new Date()}});

            expect(form.createdDate).toBeDefined();
            expect(form.createdDate.start).toBeDefined();
            expect(form.createdDate.stop).toBeDefined();
        });

        it('should contain a lastModifiedDate', function() {
            var form = target.newForm();

            expect(form.lastModifiedDate).toBeDefined();
            expect(form.lastModifiedDate.start).toBeUndefined();
            expect(form.lastModifiedDate.stop).toBeUndefined();
        });

        it('should set a lastModifiedDate start and stop', function() {
            var form = target.newForm({lastModifiedDate : {start : new Date(), stop : new Date()}});

            expect(form.lastModifiedDate).toBeDefined();
            expect(form.lastModifiedDate.start).toBeDefined();
            expect(form.lastModifiedDate.stop).toBeDefined();
        });

        it('should have no sortDate date constraint', function() {
            var form = target.newForm();

            expect(form.hasDateConstraint('sortDate')).toBeFalsy();
        });

        it('should have a start date constraint', function() {
            var form = target.newForm({sortDate : {start : new Date()}});

            expect(form.hasDateConstraint('sortDate')).toBeTruthy();
        });

        it('should have a stop date constraint', function() {
            var form = target.newForm({sortDate : {stop : new Date()}});

            expect(form.hasDateConstraint('sortDate')).toBeTruthy();
        });

        it('should return a start date', function() {
            var form = target.newForm({sortDate : {start : new Date()}});

            expect(form.getStartDateConstraint('sortDate')).toBeDefined();
        });

        it('should return a stop date', function() {
            var form = target.newForm({sortDate : {stop : new Date()}});

            expect(form.getStopDateConstraint('sortDate')).toBeDefined();
        });

        it('should clear start an stop', function() {
            var form = target.newForm({sortDate : {start : new Date(), stop : new Date()}});

            form.clearDateConstraint('sortDate')

            expect(form.hasDateConstraint('sortDate')).toBeFalsy();
        });

        it('should clear start', function() {
            var form = target.newForm({sortDate : {start : new Date()}});

            form.clearStartDateConstraint('sortDate')

            expect(form.hasDateConstraint('sortDate')).toBeFalsy();
        });

        it('should clear stop', function() {
            var form = target.newForm({sortDate : {stop : new Date()}});

            form.clearStopDateConstraint('sortDate')

            expect(form.hasDateConstraint('sortDate')).toBeFalsy();
        });

        it('should set start and stop', function() {
            var form = target.newForm();

            form.setDateConstraint('sortDate', new Date(), new Date())

            expect(form.sortDate.start).toBeDefined();
            expect(form.sortDate.stop).toBeDefined();
        });

        it('should apply when default without restrictions', function() {
            var form = target.newForm();

            expect(form.applyRestrictions({})).toBeTruthy();
        });

        it('should apply on matching type restriction', function() {
            var form = target.newForm({
                types : {
                    restriction : [
                        {id : 'BROADCAST'}
                    ]
                }
            });

            expect(form.applyRestrictions({type : {id : 'BROADCAST'}})).toBeTruthy();
        });

        it('should not apply on missing type restriction', function() {
            var form = target.newForm({
                types : {
                    restriction : [
                        {id : 'BROADCAST'}
                    ]
                }
            });

            expect(form.applyRestrictions({type : {id : 'SERIES'}})).toBeFalsy();
        });

        it('should apply on available schedule event', function() {
            var form = target.newForm({
                properties : {
                    restriction : [
                        {id : 'noScheduleEvents'}
                    ]
                }
            });

            expect(form.applyRestrictions({scheduleEvents : [
                {start : new Date()}
            ]})).toBeTruthy();
        });

        it('should not apply on missing schedule event', function() {
            var form = target.newForm({
                properties : {
                    restriction : [
                        {id : 'noScheduleEvents'}
                    ]
                }
            });

            expect(form.applyRestrictions({scheduleEvents : []})).toBeFalsy();
        });

        it('should apply on available memberOf', function() {
            var form = target.newForm({
                properties : {
                    restriction : [
                        {id : 'noMemberOf'}
                    ]
                }
            });

            expect(form.applyRestrictions({memberOf : [
                {midRef : 'VPRO_1234'}
            ]})).toBeTruthy();
        });

        it('should not apply on missing memberOf', function() {
            var form = target.newForm({
                properties : {
                    restriction : [
                        {id : 'noMemberOf'}
                    ]
                }
            });

            expect(form.applyRestrictions({memberOf : []})).toBeFalsy();
        });

        it('should apply on available episodeOf', function() {
            var form = target.newForm({
                properties : {
                    restriction : [
                        {id : 'noEpisodeOf'}
                    ]
                }
            });

            expect(form.applyRestrictions({episodeOf : [
                {midRef : 'VPRO_1234'}
            ]})).toBeTruthy();
        });

        it('should not apply on missing episodeOf', function() {
            var form = target.newForm({
                properties : {
                    restriction : [
                        {id : 'noEpisodeOf'}
                    ]
                }
            });

            expect(form.applyRestrictions({episodeOf : []})).toBeFalsy();
        });

        it('should apply on available locations', function() {
            var form = target.newForm({
                properties : {
                    restriction : [
                        {id : 'withLocations'}
                    ]
                }
            });

            expect(form.applyRestrictions({locations : [
                {programUrl : 'http://some.file'}
            ]})).toBeTruthy();
        });

        it('should not apply on missing location', function() {
            var form = target.newForm({
                properties : {
                    restriction : [
                        {id : 'withLocations'}
                    ]
                }
            });

            expect(form.applyRestrictions({locations : []})).toBeFalsy();
        });

        it('should apply when writable', function() {
            var form = target.newForm({
                properties : {
                    restriction : [
                        {id : 'writable'}
                    ]
                }
            });

            spyOn(mediaService, "hasWritePermission").and.returnValue(true);

            expect(form.applyRestrictions({mid : 'VPRO_12345'})).toBeTruthy();
        });

        it('should not apply when not writable', function() {
            var form = target.newForm({
                properties : {
                    restriction : [
                        {id : 'writable'}
                    ]
                }
            });

            spyOn(mediaService, "hasWritePermission").and.returnValue(false);

            expect(form.applyRestrictions({mid : 'VPRO_12345'})).toBeFalsy();
        });

        it('should rewrite restricted fields', function() {
            var form = target.newForm({
                types : {
                    value : [
                        {id : 'BROADCAST'}
                    ]
                }
            });

            var query = form.getQuery();

            expect(query.types.isRestrictedField).toBeUndefined();
            expect(query.types).toContain({id : 'BROADCAST'});
        });

        it('should rewrite restricted fields', function() {
            var form = target.newForm({
                properties : {
                    restriction : [
                        {id : 'writable'}
                    ]
                }
            });

            var query = form.getQuery();

            expect(query.properties).toBeUndefined();
            expect(query.filters.writable).toBeTruthy();
        });

        it('should build a readable summary', function() {
            var form = target.newForm({
                types : {
                    value : [
                        {id : 'BROADCAST', text : 'Uitzending'}
                    ]
                },
                broadcasters : [
                    {id : 'HUMAN', text : 'Human'}
                ]
            });

            form.buildSummary();

            expect(form.summary).toEqual('Uitzending, Human');
        });

    });

    describe("A search", function() {

        it('should contain an id', function() {
            expect(target.newSearch().id).toBeDefined();
        });

        it('should not be favorite when default', function() {
            expect(target.newSearch().favorite).toBeFalsy();
        });

        it('should have no scope when default', function() {
            expect(target.newSearch().scope).toBeUndefined();
        });

        it('should have no parent when default', function() {
            expect(target.newSearch().parentMid).toBeUndefined();
        });

        it('should be a multi select by default', function() {
            expect(target.newSearch().multiSelect).toBeTruthy();
        });

        it('should allow store when default', function() {
            expect(target.newSearch().allowStore).toBeTruthy();
        });

        it('should contain an empty selection when default', function() {
            expect(target.newSearch().selection).toEqual([]);
        });

        it('should contain a default form', function() {
            expect(target.newSearch().form).toBeDefined();
        });

        it('should override the default', function() {
            var search = target.newSearch({
                id : 3,
                favorite : true,
                scope : 'episodes',
                parentMid : 'VPRO_12345',
                multiSelect : false,
                allowStore : false,
                selection : ['AVRO_888'],
                form : {text : 'search'},
                _backup : {text : 'original'}
            });

            expect(search.id).toEqual(3);
            expect(search.favorite).toBeTruthy();
            expect(search.scope).toEqual('episodes');
            expect(search.parentMid).toEqual('VPRO_12345');
            expect(search.multiSelect).toBeFalsy();
            expect(search.allowStore).toBeFalsy();
            expect(search.selection).toEqual(['AVRO_888']);
            expect(search.form.text).toEqual('search');
            expect(search._backup.text).toEqual('original');

        });

        it('should contain a backup of the initial form when constructed', function() {
            var search = target.newSearch({
                id : 3,
                favorite : true,
                scope : 'episodes',
                parentMid : 'VPRO_12345',
                multiSelect : false,
                allowStore : false,
                selection : ['AVRO_888'],
                form : {text : 'search'}
            });
            expect(search._backup.text).toEqual('search');
        });

        describe("with episodes preset", function() {

            it('should have scope episodes', function() {
                var search = target.newEpisodesSearch({
                    parentMid : 'VPRO_12345'
                });

                expect(search.scope).toEqual('episodes');
            });

            it('should contain restricted type BROADCAST', function() {
                var search = target.newEpisodesSearch({
                    parentMid : 'VPRO_12345'
                });

                expect(search.form.types.value.length).toEqual(1);
                expect(search.form.types.value).toContain({id : 'BROADCAST', text : 'Uitzending'});
            });

            it('should restrict property writable', function() {
                var search = target.newEpisodesSearch({
                    parentMid : 'VPRO_12345'
                });

                //expect(search.form.properties.value.length).toEqual(1);
                //expect(search.form.properties.value).toContain({id : 'writable', text : 'Mag schrijven'});
            });

            it('should add additional configs', function() {
                var search = target.newEpisodesSearch({
                    parentMid : 'VPRO_12345',
                    form : {
                        broadcasters : [
                            {id : 'VPRO', text : 'VPRO'}
                        ]
                    }
                });

                expect(search.form.broadcasters.length).toEqual(1);
                expect(search.form.broadcasters).toContain({id : 'VPRO', text : 'VPRO'});
            });

        });

        describe("with episodeOf preset", function() {

            it('should have scope episodeOf', function() {
                var search = target.newEpisodeOfSearch({
                    parentMid : 'VPRO_12345'
                });

                expect(search.scope).toEqual('episodeOf');
            });

            it('should contain restricted type SERIES, SEASON', function() {
                var search = target.newEpisodeOfSearch({
                    parentMid : 'VPRO_12345'
                });

                expect(search.form.types.value.length).toEqual(2);
                expect(search.form.types.value).toContain({id : 'SERIES', text : 'Serie'}, {id : 'SEASON', text : 'Seizoen'});
            });

            it('should restrict property writable', function() {
                var search = target.newEpisodeOfSearch({
                    parentMid : 'VPRO_12345'
                });

                expect(search.form.properties.value.length).toEqual(1);
                expect(search.form.properties.value).toContain({id : 'writable', text : 'Mag schrijven'});
            });

            it('should add additional configs', function() {
                var search = target.newEpisodeOfSearch({
                    parentMid : 'VPRO_12345',
                    form : {
                        broadcasters : [
                            {id : 'VPRO', text : 'VPRO'}
                        ]
                    }
                });

                expect(search.form.broadcasters.length).toEqual(1);
                expect(search.form.broadcasters).toContain({id : 'VPRO', text : 'VPRO'});
            });

        });

        describe("with members preset", function() {

            it('should have scope members', function() {
                var search = target.newMembersSearch({
                    parentMid : 'VPRO_12345'
                });

                expect(search.scope).toEqual('members');
            });

            it('should add additional configs', function() {
                var search = target.newMembersSearch({
                    parentMid : 'VPRO_12345',
                    form : {
                        broadcasters : [
                            {id : 'VPRO', text : 'VPRO'}
                        ]
                    }
                });

                expect(search.form.broadcasters.length).toEqual(1);
                expect(search.form.broadcasters).toContain({id : 'VPRO', text : 'VPRO'});
            });

        });

        describe("with memberOf preset", function() {

            it('should have scope memberOf', function() {
                var search = target.newMemberOfSearch({
                    parentMid : 'VPRO_12345'
                });

                expect(search.scope).toEqual('memberOf');
            });

            it('should restrict property writable', function() {
                var search = target.newMemberOfSearch({
                    parentMid : 'VPRO_12345'
                });

                expect(search.form.properties.value.length).toEqual(1);
                expect(search.form.properties.value).toContain({id : 'writable', text : 'Mag schrijven'});
            });

            it('should add additional configs', function() {
                var search = target.newMemberOfSearch({
                    parentMid : 'VPRO_12345',
                    form : {
                        broadcasters : [
                            {id : 'VPRO', text : 'VPRO'}
                        ]
                    }
                });

                expect(search.form.broadcasters.length).toEqual(1);
                expect(search.form.broadcasters).toContain({id : 'VPRO', text : 'VPRO'});
            });

        });

        describe("with merge preset", function() {

            it('should have scope merge', function() {
                var search = target.newMergeSearch({id : 'SEASON', text : 'Seizoen'});

                expect(search.scope).toEqual('merge');
            });

            it('should not allow store', function() {
                var search = target.newMergeSearch({id : 'SEASON', text : 'Seizoen'});

                expect(search.allowStore).toBeFalsy();
            });

            it('should set restricted type', function() {
                var search = target.newMergeSearch({id : 'SEASON', text : 'Seizoen'});

                expect(search.form.types.value.length).toEqual(1);
                expect(search.form.types.value).toContain({id : 'SEASON', text : 'Seizoen'});
            });

            it('should restrict property writable', function() {
                var search = target.newMergeSearch({id : 'SEASON', text : 'Seizoen'});

                expect(search.form.properties.value.length).toEqual(1);
                expect(search.form.properties.value).toContain({id : 'writable', text : 'Mag schrijven'});
            });

            it('should add additional configs', function() {
                var search = target.newMergeSearch({id : 'SEASON', text : 'Seizoen'}, {
                    parentMid : 'VPRO_12345',
                    form : {
                        broadcasters : [
                            {id : 'VPRO', text : 'VPRO'}
                        ]
                    }
                });

                expect(search.form.broadcasters.length).toEqual(1);
                expect(search.form.broadcasters).toContain({id : 'VPRO', text : 'VPRO'});
            });

        });

    });

});
