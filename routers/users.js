/*
 * A `Backbone.Router` for managing `User` related routes.
 */
App.Routers.Users = Backbone.Router.extend({

  routes: {
    'user/login':           'login',
    'user/information':     'index',
    'user/register':        'register', 
  },
  
  /*
   * View with information navigation to login and register
   */
  index: function() {
    App.main( new App.Views.Users.Index({}) );
  },
  
  /*
   * Login view for user
   */
  login: function() {
    App.main( new App.Views.Users.Login({}) );
  },
  
  /*
   * Register view for user, fetch maps from server or set default if not success
   */
  register: function() {
    var maps = []
    var result = net.getMaps();
    if (result.success){
      var returnedMapInfos = result.result.maps.map;
      for (var i = 0 ; i < returnedMapInfos.length; i++){
        var current = returnedMapInfos[i];
        maps.push( [current.mid, current.mn] );
      }
    } else {
      maps = [12, 'Friska Norden Demo'];
    }
    utils.logDebug("maps: " + JSON.stringify(maps));
    // maps to view from api
    App.main( new App.Views.Users.Register({maps: maps}) );
  }
  
});