;define('components/voice/voiceUploader/voiceUploaderApp',function(require, exports, module){
    var template = require("components/voice/voiceUploader/voiceUploaderAppTmpl.html");
    if(template !== true){
        $('body').append(template);
    }
    var voiceUploaderApp = {
        Model: {
            appName:'voiceUploaderApp',
            defaults: function () {
                return {};
            },
            initialize: function (attributes, options) {},
            parse: function (data) {}
        },
        View: {
            appName:'voiceUploaderApp',
            initialize: function () {
                this.templateScriptNames = [{"templateName":"voiceUploaderAppTmpl","templateId":"voiceUploaderAppTmpl1472449270755"}];
                EB_Common.Backbone.View.prototype.initialize.apply(this,arguments);
                //EB_Common.EventProxy.on("eventName", callback, this);
                this.render();
            },
            render: function () {
                var view = this;

                this.$el.html(this.template.voiceUploaderAppTmpl(this.getIdSuffixModelJSON()));
                this.options.container && this.options.container.append(this.$el);
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

    return voiceUploaderApp;
});
