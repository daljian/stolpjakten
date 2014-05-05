// Make sure the namespace has been setup
App.Views.Users || (App.Views.Users = {})

// A `Backbone.View` for displaying a `User`. The view also is responsible for
// managing a popup dialog for editing the user settings.
App.Views.Users.Register = App.Views.Base.extend({

  className: 'users-register',

  // DOM events in the view that we are interested in
  events: {
    'click .submit-button':  'onSubmit'
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
    this.maps = maps;
    var source = this.createHtml(maps);
    var template = Handlebars.compile(source);
    var data = this.createData();
    var result = template(data);

    this.$el.html(result);
    $('select[name="year"]').val('1980').prop('selected', true);
  },
  
  // Controll if all fields have data and then create an user
  onSubmit: function() {
    var validReg = true;
    $('input').each( function(key, value){
      if ( !($(this).val()) ) {
        if ( !($(this).attr('name') == 'pc') ) {
          $(this).css( "background-color", "#CC3333" );
          validReg = false;
        }else{
          $(this).css( "background-color", "#2f5f99" );
        }
      }   
    });

    if (validReg) {
      var sil = $('input[name="sil"]').is(":checked") ? "1" : "0";
      var nl = $('input[name="nl"]').is(":checked") ? "1" : "0";
      var userData = new UserData(
        $('input[name="em"]').val(),
        $('input[name="fn"]').val(),
        $('input[name="ln"]').val(),
        $('input[name="dn"]').val(),
        $('input[name="sa"]').val(),
        $('input[name="zip"]').val(),
        $('input[name="ci"]').val(),
        $('input[name="ph"]').val(),
        $('select[name="ge"]').val(),
        $('input[name="pw"]').val(),
        sil,
        nl,
        $('select[name="ag"]').val(),
        $('input[name="pc"]').val(),
        new Array());
      
      var email = $('input[name="em"]').val(),
          pwd = $('input[name="pw"]').val(),
          mapId = $('select[name="mapid"]').val();
      var credentials = new NetCredentials(email, pwd, mapId);
      var result = net.createUser(credentials, userData);
      //console.log(userData);
      if( result.success ) { 
        localStorage.setItem(getUserKey(), JSON.stringify(net.getUser(credentials).result));
        localStorage.setItem(getCredentialsKey(), JSON.stringify({email: email, password: pwd, mapId: mapId}));
        //console.log('Registrering lyckades!');
        var selectedMap = new Object();
        selectedMap.mid = mapId;
        selectedMap.mn=""; //TODO, fix... 
        //console.log("Trying to store " + JSON.stringify(selectedMap));
        localStorage.setItem(getCurrentMapKey(), JSON.stringify(selectedMap));
        var test = getCurrentMap();
        //console.log("Stored " + JSON.stringify(test) + " and id is " + getCurrentMapId());

        window.location.href = '#maps/'+mapId+'/show';
        //window.location.href = '#user/login';
      } else {
        utils.error(I18n.t('views.users.register.registrationfailed'));
      }  
    }
    

  },
  
  // Om man vill ha ett annat startår än 1980 så är det bara att byta i if-satsen
  createHtml: function(maps) {
    var year = '';
    for(i = 1920; i < 2014; i++) {
      if(!(i == 1980)) {
        year += '<option value="'+i+'">'+i+'</option>';
      } else {
        year += '<option value="'+i+'" SELECTED>'+i+'</option>';
      }
    }

    var optionsString = ""
    $.each(maps, function(key, value) { optionsString += '<option value="'+value[0]+'">'+value[1]+'</option>'; });
    
    var source = '<div class="navigation"><div class="top"><a href="#user/information" style="float:left;"><span class="glyphicon glyphicon-remove-circle"></span></a>'+
    '{{menuTitle}}</div></div>' +
    '<div class="register-form">' +
    '<p><!-- <label>{{email}}:</label> --> <input name="em" placeholder="{{email}}"></p>' + 
    '<p><!-- <label>{{fname}}:</label> --> <input name="fn" placeholder="{{fname}}"></p>' + 
    '<p><!-- <label>{{lname}}:</label> --> <input name="ln" placeholder="{{lname}}"></p>' + 
    '<p><!-- <label>{{alias}}:</label> --> <input name="dn" placeholder="{{alias}}"></p>' + 
    '<p><!-- <label>{{street}}:</label> --> <input name="sa" placeholder="{{street}}"></p>' + 
    '<p><!-- <label>{{zip}}:</label> --> <input name="zip" placeholder="{{zip}}"></p>' + 
    '<p><!-- <label>{{city}}:</label> --> <input name="ci" placeholder="{{city}}"></p>' + 
    '<p><!-- <label>{{phone}}:</label> --> <input name="ph" placeholder="{{phone}}"></p>' + 
    '<p><!-- <label>{{password}}:</label> --> <input name="pw" type="password" placeholder="{{password}}"></p>' + 
    '<p><label>{{map}}:</label><div class="dropdown"><select name="mapid">'+optionsString+'</select></div></p>'+
    '<p><label>{{sex}}:</label><div class="dropdown"><select name="ge"><option value="0">{{female}}</option><option value="1">{{male}}</option></select></div></p>'+
    '<p><label>{{birth}}:</label><div class="dropdown"><select name="ag">'+year+'</select></div></p>'+
    '<p><input type="checkbox" name="sil" id="sil" value="1" CHECKED/> <label for="sil"> {{inlist}}</label></p>' +
    '<p><input type="checkbox" name="nl" id="nl" value="1" CHECKED/> <label for="nl">{{news}}</label></p>' +
    '<p><!-- <label>{{premium}}:</label> --> <input name="pc" placeholder="{{premium}}"></p><div style="clear:both;display:block;overflow:hidden;"></div>' +
    '<p><div class="submit-button">{{regButton}}</div></p>' +
    '</div>';
    return source;
  },
  
  createData: function() {
    var data = { "menuTitle": I18n.t('views.users.register.register'), "email": I18n.t('views.users.register.email'), "fname": I18n.t('views.users.register.first_name'), 
                 "lname": I18n.t('views.users.register.last_name'), "alias": I18n.t('views.users.register.display_name'), "street": I18n.t('views.users.register.street'),
                 "zip": I18n.t('views.users.register.zip'), "city": I18n.t('views.users.register.city'), "phone": I18n.t('views.users.register.phone'), 
                 "password": I18n.t('views.users.register.password'), "sex": I18n.t('views.users.register.sex'), "inlist": I18n.t('views.users.register.in_list'), "news": I18n.t('views.users.register.news'),
                 "birth":  I18n.t('views.users.register.birth_year'), "premium": I18n.t('views.users.register.premium'), "map": I18n.t('views.users.register.map'), "regButton": I18n.t('views.users.register.register'),
                  "male": I18n.t('views.users.register.male'), "female": I18n.t('views.users.register.female')};
    return data;  
  }
   
});
