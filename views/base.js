// Make sure the namespace has been setup
App.Views.Base || (App.Views.Base = {})

/**
 * Base class for all views. The view can be a composite view containing
 * nested views that are recursively closed when the parent view is closed.
 * Nested views can be manually added by inserting their `$el` to the DOM,
 * and calling `add`, or using the `{{view}}` helper which does the same
 * thing in a more readable way.
 */

App.Views.Base = Backbone.View.extend({

  /**
   * Adds a new child view to the composite. This does not add the view to the DOM tree,
   * which needs to be handled by the inheriting view.
   *
   * @param {base.View} view The child view to be added to the composite.
   * @return {base.View} The child view that was passed in.
   */

  add: function (view) {
    view.parent = this;
    this.byCid || (this.byCid = {});
    this.children || (this.children = []);
    this.byCid[view.cid] = view;
    this.children.push(view);
  },

  /**
   * Removes the child view from the composite. This also removes the view from the
   * DOM tree by invoking its `leave()` function, which also unbinds from any underlying
   * model or collection.
   *
   * @param {base.View|number} view The child view or the index of the child to remove from the composite.
   * @param {base.View|undefined} The view that was removed or `undefined` if it was not in the composite.
   */

  remove: function (view) {
    var index = view;

    if (typeof view === 'number') {
      view = this.children[index];
    } else {
      index = this.children.indexOf(view);
    }

    if (index > -1 && view) {
      this.children.splice(index, 1);
      delete this.byCid[view.cid];
      delete view.parent;
    }
  },

  /**
   * Renders the `template` function using the given `context` into the view element.
   * If the template contains `{{view}}` tags these will be expanded into placeholder
   * nodes in the DOM fragment which are resolved to the actual views that `{{view}}`
   * adds to this view as children during execution.
   *
   * @param {Function|string} template The Handlebars template function to render or
   *                                   the name of its JST entry.
   * @param {*} context The initial context to render.
   */

  /*render: function (template, context) {
    var view, self = this,
        options = { data: { view: this } };

    if (typeof template === 'string') {
      template = JST[template];
    }

    // Run the template and put its output in the view element.
    this.$el.html(template(context || this.model || this.collection || this, options));

    // Resolve any view placeholders with the nested children.
    this.$('script[data-view]').each(function (i, insertPoint) {
      insertPoint = $(insertPoint);
      view = self.byCid[insertPoint.attr('data-view')]
      insertPoint.replaceWith(view.el);
    });
  },*/
  render: function (template, context) {
    var view, self = this,
        options = { data: { view: this } };
        
    if (typeof template === 'string') {
      template = $(Handlebars.templates[template]);
    }
    //console.log( 'Base t: '+template+' c: '+context );
    // Run the template and put its output in the view element.
    this.$el.html(template);

    // Resolve any view placeholders with the nested children.
    this.$('script[data-view]').each(function (i, insertPoint) {
      insertPoint = $(insertPoint);
      view = self.byCid[insertPoint.attr('data-view')]
      insertPoint.replaceWith(view.el);
    });
  },

  // Can be used to hook up for instance 'blur select,input,textarea' in the view
  // events hash to be triggered whenever a user leaves a form field.
  //
  // The `name` attribute of the field will be used as the attribute to set on the model.
  // so an `<input name="title" ...>` will set the attribute `title` on the view's model
  // when it looses focus.
  //
  // TODO: Use a form view instead, with helper {{#form}} ... {{/form}}
  //
  updateAttribute: function (e) {
    var field      = $(e.target),
        fieldValue = field.val(),
        fieldName  = field.attr('name'),
        fieldType  = field.attr('type'),
        model      = this.model; 

    // Username needs to be lowercase.
    if (fieldName === 'username') {
      fieldValue = fieldValue.toLowerCase();
    }
    // If input is checkbox set fieldValue to false unless checked
    else if (fieldType === 'checkbox') {
      fieldValue = field.is(':checked');
    }
    // If it's a date string, make it a date. Helps with timezones and performance
    else if (field.hasClass('dateTime')) {
      fieldValue = field.scroller('getDate');
    }
    // If it's a number, typecast the value to a Number.
    else if (field.hasClass('number')) {
      fieldValue = parseInt(fieldValue);
    }

    // Update model only if value has changed in UI.
    if (model.get(fieldName) != fieldValue) {
      model.set(fieldName, fieldValue, { silent: true });
      this.errors();
    }

    e.preventDefault();
    return false;
  },

  // This method will add 0..* number of errors to DOM, depending on models error list.
  // The number of errors are returned. If an exception occur zero will be returned.
  // If the model does not support validation (model.errors is not defined), this is a no-op.
  //
  // TODO: Use a in form view instead, with helper {{#form}} ... {{/form}}
  //
  errors: function (options) {
    if (this.model.errors) {
      this.$('input').removeClass('field-error');
      this.$('.field-error-text').remove();

      _.each(this.model.errors(options), _.bind(function (error, key) {
        var input = this.$('input[name=' + key + ']');
        if (input.length > 0) {
          input.before($('<div></div>', {
            css: {
              top: input.position().top,
              left: input.position().left,
              width: input.width()
            },
            'class': 'field-error-text',
            text: error.join(', ')
          }));
        }
      }, this));
    }
  },

  // TODO: Använd input[type="phone"] som selector
  prepareHtml: function () {
    //this.$('input:checkbox, input:radio, select').uniform();
    //this.numeric();
  },

  _dateEntryOptions: function () {
    return {
      dateOrder:  'yymmdd',
      mode:       'mixed',
      dateFormat: I18n.t('date.date_format'),
      timeFormat: I18n.t('date.time_format'),
      cancelText: I18n.t('views.common.cancel'),
      setText:    I18n.t('views.common.ok'),
      monthText:  I18n.t('date.month'),
      yearText:   I18n.t('date.year'),
      dayText:    I18n.t('date.day'),
      hourText:   I18n.t('date.hour'),
      minuteText: I18n.t('date.minute'),
      ampm:       false
    };
  },

  initDateEntry: function (type) {
    var options = this._dateEntryOptions();

    this.$('.dateTime').each(function () {
      options.preset = (type === 'date_time_entry' ? 'datetime' : 'date');
      $(this).scroller(options);
    });
  },
  
  numeric: function () {
    this.$('.phonechars').numeric({ichars:'åäöÅÄÖ ½§!"*=/&{}[],.^#¤%@£$€&\'\\?!´`~<>|:;_¨', allow: '0123456789'});
    this.$('.numeric').numeric({allow: '-.0123456789'});    
  },
  
  /**
   * The default behavior of closing a view is to remove it from the DOM, remove any event bindings,
   * and recursively calling close on all children and descendants.
   */

  close: function () {
    this.$el.remove();
    //this.unobserve();
    //this.unbind();

    _.each(this.children, function (view) {
      delete view.parent;
      view.close();
    });
  },

  // Triggered when the user wants to show help
  showHelp: function(e) {
    var field = $(e.currentTarget);
    var helpSection = field.attr('data-help-section');
    var dialog = new App.Views.Dialog({
      closeInHeader: true,
      title: I18n.t('views.help.title'), 
      view: new App.Views.Help.Show({ model: helpSection}),
      width: 785
    });
  },

  navigateTo: function (localUrl) {
    window.location.hash = localUrl;
  }
});

// Mix in the observer functionality for more robust event binding
//_.extend(App.Views.Base.prototype, App.Mixins.Observer);
