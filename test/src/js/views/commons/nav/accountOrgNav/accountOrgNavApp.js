;define('views/commons/nav/accountOrgNav/accountOrgNavApp',function(require, exports, module){
    require("components/autocomplete/autocompleteApp");
    require("views/commons/nav/rolesNav/rolesNavApp");
    require("components/simpleItemsListWidget/simpleItemsListWidgetApp");
    var template = require("views/commons/nav/accountOrgNav/accountOrgNavAppTmpl.html");
    if(template !== true){
        $('body').append(template);
    }
    var accountOrgNavApp = {
        Model: {
            appName:'accountOrgNavApp',
            defaults: function () {
                return {};
            },
            initialize: function (attributes, options) {},
            parse: function (data) {}
        },
        View: {
            appName:'accountOrgNavApp',
            cache:{},
            initialize: function () {
                this.templateScriptNames = [
                    {"templateName":"accountOrgNavAppTmpl","templateId":"accountOrgNavAppTmpl1448509749777"}
                ];
                EB_Common.Backbone.View.prototype.initialize.apply(this,arguments);
                //EB_Common.EventProxy.on("eventName", callback, this);
                this.render();
            },
            render: function () {
                var view = this;
                this.model.set({
                    accountLevel: !(everbridgeCurrentOrgId && everbridgeCurrentOrgId != '0'),
                    accountId : everbridgeAccountId,
                    accountName : everbridgeAccountName,
                    isAccountAdmin: everbridgeIsAccountAdmin,
                    currentRoleName : everbridgeCurrentRoleName,
                    currentOrgId : everbridgeCurrentOrgId,
                    currentOrgName : everbridgeCurrentOrgName,
                    oneOrgAndOneRole : everbridgeOneOrgAndOneRole
                });
                this.$el.html(this.template.accountOrgNavAppTmpl(this.getIdSuffixModelJSON()));
                this.options.container && this.options.container.append(this.$el);
                this.jDom.organizationsList = this.$('#organizationsList');
                this.jDom.switchoverPanel = this.$('#switchoverPanel');
                this.buildOrgItemsListWidget();
                this.autoHide();
            },
            autoHide: function () {
                var view = this;
                $(document).click(function (e) {
                    if(!view.cache.switchoverPanelIsShow){
                        return;
                    }
                    if(view.$el.find(e.target).size() == 0 && (!view.options.matchedElement || view.options.matchedElement.indexOf(e.target) == -1)){
                        view.showOrHideSwitchoverPanel(false);
                    }
                });
            },
            resetPositionOfSwitchoverPanel: function () {
                if(!this.options.positionLabel){
                    return;
                }
                this.jDom.positionLabel = this.jDom.positionLabel || this.options.positionLabel;
                this.cache.offset = this.cache.offset || this.jDom.positionLabel.offset();
                var offset = this.cache.offset;
                if(i18n.getCurrentLanguage() == "ar_SA"){
                    this.jDom.switchoverPanel.css({
                        right: $(document).width() - offset.left,
                        top:offset.top + this.jDom.positionLabel.height()
                    });
                }else{
                    this.jDom.switchoverPanel.css({
                        left: offset.left + this.jDom.positionLabel.width(),
                        top:offset.top + this.jDom.positionLabel.height()
                    });

                }
            },
            buildOrgItemsListWidget: function () {
                var view = this;
                var simpleItemsListWidgetAppOptions = this.options.simpleItemsListWidgetOptions;
                var options = {
                    el:this.jDom.organizationsList,
                    itemsSrcUrl:'/listSimplyOrganizationsByName?includeRolesData=' + (!this.model.get('accountLevel')),
                    quickSearchUrl:'/listSimplyOrganizationsByName',
                    parseItemsData: function (items) {
                        $.each(items, function (i,item) {
                            if(item.rolesDataPage){
                                item.hasNextLevel = true;
                            }
                        });
                        view.cache.orgRolesMap = {};
                        return items;
                    }
                };
                options = $.extend(options, simpleItemsListWidgetAppOptions);
                seajs.use(['components/simpleItemsListWidget/simpleItemsListWidgetApp'],function(simpleItemsListWidgetApp){
                    var app = simpleItemsListWidgetApp.getInstance(null,null,view,options);
                    app.on('itemSelected', this.orgItemSelected, this);
                    app.on('itemMouseover', this.itemMouseover, this);
                    this.subApp.simpleItemsListWidgetApp = app;
                }.bind(this));
            },
            orgItemSelected: function (e,itemObject) {
                if(itemObject.isActive || itemObject.rolesDataPage){
                    return;
                }
                window.location.href = EB_Common.Ajax.wrapperUrl('/switch?switchOrganizationId='+itemObject.id);
            },
            roleItemSelected: function (e,itemObject) {
                if(itemObject.isActive){
                    return;
                }
                window.location.href = EB_Common.Ajax.wrapperUrl(EB_Common.format('/switch?switchOrganizationId={0}&switchRoleId={1}', itemObject.orgId, itemObject.id));
            },
            itemMouseover: function (e, itemObject, $container) {
                this.cache.orgRolesMap = this.cache.orgRolesMap || {};
                if(itemObject.rolesDataPage){
                    if(this.cache.orgRolesMap[itemObject.id]){
                        return;
                    }
                    seajs.use(['views/commons/nav/rolesNav/rolesNavApp'],function(rolesNavApp){
                        var app = rolesNavApp.getInstance(null,itemObject, this,{
                            el:$container
                        });
                        app.on('itemSelected',this.roleItemSelected, this);
                        this.cache.orgRolesMap[itemObject.id] = app;
                    }.bind(this));
                }
            },
            showOrHideSwitchoverPanel: function (isShow) {
                this.cache.switchoverPanelIsShow = isShow;
                if(isShow){
                    this.jDom.switchoverPanel.show();
                    this.resetPositionOfSwitchoverPanel();
                }else{
                    this.jDom.switchoverPanel.hide()
                }
            },
            events: function () {
                var events = {
                    'click #changeToAccountLevel' : 'eventClickChangeToAccountLevel'
                };
                return this.dealEvents(events, this.cid);
            },
            eventClickChangeToAccountLevel: function (e) {
                if($(e.currentTarget).hasClass('active')){
                    return;
                }
                window.location.href = EB_Common.Ajax.wrapperUrl('/switch?switchOrganizationId=');
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

    return accountOrgNavApp;
});
