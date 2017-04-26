;define('components/simpleItemsListWidget/simpleItemsListWidgetApp', function (require, exports, module) {
    var template = require("components/simpleItemsListWidget/simpleItemsListWidgetAppTmpl.html");
    if (template !== true) {
        $('body').append(template);
    }
    var simpleItemsListWidgetApp = {
        Model: {
            appName: 'simpleItemsListWidgetApp',
            defaults: function () {
                return {};
            },
            initialize: function (attributes, options) {
            },
            parse: function (data) {
            }
        },
        View: {
            appName: 'simpleItemsListWidgetApp',
            initialize: function () {
                this.templateScriptNames = [
                    {
                        "templateName": "simpleItemsListWidgetAppTmpl",
                        "templateId": "simpleItemsListWidgetAppTmpl1448603269936"
                    },
                    {"templateName": "itemTmpl", "templateId": "itemTmpl1448509814607"}
                ];
                EB_Common.Backbone.View.prototype.initialize.apply(this, arguments);
                this.render();
            },
            cache: {},
            render: function () {
                var view = this;
                this.$el.html(this.template.simpleItemsListWidgetAppTmpl(this.getIdSuffixModelJSON()));
                this.options.container && this.options.container.append(this.$el);
                this.pageSize = this.options.pageSize || 10;
                this.jDom.quickSearchContainer = this.$('#quickSearchContainer');
                this.jDom.itemsList = this.$('#itemsList');
                this.options.scroll && this.jDom.itemsList.addClass(this.options.scrollClass);
                this.jDom.pagination = this.$('#pagination');
                var modelData = this.model.toJSON();
                this.buildQuickSearch();
                if (this.options.enableQuickSearch === true) {
                    this.jDom.quickSearchContainer.show();
                } else if (modelData && modelData.totalPageCount > 1) {
                    this.jDom.quickSearchContainer.show();
                }
                if (modelData.data && modelData.data.length) {
                    var data = modelData.data;
                    if (view.options.parseItemsData) {
                        data = view.options.parseItemsData(data);
                    }
                    view.cache.itemsList = data;
                    this.bindDataToElement();
                    this.loadPagination(modelData.currentPageNo, modelData.totalPageCount);
                } else {
                    if (this.options.disableLoadItemsList !== true) {
                        this.loadItemsList(1);
                    }
                }
            },
            bindDataToElement: function (data) {
                var view = this;
                this.jDom.itemsList.children().each(function (i) {
                    $(this).find('a').data('item', view.cache.itemsList[i]);
                });
            },
            buildQuickSearch: function () {
                var view = this,
                    quickSearchContainer = this.jDom.quickSearchContainer,
                    quickSearchUrl = this.options.quickSearchUrl;
                seajs.use(['components/autocomplete/autocompleteApp'], function (autocompleteApp) {
                    var app = autocompleteApp.getInstance(null, null, view, {
                        el: quickSearchContainer,
                        enableTriggerInputCompleted: true,
                        enableSearchButton: true,
                        jqueryAutocompleteOptions: view.options.enableAutoComplete ? {
                            ajax: {
                                url: EB_Common.Ajax.wrapperUrl(quickSearchUrl),
                                data: function (request) {
                                    var postData = {
                                        nameLike: request.term,
                                        pageSize: 20,
                                        rows: 20,
                                        pageNo: 1
                                    };
                                    if (view.options.searchFieldName) {
                                        postData[view.options.searchFieldName] = postData.nameLike;
                                    }
                                    return postData;
                                },
                                type: view.options.httpMethod || 'POST',
                                success: function (data) {
                                    if (view.options.autocompleteSuccess) {
                                        return view.options.autocompleteSuccess(data);
                                    }
                                    if (data.data) {
                                        return _.pluck(data.data, 'name');
                                    } else {
                                        return _.pluck(data, 'name');
                                    }
                                }
                            }
                        } : null
                    });
                    app.on("inputCompleted", function (name) {
                        view.cache.autocompleteValue = name;
                        view.loadItemsList(1);
                    });
                }.bind(this));
            },
            loadItemsList: function (pageNo) {
                if (this.loadItemsRequest) {
                    this.loadItemsRequest.abort();
                }
                var view = this,
                    itemsSrcUrl = this.options.itemsSrcUrl,
                    postData = {
                        pageNo: pageNo,
                        pageSize: this.pageSize,
                        rows: this.pageSize,
                        nameLike: this.cache.autocompleteValue || ''
                    };
                if (this.options.searchFieldName) {
                    postData[this.options.searchFieldName] = postData.nameLike;
                }
                var itemsList = this.jDom.itemsList;
                this.loadItemsRequest = EB_Common.Ajax[this.options.httpMethod || 'post'](itemsSrcUrl, postData, function (dataPage) {
                    view.loadItemsRequest = null;
                    var data = dataPage.data;
                    if (view.options.parseItemsData) {
                        data = view.options.parseItemsData(data);
                    }
                    view.cache.itemsList = data;
                    if (!_.isEmpty(data)) {
                        itemsList.empty().html(view.template['itemTmpl'](data));
                    } else {
                        itemsList.empty().html(EB_Common.format('<li style="border-radius: 4px;padding-top: 5px;padding-bottom: 5px;background-color: #D01F29;color: white;">{0}</li>', i18n['global.list.no.items.select']));
                    }
                    view.bindDataToElement();
                    view.loadPagination(dataPage.currentPageNo, dataPage.totalPageCount);
                }, "json");
            },
            loadPagination: function (currentPageNo, totalPageCount) {
                var view = this, pagination = this.jDom.pagination;
                if (totalPageCount > 1) {
                    this.jDom.quickSearchContainer.show();
                    if (pagination.data("jqPagination")) {
                        pagination.jqPagination("destroy");
                    }
                    pagination.show().jqPagination({
                        link_string: 'javascript:void(0)',
                        max_page: totalPageCount,
                        current_page: currentPageNo,
                        paged: function (page) {
                            view.loadItemsList(page);
                        }
                    });
                    pagination.children().removeClass("ui-state-disabled");
                    if (totalPageCount == 1) {
                        pagination.children().not(".current").addClass("ui-state-disabled");
                    } else if (currentPageNo == 1) {
                        pagination.children(".first,.previous").addClass("ui-state-disabled");
                    } else if (currentPageNo == totalPageCount) {
                        pagination.children(".next,.last").addClass("ui-state-disabled");
                    }
                    pagination.find(".current").text(currentPageNo + "/" + totalPageCount);
                } else {
                    pagination.hide();
                }
            },
            events: function () {
                var events = {
                    'click #itemsList>li>a': 'eventClickItem',
                    'mouseover #itemsList>li>a': 'eventMouseoverItem',
                    'mouseout #itemsList>li>a': 'eventMouseoutItem'
                };
                return this.dealEvents(events, this.cid);
            },
            eventClickItem: function (e) {
                if (e.currentTarget === e.target) {
                    var $a = $(e.currentTarget);
                    this.trigger('itemSelected', e, $a.data('item'));
                }
            },
            eventMouseoverItem: function (e) {
                if (e.currentTarget === e.target) {
                    var $a = $(e.currentTarget);
                    var nextLevelContainer = $a.parent().find('div.nextLevelContainer');
                    this.trigger('itemMouseover', e, $a.data('item'), nextLevelContainer);
                }
            },
            eventMouseoutItem: function (e) {
                if (e.currentTarget === e.target) {
                    var $a = $(e.currentTarget);
                    this.trigger('itemMouseout', e, $a.data('item'));
                }
            },
            getJsonData: function () {
                var modelData = this.model.toJSON();
            }

        },
        /**
         * @param container
         * @param modelData
         * @param parentApp
         * @param options
         * itemsSrcUrl
         * enableQuickSearch, true or null
         * quickSearchUrl
         * enableAutoComplete: {boolean} true| false, default to true
         * pageSize
         * @returns {View}
         */
        getInstance: function (container, modelData, parentApp, options) {
            var View = EB_Common.Backbone.View.extend(this.View);
            var Model = Backbone.Model.extend(this.Model);
            var model = new Model(modelData || {});
            var view = new View($.extend({container: container, parentApp: parentApp, model: model}, $.extend({
                enableAutoComplete: true
            }, options)));
            return view;
        }
    };

    return simpleItemsListWidgetApp;
});
