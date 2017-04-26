/**
 * This APP is the collection of the voice recorder and voice uploader.
 */
define('components/voice/voiceSuite/voiceSuiteApp', function (require, exports, module) {
    "use strict";
    var template = require("components/voice/voiceSuite/voiceSuiteAppTmpl.html");

    if (template !== true) {
        $('body').append(template);
    }
    var voiceSuiteApp = {
        Model: {
            appName: 'voiceSuiteApp',
            defaults: function () {
                return {};
            },
            initialize: function (attributes, options) {
            },
            parse: function (data) {
            }
        },
        View: {
            appName: 'voiceSuiteApp',
            initialize: function () {
                this.templateScriptNames = [{
                    "templateName": "voiceSuiteAppTmpl",
                    "templateId": "voiceSuiteAppTmpl1472449686989"
                }];
                EB_Common.Backbone.View.prototype.initialize.apply(this, arguments);
                //EB_Common.EventProxy.on("eventName", callback, this);
                this.render();
            },
            render: function () {
                var view = this;

                this.$el.html(this.template.voiceSuiteAppTmpl(this.getIdSuffixModelJSON()));
                this.options.container && this.options.container.append(this.$el);
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

    return voiceSuiteApp;
});
