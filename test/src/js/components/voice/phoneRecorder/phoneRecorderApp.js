;define('components/voice/phoneRecorder/phoneRecorderApp', function (require, exports, module) {
    var template = require("components/voice/phoneRecorder/phoneRecorderAppTmpl.html");
    if (template !== true) {
        $('body').append(template);
    }
    var phoneRecorderApp = {
        Model: {
            appName: 'phoneRecorderApp',
            defaults: function () {
                return {};
            },
            initialize: function (attributes, options) {
            },
            parse: function (data) {
            }
        },
        View: {
            appName: 'phoneRecorderApp',
            initialize: function () {
                this.templateScriptNames = [{
                    "templateName": "phoneRecorderAppTmpl",
                    "templateId": "phoneRecorderAppTmpl1472449212749"
                }];
                EB_Common.Backbone.View.prototype.initialize.apply(this, arguments);
                //EB_Common.EventProxy.on("eventName", callback, this);
                this.render();
            },
            render: function () {
                var view = this;
                this.$el.html(this.template.phoneRecorderAppTmpl(this.getIdSuffixModelJSON()));
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

    return phoneRecorderApp;
});
