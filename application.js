//= require ./models/user
//= require_directory ./models
//= require ./views/base
//= require_tree ./views
//= require_directory ./routers

_.extend(App, {

  // Currently displayed content in the application, indexed by
  // the fold name (`main` at this point).
  _folds: {},
  
  // Sets the view that is to be displayed in the left fold of the book UI. If the
  // left fold is already displaying a view it will be removed by invoking its
  // `close` method that is responsible for removing itself from DOM and also
  // to unsubscribe from any model events.
  main: function (view) {
    $('#mainView').html(view.$el);
  },

  // Entry point for the application.
  initialize: function () {
    this._setupRoutes();
    this.setLanguage();
    // Start monitoring location hash changes.
    Backbone.history.start();
  },
  
  setLanguage: function () {
    var languageKey = localStorage.getItem(getLanguageKey()) || 'sv'; 
    window.AppLanguage = languageKey;

    return window.AppLanguage;
  },
  
  _setupRoutes: function () {
    new App.Routers.Users();
    new App.Routers.Maps();
    new App.Routers.Menu();
    //new App.Routers.NotFound();
  }

  
});