if (typeof (window.nl_vpro_media_poms_domain) === 'undefined' ) { // would have been filled by media.js.jspx if running on actual deployment
    window.nl_vpro_media_poms_domain = document.currentScript ? new URL(document.currentScript.src).origin : '';
    console && console.log("No window.nl_vpro_media_poms_domain, taking it ", window.nl_vpro_media_poms_domain);
}

const nl_vpro_media_CMSSelector = {
    popupFeatures: 'width=1024,height=800,titlebar=no,toolbar=no,statusbar=no,directories=no,location=no',

    select: function ( callback, options ) {
        const domain = window.nl_vpro_media_poms_domain;
        let popup;
        let iframe;

        let query = '';

        if ( options ) {
            for (let i in options ) {
                let value = options[ i ];
                if (value !== undefined &&  value !== '' && value != null && value !== false ) {
                    query += ( query.length ? '&' : '?') + i + '=' + value;
                }
            }
        }
        function handleMessage ( e ) {
            if ( e.origin === domain || domain === '') {
                callback( e.data );
                if (popup) {
                    popup.close();
                }
                if (iframe) {
                    iframe.parentNode.removeChild( iframe );
                }
            } else {
                console && console.log("Ignoring since", e.origin, "!=", domain);
            }
            handleClose();
        }

        function handleClose() {
            if (window.removeEventListener) {
                window.removeEventListener('message', handleMessage);
            } else if (window.detachEvent) {
                window.detachEvent('message', handleMessage);
            }
        }

        { // add event listener
            if (window.addEventListener) {
                window.addEventListener('message', handleMessage, false);
            } else if (window.attachEvent) {
                window.attachEvent('message', handleMessage, false);
            }
        }

        if ( document.all ) {
            // some hackery to help IE, because in IE you may not post to other window, only from an iframe.
            iframe = document.createElement( 'iframe' );
            iframe.setAttribute( 'style', 'position:absolute;display:none' );
            iframe = document.body.appendChild( iframe );
            iframe.src = domain + '/CMSSelector/IE.html' + query;
        } else {
            popup = window.open( domain + '/CMSSelector/' + query, '', nl_vpro_media_CMSSelector.popupFeatures);
            var timer = setInterval(function() {
                if (popup.closed) {
                    clearInterval(timer);
                    handleClose();
                    //console.log("Closed", popup);
                }
            }, 1000);
        }
    },
    /**
     * Utility to get multiple values from a select element
     */
    getMultiple: function(id) {
        const multipleType = document.getElementById(id);
        const values = [];
        for (let i = 0; i < multipleType.options.length; i++) {
            if (multipleType.options[i].selected) {
                values.push(multipleType.options[i].value);
            }
        }
        return values;
    },
    fillOptions: function(el, options) {
         options.forEach(function (option) {
             const optionElement = document.createElement('option');
             optionElement.value = option.id;
             optionElement.innerHTML = option.text;
             el.appendChild(optionElement);
         });
    },
    /**
     *
     * Dynamically resolve the current mediatypes. (supported from api 7.8)
     * @return a promise that resolves to an array of mediatypes json objects, or if a select element is provided, fill that with options.
     */
    getMediaTypes: function(el) {
        return new Promise((resolve, reject) => {
            if (el) {
                this.getMediaTypes().then(function (mediaTypes) {
                    this.fillOptions(el, mediaTypes);
                }.bind(this))
                    .then(resolve, reject);
            } else {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", "https://rs.poms.omroep.nl/v1/schema/enum/MediaType.json", true);
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.statusText);
                    }
                };
                xhr.send();
            }
        });
    },

    /**
     * Dynamically resolve the current broadcasters.
     * @return a promise that resolves to an array of broadcaster json objects.
     */
    getBroadcasters: function(el) {
        return new Promise((resolve, reject) => {
            if (el) {
                this.getBroadcasters().then(function (broadcasters) {
                    this.fillOptions(el, broadcasters);
                }.bind(this)).then(resolve, reject);
            } else {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", window.nl_vpro_media_poms_domain + "/broadcasters/CSV", true);
                //xhr.open("GET", "http://michiel.vpro.nl:8071/broadcasters/CSV", true);
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        let lines = xhr.response.split(/[\n\r]+/);
                        let broadcasters = [];
                        for (let i = 1; i < lines.length; i++) {
                            let line = lines[i];
                            let split = line.split(",");
                            if (split.length === 6) {
                                broadcasters.push({
                                    id: split[0].trim(),
                                    text: split[2].trim(),
                                    domain: split[3].trim(),
                                    from: split[4].trim(),
                                    to: split[5].trim()
                                });
                            }
                        }
                        resolve(broadcasters);
                    } else {
                        reject(xhr.statusText);
                    }
                };
                xhr.send();
            }
        });
    }
};
