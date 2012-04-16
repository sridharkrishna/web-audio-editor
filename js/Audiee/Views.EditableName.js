/**
 * Author: Jan Myler <honza.myler@gmail.com>
 * Filename: editable_name_view.js
 * 
 * View for editing the name titles (e.g. project name, track name etc.).
 */

define([
    'underscore',
    'backbone',
    'text!templates/EditableName.html',
    'text!templates/ContextMenu.html'
], function(_, Backbone, EditableNameT, ContextMenuT) {
    // sets the Mustache format delimiter: {{ variable }}
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    return Backbone.View.extend({
        // cached template function
        template: _.template(EditableNameT),
        menu: _.template(ContextMenuT),

        // listeners to a model's changes
        initialize: function() {
            _.bindAll(this, 'render', 'close', 'edit', 'contextMenu', 'keyupHandler');
            this.model.bind('change:name', this.render);
            this.model.bind('change:color', this.render);

            // register mouse events
            $(this.el)
                .on('keyup', '.name-input', this.keyupHandler)
                .on('blur', '.name-input', this.close)
                .on('contextmenu', '.display', this.contextMenu);

            this.render();
        },

        // rendering function
        render: function() {
            $(this.el).html(this.template({name: this.model.get('name')}));
            
            // sets the background color, if the options is enabled
            if (this.options.hasColor)
                $(this.el).css('background-color', this.model.get('color'));

            this.input = this.$('.name-input');
            return this;
        },

        // switches view into 'editing' mode
        edit: function() {
            $(this.el).addClass('editing');
            this.input.focus().select();
        },

        // goes to the close function when 'enter' is pressed
        keyupHandler: function(e) {
            if (e.which == 13) {  // enter key
                this.model.set({name: this.input.val()});
                $(this.el).removeClass('editing');     
            } else if (e.which == 27) {  // escape key
                this.close();
            }               
        },

        // closes the 'editing' mode and saves the changes to the model
        close: function() {
            this.input.val(this.model.get('name'));
            $(this.el).removeClass('editing');
        },

        // shows context menu change dialog when 'RMB' is clicked
        contextMenu: function(e) {
            e.preventDefault();     // don't show the context menu
            if (this.options.hasColor && e.which == 3) {
                $('body').append(this.menu);
                var $contextMenu = $('ul.context-menu'),
                    that = this;

                $contextMenu.find('span.cm-color').each(function() {
                    $(this).css('background', $(this).data('color'));
                });
                $contextMenu.css({
                    top: e.clientY + 'px',
                    left: e.clientX + 'px'
                }).on('click', '#cm-rename', function() {
                    that.edit();
                }).on('click', '#cm-duplicate', function() {
                    that.model.duplicate();
                }).on('click', '#cm-remove', function() {
                    that.model.destroy();
                }).on('click', '.cm-color', function(e) {
                    that.model.set('color', e.target.dataset.color);
                }).on('click', '#cm-info', function() {
                    console.log(
                        'Info [sT:',
                        that.model.get('startTime'),
                        ', eT:',
                        that.model.get('endTime'),
                        ', l:',
                        that.model.get('loop'),
                        ', tP:',
                        that.model.get('trackPos'),
                        ']');
                });

                $(document).on('click', function(e) {
                    $contextMenu.remove();
                }).on('mousedown', '.clip-name', function(e) {
                    $contextMenu.remove();
                });
            }
            return false;
        }

    });
});