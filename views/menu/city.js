// Make sure the namespace has been setup
App.Views.Menu || (App.Views.Menu = {})

// A `Backbone.View` for displaying a `User`. The view also is responsible for
// managing a popup dialog for editing the user settings.
App.Views.Menu.City = App.Views.Base.extend({

  className: 'menu-city',

  // DOM events in the view that we are interested in
  events: {
    'click a.back':            'back',
    'click div.option':         'mapSelect'
  },

  // The model passed into the view can be any `App.Models.User`.
  initialize: function() {
    this.render();
  },

  /**
   * Renders the view using the `views/users/edit.hbs` template.
   */
  render: function() {
    var maps = this.options.maps;
    var source = this.createHtml(maps);
    var template = Handlebars.compile(source);
    var data = this.createData();
    var result = template(data);

    this.$el.html(result);
  },
  
  back: function() {
    
    var mapView = getCurrentMapId();
    window.location.href = '#maps/'+mapView+'/show';
    //window.history.back();
  },
  
  mapSelect: function(event) {
    var target = $(event.target);
    var mapView = target.attr('id');
    var name = target.attr('name');
    var api = target.attr('api');
    setCurrentMap({mid: mapView, mn: name, api: api});
    setCourseMode(false); //default to
    var credentials = getNetCredentials();
    credentials.mid = mapView;
    
    var user = net.getUser(credentials);
    localStorage.setItem(getUserKey(), JSON.stringify(user.result));
    window.location.href = '#maps/'+mapView+'/show';
  },
  
  // html som ska visas. {{xxx}} - kommer från variabel i createData()
  //  <span class="glyphicon glyphicon-qrcode"></span>
  createHtml: function(maps) {
    var optionsString = ""
    $.each(maps, function(key, value) { optionsString += '<div class="option" api="'+value[2]+'" name="'+value[1]+'" id="'+value[0]+'">'+value[1]+'</div>'; });
    var source = '<div class="navigation map'+getCurrentMapId()+'"><div class="top"><a class="icon{{mapCss}} back"><span class="glyphicon glyphicon-remove-circle" style="float:left"></span></a>'+
                 '<span class="title">{{menuTitle}}</span></div></div>'+
                 '<div class="menu">'+
                 '<div class="menu-title">'+I18n.t('views.menu.citypicklabel')+'</div>'+
                 '<div class="menu-body">'+
                 '<div style="z-index:99; overflow-y: auto height:100%;">'+
                 optionsString +
                 '</div>'+
                 '</div>'+
                 '</div>';
    return source;
  },
  
  // variabler som skickas in i html
  createData: function() {
    var retrievedObject = JSON.parse(localStorage.getItem(getCredentialsKey()));
    var mapView = getCurrentMapId();
    var storage = JSON.parse(localStorage.getItem(getCurrentMapKey()));
    var menuTitle = "Välj stad";
    try{
      menuTitle = storage.mn;
    }catch(err){
      //At least we tried...
    }
    var retrievedObject = JSON.parse(localStorage.getItem(getUserKey())),
        firstName = retrievedObject.ud.fn,
        lastName = retrievedObject.ud.ln;
    
    var data = { "firstName": firstName, "lastName": lastName, "menuTitle": menuTitle, "login": "Inloggad som", "toMenu": "Till Huvudmeny", mapCss: mapView};
    return data;  
  }
   
});
