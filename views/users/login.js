// Make sure the namespace has been setup
App.Views.Users || (App.Views.Users = {})

// A `Backbone.View` for displaying a `User`. The view also is responsible for
// managing a popup dialog for editing the user settings.
App.Views.Users.Login = App.Views.Base.extend({

  className: 'users-login',

  // DOM events in the view that we are interested in
  events: {
    'click .submit-button':  'onSubmit'
  },

  // The model passed into the view can be any `App.Models.User`.
  initialize: function() {
    setTimeout(function () {
      net.getMaps();
    }, 1);
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
  
  onSubmit: function() {
  var validReg = true;
    $('input').each( function(key, value){
      if ( !($(this).val()) ) {
          $(this).css( "background-color", "#CC3333" );
          validReg = false;
      }else{
          $(this).css( "background-color", "#2f5f99" );
      }
    });
    if (validReg){
      var email = $('input[name="email"]').val();
      var password = $('input[name="pwd"]').val();
      var mapId = getCurrentMapId();
      var showMap = true;
      if (mapId == -1){
        mapId = 1; //We need a valid map id to login
        showMap = false;
      }
      try{
        var result = net.getUser(new NetCredentials(email, password, mapId));
      }catch(err){
        console.log(err);
        utils.error(I18n.t('views.users.login.logininternalerror'));
      }
      if(result.success) {
        var creds = new Object();
        creds.email = email;
        creds.password = password;
        localStorage.setItem(getCredentialsKey(), JSON.stringify(creds));
        localStorage.setItem(getUserKey(), JSON.stringify(result.result));
        if (showMap){
          window.location.href = '#maps/'+mapId+'/show';
        }else{
          window.location.href = '#menu/select';
        }
      } else {
        //console.log('inloggning misslyckades!!!!');
        utils.warning(I18n.t('views.users.login.loginrejected'));
      }
    }
    
  },
  
  createHtml: function() {
    var source = '<div class="navigation"><div class="top"><a class="icon{{mapCss}}" style="font-size: 20px" href="#user/information"><span class="glyphicon glyphicon-remove-circle" style:float:left;></span></a></div>'+
                 '<div class="title">{{menuTitle}}</div></div>' +
                 '<div class="login-form">' +
                 '<p><input name="email" placeholder="{{email}}"/></p>' + 
                 '<p><input name="pwd" placeholder="{{password}}" type="password"/></p>' +
                 '<p><div class="submit-button">{{menuTitle}}</div></p>'+
                 '</div>';
    return source;
  },
  
  createData: function() {
    var data = { "menuTitle": I18n.t('views.users.login.login'), "password": I18n.t('views.users.login.password'), "email": I18n.t('views.users.login.email'), "mapCss" : getCurrentMapId()};
    return data;  
  }
   
});
