;define('components/map/simpleMap/simpleMapApp', function (require, exports, module) {
    var template = require("components/map/simpleMap/simpleMapAppTmpl.html");
    if (template !== true) {
        $('body').append(template);
    }
    var simpleMapApp = {
        Model: {
            appName: 'simpleMapApp',
            defaults: function () {
                return {};
            },
            initialize: function (attributes, options) {
            },
            parse: function (data) {
            }
        },
        View: {
            appName: 'simpleMapApp',
            initialize: function () {
                this.templateScriptNames = [{
                    "templateName": "simpleMapAppTmpl",
                    "templateId": "simpleMapAppTmpl1452562812795"
                }];
                EB_Common.Backbone.View.prototype.initialize.apply(this, arguments);
                //EB_Common.EventProxy.on("eventName", callback, this);
                this.render();
            },
            destroy: function () {
                EB_Common.Backbone.View.prototype.destroy.apply(this, arguments);
                this.$el.dialog('destroy');
                this.map.destroy();
            },
            render: function () {
                var view = this;
                this.$el.html(this.template.simpleMapAppTmpl(this.getIdSuffixModelJSON()));
                this.options.container && this.options.container.append(this.$el);
                this.afterRenderDom();
            },
            afterRenderDom: function () {
                if (this.options.useOrgMapDefaultSettings) {
                    this.preLoadGoogleMapApi(this.loadOrgMapDefaultSettings);
                } else {
                    this.parseMapOptionsAndGoToBuildMap();
                }
            },
            parseMapOptionsAndGoToBuildMap: function () {
                this.validMapOptions();
                var mapOptions = this.options.mapOptions, layers = mapOptions.layers, isHasGoogleMap = false;
                $.each(layers || [], function (i, layer) {
                    if (layer instanceof OpenLayers.Layer.Google) {
                        isHasGoogleMap = true;
                        return false;
                    }
                });
                if (isHasGoogleMap) {
                    this.overrideGmap();
                    this.preLoadGoogleMapApi(this.buildMap);
                } else {
                    this.buildMap();
                }
            },
            loadOrgMapDefaultSettings: function () {
                var view = this;
                EB_Common.Openlayers.getOrganizationMapSetting(function (mapOptions) {
                    view.options.mapOptions = mapOptions;
                    view.parseMapOptionsAndGoToBuildMap();
                }.bind(this));
            },
            validMapOptions: function () {
                var mapOptions = this.options.mapOptions;
                if (!mapOptions) {
                    mapOptions = this.options.mapOptions = {}
                }
                var layers = mapOptions.layers;
                if (_.isEmpty(layers)) {
                    layers = [];
                    if (this.options.enableDefaultGoogleLayer) {
                        layers.push(getDefaultGoogleMap());
                    }
                    if (this.options.enableDefaultBinfLayer) {
                        layers.push(getDefaultBingMap());
                    }
                    if (!layers.length) {
                        layers.push(getDefaultBingMap());
                    }
                    mapOptions.layers = layers;
                }
                if (!mapOptions.center) {
                    mapOptions.center = new OpenLayers.LonLat(-118, 34).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
                }
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
            },
            buildMap: function () {
                OpenLayers.ImgPath = EB_Common.Ajax.wrapperUrl("/statics/javascripts/plugin/openlayers/img/");
                var defaultOptions = {
                    theme: EB_Common.Ajax.wrapperUrl("/statics/stylesheets/jscss/openlayer-original-style.css"),
                    div: this.$('#map')[0],
                    //allOverlays: false,
                    layers: [],
                    //numZoomLevels:21,
                    controls: EB_Common.Openlayers.getEBDefaultControls(),
                    zoom: 2,
                    projection: 'EPSG:900913'
                };
                var mapOption = $.extend(defaultOptions, this.options.mapOptions);
                this.map = new OpenLayers.Map(mapOption);
                this.map.baseLayer.setVisibility(false);
                this.buildMarkerLayer();
                setTimeout(function () {
                    this.map.baseLayer.setVisibility(true);
                    this.afterMapBuilt();
                }.bind(this), 0);
            },
            afterMapBuilt: function () {
                this.trigger('mapBuilt', this);
                var markerOptions = this.options.markerOptions,lonlat = markerOptions && markerOptions.lonlat, iconOptions = markerOptions && markerOptions.iconOptions, icon;
                if (markerOptions && lonlat) {
                    if (iconOptions) {
                        icon = this.getIcon(iconOptions.url, iconOptions.width, iconOptions.height);
                    }
                    this.addMarker(lonlat.lon, lonlat.lat, icon);
                }
            },
            overrideGmap: function () {
                OpenLayers.Layer.Google.v3.setGMapVisibility = function (visible) {
                    var cache = OpenLayers.Layer.Google.cache[this.map.id];
                    var map = this.map;
                    if (cache) {
                        var type = this.type;
                        var layers = map.layers;
                        var layer;
                        for (var i = layers.length - 1; i >= 0; --i) {
                            layer = layers[i];
                            if (layer instanceof OpenLayers.Layer.Google &&
                                layer.visibility === true && layer.inRange === true) {
                                type = layer.type;
                                visible = true;
                                break;
                            }
                        }
                        var container = this.mapObject.getDiv();
                        if (visible === true) {
                            if (container.parentNode !== map.div) {
                                if (!cache.rendered) {
                                    var me = this;
                                    google.maps.event.addListenerOnce(this.mapObject, 'tilesloaded', function () {
                                        cache.rendered = true;
                                        me.setGMapVisibility(me.getVisibility());
                                        me.moveTo(me.map.getCenter());
                                    });
                                }
                                map.div.appendChild(container);
                                cache.googleControl.appendChild(map.viewPortDiv);
                                google.maps.event.trigger(this.mapObject, 'resize');
                            }
                            this.mapObject.setMapTypeId(type);
                        } else if (cache.googleControl.hasChildNodes()) {
                            map.div.appendChild(map.viewPortDiv);
                            map.div.removeChild(container);
                        }
                    }
                };
            },
            buildMarkerLayer: function () {
                if (this.options.enableMarkerLayer !== false) {
                    this.markLayer = new OpenLayers.Layer.Markers("MarkersLayer");
                    this.map.addLayer(this.markLayer);
                }
            },
            /**
             * longtitude, latitude, icon
             * marker,icon
             */
            addMarker: function () {
                var args = Array.prototype.slice.call(arguments, 0), marker, lon, lat, icon, markerLonLat;
                if (!args.length) {
                    return;
                }
                if (args[0] instanceof OpenLayers.Marker) {
                    marker = args[0];
                    markerLonLat = marker.lonlat;
                } else {
                    lon = args[0], lat = args[1], icon = (args[2] instanceof OpenLayers.Icon) ? args[2] : null;
                    markerLonLat = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
                    marker = new OpenLayers.Marker(markerLonLat, icon);
                }
                this.markLayer.addMarker(marker);
                this.map.moveTo(markerLonLat);
            },
            getIcon: function (url, width, height) {
                var size = new OpenLayers.Size(width, height);
                var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
                var icon = new OpenLayers.Icon(url, size, offset);
                return icon;
            },
            events: function () {
                var events = {};
                return this.dealEvents(events, this.cid);
            },
            getJsonData: function () {
                var modelData = this.model.toJSON();
            }
        },
        getInstance: function (container, modelData, parentApp, options) {
            var View = EB_Common.Backbone.View.extend(this.View);
            var Model = Backbone.Model.extend(this.Model);
            var model = new Model(modelData || {});
            var view = new View($.extend({container: container, parentApp: parentApp, model: model}, options || {}));
            return view;
        }
    };

    function getDefaultGoogleMap() {
        EB_Common.Openlayers.overrideGmap();
        var layerGoogle = new OpenLayers.Layer.Google('Google Map', {
            'type': 'roadmap',
            'isBaseLayer': true,
            'buffer': 1,
            'visibility': true,
            'animationEnabled': false,
            'displayOutsideMaxExtent': false,
            'wrapDateLine': false,
            numZoomLevels: 20
            //,'resolutions':[1.40625, 0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 0.0006866455078125, 0.00034332275390625, 0.000171661376953125, 0.0000858306884765625, 0.00004291534423828125, 0.00002145767211914062, 0.00001072883605957031, 0.00000536441802978515, 0.00000268220901489257, 0.0000013411045074462891, 0.00000067055225372314453]
        });
        return layerGoogle;
    }

    function getDefaultBingMap() {
        var layerBing = new OpenLayers.Layer.Bing({
            'isBaseLayer': true,
            'key': 'Ap-dIJGZJ35wy6GO1dj5MYyemx3BYa6FTucfKINe_uQJg3c0KPcxA_H6NtFbFHRZ',
            'visibility': true,
            'resolutions': [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135, 0.29858214169740677]
        });
        return layerBing;
    }

    return simpleMapApp;
});
