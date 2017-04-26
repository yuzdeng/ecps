;
define('components/autocomplete/autocompleteApp', function (require, exports, module) {
    var template = require("components/autocomplete/autocompleteAppTmpl.html");
    if (template !== true) {
        $('body').append(template);
    }
    /**
     $.validator.addMethod("methodName",function(value,element){
        if (this.optional(element)) {
            return true;
        }
        var valid = false;
        //todo
        return valid;
    }, i18n["error code"]);
     **/
    var autocompleteApp = {
        Model: {
            appName: 'autocompleteApp',
            defaults: function () {
                return {};
            },
            initialize: function (attributes, options) {
            },
            parse: function (data) {
            }
        },
        View: {
            appName: 'autocompleteApp',
            initialize: function () {
                this.templateScriptNames = [{
                    "templateName": "autocompleteAppTmpl",
                    "templateId": "autocompleteAppTmpl1448012275454"
                }];
                EB_Common.Backbone.View.prototype.initialize.apply(this, arguments);
                this.render();
            },
            searchCache: {},
            render: function () {
                this.$el.html(this.template.autocompleteAppTmpl(this.getIdSuffixModelJSON()));
                this.options.container && this.options.container.append(this.$el);
                this.jDom.searchField = this.$('#searchField');
                if(this.options.enableTriggerInputCompleted && this.options.enableSearchButton){
                    this.jDom.goToSearch = this.$('#goToSearch').show();
                }
                this.buildAutocomplete();
                this.jDom.searchField.focus();
            },
            buildAutocomplete: function () {
                var view = this;
                if(!view.options.jqueryAutocompleteOptions) {
                    return;
                }
                var jqueryAutocompleteOptions = view.options.jqueryAutocompleteOptions || {};
                this.jDom.searchField.autocomplete({
                    delay: jqueryAutocompleteOptions.delay || 200,
                    minLength: isNaN(jqueryAutocompleteOptions.minLength) ? 2 : jqueryAutocompleteOptions.minLength,
                    appendTo: jqueryAutocompleteOptions.appendTo || this.jDom.searchField.parent(),
                    create: function (event, ui) {
                        $(this).autocomplete("widget").addClass('ui-filter-searchBox');
                    },
                    open: function ( event, ui ) {
                        if(i18n.getCurrentLanguage() == 'ar_SA'){
                            $(this).siblings('ul').css({
                                left:'inherit',
                                right:'0px'
                            });
                        }
                    },
                    select: function( event, ui ) {
                        view.eventClickGoToSearch(event, ui && ui.item && ui.item.value);
                    },
                    source: function (request, response) {
                        var term = request.term;
                        if (term in view.searchCache) {
                            response(view.searchCache[term]);
                            return;
                        }
                        var ajaxOptions = jqueryAutocompleteOptions.ajax || {};
                        var passedData = _.isFunction(ajaxOptions.data) ? ajaxOptions.data.call(view, request) : ajaxOptions.data;
                        passedData = passedData || {};
                        $.ajax($.extend({},ajaxOptions,{
                            url: ajaxOptions.url,
                            data: $.extend({searchValue: request.term}, passedData),
                            success: function (data, status, xhr) {
                                var successCallResult;
                                if(_.isFunction(ajaxOptions.success)){
                                    successCallResult = ajaxOptions.success.call(view, data, status, xhr);
                                    if(successCallResult){
                                        data = successCallResult;
                                    }
                                }else{
                                    data = _.pluck(data.data, 'name');
                                }
                                view.searchCache[term] = data;
                                response(data);
                            },
                            dataType: ajaxOptions.dataType || 'json',
                            type: ajaxOptions.type || 'post'
                        }));
                    }
                });
            },
            events: function () {
                var events = {
                    'click #goToSearch': 'eventClickGoToSearch',
                    "keypress #searchField": "eventKeypressSearchRules"
                };
                return this.dealEvents(events, this.cid);
            },
            eventKeypressSearchRules: function (e) {
                if (e.keyCode == 13 || e.which == 13) {
                    this.eventClickGoToSearch();
                    this.$('ul.ui-autocomplete').hide();
                    return false;
                }
            },
            eventClickGoToSearch: function (e,val) {
                if(this.options.enableTriggerInputCompleted){
                    var search = val || this.$('#searchField').val();
                    this.trigger('inputCompleted', $.trim(search));
                }
                return false;
            },
            getJsonData: function () {
                var modelData = this.model.toJSON();
            },
            reset: function () {
                this.jDom.searchField.val('');
                this.searchCache = {};
            }

        },
        /**
         * *
         * @param container
         * @param modelData
         * @param parentApp
         * @param options
         *          jqueryAutocompleteOptions: {delay:200,minLength:2, ajax:{url, ...}, ...}
         *          enableTriggerInputCompleted : false, after click search icon or populate the Enter Key, trigger one event named inputCompleted.
         *          enableSearchButton : false, if to show the button obviously that help user to do more operations.
         *
         * @returns {View}
         */
        getInstance: function (container, modelData, parentApp, options) {
            var View = EB_Common.Backbone.View.extend(this.View);
            var Model = Backbone.Model.extend(this.Model);
            var model = new Model(modelData || {});
            var view = new View($.extend({container: container, parentApp: parentApp, model: model}, options || {}));
            return view;
        }
    };

    return autocompleteApp;
});
