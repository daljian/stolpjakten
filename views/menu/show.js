// Make sure the namespace has been setup
App.Views.Menu || (App.Views.Menu = {})

// A `Backbone.View` for displaying a `User`. The view also is responsible for
// managing a popup dialog for editing the user settings.
App.Views.Menu.Show = App.Views.Base.extend({

  className: 'menu-show',

  // DOM events in the view that we are interested in
  events: {
    'click div.toMenu':         'onNavigate',
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
    var data = this.options.data;
    var title = this.options.title;
    var source = this.createHtml(data, title);
    var template = Handlebars.compile(source);
    var data = this.createData();
    var result = template(data);

    this.$el.html(result);
  },
  
  onNavigate: function(event) {
    var target = $(event.target);
    window.location.href = '#menu/index';
    //window.history.back();
  },
  
  toMap: function() {
    
    //var newUrl = document.URL.substring(0, document.URL.indexOf("#")) + '#maps/'+getCurrentMapId()+'/show';
    //window.location.replace(newUrl); Replace doesn't seem to work in phonegap.. 
    //alert(newUrl);
    window.location.href = '#maps/'+getCurrentMapId()+'/show';
    
  },
  
  // html som ska visas. {{xxx}} - kommer från variabel i createData()
  // <span class="glyphicon glyphicon-qrcode"></span>
  createHtml: function(data, title) {
    var source = '<div class="navigation map{{mapCss}}"><div class="top"><a class="icon{{mapCss}} toMap"  style="float: left;"><span class="glyphicon glyphicon-align-justify"></span></a>'+
                 '{{menuTitle}}</div></div>'+
                 '<div class="menu">'+
                 '<div class="menu-title"><span class="display-title">{{login}}</span><br/>'+
                 '<span class="display-name">{{firstName}} {{lastName}}</span></div>'+
                 '<div class="menu-body">'+
                 '<div class="body-title">'+title+'</div>'+
                 '<div class="toMenu option">{{toMenu}}</div>'+
                 data +
                 '</div>'+
                 '</div>';
    return source;
  },
  
  // variabler som skickas in i html
  createData: function() {
    var currentMap = getCurrentMap();
    var menuTitle = currentMap.mn,
        mapView = currentMap.mid;
    var retrievedObject = JSON.parse(localStorage.getItem(getUserKey())),
        firstName = retrievedObject.ud.fn,
        lastName = retrievedObject.ud.ln;
    
    var data = { "firstName": firstName, "lastName": lastName, "menuTitle": menuTitle, "login": I18n.t('views.menu.loginlabel'), "toMenu": I18n.t('views.menu.menubacklabel'), mapCss: mapView};
    return data;  
  }
   
});
