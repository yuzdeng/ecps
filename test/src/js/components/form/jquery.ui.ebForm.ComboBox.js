define('components/form/jquery.ui.ebForm.ComboBox', function (require, exports, module) {
    var selectBoxWidgetApp = require('components/selectBox/selectBoxWidgetApp'),
        COMBOBOX_ID_CLS = "ebform-combobox";
    exports.processSingle =function(cmp, form) {
        var type = 'multiple',
            width = 255,
            existedValues = [],
            listCfg = {
                enableAutoComplete: false,
                enableQuickSearch: true,
                httpMethod: 'get',
                pageSize: 50,
                scroll: true,
                scrollClass: 'ebform-combobox-scroll'
            },
            dataSource = cmp.attr('datasource');
        if (dataSource === 'Groups') {
            $.extend(listCfg, {
                itemsSrcUrl: '/contacts/groups/getGroupsByName',
                quickSearchUrl: '/contacts/groups/getGroupsByName',
                searchFieldName: 'groupName'
            })
        } else if (dataSource === 'Calendars') {
            var orgId = EB_Common.getCurrentOrganization().id;
            $.extend(listCfg, {
                itemsSrcUrl: '/scheduling/' + orgId + '/calendars?fields=name&filter[status]=A&filter[active]=true',
                quickSearchUrl: '/scheduling/' + orgId + '/calendars?fields=name&filter[status]=A&filter[active]=true',
                searchFieldName: 'filter[name][regex]'
            })
            //http://localhost:8080/scheduling/241901148045319/calendars?fields=name&filter[name][regex]=c&pageSize=10&pageNumb=1
        } else if (dataSource === 'airport') {
            delete listCfg.enableQuickSearch;
            $.extend(listCfg, {
                enableAutoComplete: true,
                enableQuickSearch: true,
                disableLoadItemsList: true,
                itemsSrcUrl: '/contacts/airport',
                quickSearchUrl: '/contacts/airport',
                searchFieldName: 'name'
            });
            type = cmp.attr('comboBoxType') || 'single';
            width = 330;
        }
        cmp.find('input').each(function () {
            existedValues.push({id: $(this).val(), name: $(this).val()});
        });
        cmp.removeClass('ebform-combobox-init').addClass(COMBOBOX_ID_CLS);
        return selectBoxWidgetApp.getInstance(null, {}, form, {
            el: cmp,
            type: type,
            doValid: cmp.attr('isRequired') === 'true',
            disabled: cmp.hasClass('disabled'),
            width: width,
            simpleItemsListWidgetOptions: listCfg,
            selectedItems: existedValues,
            parseItemsData: cmp.attr('parse') === 'false' ? null : function (data) {
                return _.map(data, function (item) {
                    return {id: item.name, name: item.name};
                });
            }
        });
    };
    exports.process = function (context, form) {
        context.find('div.ebform-combobox-init').each(function () {
            exports.processSingle($(this), form);
        })
    }
});