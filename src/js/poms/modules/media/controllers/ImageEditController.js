angular.module( 'poms.media.controllers' ).controller( 'ImageEditController', [
    '$scope',
    '$modal',
    '$modalInstance',
    '$upload',
    '$sce',
    '$timeout',
    'appConfig',
    'PomsEvents',
    'imageTypes',
    'licenses',
    'media',
    'image',
    'edit',
    'service',
    (function () {

        function isValid ( image ) {
            return image.title !== undefined &&
                image.title !== '' &&
                image.title.length <= 255 &&
                image.description !== undefined &&
                image.description !== '' &&
                image.type !== undefined &&
                (( image.file && image.file[0]) || image.uri || (image.uploadurl !== undefined && image.uploadurl.length > 0))
        }

        function hasValidCredits ( image ) {
            return !!(
                image.credits && image.credits !== '' &&
                image.license && image.license !== '' &&
                image.sourceName && image.sourceName !== ''
            );
        }

        function ImageEditController ( $scope, $modal, $modalInstance, $upload, $sce, $timeout, appConfig, PomsEvents, imageTypes, licenses, media, image, edit, service ) {

            this.$scope = $scope;
            this.$modal = $modal;
            this.$modalInstance = $modalInstance;
            this.$upload = $upload;
            this.$sce = $sce;
            this.$timeout = $timeout;
            this.imagesapihost = appConfig.imagesapihost;
            this.apihost   = appConfig.apihost;

            this.pomsEvents = PomsEvents;

            this.service = service;

            this.resetValue = angular.copy( image );

            image.publication = image.publication || {};

            $scope.imageTypes = imageTypes;
            $scope.licenses = licenses;
            $scope.image = image;
            $scope.media = media;

            $scope.edit = edit;

            if ( $scope.edit ) {
                $scope.modalTitle = "Afbeelding bewerken";
                $scope.submitText = "bewaar";
            } else {
                $scope.modalTitle = "Afbeelding toevoegen";
                $scope.submitText = "Maak aan";
            }

            $scope.required = [
                {'id': 'title', 'text': 'Titel'},
                {'id': 'type', 'text': 'Afbeeldingtype'},
                {'id': 'description', 'text': 'Beschrijving'},
                {'id': 'file', 'text': 'Bestand'}

            ];

            $scope.uploadImageFormValid = false;

            this.$scope.$watch( 'image.file', function ( newValue ) {

                if ( newValue && newValue[0] && ! newValue[0].name.match( /\.(jpg|jpeg|png|gif)$/i ) ) {

                    alert( 'dit bestand is geen afbeelding' );

                    this.$timeout( function(){
                        this.$scope.image.file = undefined;
                    }.bind(this),0);
                }
            }.bind( this ) );

            this.$scope.$watch('image.uploadurl', function (newValue) {
                if (newValue && (newValue.startsWith('http:') || newValue.startsWith("https:"))) {
                    this.metaData();
                } else {
                    this.setPreview('');
                }
            }.bind(this));


            this.$scope.$watchCollection( 'image', function ( newValue ) {

                if ( newValue && newValue.file && newValue.file[0]  ) {

                    var reader = new FileReader();
                    reader.onload = function ( e ) {
                        this.$scope.$apply( function(){
                            this.setPreview(e.target.result);
                        }.bind( this ));

                    }.bind( this );

                    reader.readAsDataURL( newValue.file[0] );

                }

                $scope.uploadImageFormValid = isValid( newValue, $scope );

            }.bind( this ) );
        }

        ImageEditController.prototype = {

            violations: {},

            cancel: function ( e ) {
                if ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                angular.copy( this.resetValue, this.$scope.image );
                this.$modalInstance.dismiss();
            },

            formatDate: function(millis) {
                var date = new Date(millis);
                return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
            },

            openBrowse: function () {
                if ( ! this.inputElement ) {
                    this.inputElement = angular.element( '#inputFile' );
                }

                this.$timeout( function () {
                    // ugly hack to make sure the input field is always clear and ready to accept new file
                    this.inputElement.replaceWith( this.inputElement = this.inputElement.clone( true ) );
                    this.inputElement.trigger( 'click' );
                }.bind(this), 0, false )

            },
            clearForm: function() {
                this.$scope.image.title = "";
                this.$scope.image.description = "";
                this.$scope.image.credits = "";
                this.$scope.image.source = "";
                this.$scope.image.sourceName = "";
                this.$scope.image.license = "";
                this.$scope.image.date = "";
                this.metaData();
            },
            clearUpload : function() {
                this.$scope.image.file = null;
                this.setPreview('');
            },
            setPreview: function(src) {
                var image = $.find('#previewimage')[0];
                if (image) {
                    image.src = src;
                }
            },


            isFieldMissing: function( field ){
                return (!this.$scope.image[field.id] && field.id !== 'file') || (field.id === 'file' && !this.$scope.image.uri && typeof(image) !== 'undefined' && !image[field.id]);
            },

            // MSE-3429 - For now, the image editor will show a warning when credits are invalid
            // In the future these will be mandatory.
            preSave: function () {
                var modal;
                var image = this.$scope.image;

                if ( hasValidCredits( image ) ) {
                    this.save();
                } else {

                    modal = this.$modal.open( {
                        controller: 'ConfirmController',
                        controllerAs: 'controller',
                        templateUrl: 'util/confirm.html',
                        windowClass: 'modal-confirm',
                        resolve: {
                            title: function () {
                                return 'Let op!';
                            },
                            message: function () {
                                return ''.concat( 'Bij uploaden van foto\'s moeten de rechten altijd verkregen zijn. ',
                                                    'Daarnaast kan het niet correct invullen van onderstaande gegevens leiden tot claims van de rechthebbenden. ',
                                                    'Lees <a href="http://wiki.publiekeomroep.nl/display/poms/Gebruikersdocumentatie#Gebruikersdocumentatie-4.3Afbeeldingen" target="_blank">hier</a> ',
                                                    'meer over het correcte gebruik.');
                            },
                            cancel: function () {
                                return 'annuleer';
                            },
                            submit: function () {
                                return 'begrepen';
                            }
                        }
                    } );

                    modal.result.then(
                        function () {
                            this.save();
                        }.bind( this ),
                        function () {

                        }.bind( this )
                    );

                }
            },
            fields: function() {
                var image = this.$scope.image;
                return  {
                    title: image.title,
                    description: image.description,
                    imageType: image.type ? image.type.id : undefined,
                    credits: image.credits,
                    source: image.source,
                    sourceName: image.sourceName,
                    license: ( image.license && image.license.id ) ? image.license.id : undefined,
                    date: image.date,
                    highlighted: image.highlighted,
                    publishStart: image.publication.start ? this.formatDate(image.publication.start) : undefined,
                    publishStop: image.publication.stop ? this.formatDate(image.publication.stop) : undefined,
                    url: image.uploadurl
                };

            },
            metaData: function() {
                $.find('#uploaderror')[0].innerHTML = "";
                $.find('#uploadinfo')[0].innerHTML = "";
                this.setPreview('');
                this.$upload.upload({
                    url: this.imagesapihost + "/images/metadata",
                    method: 'POST',
                    fields: this.fields()
                }).then(
                    function (extResult) {
                        var metadata = extResult.data;
                        $.find('#uploadinfo')[0].innerHTML = "Een plaatje gevonden met grootte " + metadata.width + "x" + metadata.height + " van " + metadata.size + " bytes";
                        angular.extend(this.$scope.image, {
                            title: metadata.title,
                            description: metadata.description,
                            height: metadata.height,
                            width: metadata.width,
                            license: metadata.license,
                            source: metadata.source,
                            sourceName: metadata.sourceName,
                            date: metadata.date,
                            credits: metadata.credits


                        });
                        this.setPreview(this.imagesapihost + "/images/thumb/" + metadata.uploadId);
                    }.bind(this),
                    function (error) {
                        mes = error.statusText;
                        if (error.data && error.data.message) {
                            mes += ' ' + error.data.message;
                        }
                        $.find('#uploaderror')[0].innerHTML = mes;
                    }.bind(this)
                )

            },



            save: function () {

                this.$scope.waiting = true;

                // Uploading is a two step process:
                // - First the image is uploaded to the image server (running on /images).
                // - Second the returned urn from the image server is submitted to Poms with all other meta-data.

                // We are using the legacy ext-js upload from the image server with a multipart-form upload
                var image = this.$scope.image;

                if ( image.publication && image.publication.start ) {
                    image.publication.start = new Date( image.publication.start ).getTime();
                }

                if ( image.publication && image.publication.stop ) {
                    image.publication.stop = new Date( image.publication.stop ).getTime();
                }

                //MGNL-2923 // prevent saving of publication stop time before publication start time
                if ( image.publication.stop && image.publication.start && (image.publication.stop < image.publication.start) ){
                    image.publication.stop = image.publication.start;
                }

                var saveUploadedImage = function () {

                    this.service.saveImage( this.$scope.media, this.$scope.image ).then(
                        function ( media ) {
                            this.$modalInstance.close( media );
                            this.$scope.waiting = false;
                        }.bind( this ),
                        function ( error ) {
                            this.$scope.waiting = false;
                            if ( error.status === 400 && error.violations ) {
                                this.violations = error.violations;
                            } else {
                                this.$scope.$emit( this.pomsEvents.error, error )
                            }
                        }.bind( this )
                    )
                }.bind( this );

                // Prevent double uploads
                if ( this.$scope.image.uri ) {
                    // Image uploaded to image server already, but there probably were validation errors when submitting to Poms
                    saveUploadedImage();
                } else {
                    var fields = this.fields();

                    // Image not uploaded to image server yet
                    // first get one image from the image server (see MSE-2920)


                    var uploadFunction = function () {

                        this.$upload.upload({
                            url: this.imagesapihost + "/images/upload",
                            method: 'POST',
                            fields: fields,
                            file: image.file && image.file.length > 0 ? image.file[0] : undefined,
                            fileFormDataName: 'file'
                        }).then(
                            function (extResult) {
                                var uploaded = extResult.data.list[0];

                                angular.extend(this.$scope.image, {
                                    uri: uploaded.urn,
                                    height: uploaded.height,
                                    width: uploaded.width
                                });

                                saveUploadedImage();
                            }.bind(this),
                            function (error) {
                                this.$scope.$emit(this.pomsEvents.error, error);
                                this.$scope.waiting = false;

                            }.bind(this)
                        )

                    }.bind(this);
                    // eerst een plaatje voor de zekerheid, dat de sessie maar leeft! (MSE-2920)
                    var imageObject = new Image();
                    imageObject.onload = uploadFunction;
                    imageObject.src = this.apihost + "/images/icons/arrow-up.gif";
                }
            },


            trustAsHtml: function ( value ) {
                return this.$sce.trustAsHtml( value );
            }

        };

        return ImageEditController;
    }())
] );
