/**
 * collapsibleCtr
 * Create collapsible container
 * Usage:
 * $('div').collapsibleCtr({title: xxx, titleTag:'h3'});
 * titleTag default to 'h3', title can be empty if titleTag is specific to some element's tag name
 * widget will find a title from the dom by titleTag
 * Public Methods:
 * isOpen
 *   return true|false
 * open
 * close
 */
define('components/container/jquery.ui.collapsibleCtr', function (require, exports, module) {
    var CLOSE_CLASSNAME = 'eb-collapsible-container_close',
        template = {
            wrapper: [
                '<div class="eb-collapsible-container">',
                '<div class="eb-collapsible-container-title"><h3><i class="b-ui-treepanel-branch-icon"></i><span>{{:title}}</span></h3></div>',
                '</div>'
            ].join(''),
            container: '<div class="eb-collapsible-container-content"></div>'
        };
    $.widget("ui.collapsibleCtr", {
        _create: function () {
            var me = this,
                title = this.options.title || '',
                titleTag = this.options.titleTag || 'h3';
            me.origin = $(this.element);
            if (!title && me.origin.find(titleTag).length) {
                title = me.origin.find(titleTag).html();
                me.origin.find(titleTag).remove();
            }
            me.wrapper = $(template.wrapper.replace(/\{\{\:title\}\}/, title)).insertAfter(me.origin);
            me.container = $(template.container).wrapInner(me.origin);
            me.wrapper.append(me.container);
            //init listeners
            me.wrapper.delegate('.eb-collapsible-container-title', 'click', function () {
                me.toggle();
            });
        },
        isOpen: function () {
            return !this.wrapper.hasClass(CLOSE_CLASSNAME);
        },
        //Public methods
        open: function () {
            if (!this.isOpen()) {
                this.wrapper.removeClass(CLOSE_CLASSNAME);
            }
        },
        close: function () {
            if (this.isOpen()) {
                this.wrapper.addClass(CLOSE_CLASSNAME);
            }
        },
        updateTitle: function(title){
            this.wrapper.find('.eb-collapsible-container-title span').text(title);
        },
        toggle: function () {
            if (this.isOpen()) {
                this.close();
            } else {
                if (this.wrapper.parent().is('.sigle-collapse')) {
                    this.wrapper.parent().find('.eb-collapsible-container').addClass(CLOSE_CLASSNAME);
                }
                this.open();
            }
        },
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
            this.wrapper.remove();
            delete this.wrapper;
            delete this.container;
        }
    });
})