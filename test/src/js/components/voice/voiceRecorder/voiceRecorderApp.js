;define('components/voice/voiceRecorder/voiceRecorderApp', function (require, exports, module) {
    var template = require("components/voice/voiceRecorder/voiceRecorderAppTmpl.html");
    if (template !== true) {
        $('body').append(template);
    }
    var voiceRecorderApp = {
        Model: {
            appName: 'voiceRecorderApp',
            defaults: function () {
                return {
                    mode: 1,
                    load: false,
                    audioFiles: [],
                    recordedVoices: [],
                    //WebRecorder,LandlineRecorder,WebUploader,
                    voiceSource: "None",
                    voiceFlashObject: {
                        recorderId: "recorder",
                        saveUrl: EB_Common.Ajax.wrapperUrl("/voices/write"),
                        audioUrl: EB_Common.Ajax.wrapperUrl("/voices/readRemote/"),
                        callbackMethod: "recorderCallback",
                        resizeMethod: "resizeRecorderCallback",
                        startRecordingCallback: "startRecordingCallback",
                        stopRecordingCallback: "stopRecordingCallback",
                        adjustRecordingStatus: "adjustRecordingStatus"
                    },
                    uploadingValid: true,
                    disableRadio: false,
                    includeAVoice: false
                };
            },
            initialize: function (attributes, options) {
            },
            parse: function (data) {
            }
        },
        View: {
            appName: 'voiceRecorderApp',
            uploader: {},
            pageConstants: {
                NOVOICE: "None",
                HAVEVOICE: "HaveVoice"
            },
            initialize: function () {
                this.templateScriptNames = [{
                    "templateName": "voiceRecorderAppTmpl",
                    "templateId": "voiceRecorderAppTmpl1472440226137"
                }];
                EB_Common.Backbone.View.prototype.initialize.apply(this, arguments);
                //EB_Common.EventProxy.on("eventName", callback, this);
                this.render();
            },
            render: function () {
                var view = this;

                this.$el.html(this.template.voiceRecorderAppTmpl(this.getIdSuffixModelJSON()));
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

    return voiceRecorderApp;
});
