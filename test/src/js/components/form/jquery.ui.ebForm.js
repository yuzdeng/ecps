/**
 * ebForm
 */
define('components/form/jquery.ui.ebForm', function (require, exports, module) {
    var FORM_IDENTITY_CLASSNAME = 'eb-form',
        comboBox = require('components/form/jquery.ui.ebForm.ComboBox'),
        dateStartCls = 'eb-form-DateRangeStart',
        dateEndCls = 'eb-form-DateRangeEnd',
        findPairDatePickers = function (jDom) {
            var datePickers = {};
            if (jDom.hasClass(dateStartCls)) {
                datePickers.start = jDom;
                datePickers.end = jDom.nextAll("." + dateEndCls);
                datePickers.index = 0;
            }
            if (jDom.hasClass(dateEndCls)) {
                datePickers.end = jDom;
                datePickers.start = jDom.prevAll("." + dateStartCls);
                datePickers.index = 1;
            }
            return datePickers;
        },
        processDatePicker = function (context) {
            var defaultCfg = {
                buttonImage: EB_Common.Ajax.wrapperUrl("/statics/stylesheets/common/img/icn_calendar_16.png"),
                buttonText: i18n['button.calendar.tooltip'],
                buttonImageOnly: true,
                showOn: "both",
                changeMonth: true,
                changeYear: true,
                dateFormat: "mm-dd-yy",
                onSelect: function (dateStr, ui) {
                    var domInput = ui.input || ui.$input;
                    domInput.valid();
                    domInput.trigger("change");
                }
            }, updateMatchedFieldMinOrMaxDate = function (dateStr, domInput) {
                var pairPickers = findPairDatePickers($(domInput));
                if (pairPickers.index === 0) {
                    var tempDate = pairPickers.end.val();
                    pairPickers.end.datetimepicker('option', {
                        minDate: dateStr
                    });
                    pairPickers.end.val(tempDate).change();
                    pairPickers.end.valid();
                } else {
                    var tempDate = pairPickers.start.val();
                    pairPickers.start.datetimepicker('option', {
                        maxDate: dateStr
                    });
                    pairPickers.start.val(tempDate).change();//IM-1371
                    pairPickers.start.valid();
                }
            };

            context.find("input[inputDate]").each(function () {
                var j = $(this),
                    dateFormat = j.attr("inputDate").toLowerCase(),
                    disabled = j.attr('disabled');
                if (disabled) {
                    return true;
                }
                if (/\w+\s\w+/.test(dateFormat)) {
                    j.datetimepicker($.extend($.extend(true, defaultCfg), {
                        showSecond: dateFormat.indexOf('ss') > 0 ? true : false,
                        dateFormat: "mm-dd-yy at",
                        timeFormat: dateFormat.indexOf('ss') > 0 ? 'HH:mm:ss' : 'HH:mm',
                        stepHour: 1,
                        stepMinute: 1,
                        stepSecond: 1
                    }, (function () {
                        if (j.hasClass(dateStartCls) || j.hasClass(dateEndCls)) {
                            return {
                                onSelect: function (dateStr, ui) {
                                    var domInput = ui.input || ui.$input || ui;
                                    domInput.valid();
                                    updateMatchedFieldMinOrMaxDate(dateStr, domInput);
                                    domInput.trigger("change");
                                }
                            }
                        }
                    })()));
                } else {
                    j.attr("readonly", "readonly").datepicker(defaultCfg);
                }
            });
            context.find("input[inputDate]").each(function () {
                var j = $(this),
                    disabled = j.attr('disabled');
                if (disabled) {
                    return true;
                }
                if (j.val() && (j.hasClass(dateStartCls) || j.hasClass(dateEndCls))) {
                    updateMatchedFieldMinOrMaxDate(j.val(), j);
                }
            });
            context.on("click", "a.icon_clear_auto", function (e) {
                var targetDateInput = $(this).prevAll("input[inputdate]:first"),
                    disabled = targetDateInput.attr('disabled');
                if (targetDateInput && !disabled) {
                    targetDateInput.val("").trigger("change");
                    if ((targetDateInput.hasClass(dateStartCls) || targetDateInput.hasClass(dateEndCls))) {
                        updateMatchedFieldMinOrMaxDate(targetDateInput.val(), targetDateInput);
                    }
                }
            });
            //datepicker validation

        };
    $.widget("ui.ebForm", {
        _create: function () {
            var me = this;
            me.origin = $(this.element);
            me.initValidation();
            me.origin.addClass(FORM_IDENTITY_CLASSNAME);
        },
        _init: function () {
            this.reRender();
        },
        initValidation: function () {
            $.validator.addMethod('validateDateRange', function (value, element) {
                var pairPickers = findPairDatePickers($(element));
                var d1 = pairPickers.start.val().replace('at ', '');
                var d2 = pairPickers.end.val().replace('at ', '');
                if (!d2 || !d1) {
                    return true;
                } else {
                    d1 = moment(d1)._d;
                    d2 = moment(d2)._d;
                    return d1 >= d2 ? false : true;
                }
            }, i18n['schedule.onShift.dateValidate']);
        },
        reRender: function () {
            processDatePicker(this.origin);
            comboBox.process(this.origin, this);
        }
    });
})