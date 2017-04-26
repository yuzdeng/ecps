;define('views/commons/nav/rolesNav/rolesNavApp',function(require, exports, module){
    var template = require("views/commons/nav/rolesNav/rolesNavAppTmpl.html");
    if(template !== true){
        $('body').append(template);
    }
    var rolesNavApp = {
        Model: {
            appName:'rolesNavApp',
            defaults: function () {
                return {};
            },
            initialize: function (attributes, options) {},
            parse: function (data) {}
        },
        View: {
            appName:'rolesNavApp',
            initialize: function () {
                this.templateScriptNames = [
                    {"templateName":"rolesNavAppTmpl","templateId":"rolesNavAppTmpl1448509814607"},
                    {"templateName":"rolesNavAppRoleItemTmpl","templateId":"rolesNavAppRoleItemTmpl1448509814607"}
                ];
                EB_Common.Backbone.View.prototype.initialize.apply(this,arguments);
                //EB_Common.EventProxy.on("eventName", callback, this);
                this.render();
            },
            cache:{},
            render: function () {
                var view = this;
                this.$el.html(this.template.rolesNavAppTmpl(this.getIdSuffixModelJSON()));
                this.options.container && this.options.container.append(this.$el);
                this.jDom.rolesList = this.$('#rolesList');
                this.buildOrgItemsListWidget();
            },
            buildOrgItemsListWidget: function () {
                var simpleItemsListWidgetAppOptions = this.options.simpleItemsListWidgetOptions;
                var options = {
                    el:this.jDom.rolesList,
                    itemsSrcUrl:'/roles/listSimplyRolesByNameInOrg?orgId=' + (this.model.get('id')),
                    quickSearchUrl:'/roles/listSimplyRolesByNameInOrg?orgId=' + (this.model.get('id'))
                };
                options = $.extend(options, simpleItemsListWidgetAppOptions);
                seajs.use(['components/simpleItemsListWidget/simpleItemsListWidgetApp'],function(simpleItemsListWidgetApp){
                    var app = simpleItemsListWidgetApp.getInstance(null,this.model.get('rolesDataPage'),null,options);
                    app.on('itemSelected', this.itemSelected, this);
                    this.subApp.simpleItemsListWidgetApp = app;
                }.bind(this));
            },
            showOrHideSwitchoverPanel: function (isShow) {
                if(isShow){
                    this.$el.show();
                }else{
                    this.$el.hide();
                }
            },
            itemSelected: function (e, itemObject) {
                if(itemObject.isActive){
                    return;
                }
                itemObject.orgName = this.model.get('name');
                this.trigger('itemSelected',e, itemObject);
            },
            events: function () {
                var events = {
                };
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
            var view = new View($.extend({container:container, parentApp: parentApp, model: model },options||{}));
            return view;
        }
    };

    return rolesNavApp;
});
