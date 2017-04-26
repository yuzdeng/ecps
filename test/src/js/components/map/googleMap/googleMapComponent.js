;define('components/map/googleMap/googleMapComponent', function (require, exports, module) {
    var googleMapComponentApp = {
        defaults: {
            latitude: 37.09024,
            longitude: -95.712891,
            zoom: 15, //street level
            disableDefaultUI: true,
            panControl: true,
            zoomControl: true,
            latLngByCountry: {
                'US': {
                    latitude: 37.09024,
                    longitude: -95.712891
                }
            },
            locale: {
                country: i18n['contact.field.address.country'],
                city: i18n['contact.field.address.city'],
                state: i18n['contact.field.address.stateProvince'],
                address: i18n['contact.field.address'],
                postalCode: i18n['contact.field.address.postalCode'],
                latitude: i18n['contact.field.address.gisLocation.lat'],
                longitude: i18n['contact.field.address.gisLocation.lon'],
                currentLocation: i18n['gmap.lable.currentLocation'],
                limitedArea: i18n['gmap.info.limitedArea'],
                loadMarkerFail: i18n['gmap.info.loadMarkerFail'],
                loadMarkerError: i18n['gmap.info.loadMarkerError'],
                confirmContent: i18n['gmap.info.confirmContent'],
                selectedAddress: i18n['gmap.info.selectedAddress'],
                confirmTitle: i18n['global.dialog.title.confirm'],
                hints: i18n['gmap.info.hints'],
                geoCoordinates: i18n['gmap.info.geoCoordinates'],
                enterAddress: i18n['gmap.info.enterAddress']
            }
        },
        getInstance: function(config) {
            var me = this;
            config = config || {};
            this.settings = $.extend(true, {}, this.defaults, config);
            this.preLoadGoogleMapApi(function(){
                me.init();
            });
        },
        init: function() {
            // info window object
            this.infoWindow = new google.maps.InfoWindow({
                //pixelOffset: new google.maps.Size(15, 10)
            });
            this.geocoder = new google.maps.Geocoder();
            // Add an overlay that looks like a bubble for a marker
            var locale = this.settings.locale;
            //init template
            var htmlTmpl = '<div class="map-window-info">\
                  <h4 class="map-window-title">' + locale.currentLocation + '</h4>\
                  <hr>\
                  <p class="bold">' + locale.geoCoordinates + ':</p>\
                  <dl class="map-marker-info">\
                    <dt>' + locale.latitude + '</dt>\
                    <dd>${latitude}</dd>\
                    <dt>' + locale.longitude + '</dt>\
                    <dd>${longitude}</dd>\
                  </dl>\
                  <p class="bold font-gray">' + locale.enterAddress + ':</p>\
                  <p class="font-gray margin5-T" style="max-width: 500px;">${enterAddress}</p>\
                </div>';
            $.template('bubbleMarker', htmlTmpl);
            this.createMap();
        },

        // create map
        createMap: function(settings) {
            if (settings) {
                this.setDefaults(settings);
            }
            var me = this;
            $('#map_canvas').remove();
            $('body').append('<div id="map_canvas" style="width:1000px; height:600px"></div>');
            var settings = this.settings;
            var mapOptions = {
                zoom: settings.zoom,
                center: new google.maps.LatLng(settings.latitude, settings.longitude),
                disableDefaultUI: settings.disableDefaultUI,
                panControl: settings.panControl,
                zoomControl: settings.zoomControl,
                mapTypeId: settings.mapTypeId || google.maps.MapTypeId.ROADMAP
            };

            $('#map_canvas').dialog({
                width: 1000,
                title: i18n['gmap.button.location'],
                height: 700,
                resizable: false,
                modal: true,
                draggable: true,
                zIndex: 2300,
                buttons: {
                    Ok: {
                        click: function() {
                            me.isWrite = true;
                            $(this).dialog('close');
                        },
                        'class': 'orange',
                        text: i18n['gmap.button.useLocation']
                    },
                    Cancel: {
                        click: function() {
                            $(this).dialog('close');
                        },
                        'class': 'gray',
                        text: 'Cancel'
                    }
                },
                close: function(){
                    me.closeGoogleMap();
                    $(this).dialog('destroy');
                }
            });

            this.customMap = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
            $('#map_canvas').dialog('open');
            if (this.settings.regions) {
                this.addMarker(this.settings.regions);
            }
        },
        setDefaults: function(settings) {
            if (!settings) {
                return;
            }
            $.extend(this.settings, settings);
        },
        // add market
        /*
         * @param: region json
         * @param : region.isAddress When the value is true, we create marker for address, otherwise for latlng.The default is false.
         */
        addMarker: function(region) {
            var limits = this.settings.limits,
                me = this,
                latLog = this.settings.latLngByCountry[limits],
                limitedArea = this.settings.locale.limitedArea,
                loadMarkerFail = this.settings.locale.loadMarkerFail,
                loadMarkerError = this.settings.locale.loadMarkerError,
                loadMarker = function (results, status) {
                    if(status === google.maps.GeocoderStatus.ERROR){
                        alert(loadMarkerError);
                        me.removeMarker(me.currentMarker);
                        me.infoWindow.close();
                        $('#map_canvas').dialog('close');
                        return;
                    }
                    if (limits && me.isBeyondLimits(results ? results[0] : null, limits)) {
                        alert(limitedArea);
                        me.removeMarker(me.currentMarker);
                        me.infoWindow.close();
                        $('#map_canvas').dialog('close');
                        return;
                    }

                    if (status != google.maps.GeocoderStatus.OK || !results[0]) {
                        if (region.isAddress === true) {
                            alert(loadMarkerFail);
                            me.removeMarker(me.currentMarker);
                            me.infoWindow.close();
                            $('#map_canvas').dialog('close');
                            return;
                        } else {
                            me.setMarker(region.latitude, region.longitude, region.locationName);
                        }
                    } else {
                        if (region.isAddress === true) {
                            var latlng = results[0].geometry.location;
                            me.setMarker(latlng.lat(), latlng.lng(), region.locationName, results[0]);
                        }else{
                            me.setMarker(region.latitude, region.longitude, region.locationName, results[0]);
                        }
                    }
                };

            if (region.isAddress === true) {
                this.geocoder.geocode({
                    'address': region.enterAddress
                }, loadMarker);
            } else {
                this.geocoder.geocode({
                    'latLng': new google.maps.LatLng(region.latitude, region.longitude)
                }, loadMarker);
            }
        },

        setMarker: function (latitude, longitude, locationName, results) {
            var me = this;
            var markerData = this.getMarkerInfo(results, latitude, longitude);
            var latlng = new google.maps.LatLng(latitude, longitude),
                marker = new google.maps.Marker({
                    position: latlng
                });
            marker.setMap(this.customMap);
            marker.setTitle(locationName || '');
            marker.setDraggable(true);
            google.maps.event.addListener(marker, 'dragstart', function () {
                me.infoWindow.close();
            });
            google.maps.event.addListener(marker,
                'dragend', function () {
                    me.adjustLatLng(this);
                });
            this.currentMarker = marker;
            //Record latitude and longitude
            this.currentLat = latlng.lat();
            this.currentLng = latlng.lng();
            this.markerData = $.extend({}, markerData);

            this.customMap.setCenter(new google.maps.LatLng(me.currentLat, me.currentLng));
            this.setMarkerEvent();
            this.setBubble(marker);
        },
        removeMarker: function(marker) {
            if (marker) {
                marker.setMap(null);
            }
        },
        setMarkerEvent: function() {
            var me = this,
                marker = this.currentMarker,
                clickFn = function(event) {
                    var currentMarker = this;
                    me.setBubble.call(me, currentMarker);
                };
            google.maps.event.addListener(marker, 'click', clickFn);
        },
        setBubble: function(marker) {
            var tempData = $.tmpl('bubbleMarker', $.extend({}, this.markerData));
            this.infoWindow.setContent(tempData[0]);
            var self = this;
            setTimeout(function() {
                self.infoWindow.open(self.customMap, marker);
            }, 200);
        },

        adjustLatLng: function(marker) {
            var me = this,
                limits = this.settings.limits,
                limitedArea = this.settings.locale.limitedArea,
                loadMarkerFail = this.settings.locale.loadMarkerFail,
                latlng = new google.maps.LatLng(marker.getPosition().lat(),
                    marker.getPosition().lng());
            this.geocoder.geocode({
                'latLng': latlng
            }, function(results, status) {
                if(status === google.maps.GeocoderStatus.ERROR){
                    alert(loadMarkerFail + status);
                    me.currentMarker.setPosition(new google.maps.LatLng(me.currentLat, me.currentLng));
                    return;
                }
                var markerData = me.getMarkerInfo(results[0], marker.getPosition().lat(), marker.getPosition().lng());
                if (limits) {
                    if (limits != markerData.country) {
                        alert(limitedArea);
                        me.currentMarker.setPosition(new google.maps.LatLng(me.currentLat, me.currentLng));
                        return;
                    }
                }
                if (status !== google.maps.GeocoderStatus.OK || !results[0]) {
                    alert(i18n['gmap.info.invalidLocation']);
                }
                me.markerData = markerData;
                //record current latitude and longitude
                me.currentLat = markerData.latitude;
                me.currentLng = markerData.longitude;
                me.setBubble(marker);
            });
        },

        getMarkerInfo: function(result, latitude, longitude) {
            var country = '',
                country_name = '',
                city = '',
                state = '',
                stateCode = '',
                postalCode = '',
                address,
                formatted_address,
                address_components,
                map = {};

            if(result){
                latitude = latitude != undefined ? latitude : result.geometry.location.lat();
                longitude = longitude != undefined ? longitude : result.geometry.location.lng();

                formatted_address = result.formatted_address;
                address_components = result.address_components;
                for (var i = 0,len = address_components.length; i < len; i++) {
                    map[address_components[i].types[0]] = {
                        long_name: address_components[i].long_name,
                        short_name: address_components[i].short_name
                    };
                }

                country = map['country'] ? map['country'].short_name : '';
                country_name = map['country'] ? map['country'].long_name : '';
                state = map['administrative_area_level_1'] ? map['administrative_area_level_1'].long_name : '';
                stateCode = map['administrative_area_level_1'] ? map['administrative_area_level_1'].short_name : '';
                if (map['locality']) {
                    city = map['locality'].long_name;
                } else if (map['administrative_area_level_3']) {
                    city = map['administrative_area_level_3'].long_name;
                } else if (map['administrative_area_level_2']) {
                    city = map['administrative_area_level_2'].long_name;
                }
                postalCode = map['postal_code'] ? map['postal_code'].long_name : '';
                address = map['street_number'] ? (map['street_number'].long_name + ' ') : '';
                address += map['route'] ? map['route'].long_name : '';
            }

            var markerData = {
                country: country,
                country_name: country_name,
                city: city,
                state: state,
                stateCode: stateCode,
                enterAddress: this.settings.regions.enterAddress,
                address: address,
                postalCode: postalCode,
                latitude: latitude,
                longitude: longitude,
                formatted_address: formatted_address
            };
            return markerData;
        },

        /**
         * is beyond country limited, beyond return true
         * @param result
         * @param country
         * @returns {boolean}
         */
        isBeyondLimits: function(result, country){
            if(!result){
                return true;
            }
            var address_components = result.address_components;
            for (var i = 0,len = address_components.length; i < len; i++) {
                if(address_components[i].types[0] == 'country'){
                    return address_components[i].short_name != country;
                }
            }
            return true;
        },

        closeGoogleMap: function() {
            if (this.isWrite) {
                if (this.currentMarker && this.settings.callbackFn) {
                    if (this.markerData) {
                        var data = $.extend({}, this.markerData);
                        this.settings.callbackFn.call(this,
                            this.settings.locatedCt, data);
                    }
                    this.removeMarker(this.currentMarker);
                }
            }
            this.infoWindow.close();
            delete this.isWrite;
            delete this.customMap;
        },

        stateMap: {
            'AL': 'Alabama',
            'AK': 'Alaska',
            'AZ': 'Arizona',
            'AR': 'Arkansas',
            'CA': 'California',
            'CO': 'Colorado',
            'CT': 'Connecticut',
            'DE': 'Delaware',
            'FL': 'Florida',
            'GA': 'Georgia',
            'HI': 'Hawaii',
            'ID': 'Idaho',
            'IL': 'Illinois',
            'IN': 'Indiana',
            'IA': 'Iowa',
            'KS': 'Kansas',
            'KY': 'Kentucky',
            'LA': 'Louisiana',
            'ME': 'Maine',
            'MD': 'Maryland',
            'MA': 'Massachusetts',
            'MI': 'Michigan',
            'MN': 'Minnesota',
            'MS': 'Mississippi',
            'MO': 'Missouri',
            'MT': 'Montana',
            'NE': 'Nebraska',
            'NV': 'Nevada',
            'NH': 'New Hampshire',
            'NJ': 'New Jersey',
            'NM': 'New Mexico',
            'NY': 'New York',
            'NC': 'North Carolina',
            'ND': 'North Dakota',
            'OH': 'Ohio',
            'OK': 'Oklahoma',
            'OR': 'Oregon',
            'PA': 'Pennsylvania',
            'RI': 'Rhode Island',
            'SC': 'South Carolina',
            'SD': 'South Dakota',
            'TN': 'Tennessee',
            'TX': 'Texas',
            'UT': 'Utah',
            'VT': 'Vermont',
            'VA': 'Virginia',
            'WA': 'Washington',
            'WV': 'West Virginia',
            'WI': 'Wisconsin',
            'WY': 'Wyoming',
            'DC': 'District of Columbia',
            'St Thomas': 'Virgin Islands',
            'St John': 'Virgin Islands',
            'St Croix': 'Virgin Islands'
        },

        preLoadGoogleMapApi: function (callback) {
            var view = this, googleMapApiCallBack = 'view' + this.cid;
            if (!this.googleScriptAdded && ((!window.google) || (!window.google.maps) || (!window.google.maps.MapTypeId))) {
                window[googleMapApiCallBack] = function () {
                    callback.call(view);
                };
                function loadScript() {
                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = 'https://maps.googleapis.com/maps/api/js?v=3&sensor=true&callback=' + googleMapApiCallBack;
                    document.body.appendChild(script);
                }

                this.googleScriptAdded = true;
                loadScript();
            } else {
                callback.call(view);
            }
        }
    };
    return googleMapComponentApp;
});
