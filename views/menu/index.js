// Make sure the namespace has been setup
App.Views.Menu || (App.Views.Menu = {})

// A `Backbone.View` for displaying a `User`. The view also is responsible for
// managing a popup dialog for editing the user settings.
App.Views.Menu.Index = App.Views.Base.extend({

  className: 'menu-index',

  // DOM events in the view that we are interested in
  events: {
    'click div.option':         'onNavigate',
    'click a.toMap':            'toMap'
  },

  // The model passed into the view can be any `App.Models.User`.
  initialize: function() {
    this.render();
  },

  /**
   * Renders the view using the `views/users/edit.hbs` template.
   */
  render: function() {
    var source = this.createHtml();
    var template = Handlebars.compile(source);
    var data = this.createData();
    var result = template(data);

    this.$el.html(result);
  },
  
  onNavigate: function(event) {
    var target = $(event.target).attr('data-action');
    window.location.href = '#menu/index/'+target;
  },
  
  toMap: function() {
    var storage = getCurrentMap();
        mapView = storage.mid;
    window.location.href = '#maps/'+mapView+'/show';
    //window.history.back();
  },
  
  // html som ska visas. {{xxx}} - kommer från variabel i createData()
  //  <span class="glyphicon glyphicon-qrcode"></span>
  createHtml: function() {
    var source = '<div class="navigation map{{mapCss}}"><div class="top"><a class="icon{{mapCss}} toMap" style="float:left;"><span class="glyphicon glyphicon-align-justify"></span></a>{{menuTitle}}</div></div>'+
                 '<div class="menu">'+
                 '<div class="menu-title"><span class="display-title">{{login}}</span><br/>'+
                 
                 '<span class="display-name">{{firstName}} {{lastName}}</span></div>'+
                 '<div class="menu-body">'+
                 '<div class="option" data-action="marker">'+I18n.t('views.menu.stickslabel')+'</div>'+
                 //'<div class="option" data-action="account">'+I18n.t('views.menu.accountlabel')+'</div>'+
                 //'<div class="option" data-action="info">'+I18n.t('views.menu.infolabel')+'</div>'+
                 '<div class="option" data-action="result">'+I18n.t('views.menu.resultslabel')+'</div>'+
                 '<div class="option" data-action="toplist">'+I18n.t('views.menu.toplistlabel')+'</div>'+
                 '<div class="option" data-action="settings">'+I18n.t('views.menu.settingslabel')+'</div>'+
                 '<div class="option" data-action="logout">'+I18n.t('views.menu.logoutlabel')+'</div>'+
                 '</div>'+
                 '</div>';
    return source;
  },
  
  // variabler som skickas in i html
  createData: function() {

    var storage = getCurrentMap(),
        menuTitle = storage.mn,
        mapView = storage.mid;
    var retrievedObject = JSON.parse(localStorage.getItem(getUserKey())),
        firstName = retrievedObject.ud.fn,
        lastName = retrievedObject.ud.ln;
    
    var data = { "firstName": firstName, "lastName": lastName, "menuTitle": menuTitle, "login": I18n.t('views.menu.loginlabel'), mapCss: mapView};
    return data;  
  }
   
});
