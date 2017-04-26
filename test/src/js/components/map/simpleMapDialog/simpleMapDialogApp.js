;define('components/map/simpleMapDialog/simpleMapDialogApp',function(require, exports, module){
    var simpleMapApp = require('components/map/simpleMap/simpleMapApp');
    var simpleMapDialogApp = $.extend(true,{},simpleMapApp,{
        Model: {
            appName:'simpleMapDialogApp'
        },
        View: {
            appName:'simpleMapDialogApp',
            destroy: function () {
                this.map.destroy();
                this.$el.dialog('destroy');
            },
            afterRenderDom: function () {
                if(this.options.useOrgMapDefaultSettings){
                    this.preLoadGoogleMapApi(this.loadOrgMapDefaultSettings);
                }else{
                    this.buildDialog();
                }
            },
            loadOrgMapDefaultSettings: function () {
                var view = this;
                EB_Common.Openlayers.getOrganizationMapSetting(function(mapOptions){
                    view.options.mapOptions = mapOptions;
                    view.buildDialog();
                }.bind(this));
            },
            buildDialog: function(){
                var view = this;
                var size = this.options.size || {width:600, heigth:500};
                this.$('#map').css({width:size.width, height:size.heigth});
                this.$el.dialog({
                    autoOpen: true,
                    width: size.width + 20,
                    height: "auto",
                    modal: true,
                    resizable: false,
                    title: i18n['setting.precisiongis.published.pointaddress.published.view'],
                    open: function () {
                        //reset the position of dialog.
                        view.parseMapOptionsAndGoToBuildMap();
                    },
                    close: function () {
                        view.destroy();
                    },
                    buttons: {
                        Ok: {
                            click: function () {
                                $(this).dialog("close");
                            },
                            'class': 'orange',
                            text: i18n['button.close'],
                            id: "okButton" + view.cid //add the id for ok button to make the easy use
                        }
                    }
                });
            }
        }
    });

    return simpleMapDialogApp;
});
