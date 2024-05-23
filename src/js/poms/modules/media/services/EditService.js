angular.module( 'poms.media.services' ).factory( 'EditService', [
    'MediaService',
    function ( mediaService ) {

        function EditService () {
        }

        EditService.prototype = {
            // Talking about of boiler plate code....

            hasReadPermission: function ( media, field) {
                return mediaService.hasReadPermission( media, field);
            },

            hasWritePermission: function ( media, field ) {
                return mediaService.hasWritePermission( media, field );
            },

            setTitle: function ( media, type, text ) {
                return mediaService.setTitle( media, type, text );
            },


            setDescription: function ( media, type, text ) {
                return mediaService.setDescription( media, type, text );
            },

            broadcasters: function ( media, broadcasters ) {
                return mediaService.setBroadcasters( media, broadcasters );
            },

            countries: function ( media, countries ) {
                return mediaService.setCountries( media, countries );
            },

            languages: function ( media, languages ) {
                return mediaService.setLanguages( media, languages );
            },

            portals: function ( media, portals ) {
                return mediaService.setPortals( media, portals );
            },

            avType: function ( media, avType ) {
                return mediaService.setAvType( media, avType );
            },
            type: function ( media, type ) {
                return mediaService.setType( media, type );
            },


            publication: function ( media, publication ) {
                return mediaService.setPublication( media, publication );
            },

            duration: function ( media, duration ) {
                return mediaService.setDuration( media, duration );
            },

            year: function ( media, year ) {
                return mediaService.setYear( media, year );
            },

            embeddable: function ( media, boolean ) {
                return mediaService.setEmbeddable( media, boolean );
            },
            adoptQualityFromPlus: function ( media, value) {
                return mediaService.setAdoptQualityFromPlus( media, value );
            },

            isDubbed: function (media, boolean) {
                return mediaService.setIsDubbed(media, boolean);
            },

            ageRating: function ( media, ageRating ) {
                return mediaService.setAgeRating( media, ageRating );
            },

            contentRatings: function ( media, contentRatings ) {
                return mediaService.setContentRatings( media, contentRatings );
            },

            genres: function ( media, genres ) {
                return mediaService.setGenres( media, genres );
            },

            intentions: function ( media, intentions ) {
                return mediaService.setIntentions( media, intentions );
            },

            targetGroups: function ( media, targetGroups ) {
                return mediaService.setTargetGroups( media, targetGroups );
            },

            tags: function ( media, tags ) {
                return mediaService.setTags( media, tags );
            },

            geoRestrictions: function ( media, geoRestrictions ) {
                return mediaService.setGeoRestrictions( media, geoRestrictions );
            },

            portalRestrictions: function ( media, portalRestrictions ) {
                return mediaService.setPortalRestrictions( media, portalRestrictions );
            },

            credits: function ( media, credits ) {
                return mediaService.setCredits( media, credits );
            },

            websites: function ( media, websites ) {
                return mediaService.setWebsites( media, websites );
            },

            mainTitle: function ( media, text ) {
                return this.setTitle( media, 'MAIN', text );
            },

            subTitle: function ( media, text ) {
                return this.setTitle( media, 'SUB', text );
            },

            shortTitle: function ( media, text ) {
                return this.setTitle( media, 'SHORT', text );
            },

            abbreviationTitle: function ( media, text ) {
                return this.setTitle( media, 'ABBREVIATION', text );
            },

            workTitle: function ( media, text ) {
                return this.setTitle( media, 'WORK', text );
            },

            originalTitle: function ( media, text ) {
                return this.setTitle( media, 'ORIGINAL', text );
            },

            lexicoTitle: function ( media, text ) {
                return this.setTitle( media, 'LEXICO', text );
            },

            mainDescription: function ( media, text ) {
                return this.setDescription( media, 'MAIN', text );
            },

            subDescription: function ( media, text ) {
                return this.setDescription( media, 'SUB', text );
            },

            shortDescription: function ( media, text ) {
                return this.setDescription( media, 'SHORT', text );
            },

            kickerDescription: function ( media, text ) {
                return this.setDescription( media, 'KICKER', text );
            },



        };

        return new EditService();
    }
] );
