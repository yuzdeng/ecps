;define('components/selectBox/selectBoxWidgetApp', function (require, exports, module) {
    var template = require("components/selectBox/selectBoxWidgetAppTmpl.html");
    if (template !== true) {
        $('body').append(template);
    }
    var selectBoxWidgetApp = {
        Model: {
            appName: 'selectBoxWidgetApp',
            defaults: function () {
                return {};
            },
            initialize: function (attributes, options) {
            },
            parse: function (data) {
            }
        },
        View: {
            appName: 'selectBoxWidgetApp',
            cache: {
                selectedItems: [],
                simpleItemsListWidgetIsOpen: false
            },
            initialize: function (newTemplateScriptNames) {
                this.templateScriptNames = [
                    {"templateName": "selectBoxWidgetAppTmpl", "templateId": "selectBoxWidgetAppTmpl1448715795028"},
                    {"templateName": "itemTmpl", "templateId": "itemTmpl1448715795028"}
                ];
                if (_.isArray(newTemplateScriptNames)) {
                    this.templateScriptNames = this.templateScriptNames.concat(newTemplateScriptNames);
                }
                EB_Common.Backbone.View.prototype.initialize.apply(this, arguments);
                this.model.set('doValid', !!this.options.doValid);
                this.render();
                if (this.options.doValid) {
                    this.on('selectBoxChange', this.doValid, this);
                }
            },
            render: function () {
                var view = this;
                this.$el.html(this.template.selectBoxWidgetAppTmpl(this.getIdSuffixModelJSON()));
                this.options.container && this.options.container.append(this.$el);
                this.jDom.selectedItemsContainer = this.$('#selectedItemsContainer');

                this.jDom.simpleItemsListWidgetContainer = this.$('#simpleItemsListWidgetContainer').appendTo('body');
                this.jDom.simpleItemsListWidgetContainer.css({width: this.$el.width() - 5});
                if (this.options.width) {
                    this.jDom.selectedItemsContainer.width(this.options.width);
                }
                this.jDom.doValid = this.$('#doValid');
                this.autoHide();
                if (this.options.selectedItems && this.options.selectedItems.length) {
                    this.resetSelectedItems(this.options.selectedItems);
                    this.jDom.doValid.val('true');
                }
            },
            autoHide: function () {
                var view = this;
                $(document).click(function (e) {
                    if (view.jDom.simpleItemsListWidgetContainer.find(e.target).size() == 0 && (view.jDom.selectedItemsContainer[0] != e.target)) {
                        view.openOrCloseSimpleItemsListWidget(false);
                    }
                });
            },
            ignoreValid: function (isIgnore) {
                if (isIgnore) {
                    this.jDom.doValid.addClass('ignore').errorCancel();
                } else {
                    this.jDom.doValid.removeClass('ignore');
                }
            },
            doValid: function (selectIds) {
                if (selectIds && selectIds.length) {
                    this.jDom.doValid.val('true').valid();
                } else {
                    this.jDom.doValid.val('').valid();
                }
            },
            resetSelectedItems: function (items) {
                this.cache.selectedItems = items || [];
                this.renderSelectedItems();
            },
            renderSelectedItems: function () {
                var selectedItems = this.cache.selectedItems || [];
                if (selectedItems.length) {
                    this.jDom.selectedItemsContainer.html(this.template.itemTmpl(selectedItems));
                } else {
                    this.jDom.selectedItemsContainer.html(i18n['global.select.null.text']);
                }
                this.trigger('selectBoxChange', this.getValue());
                this.$el.trigger('change', {values: this.getValue(), items: this.cache.selectedItems});
            },
            buildItemsListWidget: function () {
                var simpleItemsListWidgetAppOptions = this.options.simpleItemsListWidgetOptions;
                var options = {
                    el: this.jDom.simpleItemsListWidgetContainer,
                    itemsSrcUrl: '/listSimplyOrganizationsByName',
                    quickSearchUrl: '/listSimplyOrganizationsByName',
                    searchFieldName: null,
                    enableQuickSearch: this.options.enableQuickSearch,
                    parseItemsData: this.options.parseItemsData
                };
                options = $.extend(options, simpleItemsListWidgetAppOptions);
                seajs.use(['components/simpleItemsListWidget/simpleItemsListWidgetApp'], function (simpleItemsListWidgetApp) {
                    var app = simpleItemsListWidgetApp.getInstance(null, null, null, options);
                    app.on('itemSelected', this.itemSelected, this);
                    this.subApp.itemsListWidgetApp = app;
                }.bind(this));
            },
            itemSelected: function (e, item) {
                this.openOrCloseSimpleItemsListWidget(false);
                var selectedItems = this.cache.selectedItems || [];
                if (selectedItems.length && _.where(selectedItems, {id: item.id}).length) {
                    return;
                }
                if (this.options.type == 'multiple') {
                    selectedItems.push(item);
                } else {
                    selectedItems = [item]
                }
                this.cache.selectedItems = selectedItems;
                this.renderSelectedItems();
            },
            openOrCloseSimpleItemsListWidget: function (isOpen) {
                var selectedItemsContainerOffset, height,
                    me = this;
                if (isOpen === true) {
                    selectedItemsContainerOffset = this.jDom.selectedItemsContainer.offset();
                    height = this.jDom.selectedItemsContainer.height();
                    this.jDom.simpleItemsListWidgetContainer.css({
                        left: selectedItemsContainerOffset.left,
                        top: selectedItemsContainerOffset.top + height + 6,
                        width: this.jDom.selectedItemsContainer.parent().width()
                    });
                    if (!this.subApp.itemsListWidgetApp) {
                        this.buildItemsListWidget();
                    }
                    this.jDom.simpleItemsListWidgetContainer.show();
                    //try to put focus in searchField( child component 'simpleItemsListWidgetApp's child autocompleteApp's element) ,
                    //should not be here, but nowhere else could be better
                    window.setTimeout(function () {
                        me.jDom.simpleItemsListWidgetContainer.find('.quickSearchContainer input').focus();
                    }, 0);
                } else if (isOpen === false) {
                    this.jDom.simpleItemsListWidgetContainer.hide();
                }
                this.cache.simpleItemsListWidgetIsOpen = isOpen;
            },
            events: function () {
                var events = {
                    'click #selectedItemsContainer': 'eventClickSelectedItemsContainer',
                    'click #selectedItemsContainer a.selectedItemRemove': 'eventClickSelectedItemRemove'
                };
                if (this.options.disabled === true) {
                    events = {};
                }
                return this.dealEvents(events, this.cid);
            },
            eventClickSelectedItemsContainer: function (e) {
                var $selectedItemsContainer = $(e.target), isOpen = $selectedItemsContainer.data('open');
                this.openOrCloseSimpleItemsListWidget(true);
            },
            eventClickSelectedItemRemove: function (e) {
                var $item = $(e.target),
                    itemId = $item.attr('itemId'),
                    selectedItems = this.cache.selectedItems || [];
                e.stopPropagation();
                selectedItems = _.filter(selectedItems, function (item) {
                    return item.id != itemId;
                });
                this.cache.selectedItems = selectedItems;
                this.renderSelectedItems();
            },
            getJsonData: function () {
                var modelData = this.model.toJSON();
            },
            getValue: function () {
                return _.map(this.cache.selectedItems, function (item) {
                    return item['id'];
                });
            }
        },
        /**
         *
         * @param container
         * @param modelData
         * @param parentApp
         * @param options
         * {
         *      enableQuickSearch : {boolean} true|false, null, default to null, will automatically show/hide quicksearch box
         *      selectedItems: {Array} selected array,
         *      disabled: {boolean}  true|false
         * }
         * @returns {*}
         */
        getInstance: function (container, modelData, parentApp, options) {
            var View = EB_Common.Backbone.View.extend(this.View);
            var Model = Backbone.Model.extend(this.Model);
            var model = new Model(modelData || {});
            var view = new View($.extend({
                container: container,
                parentApp: parentApp,
                model: model
            }, $.extend({}, options)));
            return view;
        }
    };

    return selectBoxWidgetApp;
});
